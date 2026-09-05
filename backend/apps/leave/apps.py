from django.apps import AppConfig


class LeaveConfig(AppConfig):
    name = 'apps.leave'

    def ready(self):
        from . import signals  # noqa: F401
