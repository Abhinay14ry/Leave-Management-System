from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError
from django.db.models import ProtectedError
from .models import LeaveType, LeaveRequest, LeaveBalance, Holiday
from .serializers import LeaveTypeSerializer, LeaveRequestSerializer, LeaveBalanceSerializer, HolidaySerializer
from .services import apply_leave, approve_request, reject_request, cancel_request
from .permissions import CanApproveLeaveRequest, IsManagerOrHR

class LeaveTypeViewSet(viewsets.ModelViewSet):
    queryset = LeaveType.objects.all()
    serializer_class = LeaveTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerOrHR()]
        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        leave_type = self.get_object()
        if LeaveRequest.objects.filter(leave_type=leave_type).exists():
            return Response(
                {'error': 'This leave type cannot be deleted because it is used by existing leave requests.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'This leave type cannot be deleted because it is used by existing leave requests.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

class LeaveRequestViewSet(viewsets.ModelViewSet):
    serializer_class = LeaveRequestSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if self.request.query_params.get('mine') == 'true':
            queryset = LeaveRequest.objects.filter(user=user)
        elif user.role == 'hr':
            queryset = LeaveRequest.objects.filter(user__role='employee')
        elif user.role == 'manager':
            queryset = LeaveRequest.objects.filter(user__role='hr')
        else:
            queryset = LeaveRequest.objects.filter(user=user)

        request_status = self.request.query_params.get('status')
        if request_status:
            queryset = queryset.filter(status=request_status)

        from_date = self.request.query_params.get('from_date')
        to_date = self.request.query_params.get('to_date')
        if from_date:
            queryset = queryset.filter(end_date__gte=from_date)
        if to_date:
            queryset = queryset.filter(start_date__lte=to_date)
        return queryset

    def perform_create(self, serializer):
        try:
            leave_request = apply_leave(
                user=self.request.user,
                leave_type=serializer.validated_data['leave_type'],
                start_date=serializer.validated_data['start_date'],
                end_date=serializer.validated_data['end_date'],
                half_day=serializer.validated_data.get('half_day'),
                reason=serializer.validated_data.get('reason', ''),
                attachment=serializer.validated_data.get('attachment')
            )
            serializer.instance = leave_request
        except ValueError as e:
            raise ValidationError({'error': str(e)}) from e

    @action(detail=True, methods=['post'], permission_classes=[CanApproveLeaveRequest])
    def approve(self, request, pk=None):
        leave_request = self.get_object()
        try:
            updated = approve_request(leave_request, request.user, request.data.get('comments', ''))
            return Response(LeaveRequestSerializer(updated).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[CanApproveLeaveRequest])
    def reject(self, request, pk=None):
        leave_request = self.get_object()
        try:
            updated = reject_request(leave_request, request.user, request.data.get('comments', ''))
            return Response(LeaveRequestSerializer(updated).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def cancel(self, request, pk=None):
        leave_request = self.get_object()
        try:
            updated = cancel_request(leave_request)
            return Response(LeaveRequestSerializer(updated).data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class LeaveBalanceViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = LeaveBalanceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'hr':
            return LeaveBalance.objects.all()
        elif user.role == 'manager':
            team_members = user.team_members.all()
            return LeaveBalance.objects.filter(user__in=team_members) | LeaveBalance.objects.filter(user=user)
        return LeaveBalance.objects.filter(user=user)

class HolidayViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsManagerOrHR()]
        return [permissions.IsAuthenticated()]

    def destroy(self, request, *args, **kwargs):
        leave_type = self.get_object()
        if LeaveRequest.objects.filter(leave_type=leave_type).exists():
            return Response(
                {'error': 'This leave type cannot be deleted because it is used by existing leave requests.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return super().destroy(request, *args, **kwargs)
        except ProtectedError:
            return Response(
                {'error': 'This leave type cannot be deleted because it is used by existing leave requests.'},
                status=status.HTTP_400_BAD_REQUEST,
            )