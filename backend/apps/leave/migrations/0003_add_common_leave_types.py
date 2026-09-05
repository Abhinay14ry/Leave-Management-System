from django.db import migrations


LEAVE_TYPES = [
    ('annual', 'Annual Leave', 'Planned vacation and personal time'),
    ('sick', 'Sick Leave', 'Time away for illness or medical care'),
    ('casual', 'Casual Leave', 'Short-notice personal time away'),
    ('maternity', 'Maternity Leave', 'Leave related to childbirth'),
    ('paternity', 'Paternity Leave', 'Leave related to welcoming a child'),
    ('unpaid', 'Unpaid Leave', 'Approved time away without pay'),
    ('bereavement', 'Bereavement Leave', 'Time away following a loss'),
]


def create_leave_types(apps, schema_editor):
    LeaveType = apps.get_model('leave', 'LeaveType')
    for code, name, description in LEAVE_TYPES:
        LeaveType.objects.get_or_create(
            code=code,
            defaults={
                'name': name,
                'description': description,
            },
        )


def remove_leave_types(apps, schema_editor):
    LeaveType = apps.get_model('leave', 'LeaveType')
    LeaveType.objects.filter(code__in=[code for code, _, _ in LEAVE_TYPES]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('leave', '0002_add_leave_type'),
    ]

    operations = [
        migrations.RunPython(create_leave_types, remove_leave_types),
    ]
