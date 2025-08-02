from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Keyword(models.Model):
    """Keywords to monitor for in Reddit posts"""
    keyword = models.CharField(max_length=100, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['keyword']

    def __str__(self):
        return self.keyword


class Subreddit(models.Model):
    """Subreddits to monitor"""
    name = models.CharField(max_length=50, unique=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return f"r/{self.name}"


class RedditPost(models.Model):
    """Reddit posts that have been scraped"""
    post_id = models.CharField(max_length=20, unique=True)
    title = models.TextField()
    body = models.TextField(blank=True)
    author = models.CharField(max_length=50)
    subreddit = models.CharField(max_length=50)
    url = models.URLField()
    score = models.IntegerField(default=0)
    num_comments = models.IntegerField(default=0)
    created_utc = models.DateTimeField()
    scraped_at = models.DateTimeField(auto_now_add=True)
    is_deleted = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_utc']

    def __str__(self):
        return f"{self.title[:50]}..."


class Classification(models.Model):
    """AI classification results for Reddit posts"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    post = models.OneToOneField(RedditPost, on_delete=models.CASCADE, related_name='classification')
    is_opportunity = models.BooleanField()
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='low')
    confidence_score = models.FloatField(default=0.0)
    summary = models.TextField(blank=True)
    intent = models.TextField(blank=True)
    budget_mentioned = models.BooleanField(default=False)
    budget_amount = models.CharField(max_length=50, blank=True)
    services_needed = models.TextField(blank=True)
    urgency_level = models.CharField(max_length=20, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.post.title[:30]} - {self.priority}"


class Reply(models.Model):
    """Replies posted to Reddit posts"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('posted', 'Posted'),
        ('failed', 'Failed'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    post = models.ForeignKey(RedditPost, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    reddit_comment_id = models.CharField(max_length=20, blank=True)
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    reply_count = models.IntegerField(default=0)
    posted_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reply to {self.post.title[:30]}"


class Notification(models.Model):
    """System notifications"""
    NOTIFICATION_TYPES = [
        ('reply_received', 'Reply Received'),
        ('high_priority', 'High Priority Post'),
        ('engagement', 'High Engagement'),
        ('error', 'Error'),
        ('info', 'Information'),
    ]

    message = models.TextField()
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPES)
    is_read = models.BooleanField(default=False)
    related_post = models.ForeignKey(RedditPost, on_delete=models.CASCADE, null=True, blank=True)
    related_reply = models.ForeignKey(Reply, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.notification_type}: {self.message[:50]}..."


class AIPersona(models.Model):
    """AI persona configuration for generating replies"""
    name = models.CharField(max_length=100)
    tone = models.CharField(max_length=50, default='professional')
    style = models.TextField()
    include_portfolio = models.BooleanField(default=False)
    portfolio_url = models.URLField(blank=True)
    include_cta = models.BooleanField(default=True)
    cta_text = models.CharField(max_length=200, default="DM me if this sounds like a good fit!")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class PerformanceMetrics(models.Model):
    """Performance tracking metrics"""
    date = models.DateField(unique=True)
    posts_scraped = models.IntegerField(default=0)
    opportunities_found = models.IntegerField(default=0)
    replies_posted = models.IntegerField(default=0)
    replies_with_responses = models.IntegerField(default=0)
    total_upvotes_received = models.IntegerField(default=0)
    total_engagement = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Metrics for {self.date}"
