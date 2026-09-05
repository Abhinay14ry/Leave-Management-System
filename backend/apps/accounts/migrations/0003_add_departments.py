from django.db import migrations


DEPARTMENTS = [
    ('Human Resources', 'HR'),
    ('Engineering', 'ENG'),
    ('Finance', 'FIN'),
    ('Sales', 'SALES'),
    ('Marketing', 'MKT'),
    ('Operations', 'OPS'),
    ('Customer Support', 'SUPPORT'),
]


def create_departments(apps, schema_editor):
    Department = apps.get_model('accounts', 'Department')
    for name, code in DEPARTMENTS:
        Department.objects.get_or_create(code=code, defaults={'name': name})


def remove_departments(apps, schema_editor):
    Department = apps.get_model('accounts', 'Department')
    Department.objects.filter(code__in=[code for _, code in DEPARTMENTS]).delete()


class Migration(migrations.Migration):
    dependencies = [
        ('accounts', '0002_user_avatar'),
    ]

    operations = [
        migrations.RunPython(create_departments, remove_departments),
    ]
