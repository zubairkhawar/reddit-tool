#!/usr/bin/env python3
"""
Test script to fetch Reddit posts and test the RedditLead.AI system
"""
import os
import sys
import django
from decouple import config

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.models import Keyword, Subreddit, RedditPost
from reddit.fetcher import RedditFetcher
from langagent.agent import RedditLeadAgent
from django.utils import timezone

def test_reddit_fetcher():
    """Test the Reddit fetcher with sample data"""
    try:
        print("🔍 Testing RedditLead.AI System...")
        
        # Get keywords and subreddits
        keywords = Keyword.objects.filter(is_active=True)
        subreddits = Subreddit.objects.filter(is_active=True)
        
        print(f"📝 Found {keywords.count()} active keywords")
        print(f"📊 Found {subreddits.count()} active subreddits")
        
        if keywords.count() == 0 or subreddits.count() == 0:
            print("❌ No keywords or subreddits found. Please add some via the frontend first.")
            return False
        
        # Initialize fetcher
        fetcher = RedditFetcher()
        
        # Test fetching posts
        print(f"\n📡 Testing Reddit fetch...")
        
        # Fetch posts
        posts = fetcher.fetch_posts(hours_back=24)
        
        if posts:
            print(f"✅ Successfully fetched {len(posts)} posts")
            
            # Test AI agent
            agent = RedditLeadAgent()
            
            for post_data in posts[:3]:  # Test first 3 posts
                print(f"\n🤖 Testing AI classification for: {post_data['title'][:50]}...")
                
                # Create a mock post object for testing
                class MockPost:
                    def __init__(self, data):
                        self.title = data['title']
                        self.body = data['content']  # Changed from 'body' to 'content'
                        self.id = data['reddit_id']  # Changed from 'post_id' to 'reddit_id'
                
                mock_post = MockPost(post_data)
                
                # Classify post
                classification = agent.classify_post(mock_post)
                if classification:
                    print(f"   Classification: {classification.is_opportunity}")
                    
                    if classification.is_opportunity:
                        print(f"   💼 OPPORTUNITY FOUND!")
                        print(f"   Intent: {classification.intent}")
                        print(f"   Priority: {classification.priority}")
                        print(f"   Budget: {classification.budget_amount}")
                        
                        # Generate reply
                        reply = agent.generate_reply(mock_post, classification)
                        if reply:
                            print(f"   💬 Generated reply: {reply.content[:100]}...")
        
        else:
            print("⚠️ No posts fetched. This might be normal if the subreddit is quiet.")
        
        print("\n🎉 RedditLead.AI test completed!")
        return True
        
    except Exception as e:
        print(f"\n❌ Test failed: {str(e)}")
        return False

def show_current_data():
    """Show current data in the system"""
    print("\n📊 Current System Data:")
    print("=" * 40)
    
    # Keywords
    keywords = Keyword.objects.filter(is_active=True)
    print(f"Keywords ({keywords.count()}):")
    for kw in keywords[:10]:  # Show first 10
        print(f"  - {kw.keyword}")
    if keywords.count() > 10:
        print(f"  ... and {keywords.count() - 10} more")
    
    # Subreddits
    subreddits = Subreddit.objects.filter(is_active=True)
    print(f"\nSubreddits ({subreddits.count()}):")
    for sub in subreddits[:10]:  # Show first 10
        print(f"  - r/{sub.name}")
    if subreddits.count() > 10:
        print(f"  ... and {subreddits.count() - 10} more")
    
    # Posts
    posts = RedditPost.objects.all()
    print(f"\nPosts ({posts.count()}):")
    for post in posts[:5]:  # Show first 5
        print(f"  - {post.title[:50]}... (r/{post.subreddit.name})")
    if posts.count() > 5:
        print(f"  ... and {posts.count() - 5} more")

if __name__ == "__main__":
    print("🚀 RedditLead.AI - System Test")
    print("=" * 50)
    
    # Show current data
    show_current_data()
    
    # Test the system
    success = test_reddit_fetcher()
    
    if success:
        print("\n🎉 All tests PASSED! Your RedditLead.AI is ready to use.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check the output above.")
        sys.exit(1) 