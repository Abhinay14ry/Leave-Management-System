from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsManagerOrHR(BasePermission):
    """
    Allows access only to users with role 'manager' or 'hr'.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['manager', 'hr']

class CanApproveLeaveRequest(BasePermission):
    """Allow HR to decide employee requests and managers to decide HR requests."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['manager', 'hr']

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'hr':
            return obj.user.role == 'employee'
        if request.user.role == 'manager':
            return obj.user.role == 'hr'
        return False

class IsHR(BasePermission):
    """
    Allows access only to HR users.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'hr'

class IsOwnerOrManagerOrHR(BasePermission):
    """
    Object-level permission to only allow owners of an object,
    or managers/HR to access it.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if obj == request.user:
            return True
        if request.user.role in ['manager', 'hr']:
            return True
        if hasattr(obj, 'user'):
            return obj.user == request.user
        return False