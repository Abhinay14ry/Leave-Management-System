from django.db import migrations


DEPARTMENT_NAME = 'IT Officer'
DEPARTMENT_CODE = 'IT'


def create_it_officer_department(apps, schema_editor):
    Department = apps.get_model('accounts', 'Department')
    Department.objects.get_or_create(
        code=DEPARTMENT_CODE,
        defaults={'name': DEPARTMENT_NAME},
    )


def remove_it_officer_department(apps, schema_editor):
    Department = apps.get_model('accounts', 'Department')
    Department.objects.filter(code=DEPARTMENT_CODE).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0003_add_departments'),
    ]

    operations = [
        migrations.RunPython(create_it_officer_department, remove_it_officer_department),
    ]
