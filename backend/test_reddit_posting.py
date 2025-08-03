#!/usr/bin/env python3
"""
Test script to verify Reddit posting functionality
"""
import os
import sys
import django
from decouple import config

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.poster import RedditPoster
from reddit.models import Reply, RedditPost, Subreddit
from django.utils import timezone

def test_reddit_posting():
    """Test Reddit posting functionality"""
    print("🔍 Testing Reddit posting functionality...")
    
    # Check if Reddit credentials are configured
    client_id = config('REDDIT_CLIENT_ID', default='')
    client_secret = config('REDDIT_CLIENT_SECRET', default='')
    username = config('REDDIT_USERNAME', default='')
    password = config('REDDIT_PASSWORD', default='')
    
    if not all([client_id, client_secret, username, password]):
        print("❌ Reddit credentials not configured!")
        print("Please set the following environment variables:")
        print("- REDDIT_CLIENT_ID")
        print("- REDDIT_CLIENT_SECRET") 
        print("- REDDIT_USERNAME")
        print("- REDDIT_PASSWORD")
        return False
    
    print("✅ Reddit credentials found")
    
    try:
        # Initialize RedditPoster
        poster = RedditPoster()
        print("✅ RedditPoster initialized successfully")
        
        # Test authentication
        user = poster.reddit.user.me()
        print(f"✅ Authenticated as: {user}")
        
        # Find a test reply
        test_reply = Reply.objects.filter(status='approved').first()
        if not test_reply:
            print("❌ No approved replies found for testing")
            return False
        
        print(f"✅ Found test reply: {test_reply.id}")
        print(f"   Content: {test_reply.content[:100]}...")
        print(f"   Post: {test_reply.post.title}")
        
        # Test posting (but don't actually post)
        print("\n⚠️  Note: This is a test - no actual posting will occur")
        print("To actually post, you would call: poster._post_reply(test_reply)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error testing Reddit posting: {e}")
        return False

if __name__ == "__main__":
    success = test_reddit_posting()
    if success:
        print("\n✅ Reddit posting test completed successfully!")
    else:
        print("\n❌ Reddit posting test failed!")
        sys.exit(1) 