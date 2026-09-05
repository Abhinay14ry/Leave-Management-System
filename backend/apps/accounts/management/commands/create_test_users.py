from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users with different roles for development'

    def handle(self, *args, **options):
        test_users = [
            {
                'username': 'emp_john',
                'email': 'john@company.com',
                'first_name': 'John',
                'last_name': 'Employee',
                'password': 'TestPass123',
                'role': 'employee',
            },
            {
                'username': 'mgr_sarah',
                'email': 'sarah@company.com',
                'first_name': 'Sarah',
                'last_name': 'Manager',
                'password': 'TestPass123',
                'role': 'manager',
            },
            {
                'username': 'hr_admin',
                'email': 'admin@company.com',
                'first_name': 'Admin',
                'last_name': 'HR',
                'password': 'TestPass123',
                'role': 'hr',
            },
        ]

        for user_data in test_users:
            password = user_data.pop('password')
            username = user_data['username']
            
            if User.objects.filter(username=username).exists():
                self.stdout.write(self.style.WARNING(f'User {username} already exists. Skipping...'))
            else:
                user = User.objects.create_user(password=password, **user_data)
                self.stdout.write(self.style.SUCCESS(f'Created user: {username} ({user.role})'))

        self.stdout.write(self.style.SUCCESS('\nTest users created successfully!'))
        self.stdout.write('\nAvailable test accounts:')
        self.stdout.write('  Employee: emp_john / TestPass123')
        self.stdout.write('  Manager:  mgr_sarah / TestPass123')
        self.stdout.write('  HR Admin: hr_admin / TestPass123')
