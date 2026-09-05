from rest_framework import generics, viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .models import Department
from .serializers import RegistrationSerializer, UserSerializer, DepartmentSerializer
from apps.leave.permissions import IsHR, IsOwnerOrManagerOrHR

User = get_user_model()

class RegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint for user management.
    Permissions:
    - All authenticated users can list/retrieve (subject to object-level checks)
    - HR can create/delete users
    - Users can update their own profile; managers can update their team
    """
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'hr':
            # HR sees all users
            return User.objects.all()
        elif user.role == 'manager':
            # Manager sees themselves and their direct reports
            team = User.objects.filter(manager=user)
            return User.objects.filter(id=user.id) | team
        else:
            # Regular employee sees only themselves
            return User.objects.filter(id=user.id)

    def get_permissions(self):
        """
        Override to enforce role-based permissions on specific actions.
        """
        if self.action in ['create', 'destroy']:
            return [IsHR()]
        if self.action in ['update', 'partial_update', 'retrieve']:
            return [IsOwnerOrManagerOrHR()]
        return super().get_permissions()

    @action(detail=False, methods=['get'], url_path='me')
    def me(self, request):
        """
        Returns the current authenticated user's profile.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class DepartmentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint for departments (read-only for all authenticated users).
    """
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [permissions.IsAuthenticated]