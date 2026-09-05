from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth import get_user_model
from django.template.loader import render_to_string
from django.utils.html import strip_tags

User = get_user_model()

@shared_task
def send_leave_status_email(leave_request_id, status, recipient_email, comments=''):
    """
    Send an email notification when a leave request is approved/rejected.
    """
    subject = f"Leave Request {status.capitalize()}"
    context = {
        'status': status,
        'comments': comments,
        'leave_request_id': leave_request_id,
    }
    html_message = render_to_string('emails/leave_status.html', context)
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL

    send_mail(
        subject,
        plain_message,
        from_email,
        [recipient_email],
        html_message=html_message,
        fail_silently=False,
    )

@shared_task
def send_leave_request_submitted_email(leave_request_id, recipient_email):
    """
    Send an email to the manager when a new leave request is submitted.
    """
    subject = "New Leave Request Submitted"
    context = {
        'leave_request_id': leave_request_id,
    }
    html_message = render_to_string('emails/leave_submitted.html', context)
    plain_message = strip_tags(html_message)
    from_email = settings.DEFAULT_FROM_EMAIL

    send_mail(
        subject,
        plain_message,
        from_email,
        [recipient_email],
        html_message=html_message,
        fail_silently=False,
    )

@shared_task
def create_in_app_notification(recipient_id, notification_type, title, message):
    """
    Create an in-app notification for a user.
    """
    try:
        recipient = User.objects.get(id=recipient_id)
        from .models import Notification  # local import to avoid circular imports
        Notification.objects.create(
            recipient=recipient,
            notification_type=notification_type,
            title=title,
            message=message
        )
    except User.DoesNotExist:
        pass  # or log the error