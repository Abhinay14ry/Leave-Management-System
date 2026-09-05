from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import RegistrationView, UserViewSet, DepartmentViewSet

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('departments', DepartmentViewSet, basename='department')

urlpatterns = [
	path('auth/register/', RegistrationView.as_view(), name='register'),
]
urlpatterns += router.urls