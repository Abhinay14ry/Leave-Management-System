from rest_framework.routers import DefaultRouter
from .views import LeaveTypeViewSet, LeaveRequestViewSet, LeaveBalanceViewSet, HolidayViewSet

router = DefaultRouter()
router.register('leave-types', LeaveTypeViewSet)
router.register('leave-requests', LeaveRequestViewSet, basename='leave-request')
router.register('leave-balances', LeaveBalanceViewSet, basename='leave-balance')
router.register('holidays', HolidayViewSet)

urlpatterns = router.urls