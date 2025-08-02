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
    """Reddit post with metadata and engagement tracking"""
    PRIORITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('urgent', 'Urgent'),
    ]

    reddit_id = models.CharField(max_length=20, unique=True)
    title = models.TextField()
    content = models.TextField()
    author = models.CharField(max_length=50)
    subreddit = models.ForeignKey(Subreddit, on_delete=models.CASCADE, related_name='posts')
    url = models.URLField()
    score = models.IntegerField(default=0)
    comment_count = models.IntegerField(default=0)
    created_at = models.DateTimeField()
    fetched_at = models.DateTimeField(auto_now_add=True)
    is_opportunity = models.BooleanField(default=False)
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default='low')
    
    # Old lead monitoring fields
    last_monitored_at = models.DateTimeField(blank=True, null=True)
    monitoring_enabled = models.BooleanField(default=True)
    engagement_increased = models.BooleanField(default=False)
    new_comments_since_last_check = models.IntegerField(default=0)
    
    # Follow-up automation fields
    follow_up_sent = models.BooleanField(default=False)
    follow_up_sent_at = models.DateTimeField(blank=True, null=True)
    follow_up_content = models.TextField(blank=True, null=True)
    follow_up_response_received = models.BooleanField(default=False)
    follow_up_response_content = models.TextField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['created_at']),
            models.Index(fields=['is_opportunity']),
            models.Index(fields=['priority']),
            models.Index(fields=['last_monitored_at']),
        ]

    def __str__(self):
        return f"{self.title[:50]} - {self.subreddit.name}"

    @property
    def engagement_rate(self):
        """Calculate engagement rate based on score and comments"""
        if self.comment_count == 0:
            return 0
        return (self.score + self.comment_count) / self.comment_count

    def should_send_follow_up(self):
        """Determine if a follow-up should be sent based on engagement"""
        if self.follow_up_sent:
            return False
        
        # Send follow-up if engagement increased significantly
        if self.engagement_increased and self.score > 10:
            return True
        
        # Send follow-up if there are new comments and we have a reply
        if self.new_comments_since_last_check > 0 and self.replies.exists():
            return True
        
        return False


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
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('posted', 'Posted'),
        ('failed', 'Failed'),
    ]

    post = models.ForeignKey(RedditPost, on_delete=models.CASCADE, related_name='replies')
    content = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    reddit_comment_id = models.CharField(max_length=20, blank=True, null=True)
    upvotes = models.IntegerField(default=0)
    downvotes = models.IntegerField(default=0)
    reply_count = models.IntegerField(default=0)
    posted_at = models.DateTimeField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    error_message = models.TextField(blank=True, null=True)

    # New fields for manual approval
    confidence_score = models.FloatField(default=0.0)
    requires_manual_approval = models.BooleanField(default=False)
    edited_content = models.TextField(blank=True, null=True)
    approved_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='approved_replies')
    approved_at = models.DateTimeField(blank=True, null=True)

    # Success tracking
    marked_successful = models.BooleanField(default=False)
    marked_successful_at = models.DateTimeField(blank=True, null=True)
    marked_successful_by = models.ForeignKey('auth.User', on_delete=models.SET_NULL, null=True, blank=True, related_name='successful_replies')
    success_notes = models.TextField(blank=True, null=True)

    # Follow-up tracking
    follow_up_sent = models.BooleanField(default=False)
    follow_up_content = models.TextField(blank=True, null=True)
    follow_up_sent_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Reply to {self.post.title[:50]}"


class Notification(models.Model):
    """System notifications for users"""
    NOTIFICATION_TYPE_CHOICES = [
        ('high_priority', 'High Priority Post'),
        ('reply_posted', 'Reply Posted'),
        ('engagement_increase', 'Engagement Increase'),
        ('follow_up_sent', 'Follow-up Sent'),
        ('success_marked', 'Success Marked'),
        ('error', 'Error'),
    ]
    
    notification_type = models.CharField(max_length=20, choices=NOTIFICATION_TYPE_CHOICES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    post = models.ForeignKey(RedditPost, on_delete=models.CASCADE, null=True, blank=True)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # WhatsApp notification fields
    whatsapp_sent = models.BooleanField(default=False)
    whatsapp_sent_at = models.DateTimeField(blank=True, null=True)
    whatsapp_message_id = models.CharField(max_length=100, blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_notification_type_display()}: {self.title}"


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


class SystemConfig(models.Model):
    """System configuration for AI behavior and thresholds"""
    key = models.CharField(max_length=100, unique=True)
    value = models.TextField()
    description = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['key']

    def __str__(self):
        return f"{self.key}: {self.value}"

    @classmethod
    def get_value(cls, key, default=None):
        try:
            return cls.objects.get(key=key).value
        except cls.DoesNotExist:
            return default

    @classmethod
    def set_value(cls, key, value, description=""):
        obj, created = cls.objects.get_or_create(key=key)
        obj.value = str(value)
        obj.description = description
        obj.save()
        return obj


class Leaderboard(models.Model):
    """Track performance metrics for keywords, subreddits, and reply templates"""
    METRIC_TYPE_CHOICES = [
        ('keyword', 'Keyword'),
        ('subreddit', 'Subreddit'),
        ('reply_template', 'Reply Template'),
    ]
    
    metric_type = models.CharField(max_length=20, choices=METRIC_TYPE_CHOICES)
    name = models.CharField(max_length=100)  # keyword name, subreddit name, or template identifier
    total_posts = models.IntegerField(default=0)
    total_opportunities = models.IntegerField(default=0)
    total_replies = models.IntegerField(default=0)
    total_engagement = models.IntegerField(default=0)  # sum of upvotes
    success_rate = models.FloatField(default=0.0)  # percentage of successful replies
    avg_engagement_rate = models.FloatField(default=0.0)
    last_updated = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['metric_type', 'name']
        ordering = ['-total_engagement', '-success_rate']
    
    def __str__(self):
        return f"{self.get_metric_type_display()}: {self.name}"
    
    def update_metrics(self):
        """Update metrics based on current data"""
        if self.metric_type == 'keyword':
            posts = RedditPost.objects.filter(
                title__icontains=self.name
            ).exclude(title__icontains=self.name + 's')  # Avoid plurals
        elif self.metric_type == 'subreddit':
            posts = RedditPost.objects.filter(subreddit__name=self.name)
        else:  # reply_template
            posts = RedditPost.objects.filter(
                replies__content__icontains=self.name
            ).distinct()
        
        self.total_posts = posts.count()
        self.total_opportunities = posts.filter(is_opportunity=True).count()
        self.total_replies = posts.filter(replies__isnull=False).count()
        
        # Calculate engagement
        total_upvotes = sum(post.replies.aggregate(
            total=models.Sum('upvotes')
        )['total'] or 0 for post in posts)
        self.total_engagement = total_upvotes
        
        # Calculate success rate
        successful_replies = posts.filter(
            replies__marked_successful=True
        ).count()
        self.success_rate = (successful_replies / self.total_replies * 100) if self.total_replies > 0 else 0
        
        # Calculate average engagement rate
        if self.total_posts > 0:
            avg_engagement = sum(post.engagement_rate for post in posts) / self.total_posts
            self.avg_engagement_rate = avg_engagement
        
        self.save()
