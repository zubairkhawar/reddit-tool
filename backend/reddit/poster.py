import praw
from django.conf import settings
from django.utils import timezone
from .models import Reply, Notification
import logging
import time
import random

logger = logging.getLogger(__name__)


class RedditPoster:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT,
            # Add your Reddit username and password here for posting
            # username='your_username',
            # password='your_password',
        )
    
    def post_pending_replies(self):
        """Post pending replies to Reddit"""
        pending_replies = Reply.objects.filter(status='pending')
        posted_count = 0
        
        for reply in pending_replies:
            try:
                # Add random delay to avoid rate limiting
                time.sleep(random.uniform(3, 8))
                
                success = self._post_reply(reply)
                if success:
                    posted_count += 1
                    
            except Exception as e:
                logger.error(f"Error posting reply {reply.id}: {e}")
                reply.status = 'failed'
                reply.error_message = str(e)
                reply.save()
        
        return posted_count
    
    def _post_reply(self, reply):
        """Post a single reply to Reddit"""
        try:
            # Get the Reddit submission
            submission = self.reddit.submission(id=reply.post.post_id)
            
            # Post the comment
            comment = submission.reply(reply.content)
            
            # Update reply status
            reply.status = 'posted'
            reply.reddit_comment_id = comment.id
            reply.posted_at = timezone.now()
            reply.save()
            
            logger.info(f"Successfully posted reply {reply.id} to Reddit")
            
            # Create notification
            Notification.objects.create(
                message=f"Reply posted to: {reply.post.title[:50]}...",
                notification_type='info',
                related_reply=reply
            )
            
            return True
            
        except Exception as e:
            logger.error(f"Error posting reply {reply.id}: {e}")
            reply.status = 'failed'
            reply.error_message = str(e)
            reply.save()
            return False
    
    def update_engagement_metrics(self):
        """Update engagement metrics for posted replies"""
        posted_replies = Reply.objects.filter(
            status='posted',
            reddit_comment_id__isnull=False
        )
        
        updated_count = 0
        
        for reply in posted_replies:
            try:
                # Add random delay
                time.sleep(random.uniform(1, 3))
                
                # Get the comment from Reddit
                comment = self.reddit.comment(id=reply.reddit_comment_id)
                
                # Update metrics
                reply.upvotes = comment.score
                reply.downvotes = 0  # Reddit API doesn't provide downvotes directly
                reply.reply_count = len(comment.replies)
                reply.save()
                
                # Check for high engagement
                if reply.upvotes >= 5:
                    Notification.objects.create(
                        message=f"High engagement on reply: {reply.post.title[:50]}... ({reply.upvotes} upvotes)",
                        notification_type='engagement',
                        related_reply=reply
                    )
                
                updated_count += 1
                
            except Exception as e:
                logger.error(f"Error updating engagement for reply {reply.id}: {e}")
        
        return updated_count
    
    def approve_reply(self, reply_id):
        """Approve a reply for posting"""
        try:
            reply = Reply.objects.get(id=reply_id)
            reply.status = 'approved'
            reply.save()
            
            # Post the reply
            success = self._post_reply(reply)
            return success
            
        except Reply.DoesNotExist:
            logger.error(f"Reply {reply_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error approving reply {reply_id}: {e}")
            return False
    
    def reject_reply(self, reply_id):
        """Reject a reply"""
        try:
            reply = Reply.objects.get(id=reply_id)
            reply.status = 'rejected'
            reply.save()
            
            logger.info(f"Rejected reply {reply_id}")
            return True
            
        except Reply.DoesNotExist:
            logger.error(f"Reply {reply_id} not found")
            return False
        except Exception as e:
            logger.error(f"Error rejecting reply {reply_id}: {e}")
            return False 