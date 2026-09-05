from django.contrib.auth.models import AbstractUser
from django.db import models

class Department(models.Model):
    """Represents a department/team within the organization."""
    name = models.CharField(max_length=100)
    code = models.CharField(max_length=20, unique=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    """Custom user model with additional fields for leave management."""
    ROLE_CHOICES = [
        ('employee', 'Employee'),
        ('manager', 'Manager'),
        ('hr', 'HR'),
    ]

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='employee',
        help_text='Role determines permissions and visibility'
    )
    department = models.ForeignKey(
        Department,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='employees'
    )
    manager = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='team_members',
        help_text='The manager who approves this user\'s leave'
    )
    job_title = models.CharField(max_length=100, blank=True)
    avatar = models.FileField(upload_to='avatars/', blank=True, null=True)
    join_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.get_full_name() or self.username

    @property
    def full_name(self):
        return self.get_full_name()