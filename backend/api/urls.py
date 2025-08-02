from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    KeywordViewSet, SubredditViewSet, RedditPostViewSet,
    ClassificationViewSet, ReplyViewSet, NotificationViewSet,
    AIPersonaViewSet, PerformanceMetricsViewSet, DashboardViewSet
)

router = DefaultRouter()
router.register(r'keywords', KeywordViewSet)
router.register(r'subreddits', SubredditViewSet)
router.register(r'posts', RedditPostViewSet)
router.register(r'classifications', ClassificationViewSet)
router.register(r'replies', ReplyViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'ai-personas', AIPersonaViewSet)
router.register(r'performance-metrics', PerformanceMetricsViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')

urlpatterns = [
    path('', include(router.urls)),
] 