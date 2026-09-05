from rest_framework import serializers
from .models import LeaveType, LeaveRequest, LeaveBalance, Holiday
from django.utils import timezone

class LeaveTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LeaveType
        fields = '__all__'

class LeaveRequestSerializer(serializers.ModelSerializer):
    user = serializers.PrimaryKeyRelatedField(read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)
    decided_by_name = serializers.CharField(source='decided_by.get_full_name', read_only=True)

    class Meta:
        model = LeaveRequest
        fields = [
            'id', 'user', 'leave_type', 'leave_type_name',
            'start_date', 'end_date', 'half_day', 'reason',
            'attachment', 'status', 'submitted_at',
            'decided_by', 'decided_by_name', 'decided_at', 'comments'
        ]
        read_only_fields = ['status', 'submitted_at', 'decided_by', 'decided_at']

    def validate(self, attrs):
        start_date = attrs.get('start_date')
        end_date = attrs.get('end_date')
        if start_date and end_date and end_date < start_date:
            raise serializers.ValidationError("End date must be after start date.")
        return attrs

    def validate_half_day(self, value):
        if value and value not in ['first', 'second']:
            raise serializers.ValidationError("Half day must be 'first' or 'second'.")
        return value

class LeaveBalanceSerializer(serializers.ModelSerializer):
    available = serializers.SerializerMethodField()
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    leave_type_name = serializers.CharField(source='leave_type.name', read_only=True)

    class Meta:
        model = LeaveBalance
        fields = [
            'id', 'user', 'user_name', 'leave_type', 'leave_type_name',
            'year', 'total_credited', 'used', 'pending', 'carried_over', 'available'
        ]

    def get_available(self, obj):
        return obj.available

class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'