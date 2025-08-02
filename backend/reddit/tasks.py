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
def send_notification(notification_type, title, message, post_id=None, reply_id=None):
    """Send notification via multiple channels"""
    from django.utils import timezone
    
    # Create notification record
    notification = Notification.objects.create(
        notification_type=notification_type,
        title=title,
        message=message,
        post_id=post_id
    )
    
    # Send via Telegram if enabled
    telegram_enabled = SystemConfig.get_value('telegram_bot_enabled', 'false').lower() == 'true'
    if telegram_enabled:
        try:
            telegram_token = config('TELEGRAM_BOT_TOKEN', default='')
            chat_id = config('TELEGRAM_CHAT_ID', default='')
            
            if telegram_token and chat_id:
                import telegram
                bot = telegram.Bot(token=telegram_token)
                bot.send_message(
                    chat_id=chat_id,
                    text=f"🔔 {title}\n\n{message}"
                )
        except Exception as e:
            logger.error(f"Error sending Telegram notification: {e}")
    
    # Send via WhatsApp if enabled
    whatsapp_enabled = SystemConfig.get_value('whatsapp_bot_enabled', 'false').lower() == 'true'
    if whatsapp_enabled:
        try:
            send_whatsapp_notification.delay(notification.id)
        except Exception as e:
            logger.error(f"Error sending WhatsApp notification: {e}")
    
    return notification.id

@shared_task
def send_whatsapp_notification(notification_id):
    """Send notification via WhatsApp Business API"""
    from django.utils import timezone
    
    try:
        notification = Notification.objects.get(id=notification_id)
        
        # WhatsApp Business API credentials
        access_token = config('WHATSAPP_ACCESS_TOKEN', default='')
        phone_number_id = config('WHATSAPP_PHONE_NUMBER_ID', default='')
        to_phone_number = config('WHATSAPP_TO_PHONE_NUMBER', default='')
        
        if not all([access_token, phone_number_id, to_phone_number]):
            logger.warning("WhatsApp credentials not configured")
            return
        
        # Prepare message
        message_text = f"🔔 {notification.title}\n\n{notification.message}"
        
        # Send via WhatsApp Business API
        import requests
        
        url = f"https://graph.facebook.com/v17.0/{phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {access_token}",
            "Content-Type": "application/json"
        }
        data = {
            "messaging_product": "whatsapp",
            "to": to_phone_number,
            "type": "text",
            "text": {"body": message_text}
        }
        
        response = requests.post(url, headers=headers, json=data)
        
        if response.status_code == 200:
            result = response.json()
            notification.whatsapp_sent = True
            notification.whatsapp_sent_at = timezone.now()
            notification.whatsapp_message_id = result.get('messages', [{}])[0].get('id', '')
            notification.save()
            logger.info(f"WhatsApp notification sent successfully: {notification.title}")
        else:
            logger.error(f"WhatsApp API error: {response.status_code} - {response.text}")
            
    except Exception as e:
        logger.error(f"Error sending WhatsApp notification: {e}")


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

@shared_task
def monitor_old_leads():
    """Monitor old leads for new activity and engagement changes"""
    from django.utils import timezone
    from datetime import timedelta
    
    # Get posts that haven't been monitored recently
    cutoff_date = timezone.now() - timedelta(days=1)
    old_posts = RedditPost.objects.filter(
        monitoring_enabled=True,
        last_monitored_at__lt=cutoff_date,
        is_opportunity=True
    )
    
    for post in old_posts:
        try:
            # Fetch updated post data from Reddit
            reddit = get_reddit_client()
            submission = reddit.submission(id=post.reddit_id)
            
            # Check for engagement changes
            old_score = post.score
            old_comments = post.comment_count
            
            if submission.score != old_score or submission.num_comments != old_comments:
                post.engagement_increased = True
                post.new_comments_since_last_check = submission.num_comments - old_comments
                post.score = submission.score
                post.comment_count = submission.num_comments
                post.save()
                
                # Send notification for engagement increase
                if post.engagement_increased:
                    send_notification.delay(
                        notification_type='engagement_increase',
                        title=f'Engagement increased for post: {post.title[:50]}',
                        message=f'Post score: {old_score} → {post.score}, Comments: {old_comments} → {post.comment_count}',
                        post_id=post.id
                    )
            
            post.last_monitored_at = timezone.now()
            post.save()
            
        except Exception as e:
            logger.error(f"Error monitoring old lead {post.reddit_id}: {e}")

@shared_task
def send_follow_ups():
    """Send follow-up replies to posts with increased engagement"""
    from django.utils import timezone
    
    # Get posts that need follow-ups
    posts_needing_follow_up = RedditPost.objects.filter(
        follow_up_sent=False,
        engagement_increased=True
    )
    
    for post in posts_needing_follow_up:
        if post.should_send_follow_up():
            try:
                # Generate follow-up content
                follow_up_content = generate_follow_up_content(post)
                
                # Post follow-up via Reddit
                reddit = get_reddit_client()
                submission = reddit.submission(id=post.reddit_id)
                comment = submission.reply(follow_up_content)
                
                # Update post with follow-up info
                post.follow_up_sent = True
                post.follow_up_sent_at = timezone.now()
                post.follow_up_content = follow_up_content
                post.save()
                
                # Create reply record
                Reply.objects.create(
                    post=post,
                    content=follow_up_content,
                    status='posted',
                    reddit_comment_id=comment.id,
                    posted_at=timezone.now()
                )
                
                # Send notification
                send_notification.delay(
                    notification_type='follow_up_sent',
                    title=f'Follow-up sent for: {post.title[:50]}',
                    message=f'Follow-up posted with {len(follow_up_content)} characters',
                    post_id=post.id
                )
                
            except Exception as e:
                logger.error(f"Error sending follow-up for post {post.reddit_id}: {e}")

def generate_follow_up_content(post):
    """Generate follow-up content based on post engagement"""
    if post.engagement_increased and post.score > 10:
        return f"""Thanks for the engagement on this post! I'm still available to help with this project. 

I noticed this post is getting good traction - would love to discuss how I can contribute to making this a success. Feel free to DM me with any questions!"""
    
    elif post.new_comments_since_last_check > 0:
        return f"""I see there's been some new discussion on this post. I'm still interested in helping with this project and would love to hear more about the current status. 

What's the latest on this? I'm ready to jump in whenever you are!"""
    
    else:
        return f"""Just checking in on this project - still very interested in helping out! 

Let me know if you're still looking for someone to work on this or if you have any questions about my approach.""" 