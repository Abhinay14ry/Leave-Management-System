from datetime import date, timedelta
import logging
from django.db import transaction
from django.utils import timezone
from .models import LeaveRequest, LeaveBalance, Holiday
from apps.notifications.tasks import send_leave_status_email, create_in_app_notification

logger = logging.getLogger(__name__)


def queue_notification(task, **kwargs):
    try:
        task.delay(**kwargs)
    except Exception:
        logger.exception('Unable to queue leave notification')
        if task is create_in_app_notification:
            task.run(**kwargs)

def calculate_leave_days(start_date, end_date, half_day=None):
    """Calculate number of working days excluding weekends and public holidays."""
    days = 0
    current = start_date
    while current <= end_date:
        if current.weekday() < 5:  # Mon-Fri
            if not Holiday.objects.filter(date=current).exists():
                days += 1
        current += timedelta(days=1)
    if half_day:
        days -= 0.5
    return max(0, days)

@transaction.atomic
def apply_leave(user, leave_type, start_date, end_date, half_day=None, reason='', attachment=None):
    # Calculate days
    days = calculate_leave_days(start_date, end_date, half_day)
    # Check balance
    year = start_date.year
    try:
        balance = LeaveBalance.objects.select_for_update().get(
            user=user, leave_type=leave_type, year=year
        )
    except LeaveBalance.DoesNotExist as exc:
        raise ValueError('No leave balance is configured for this leave type.') from exc
    if balance.available < days:
        raise ValueError("Insufficient leave balance")
    # Check overlapping requests
    overlapping = LeaveRequest.objects.filter(
        user=user,
        start_date__lte=end_date,
        end_date__gte=start_date,
        status__in=['pending', 'approved']
    ).exists()
    if overlapping:
        raise ValueError("Overlapping leave request exists")
    # Create request
    request = LeaveRequest.objects.create(
        user=user,
        leave_type=leave_type,
        start_date=start_date,
        end_date=end_date,
        half_day=half_day,
        reason=reason,
        attachment=attachment,
        status='pending'
    )
    # Update pending balance
    balance.pending += days
    balance.save()

    # Notify manager and HR about new leave request
    from django.contrib.auth import get_user_model
    User = get_user_model()
    recipient_ids = set()
    if user.manager:
        recipient_ids.add(user.manager.id)
    for hr_user in User.objects.filter(role='hr'):
        recipient_ids.add(hr_user.id)

    transaction.on_commit(lambda: [
        queue_notification(
            create_in_app_notification,
            recipient_id=rid,
            notification_type='leave_request_submitted',
            title='New Leave Request',
            message=f"{user.get_full_name() or user.username} submitted a leave request from {start_date} to {end_date}.",
        ) for rid in recipient_ids
    ])

    return request

@transaction.atomic
def approve_request(leave_request, approver, comments=''):
    if leave_request.status != 'pending':
        raise ValueError("Request is not pending")
    days = calculate_leave_days(leave_request.start_date, leave_request.end_date, leave_request.half_day)
    year = leave_request.start_date.year
    balance = LeaveBalance.objects.select_for_update().get(
        user=leave_request.user, leave_type=leave_request.leave_type, year=year
    )
    balance.pending -= days
    balance.used += days
    balance.save()

    leave_request.status = 'approved'
    leave_request.decided_by = approver
    leave_request.decided_at = timezone.now()
    leave_request.comments = comments
    leave_request.save()

    transaction.on_commit(lambda: queue_notification(
        send_leave_status_email,
        leave_request_id=leave_request.id,
        status='approved',
        recipient_email=leave_request.user.email,
        comments=comments,
    ))
    transaction.on_commit(lambda: queue_notification(
        create_in_app_notification,
        recipient_id=leave_request.user.id,
        notification_type='leave_request_approved',
        title='Leave Request Approved',
        message=f"Your leave request from {leave_request.start_date} to {leave_request.end_date} has been approved.",
    ))

    return leave_request

@transaction.atomic
def reject_request(leave_request, approver, comments=''):
    if leave_request.status != 'pending':
        raise ValueError("Request is not pending")
    days = calculate_leave_days(leave_request.start_date, leave_request.end_date, leave_request.half_day)
    year = leave_request.start_date.year
    balance = LeaveBalance.objects.select_for_update().get(
        user=leave_request.user, leave_type=leave_request.leave_type, year=year
    )
    balance.pending -= days
    balance.save()

    leave_request.status = 'rejected'
    leave_request.decided_by = approver
    leave_request.decided_at = timezone.now()
    leave_request.comments = comments
    leave_request.save()

    transaction.on_commit(lambda: queue_notification(
        send_leave_status_email,
        leave_request_id=leave_request.id,
        status='rejected',
        recipient_email=leave_request.user.email,
        comments=comments,
    ))
    transaction.on_commit(lambda: queue_notification(
        create_in_app_notification,
        recipient_id=leave_request.user.id,
        notification_type='leave_request_rejected',
        title='Leave Request Rejected',
        message=f"Your leave request from {leave_request.start_date} to {leave_request.end_date} has been rejected.",
    ))

    return leave_request


@transaction.atomic
def cancel_request(leave_request):
    if leave_request.status != 'pending':
        raise ValueError('Only pending requests can be cancelled')

    days = calculate_leave_days(leave_request.start_date, leave_request.end_date, leave_request.half_day)
    year = leave_request.start_date.year
    try:
        balance = LeaveBalance.objects.select_for_update().get(
            user=leave_request.user, leave_type=leave_request.leave_type, year=year
        )
    except LeaveBalance.DoesNotExist as exc:
        raise ValueError('No leave balance is configured for this leave type.') from exc

    balance.pending = max(0, balance.pending - days)
    balance.save(update_fields=['pending'])
    leave_request.status = 'cancelled'
    leave_request.save(update_fields=['status'])

    # Notify manager and HR about cancellation
    from django.contrib.auth import get_user_model
    User = get_user_model()
    recipient_ids = set()
    if leave_request.user.manager:
        recipient_ids.add(leave_request.user.manager.id)
    for hr_user in User.objects.filter(role='hr'):
        recipient_ids.add(hr_user.id)

    transaction.on_commit(lambda: [
        queue_notification(
            create_in_app_notification,
            recipient_id=rid,
            notification_type='leave_request_cancelled',
            title='Leave Request Cancelled',
            message=f"{leave_request.user.get_full_name() or leave_request.user.username} cancelled a leave request from {leave_request.start_date} to {leave_request.end_date}.",
        ) for rid in recipient_ids
    ])

    return leave_request