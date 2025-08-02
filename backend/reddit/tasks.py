from celery import shared_task
from django.utils import timezone
from .fetcher import RedditFetcher
from langagent.agent import RedditLeadAgent
from .models import RedditPost, Reply, Notification
import logging

logger = logging.getLogger(__name__)


@shared_task
def fetch_reddit_posts():
    """Fetch new Reddit posts from monitored subreddits"""
    try:
        fetcher = RedditFetcher()
        saved_posts = fetcher.fetch_and_save(hours_back=24)
        
        logger.info(f"Successfully fetched {len(saved_posts)} new posts")
        return len(saved_posts)
        
    except Exception as e:
        logger.error(f"Error in fetch_reddit_posts task: {e}")
        return 0


@shared_task
def process_posts_with_ai():
    """Process unclassified posts with AI"""
    try:
        agent = RedditLeadAgent()
        processed_count = agent.process_unclassified_posts()
        
        logger.info(f"Successfully processed {processed_count} posts with AI")
        return processed_count
        
    except Exception as e:
        logger.error(f"Error in process_posts_with_ai task: {e}")
        return 0


@shared_task
def post_replies_to_reddit():
    """Post approved replies to Reddit"""
    try:
        from .poster import RedditPoster
        
        poster = RedditPoster()
        posted_count = poster.post_pending_replies()
        
        logger.info(f"Successfully posted {posted_count} replies to Reddit")
        return posted_count
        
    except Exception as e:
        logger.error(f"Error in post_replies_to_reddit task: {e}")
        return 0


@shared_task
def update_engagement_metrics():
    """Update engagement metrics for posted replies"""
    try:
        from .poster import RedditPoster
        
        poster = RedditPoster()
        updated_count = poster.update_engagement_metrics()
        
        logger.info(f"Successfully updated {updated_count} engagement metrics")
        return updated_count
        
    except Exception as e:
        logger.error(f"Error in update_engagement_metrics task: {e}")
        return 0


@shared_task
def send_notifications():
    """Send notifications for important events"""
    try:
        # Check for unread high priority notifications
        high_priority_notifications = Notification.objects.filter(
            is_read=False,
            notification_type__in=['high_priority', 'engagement']
        )
        
        for notification in high_priority_notifications:
            # Here you would integrate with Telegram, email, etc.
            # For now, just mark as read
            notification.is_read = True
            notification.save()
        
        logger.info(f"Processed {high_priority_notifications.count()} notifications")
        return high_priority_notifications.count()
        
    except Exception as e:
        logger.error(f"Error in send_notifications task: {e}")
        return 0


@shared_task
def daily_maintenance():
    """Daily maintenance tasks"""
    try:
        # Clean up old posts (older than 30 days)
        cutoff_date = timezone.now() - timezone.timedelta(days=30)
        old_posts = RedditPost.objects.filter(scraped_at__lt=cutoff_date)
        deleted_count = old_posts.count()
        old_posts.delete()
        
        # Update performance metrics
        from .models import PerformanceMetrics
        today = timezone.now().date()
        
        metrics, created = PerformanceMetrics.objects.get_or_create(date=today)
        metrics.posts_scraped = RedditPost.objects.filter(scraped_at__date=today).count()
        metrics.opportunities_found = RedditPost.objects.filter(
            classification__is_opportunity=True,
            classification__created_at__date=today
        ).count()
        metrics.replies_posted = Reply.objects.filter(
            status='posted',
            posted_at__date=today
        ).count()
        metrics.save()
        
        logger.info(f"Daily maintenance completed. Deleted {deleted_count} old posts.")
        return deleted_count
        
    except Exception as e:
        logger.error(f"Error in daily_maintenance task: {e}")
        return 0 