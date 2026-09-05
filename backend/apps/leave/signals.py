from decimal import Decimal

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from django.utils import timezone

from .models import LeaveBalance, LeaveType


DEFAULT_ALLOWANCES = {
    'leave': Decimal('10.0'),
    'annual': Decimal('20.0'),
    'sick': Decimal('10.0'),
    'casual': Decimal('5.0'),
    'maternity': Decimal('90.0'),
    'paternity': Decimal('15.0'),
    'unpaid': Decimal('30.0'),
    'bereavement': Decimal('5.0'),
}


@receiver(post_save, sender=get_user_model())
def provision_leave_balances(sender, instance, created, **kwargs):
    if not created:
        return

    year = timezone.now().year
    for leave_type in LeaveType.objects.all():
        LeaveBalance.objects.get_or_create(
            user=instance,
            leave_type=leave_type,
            year=year,
            defaults={
                'total_credited': DEFAULT_ALLOWANCES.get(
                    leave_type.code, Decimal('0.0')
                ),
            },
        )
