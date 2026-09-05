from celery import shared_task
from django.utils import timezone
from datetime import date, timedelta
from .models import LeaveBalance, LeaveType
from apps.accounts.models import User

@shared_task
def accrue_leave_balances():
    """Accrue leave for all users based on policy."""
    today = date.today()
    # Simple yearly accrual: credit annual leave on Jan 1st
    if today.month == 1 and today.day == 1:
        users = User.objects.filter(is_active=True)
        annual_type = LeaveType.objects.get(code='annual')
        for user in users:
            # Check if balance already exists for this year
            balance, created = LeaveBalance.objects.get_or_create(
                user=user, leave_type=annual_type, year=today.year,
                defaults={'total_credited': annual_type.accrual_rate}
            )
            if created:
                # Handle carry forward from previous year
                prev_year_balance = LeaveBalance.objects.filter(
                    user=user, leave_type=annual_type, year=today.year-1
                ).first()
                if prev_year_balance:
                    carry = min(prev_year_balance.available, annual_type.max_carry_forward)
                    balance.carried_over = carry
                    balance.save()
    # Could be extended for monthly accrual, sick leave, etc.