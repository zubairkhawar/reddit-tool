from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from reddit.models import (
    Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics
)
from .serializers import (
    KeywordSerializer, SubredditSerializer, RedditPostSerializer,
    ClassificationSerializer, ReplySerializer, NotificationSerializer,
    AIPersonaSerializer, PerformanceMetricsSerializer,
    DashboardStatsSerializer, LeadSummarySerializer
)


class KeywordViewSet(viewsets.ModelViewSet):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [permissions.IsAuthenticated]


class SubredditViewSet(viewsets.ModelViewSet):
    queryset = Subreddit.objects.all()
    serializer_class = SubredditSerializer
    permission_classes = [permissions.IsAuthenticated]


class RedditPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RedditPost.objects.all()
    serializer_class = RedditPostSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = RedditPost.objects.all()
        
        # Filter by subreddit
        subreddit = self.request.query_params.get('subreddit', None)
        if subreddit:
            queryset = queryset.filter(subreddit=subreddit)
        
        # Filter by keyword
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | Q(body__icontains=keyword)
            )
        
        # Filter by classification
        is_opportunity = self.request.query_params.get('is_opportunity', None)
        if is_opportunity is not None:
            if is_opportunity.lower() == 'true':
                queryset = queryset.filter(classification__is_opportunity=True)
            else:
                queryset = queryset.filter(classification__is_opportunity=False)
        
        return queryset


class ClassificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Classification.objects.all()
        
        # Filter by priority
        priority = self.request.query_params.get('priority', None)
        if priority:
            queryset = queryset.filter(priority=priority)
        
        # Filter by opportunity
        is_opportunity = self.request.query_params.get('is_opportunity', None)
        if is_opportunity is not None:
            if is_opportunity.lower() == 'true':
                queryset = queryset.filter(is_opportunity=True)
            else:
                queryset = queryset.filter(is_opportunity=False)
        
        return queryset


class ReplyViewSet(viewsets.ModelViewSet):
    queryset = Reply.objects.all()
    serializer_class = ReplySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Reply.objects.all()
        
        # Filter by status
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        reply = self.get_object()
        reply.status = 'approved'
        reply.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reply = self.get_object()
        reply.status = 'rejected'
        reply.save()
        return Response({'status': 'rejected'})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Notification.objects.all()
        
        # Filter by read status
        is_read = self.request.query_params.get('is_read', None)
        if is_read is not None:
            if is_read.lower() == 'true':
                queryset = queryset.filter(is_read=True)
            else:
                queryset = queryset.filter(is_read=False)
        
        # Filter by type
        notification_type = self.request.query_params.get('type', None)
        if notification_type:
            queryset = queryset.filter(notification_type=notification_type)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'marked as read'})


class AIPersonaViewSet(viewsets.ModelViewSet):
    queryset = AIPersona.objects.all()
    serializer_class = AIPersonaSerializer
    permission_classes = [permissions.IsAuthenticated]


class PerformanceMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PerformanceMetrics.objects.all()
    serializer_class = PerformanceMetricsSerializer
    permission_classes = [permissions.IsAuthenticated]


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get dashboard statistics"""
        today = timezone.now().date()
        week_ago = today - timedelta(days=7)
        
        # Total stats
        total_posts = RedditPost.objects.count()
        opportunities_found = Classification.objects.filter(is_opportunity=True).count()
        replies_posted = Reply.objects.filter(status='posted').count()
        
        # Engagement rate
        total_replies = Reply.objects.filter(status='posted')
        total_upvotes = sum(reply.upvotes for reply in total_replies)
        engagement_rate = (total_upvotes / total_replies.count()) if total_replies.count() > 0 else 0
        
        # Today's stats
        today_posts = RedditPost.objects.filter(scraped_at__date=today).count()
        today_opportunities = Classification.objects.filter(
            is_opportunity=True, created_at__date=today
        ).count()
        today_replies = Reply.objects.filter(
            status='posted', posted_at__date=today
        ).count()
        
        # Top subreddits
        top_subreddits = RedditPost.objects.values('subreddit').annotate(
            count=Count('id')
        ).order_by('-count')[:5]
        
        # Recent notifications
        recent_notifications = Notification.objects.filter(
            created_at__gte=week_ago
        ).order_by('-created_at')[:10]
        
        data = {
            'total_posts': total_posts,
            'opportunities_found': opportunities_found,
            'replies_posted': replies_posted,
            'engagement_rate': round(engagement_rate, 2),
            'today_posts': today_posts,
            'today_opportunities': today_opportunities,
            'today_replies': today_replies,
            'top_subreddits': list(top_subreddits),
            'recent_notifications': NotificationSerializer(recent_notifications, many=True).data,
        }
        
        serializer = DashboardStatsSerializer(data)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def leads(self, request):
        """Get recent leads with high priority"""
        leads = Classification.objects.filter(
            is_opportunity=True,
            priority__in=['high', 'urgent']
        ).select_related('post').prefetch_related('post__replies')
        
        lead_summaries = []
        for classification in leads:
            replies = classification.post.replies.all()
            engagement_score = sum(reply.upvotes for reply in replies)
            
            lead_summary = {
                'post': RedditPostSerializer(classification.post).data,
                'classification': ClassificationSerializer(classification).data,
                'replies': ReplySerializer(replies, many=True).data,
                'engagement_score': engagement_score,
            }
            lead_summaries.append(lead_summary)
        
        return Response(lead_summaries)
