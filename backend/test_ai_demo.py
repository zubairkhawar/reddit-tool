#!/usr/bin/env python3
"""
Demo script to show AI classification and reply generation
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'redditlead.settings')
django.setup()

from reddit.models import RedditPost
from langagent.agent import RedditLeadAgent

def demo_ai_functionality():
    """Demonstrate AI classification and reply generation"""
    print("🤖 RedditLead.AI - AI Demo")
    print("=" * 50)
    
    # Get some posts from hiring subreddits that don't have classifications yet
    posts = RedditPost.objects.filter(
        subreddit__name__in=['forhire', 'freelance', 'freelancing']
    ).exclude(
        classification__isnull=False
    )[:3]
    
    print(f"Testing with {len(posts)} hiring posts without classifications...")
    
    # Initialize AI agent
    agent = RedditLeadAgent()
    
    for i, post in enumerate(posts, 1):
        print(f"\n📝 Post {i}: {post.title[:60]}...")
        print(f"   Subreddit: r/{post.subreddit.name}")
        print(f"   Content: {post.content[:100]}...")
        
        # Process the post
        result = agent.process_post(post)
        
        if result:
            classification = result['classification']
            reply = result['reply']
            
            print(f"   ✅ AI Classification:")
            print(f"      - Opportunity: {classification.is_opportunity}")
            print(f"      - Priority: {classification.priority}")
            print(f"      - Confidence: {classification.confidence_score:.2f}")
            print(f"      - Intent: {classification.intent}")
            
            if reply:
                print(f"   💬 AI Reply:")
                print(f"      - Status: {reply.status}")
                print(f"      - Content: {reply.content[:150]}...")
            else:
                print(f"   ❌ No reply generated (not an opportunity or low priority)")
        else:
            print(f"   ❌ Failed to process post")
        
        print("-" * 50)
    
    if len(posts) == 0:
        print("No posts without classifications found. Try fetching new posts first!")

if __name__ == "__main__":
    demo_ai_functionality() 