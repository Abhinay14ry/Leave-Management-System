from django.db import models
from django.conf import settings
from django.utils import timezone

class Notification(models.Model):
    """
    In-app notification model.
    """
    NOTIFICATION_TYPES = [
        ('leave_request_submitted', 'Leave Request Submitted'),
        ('leave_request_approved', 'Leave Request Approved'),
        ('leave_request_rejected', 'Leave Request Rejected'),
        ('leave_request_cancelled', 'Leave Request Cancelled'),
        ('leave_balance_updated', 'Leave Balance Updated'),
    ]

    recipient = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='notifications'
    )
    notification_type = models.CharField(
        max_length=50,
        choices=NOTIFICATION_TYPES,
        default='leave_request_submitted'
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient} - {self.title}"

    def mark_as_read(self):
        self.is_read = True
        self.save(update_fields=['is_read'])