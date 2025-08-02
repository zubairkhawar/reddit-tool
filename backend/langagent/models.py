from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class AILearningData(models.Model):
    """Training data for AI model improvement"""
    FEEDBACK_TYPE_CHOICES = [
        ('success', 'Successful Reply'),
        ('failure', 'Failed Reply'),
        ('improvement', 'Improvement Needed'),
    ]
    
    feedback_type = models.CharField(max_length=20, choices=FEEDBACK_TYPE_CHOICES)
    post_title = models.TextField()
    post_content = models.TextField()
    original_reply = models.TextField()
    user_feedback = models.TextField(blank=True, null=True)
    improved_reply = models.TextField(blank=True, null=True)
    keywords_used = models.TextField(blank=True, null=True)
    subreddit = models.CharField(max_length=50)
    engagement_score = models.FloatField(default=0.0)
    success_score = models.FloatField(default=0.0)
    created_at = models.DateTimeField(auto_now_add=True)
    used_for_training = models.BooleanField(default=False)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_feedback_type_display()}: {self.post_title[:50]}"

class AIPromptTemplate(models.Model):
    """Templates for AI prompts that can be improved based on feedback"""
    TEMPLATE_TYPE_CHOICES = [
        ('classification', 'Post Classification'),
        ('intent_extraction', 'Intent Extraction'),
        ('reply_generation', 'Reply Generation'),
        ('follow_up', 'Follow-up Generation'),
    ]
    
    template_type = models.CharField(max_length=20, choices=TEMPLATE_TYPE_CHOICES)
    name = models.CharField(max_length=100)
    prompt_template = models.TextField()
    version = models.IntegerField(default=1)
    is_active = models.BooleanField(default=True)
    success_rate = models.FloatField(default=0.0)
    usage_count = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['template_type', 'name', 'version']
        ordering = ['-version']
    
    def __str__(self):
        return f"{self.get_template_type_display()}: {self.name} v{self.version}"

class AIPerformanceMetrics(models.Model):
    """Track AI model performance over time"""
    date = models.DateField()
    template_type = models.CharField(max_length=20, choices=AIPromptTemplate.TEMPLATE_TYPE_CHOICES)
    total_requests = models.IntegerField(default=0)
    successful_requests = models.IntegerField(default=0)
    failed_requests = models.IntegerField(default=0)
    avg_response_time = models.FloatField(default=0.0)
    avg_engagement_score = models.FloatField(default=0.0)
    avg_success_score = models.FloatField(default=0.0)
    
    class Meta:
        unique_together = ['date', 'template_type']
        ordering = ['-date']
    
    def __str__(self):
        return f"{self.date}: {self.get_template_type_display()}"
    
    @property
    def success_rate(self):
        if self.total_requests == 0:
            return 0.0
        return (self.successful_requests / self.total_requests) * 100
