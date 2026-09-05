from decimal import Decimal

from django.db import migrations
from django.utils import timezone


ALLOWANCES = {
    'leave': Decimal('10.0'),
    'annual': Decimal('20.0'),
    'sick': Decimal('10.0'),
    'casual': Decimal('5.0'),
    'maternity': Decimal('90.0'),
    'paternity': Decimal('15.0'),
    'unpaid': Decimal('30.0'),
    'bereavement': Decimal('5.0'),
}


def provision_balances(apps, schema_editor):
    User = apps.get_model('accounts', 'User')
    LeaveType = apps.get_model('leave', 'LeaveType')
    LeaveBalance = apps.get_model('leave', 'LeaveBalance')
    year = timezone.now().year

    for user in User.objects.all():
        for leave_type in LeaveType.objects.all():
            LeaveBalance.objects.get_or_create(
                user=user,
                leave_type=leave_type,
                year=year,
                defaults={'total_credited': ALLOWANCES.get(leave_type.code, Decimal('0.0'))},
            )


def remove_balances(apps, schema_editor):
    LeaveBalance = apps.get_model('leave', 'LeaveBalance')
    LeaveBalance.objects.filter(year=timezone.now().year).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('leave', '0003_add_common_leave_types'),
    ]

    operations = [
        migrations.RunPython(provision_balances, remove_balances),
    ]
