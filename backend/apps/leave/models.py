from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator
import datetime

class LeaveType(models.Model):
    name = models.CharField(max_length=50)
    code = models.CharField(max_length=10, unique=True)  # e.g., 'annual', 'sick'
    description = models.TextField(blank=True)
    accrual_rate = models.FloatField(default=0)  # days per year
    max_carry_forward = models.IntegerField(default=0)
    requires_documentation = models.BooleanField(default=False)
    max_consecutive_days = models.IntegerField(null=True, blank=True)

    def __str__(self):
        return self.name

class LeavePolicy(models.Model):
    name = models.CharField(max_length=100)
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    department = models.ForeignKey('accounts.Department', null=True, blank=True, on_delete=models.SET_NULL)
    accrual_frequency = models.CharField(max_length=20, choices=[('monthly', 'Monthly'), ('yearly', 'Yearly')])
    prorate_new_joiner = models.BooleanField(default=True)
    carry_forward_enabled = models.BooleanField(default=False)
    carry_forward_limit = models.IntegerField(default=0)
    carry_forward_expiry_months = models.IntegerField(default=12)

    def __str__(self):
        return self.name

class Holiday(models.Model):
    name = models.CharField(max_length=100)
    date = models.DateField()
    country = models.CharField(max_length=50, default='US')

    class Meta:
        unique_together = ('date', 'country')
        ordering = ['date']

class LeaveBalance(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_balances')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.CASCADE)
    year = models.IntegerField(default=datetime.date.today().year)
    total_credited = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    used = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    pending = models.DecimalField(max_digits=5, decimal_places=1, default=0)
    carried_over = models.DecimalField(max_digits=5, decimal_places=1, default=0)

    class Meta:
        unique_together = ('user', 'leave_type', 'year')

    @property
    def available(self):
        return self.total_credited + self.carried_over - self.used - self.pending

class LeaveRequest(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('cancelled', 'Cancelled'),
    ]
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='leave_requests')
    leave_type = models.ForeignKey(LeaveType, on_delete=models.PROTECT)
    start_date = models.DateField()
    end_date = models.DateField()
    half_day = models.CharField(max_length=10, blank=True, null=True, choices=[('first', 'First Half'), ('second', 'Second Half')])
    reason = models.TextField(blank=True)
    attachment = models.FileField(upload_to='attachments/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    submitted_at = models.DateTimeField(auto_now_add=True)
    decided_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL, related_name='decided_requests')
    decided_at = models.DateTimeField(null=True, blank=True)
    comments = models.TextField(blank=True)

    class Meta:
        ordering = ['-submitted_at']

    def __str__(self):
        return f"{self.user} - {self.leave_type} ({self.start_date} to {self.end_date})"