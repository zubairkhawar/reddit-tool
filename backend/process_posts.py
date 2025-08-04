#!/usr/bin/env python3
"""
Script to process all fetched posts and classify them as leads
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.models import RedditPost, Classification
from langagent.agent import RedditLeadAgent

def process_all_posts():
    """Process all fetched posts and classify them"""
    print("🤖 Processing all fetched posts...")
    
    # Count posts
    total_posts = RedditPost.objects.count()
    classified_posts = Classification.objects.count()
    
    print(f"📊 Current Status:")
    print(f"   Total Posts: {total_posts}")
    print(f"   Already Classified: {classified_posts}")
    
    if total_posts == 0:
        print("❌ No posts found. Please run the fetcher first.")
        return False
    
    # Get unclassified posts
    unclassified_posts = RedditPost.objects.filter(classification__isnull=True)
    print(f"📝 Posts to classify: {unclassified_posts.count()}")
    
    if unclassified_posts.count() == 0:
        print("✅ All posts are already classified!")
        return True
    
    # Initialize AI agent
    agent = RedditLeadAgent()
    
    # Process posts in batches
    batch_size = 10
    processed = 0
    opportunities = 0
    
    for i in range(0, unclassified_posts.count(), batch_size):
        batch = unclassified_posts[i:i+batch_size]
        print(f"\n🔄 Processing batch {i//batch_size + 1}...")
        
        for post in batch:
            try:
                print(f"   📝 Classifying: {post.title[:50]}...")
                
                # Classify the post
                classification = agent.classify_post(post)
                
                if classification:
                    processed += 1
                    if classification.is_opportunity:
                        opportunities += 1
                        print(f"   ✅ OPPORTUNITY: {post.title[:50]}... (Priority: {classification.priority})")
                    else:
                        print(f"   ❌ Not an opportunity: {post.title[:50]}...")
                else:
                    print(f"   ⚠️ Failed to classify: {post.title[:50]}...")
                    
            except Exception as e:
                print(f"   ❌ Error classifying post {post.id}: {e}")
        
        # Rate limiting between batches
        import time
        time.sleep(2)
    
    # Final summary
    total_classified = Classification.objects.count()
    total_opportunities = Classification.objects.filter(is_opportunity=True).count()
    high_priority = Classification.objects.filter(is_opportunity=True, priority__in=['high', 'urgent']).count()
    
    print(f"\n🎉 Processing Complete!")
    print(f"📊 Final Results:")
    print(f"   Total Classified: {total_classified}")
    print(f"   Opportunities Found: {total_opportunities}")
    print(f"   High Priority Leads: {high_priority}")
    
    return high_priority > 0

if __name__ == "__main__":
    success = process_all_posts()
    
    if success:
        print("\n🎯 Leads found! Check the frontend now.")
    else:
        print("\n❌ No high-priority leads found.")
    
    sys.exit(0 if success else 1) 