from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.utils import timezone
from datetime import timedelta
from reddit.models import (
    Group, Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics, SystemConfig, Leaderboard
)
from langagent.models import AILearningData, AIPromptTemplate, AIPerformanceMetrics
from .serializers import (
    KeywordSerializer, 
    SubredditSerializer, 
    GroupSerializer, 
    GroupWithDataSerializer,
    RedditPostSerializer, 
    ClassificationSerializer, 
    ReplySerializer,
    NotificationSerializer,
    AIPersonaSerializer,
    PerformanceMetricsSerializer,
    DashboardStatsSerializer,
    LeadSummarySerializer,
    SystemConfigSerializer,
    LeaderboardSerializer,
    AILearningDataSerializer,
    AIPromptTemplateSerializer,
    AIPerformanceMetricsSerializer
)
from django.shortcuts import get_object_or_404
from reddit.poster import RedditPoster
from reddit.fetcher import RedditFetcher
from langagent.agent import RedditLeadAgent
import subprocess
import os


class GroupViewSet(viewsets.ModelViewSet):
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'])
    def with_data(self, request):
        """Get all groups with their keywords and subreddits in a single optimized query"""
        try:
            # Use prefetch_related to optimize database queries
            groups = Group.objects.prefetch_related('keywords', 'subreddits').all()
            serializer = GroupWithDataSerializer(groups, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class KeywordViewSet(viewsets.ModelViewSet):
    queryset = Keyword.objects.all()
    serializer_class = KeywordSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Keyword.objects.all()
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset


class SubredditViewSet(viewsets.ModelViewSet):
    queryset = Subreddit.objects.all()
    serializer_class = SubredditSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = Subreddit.objects.all()
        group_id = self.request.query_params.get('group_id')
        if group_id:
            queryset = queryset.filter(group_id=group_id)
        return queryset


class RedditPostViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = RedditPost.objects.all()
    serializer_class = RedditPostSerializer
    permission_classes = [permissions.AllowAny]
    
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

    @action(detail=False, methods=['get'])
    def test(self, request):
        """Test action to verify @action decorator works"""
        return Response({'status': 'test_action_works_reloaded'})

    @action(detail=False, methods=['get'])
    def new_test(self, request):
        """New test method"""
        return Response({'status': 'new_test_works'})

    @action(detail=False, methods=['get'])
    def debug_test(self, request):
        """Get old leads that are being monitored"""
        print("DEBUG: debug_test method called")  # Add print statement
        # Simplified version for testing
        return Response([])

    @action(detail=False, methods=['get'])
    def follow_up_candidates(self, request):
        """Get posts that need follow-up replies"""
        follow_up_candidates = RedditPost.objects.filter(
            is_opportunity=True,
            engagement_increased=True,
            follow_up_sent=False
        ).order_by('-created_at')
        
        serializer = RedditPostSerializer(follow_up_candidates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def enable_monitoring(self, request, pk=None):
        """Enable monitoring for a post"""
        post = self.get_object()
        post.monitoring_enabled = True
        post.save()
        return Response({'status': 'monitoring_enabled'})

    @action(detail=True, methods=['post'])
    def disable_monitoring(self, request, pk=None):
        """Disable monitoring for a post"""
        post = self.get_object()
        post.monitoring_enabled = False
        post.save()
        return Response({'status': 'monitoring_disabled'})

    @action(detail=True, methods=['post'])
    def send_follow_up(self, request, pk=None):
        """Send a follow-up reply to a post"""
        post = self.get_object()
        content = request.data.get('content', '')
        
        if not content:
            return Response({'error': 'Content is required'}, status=400)
        
        # Create a reply for the follow-up
        reply = Reply.objects.create(
            post=post,
            content=content,
            status='posted',
            posted_at=timezone.now()
        )
        
        # Update post with follow-up info
        post.follow_up_sent = True
        post.follow_up_sent_at = timezone.now()
        post.follow_up_content = content
        post.save()
        
        return Response({'status': 'follow_up_sent', 'reply_id': reply.id})

    @action(detail=False, methods=['get'])
    def final_test(self, request):
        """Final test method at the end of the class"""
        return Response({'status': 'final_test_works'})


class ClassificationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Classification.objects.all()
    serializer_class = ClassificationSerializer
    permission_classes = [permissions.AllowAny]
    
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
    filterset_fields = ['status', 'requires_manual_approval']
    search_fields = ['content', 'post__title']
    ordering_fields = ['created_at', 'confidence_score', 'upvotes']
    ordering = ['-created_at']
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        queryset = super().get_queryset()
        status = self.request.query_params.get('status', None)
        requires_approval = self.request.query_params.get('requires_approval', None)
        
        if status:
            queryset = queryset.filter(status=status)
        if requires_approval is not None:
            queryset = queryset.filter(requires_manual_approval=requires_approval.lower() == 'true')
        
        return queryset

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a reply for posting"""
        reply = self.get_object()
        reply.status = 'approved'
        reply.approved_at = timezone.now()
        
        # Only set approved_by if user is authenticated
        if request.user.is_authenticated:
            reply.approved_by = request.user
        
        reply.save()
        
        # Create notification
        Notification.objects.create(
            notification_type='reply_posted',
            title='Reply Approved',
            message=f'Reply to "{reply.post.title[:50]}..." has been approved.',
            post=reply.post
        )
        
        # Post the reply to Reddit using RedditPoster
        reddit_poster = RedditPoster()
        try:
            # Use edited content if available, otherwise use original content
            content_to_post = reply.edited_content if reply.edited_content else reply.content
            reply.content = content_to_post  # Update the main content with edited version
            
            success = reddit_poster._post_reply(reply)
            if success:
                return Response({'status': 'approved_and_posted', 'reply_id': reply.id})
            else:
                reply.status = 'rejected'  # Revert status on failure
                reply.save()
                return Response({'status': 'approved_failed_to_post', 'error': 'Failed to post to Reddit'}, status=500)
        except Exception as e:
            reply.status = 'rejected'  # Revert status on failure
            reply.save()
            return Response({'status': 'approved_failed_to_post', 'error': str(e)}, status=500)

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        reply = self.get_object()
        reply.status = 'rejected'
        reply.save()
        return Response({'status': 'rejected'})

    @action(detail=True, methods=['post'])
    def mark_successful(self, request, pk=None):
        """Mark a reply as successful"""
        reply = self.get_object()
        reply.marked_successful = True
        reply.marked_successful_at = timezone.now()
        
        # Only set marked_successful_by if user is authenticated
        if request.user.is_authenticated:
            reply.marked_successful_by = request.user
        
        reply.success_notes = request.data.get('notes', '')
        reply.save()
        
        return Response({'status': 'marked_successful'})

    @action(detail=True, methods=['post'])
    def edit_content(self, request, pk=None):
        reply = self.get_object()
        reply.edited_content = request.data.get('content', '')
        reply.save()
        return Response({'status': 'content_edited'})


class NotificationViewSet(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]
    
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
    permission_classes = [permissions.AllowAny]


class PerformanceMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PerformanceMetrics.objects.all()
    serializer_class = PerformanceMetricsSerializer
    permission_classes = [permissions.AllowAny]


class DashboardViewSet(viewsets.ViewSet):
    permission_classes = [permissions.AllowAny]
    
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
        today_posts = RedditPost.objects.filter(fetched_at__date=today).count()
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

    @action(detail=False, methods=['post'])
    def run_test(self, request):
        """Run the Reddit fetcher test"""
        try:
            # Get group_id from request
            group_id = request.data.get('group_id')
            
            # Initialize fetcher and run test
            fetcher = RedditFetcher()
            saved_posts = fetcher.fetch_and_save(hours_back=96, group_id=group_id)  # 4 days
            
            # Process posts with AI agent
            agent = RedditLeadAgent()
            processed_count = agent.process_unclassified_posts()
            
            # Get group info if specified
            group_info = None
            if group_id:
                try:
                    group = Group.objects.get(id=group_id)
                    group_info = {
                        'id': group.id,
                        'name': group.name,
                        'keywords_count': group.keywords.count(),
                        'subreddits_count': group.subreddits.count()
                    }
                except Group.DoesNotExist:
                    pass
            
            return Response({
                'success': True,
                'message': f'Test completed successfully',
                'posts_saved': len(saved_posts),
                'posts_processed': processed_count,
                'opportunities_found': Classification.objects.filter(is_opportunity=True).count(),
                'group': group_info
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Test failed: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=False, methods=['post'])
    def clear_posts(self, request):
        """Clear all scraped posts"""
        try:
            # Clear all posts and related data
            posts_deleted = RedditPost.objects.count()
            classifications_deleted = Classification.objects.count()
            replies_deleted = Reply.objects.count()
            
            RedditPost.objects.all().delete()
            Classification.objects.all().delete()
            Reply.objects.all().delete()
            
            return Response({
                'success': True,
                'message': 'All posts cleared successfully',
                'posts_deleted': posts_deleted,
                'classifications_deleted': classifications_deleted,
                'replies_deleted': replies_deleted
            })
            
        except Exception as e:
            return Response({
                'success': False,
                'message': f'Failed to clear posts: {str(e)}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class SystemConfigViewSet(viewsets.ModelViewSet):
    queryset = SystemConfig.objects.all()
    serializer_class = SystemConfigSerializer
    lookup_field = 'key'
    
    def get_object(self):
        key = self.kwargs.get('key')
        return get_object_or_404(SystemConfig, key=key)


class LeaderboardViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Leaderboard.objects.all()
    serializer_class = LeaderboardSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        metric_type = self.request.query_params.get('metric_type')
        if metric_type:
            queryset = queryset.filter(metric_type=metric_type)
        return queryset.order_by('-last_updated')


class AIPerformanceMetricsViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIPerformanceMetrics.objects.all()
    serializer_class = AIPerformanceMetricsSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        days = self.request.query_params.get('days', 30)
        if days:
            cutoff_date = timezone.now().date() - timedelta(days=int(days))
            queryset = queryset.filter(date__gte=cutoff_date)
        return queryset.order_by('-date')


class AILearningDataViewSet(viewsets.ModelViewSet):
    queryset = AILearningData.objects.all()
    serializer_class = AILearningDataSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return super().get_queryset().order_by('-created_at')


class AIPromptTemplateViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AIPromptTemplate.objects.all()
    serializer_class = AIPromptTemplateSerializer
    permission_classes = [permissions.AllowAny]
    
    def get_queryset(self):
        return super().get_queryset().filter(is_active=True).order_by('-version')
