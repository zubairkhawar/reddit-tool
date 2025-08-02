import praw
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
from .models import RedditPost, Keyword, Subreddit
import logging

logger = logging.getLogger(__name__)


class RedditFetcher:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT,
        )
    
    def fetch_posts(self, hours_back=24):
        """Fetch posts from monitored subreddits"""
        active_subreddits = Subreddit.objects.filter(is_active=True)
        active_keywords = Keyword.objects.filter(is_active=True)
        
        if not active_subreddits.exists():
            logger.warning("No active subreddits configured")
            return []
        
        if not active_keywords.exists():
            logger.warning("No active keywords configured")
            return []
        
        fetched_posts = []
        cutoff_time = timezone.now() - timedelta(hours=hours_back)
        
        for subreddit in active_subreddits:
            try:
                subreddit_posts = self._fetch_subreddit_posts(subreddit.name, cutoff_time)
                fetched_posts.extend(subreddit_posts)
                logger.info(f"Fetched {len(subreddit_posts)} posts from r/{subreddit.name}")
            except Exception as e:
                logger.error(f"Error fetching posts from r/{subreddit.name}: {e}")
        
        return fetched_posts
    
    def _fetch_subreddit_posts(self, subreddit_name, cutoff_time):
        """Fetch posts from a specific subreddit"""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts = []
            
            # Fetch new posts
            for submission in subreddit.new(limit=100):
                # Check if post is recent enough
                post_time = datetime.fromtimestamp(submission.created_utc, tz=timezone.utc)
                if post_time < cutoff_time:
                    continue
                
                # Check if post contains any monitored keywords
                if self._contains_keywords(submission.title + " " + submission.selftext):
                    post_data = self._extract_post_data(submission)
                    posts.append(post_data)
            
            return posts
        except Exception as e:
            logger.error(f"Error fetching from r/{subreddit_name}: {e}")
            return []
    
    def _contains_keywords(self, text):
        """Check if text contains any monitored keywords"""
        text_lower = text.lower()
        active_keywords = Keyword.objects.filter(is_active=True)
        
        for keyword in active_keywords:
            if keyword.keyword.lower() in text_lower:
                return True
        
        return False
    
    def _extract_post_data(self, submission):
        """Extract relevant data from a Reddit submission"""
        return {
            'post_id': submission.id,
            'title': submission.title,
            'body': submission.selftext,
            'author': str(submission.author) if submission.author else '[deleted]',
            'subreddit': submission.subreddit.display_name,
            'url': f"https://reddit.com{submission.permalink}",
            'score': submission.score,
            'num_comments': submission.num_comments,
            'created_utc': datetime.fromtimestamp(submission.created_utc, tz=timezone.utc),
        }
    
    def save_posts(self, posts_data):
        """Save fetched posts to database"""
        saved_posts = []
        
        for post_data in posts_data:
            try:
                # Check if post already exists
                if RedditPost.objects.filter(post_id=post_data['post_id']).exists():
                    continue
                
                # Create new post
                post = RedditPost.objects.create(**post_data)
                saved_posts.append(post)
                logger.info(f"Saved post: {post.title[:50]}...")
                
            except Exception as e:
                logger.error(f"Error saving post {post_data.get('post_id', 'unknown')}: {e}")
        
        return saved_posts
    
    def fetch_and_save(self, hours_back=24):
        """Main method to fetch and save posts"""
        logger.info(f"Starting Reddit fetch for last {hours_back} hours")
        
        # Fetch posts
        posts_data = self.fetch_posts(hours_back)
        logger.info(f"Fetched {len(posts_data)} posts")
        
        # Save posts
        saved_posts = self.save_posts(posts_data)
        logger.info(f"Saved {len(saved_posts)} new posts")
        
        return saved_posts 