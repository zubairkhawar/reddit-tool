#!/usr/bin/env python3
"""
Test script to verify Reddit API connection
"""
import os
import sys
import django
from decouple import config

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

def test_reddit_connection():
    """Test Reddit API connection"""
    try:
        import praw
        
        # Get credentials from environment
        client_id = config('REDDIT_CLIENT_ID')
        client_secret = config('REDDIT_CLIENT_SECRET')
        user_agent = config('REDDIT_USER_AGENT', default='RedditLead.AI/1.0')
        
        print("🔍 Testing Reddit API Connection...")
        print(f"Client ID: {client_id[:10]}...")
        print(f"User Agent: {user_agent}")
        
        # Initialize Reddit client
        reddit = praw.Reddit(
            client_id=client_id,
            client_secret=client_secret,
            user_agent=user_agent
        )
        
        # Test basic API call
        print("\n📡 Testing API call...")
        subreddit = reddit.subreddit("test")
        print(f"✅ Successfully connected to Reddit API!")
        print(f"📊 Subreddit 'test' has {subreddit.subscribers} subscribers")
        
        # Test fetching a post
        print("\n📝 Testing post fetching...")
        posts = list(subreddit.hot(limit=1))
        if posts:
            post = posts[0]
            print(f"✅ Successfully fetched post: {post.title[:50]}...")
            print(f"📊 Post score: {post.score}")
            print(f"💬 Comments: {post.num_comments}")
        else:
            print("⚠️ No posts found in r/test")
        
        print("\n🎉 Reddit API connection test PASSED!")
        return True
        
    except Exception as e:
        print(f"\n❌ Reddit API connection test FAILED!")
        print(f"Error: {str(e)}")
        print("\n🔧 Troubleshooting tips:")
        print("1. Check your REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET")
        print("2. Verify your Reddit app is configured as 'script' type")
        print("3. Make sure your .env file is in the backend directory")
        return False

def test_environment():
    """Test environment variables"""
    print("🔧 Testing Environment Variables...")
    
    required_vars = [
        'REDDIT_CLIENT_ID',
        'REDDIT_CLIENT_SECRET',
        'DB_HOST',
        'DB_NAME',
        'DB_USER',
        'DB_PASSWORD'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = config(var, default=None)
        if value:
            print(f"✅ {var}: {value[:10]}..." if len(value) > 10 else f"✅ {var}: {value}")
        else:
            print(f"❌ {var}: MISSING")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n⚠️ Missing environment variables: {', '.join(missing_vars)}")
        return False
    else:
        print("\n✅ All required environment variables are set!")
        return True

if __name__ == "__main__":
    print("🚀 RedditLead.AI - Reddit API Connection Test")
    print("=" * 50)
    
    # Test environment first
    env_ok = test_environment()
    
    if env_ok:
        # Test Reddit connection
        reddit_ok = test_reddit_connection()
        
        if reddit_ok:
            print("\n🎉 All tests PASSED! Your Reddit API is ready to use.")
            sys.exit(0)
        else:
            print("\n❌ Reddit API test failed.")
            sys.exit(1)
    else:
        print("\n❌ Environment setup failed.")
        sys.exit(1) 