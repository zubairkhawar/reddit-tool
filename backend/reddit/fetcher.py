import praw
from django.conf import settings
from django.utils import timezone
from datetime import datetime, timedelta
import pytz
from .models import RedditPost, Keyword, Subreddit
import logging
import time

logger = logging.getLogger(__name__)


class RedditFetcher:
    def __init__(self):
        self.reddit = praw.Reddit(
            client_id=settings.REDDIT_CLIENT_ID,
            client_secret=settings.REDDIT_CLIENT_SECRET,
            user_agent=settings.REDDIT_USER_AGENT,
        )
    
    def fetch_posts(self, hours_back=96, group_id=None):  # Added group_id parameter
        """Fetch posts from monitored subreddits"""
        active_subreddits = Subreddit.objects.filter(is_active=True)
        active_keywords = Keyword.objects.filter(is_active=True)
        
        # Filter by group if specified
        if group_id:
            active_subreddits = active_subreddits.filter(group_id=group_id)
            active_keywords = active_keywords.filter(group_id=group_id)
        
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
                
                # Rate limiting between subreddits
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Error fetching posts from r/{subreddit.name}: {e}")
        
        return fetched_posts
    
    def _fetch_subreddit_posts(self, subreddit_name, cutoff_time):
        """Fetch posts from a specific subreddit"""
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            posts = []
            
            # Fetch 50 new posts (reduced from 100)
            for submission in subreddit.new(limit=50):
                # Check if post is recent enough
                post_time = datetime.fromtimestamp(submission.created_utc, tz=pytz.UTC)
                if post_time < cutoff_time:
                    continue
                
                # Check if post contains any monitored keywords
                if self._contains_keywords(submission.title + " " + submission.selftext):
                    post_data = self._extract_post_data(submission)
                    posts.append(post_data)
            
            # Also check 25 hot posts (reduced from 50)
            for submission in subreddit.hot(limit=25):
                post_time = datetime.fromtimestamp(submission.created_utc, tz=pytz.UTC)
                if post_time < cutoff_time:
                    continue
                
                if self._contains_keywords(submission.title + " " + submission.selftext):
                    post_data = self._extract_post_data(submission)
                    posts.append(post_data)
            
            return posts
        except Exception as e:
            logger.error(f"Error fetching from r/{subreddit_name}: {e}")
            return []
    
    def _contains_keywords(self, text):
        """Check if text contains any monitored keywords with improved scoring"""
        text_lower = text.lower()
        active_keywords = Keyword.objects.filter(is_active=True)
        
        # Score the post based on keyword matches
        score = 0
        matched_keywords = []
        
        for keyword in active_keywords:
            if keyword.keyword.lower() in text_lower:
                score += 1
                matched_keywords.append(keyword.keyword)
        
        # Lower threshold for better lead detection
        if score >= 1:  # Changed from 2 to 1
            logger.info(f"Post found with keywords: {matched_keywords}")
            return True
        
        # Check for high-priority keywords (AI, web development, hiring terms)
        high_priority_keywords = [
            'ai automation', 'langchain', 'langgraph', 'web development', 'webdev',
            'django', 'next.js', 'react', 'data analysis', 'need help', 'hiring',
            'freelancer', 'looking for developer', 'want to hire', 'for hire',
            'freelance developer', 'developer needed', 'help with project',
            'build', 'create', 'develop', 'implement', 'setup', 'project',
            'work', 'job', 'gig', 'contract', 'budget', 'paid', 'compensation'
        ]
        
        for keyword in high_priority_keywords:
            if keyword in text_lower:
                logger.info(f"High-priority keyword found: {keyword}")
                return True
        
        return False
    
    def _extract_post_data(self, submission):
        """Extract relevant data from a Reddit submission"""
        # Get or create the subreddit instance
        subreddit_name = submission.subreddit.display_name
        subreddit, created = Subreddit.objects.get_or_create(
            name=subreddit_name,
            defaults={'is_active': True}
        )
        
        return {
            'reddit_id': submission.id,
            'title': submission.title,
            'content': submission.selftext,
            'author': str(submission.author) if submission.author else '[deleted]',
            'subreddit': subreddit,  # Use the Subreddit instance
            'url': f"https://reddit.com{submission.permalink}",
            'score': submission.score,
            'comment_count': submission.num_comments,
            'created_at': datetime.fromtimestamp(submission.created_utc, tz=pytz.UTC),
        }
    
    def save_posts(self, posts_data):
        """Save fetched posts to database"""
        saved_posts = []
        
        for post_data in posts_data:
            try:
                # Check if post already exists
                if RedditPost.objects.filter(reddit_id=post_data['reddit_id']).exists():
                    continue
                
                # Create new post
                post = RedditPost.objects.create(**post_data)
                saved_posts.append(post)
                logger.info(f"Saved post: {post.title[:50]}...")
                
            except Exception as e:
                logger.error(f"Error saving post {post_data.get('reddit_id', 'unknown')}: {e}")
        
        return saved_posts
    
    def fetch_and_save(self, hours_back=96, group_id=None):  # Added group_id parameter
        """Main method to fetch and save posts"""
        logger.info(f"Starting Reddit fetch for last {hours_back} hours")
        if group_id:
            logger.info(f"Filtering by group ID: {group_id}")
        
        # Fetch posts
        posts_data = self.fetch_posts(hours_back, group_id)
        logger.info(f"Fetched {len(posts_data)} posts")
        
        # Save posts
        saved_posts = self.save_posts(posts_data)
        logger.info(f"Saved {len(saved_posts)} new posts")
        
        return saved_posts 