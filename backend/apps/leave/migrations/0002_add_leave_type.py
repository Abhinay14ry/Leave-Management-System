from django.db import migrations


def create_leave_type(apps, schema_editor):
    LeaveType = apps.get_model('leave', 'LeaveType')
    LeaveType.objects.get_or_create(
        code='leave',
        defaults={
            'name': 'Leave',
            'description': 'General leave request',
        },
    )


def remove_leave_type(apps, schema_editor):
    LeaveType = apps.get_model('leave', 'LeaveType')
    LeaveType.objects.filter(code='leave').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('leave', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_leave_type, remove_leave_type),
    ]
