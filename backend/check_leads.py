#!/usr/bin/env python3
"""
Quick script to check for leads and process posts
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.models import RedditPost, Classification, Reply
from langagent.agent import RedditLeadAgent

def check_leads():
    """Check current leads and process posts"""
    print("🔍 Checking RedditLead.AI System...")
    
    # Count posts
    total_posts = RedditPost.objects.count()
    classified_posts = Classification.objects.count()
    opportunity_posts = Classification.objects.filter(is_opportunity=True).count()
    replies = Reply.objects.count()
    
    print(f"📊 System Status:")
    print(f"   Total Posts: {total_posts}")
    print(f"   Classified Posts: {classified_posts}")
    print(f"   Opportunities Found: {opportunity_posts}")
    print(f"   Replies Generated: {replies}")
    
    # Show recent posts
    print(f"\n📝 Recent Posts (last 10):")
    recent_posts = RedditPost.objects.order_by('-created_at')[:10]
    for post in recent_posts:
        print(f"   - {post.title[:60]}... (r/{post.subreddit.name})")
    
    # Show opportunities
    if opportunity_posts > 0:
        print(f"\n💼 Opportunities Found:")
        opportunities = Classification.objects.filter(is_opportunity=True).order_by('-created_at')[:5]
        for opp in opportunities:
            print(f"   - {opp.post.title[:60]}... (Confidence: {opp.confidence_score})")
    
    # Process unclassified posts
    unclassified = RedditPost.objects.filter(classification__isnull=True).count()
    if unclassified > 0:
        print(f"\n🤖 Processing {unclassified} unclassified posts...")
        
        agent = RedditLeadAgent()
        processed = agent.process_unclassified_posts()
        
        print(f"✅ Processed {processed} posts")
        
        # Check again
        new_opportunities = Classification.objects.filter(is_opportunity=True).count()
        print(f"🎯 Total opportunities now: {new_opportunities}")
    
    return opportunity_posts > 0

if __name__ == "__main__":
    success = check_leads()
    
    if success:
        print("\n🎉 Found leads! Check the frontend.")
    else:
        print("\n❌ No leads found. The system might need more posts or better keywords.")
    
    sys.exit(0 if success else 1) 