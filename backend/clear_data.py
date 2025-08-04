#!/usr/bin/env python3
"""
Script to clear all fetched posts data
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.models import RedditPost, Classification, Reply

def clear_all_data():
    """Clear all fetched posts and related data"""
    print("🧹 Clearing all fetched posts data...")
    
    # Count before deletion
    posts_count = RedditPost.objects.count()
    classifications_count = Classification.objects.count()
    replies_count = Reply.objects.count()
    
    print(f"📊 Data to be deleted:")
    print(f"   Posts: {posts_count}")
    print(f"   Classifications: {classifications_count}")
    print(f"   Replies: {replies_count}")
    
    # Delete all data
    RedditPost.objects.all().delete()
    Classification.objects.all().delete()
    Reply.objects.all().delete()
    
    print("✅ All posts data cleared!")
    
    # Verify deletion
    remaining_posts = RedditPost.objects.count()
    remaining_classifications = Classification.objects.count()
    remaining_replies = Reply.objects.count()
    
    print(f"📊 Remaining data:")
    print(f"   Posts: {remaining_posts}")
    print(f"   Classifications: {remaining_classifications}")
    print(f"   Replies: {remaining_replies}")
    
    print("\n🎉 Database cleared! Ready for fresh data.")

if __name__ == "__main__":
    clear_all_data()
    sys.exit(0) 