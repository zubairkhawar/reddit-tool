from django.contrib import admin
from .models import (
    Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics, SystemConfig,
    Leaderboard
)
from langagent.models import AILearningData, AIPromptTemplate, AIPerformanceMetrics

@admin.register(Keyword)
class KeywordAdmin(admin.ModelAdmin):
    list_display = ['keyword', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['keyword']
    ordering = ['keyword']

@admin.register(Subreddit)
class SubredditAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name']
    ordering = ['name']

@admin.register(RedditPost)
class RedditPostAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'author', 'subreddit', 'score', 'comment_count', 
        'created_at', 'is_opportunity', 'priority'
    ]
    list_filter = [
        'is_opportunity', 'priority', 'created_at', 'monitoring_enabled',
        'engagement_increased', 'follow_up_sent'
    ]
    search_fields = ['title', 'content', 'author', 'subreddit__name']
    readonly_fields = [
        'reddit_id', 'created_at', 'fetched_at', 'last_monitored_at',
        'follow_up_sent_at', 'engagement_rate'
    ]
    ordering = ['-created_at']
    date_hierarchy = 'created_at'

    def engagement_rate(self, obj):
        return f"{obj.engagement_rate:.2f}"
    engagement_rate.short_description = 'Engagement Rate'

@admin.register(Classification)
class ClassificationAdmin(admin.ModelAdmin):
    list_display = [
        'post', 'is_opportunity', 'priority', 'confidence_score',
        'created_at'
    ]
    list_filter = ['is_opportunity', 'priority', 'created_at']
    search_fields = ['post__title', 'summary', 'intent']
    ordering = ['-created_at']

@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = [
        'post', 'status', 'upvotes', 'downvotes', 'confidence_score',
        'requires_manual_approval', 'marked_successful', 'created_at'
    ]
    list_filter = [
        'status', 'requires_manual_approval', 'marked_successful',
        'follow_up_sent', 'created_at'
    ]
    search_fields = ['content', 'post__title']
    readonly_fields = [
        'created_at', 'updated_at', 'posted_at', 'approved_at',
        'marked_successful_at', 'follow_up_sent_at'
    ]
    ordering = ['-created_at']

    actions = ['approve_replies', 'reject_replies', 'mark_successful']

    def approve_replies(self, request, queryset):
        updated = queryset.update(status='approved')
        self.message_user(request, f'{updated} replies approved.')
    approve_replies.short_description = 'Approve selected replies'

    def reject_replies(self, request, queryset):
        updated = queryset.update(status='rejected')
        self.message_user(request, f'{updated} replies rejected.')
    reject_replies.short_description = 'Reject selected replies'

    def mark_successful(self, request, queryset):
        updated = queryset.update(marked_successful=True)
        self.message_user(request, f'{updated} replies marked as successful.')
    mark_successful.short_description = 'Mark replies as successful'

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = [
        'notification_type', 'title', 'is_read', 'whatsapp_sent',
        'created_at'
    ]
    list_filter = [
        'notification_type', 'is_read', 'whatsapp_sent', 'created_at'
    ]
    search_fields = ['title', 'message']
    readonly_fields = ['created_at', 'whatsapp_sent_at']
    ordering = ['-created_at']

@admin.register(AIPersona)
class AIPersonaAdmin(admin.ModelAdmin):
    list_display = ['name', 'tone', 'created_at']
    list_filter = ['tone', 'created_at']
    search_fields = ['name', 'description']
    ordering = ['name']

@admin.register(PerformanceMetrics)
class PerformanceMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'posts_scraped', 'opportunities_found', 'replies_posted',
        'total_upvotes_received'
    ]
    list_filter = ['date']
    ordering = ['-date']

@admin.register(SystemConfig)
class SystemConfigAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'updated_at']
    list_filter = ['updated_at']
    search_fields = ['key', 'description']
    ordering = ['key']
    readonly_fields = ['updated_at']

@admin.register(Leaderboard)
class LeaderboardAdmin(admin.ModelAdmin):
    list_display = [
        'metric_type', 'name', 'total_posts', 'total_opportunities',
        'total_replies', 'total_engagement', 'success_rate'
    ]
    list_filter = ['metric_type', 'last_updated']
    search_fields = ['name']
    ordering = ['-total_engagement', '-success_rate']
    readonly_fields = ['last_updated']

# AI Learning Models
@admin.register(AILearningData)
class AILearningDataAdmin(admin.ModelAdmin):
    list_display = [
        'feedback_type', 'subreddit', 'engagement_score', 'success_score',
        'used_for_training', 'created_at'
    ]
    list_filter = ['feedback_type', 'used_for_training', 'created_at']
    search_fields = ['post_title', 'subreddit']
    ordering = ['-created_at']
    readonly_fields = ['created_at']

@admin.register(AIPromptTemplate)
class AIPromptTemplateAdmin(admin.ModelAdmin):
    list_display = [
        'template_type', 'name', 'version', 'is_active', 'success_rate',
        'usage_count'
    ]
    list_filter = ['template_type', 'is_active', 'created_at']
    search_fields = ['name', 'prompt_template']
    ordering = ['-version']
    readonly_fields = ['created_at', 'updated_at']

@admin.register(AIPerformanceMetrics)
class AIPerformanceMetricsAdmin(admin.ModelAdmin):
    list_display = [
        'date', 'template_type', 'total_requests', 'successful_requests',
        'success_rate'
    ]
    list_filter = ['date', 'template_type']
    ordering = ['-date']
    readonly_fields = ['success_rate']

    def success_rate(self, obj):
        return f"{obj.success_rate:.1f}%"
    success_rate.short_description = 'Success Rate'
