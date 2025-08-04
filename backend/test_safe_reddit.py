#!/usr/bin/env python3
"""
Safe Reddit API test with proper rate limiting
"""
import os
import sys
import time
import django
from decouple import config

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

def test_safe_reddit_connection():
    """Test Reddit API connection safely"""
    try:
        import praw
        
        # Get credentials from environment
        client_id = config('REDDIT_CLIENT_ID')
        client_secret = config('REDDIT_CLIENT_SECRET')
        username = config('REDDIT_USERNAME')
        password = config('REDDIT_PASSWORD')
        user_agent = config('REDDIT_USER_AGENT', default='RedditLead.AI/1.0')
        
        print("🔍 Testing Safe Reddit API Connection...")
        print(f"Client ID: {client_id[:10]}...")
        print(f"Username: {username}")
        print(f"User Agent: {user_agent}")
        
        # Initialize Reddit client with authentication
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            username=username,
            password=password,
            user_agent=user_agent
        )
        
        # Test basic API call with rate limiting
        print("\n📡 Testing API call with rate limiting...")
        time.sleep(1)  # Rate limiting
        
        # Test with a safe, public subreddit
        subreddit = reddit.subreddit("programming")
        print(f"✅ Successfully connected to Reddit API!")
        print(f"📊 Subreddit 'programming' has {subreddit.subscribers} subscribers")
        
        # Test fetching a few posts safely
        print("\n📝 Testing safe post fetching (limited to 3 posts)...")
        time.sleep(2)  # Rate limiting
        
        posts = list(subreddit.hot(limit=3))
        if posts:
            for i, post in enumerate(posts, 1):
                print(f"📄 Post {i}: {post.title[:60]}...")
                print(f"   Score: {post.score}, Comments: {post.num_comments}")
                time.sleep(1)  # Rate limiting between posts
        else:
            print("⚠️ No posts found")
        
        print("\n🎉 Safe Reddit API connection test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Safe Reddit API connection test FAILED!")
        print(f"Error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET")
        print("2. Verify your Reddit app is configured as 'script' type")
        print("3. Make sure your username and password are correct")
        print("4. Check if your account has any restrictions")
        return False

if __name__ == "__main__":
    print("🚀 RedditLead.AI - Safe Reddit API Test")
    print("=" * 50)
    
    # Test Reddit connection safely
    success = test_safe_reddit_connection()
    
    if success:
        print("\n🎉 Safe test PASSED! Ready to scrape data carefully.")
        sys.exit(0)
    else:
        print("\n❌ Safe test failed.")
        sys.exit(1) 