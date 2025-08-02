from django.contrib import admin
from .models import (
    Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics
)


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
    list_display = ['title', 'author', 'subreddit', 'score', 'num_comments', 'created_utc', 'scraped_at']
    list_filter = ['subreddit', 'created_utc', 'scraped_at', 'is_deleted', 'is_blocked']
    search_fields = ['title', 'body', 'author']
    readonly_fields = ['post_id', 'created_utc', 'scraped_at']
    ordering = ['-created_utc']
    
    def has_add_permission(self, request):
        return False  # Posts are created automatically


@admin.register(Classification)
class ClassificationAdmin(admin.ModelAdmin):
    list_display = ['post_title', 'is_opportunity', 'priority', 'confidence_score', 'created_at']
    list_filter = ['is_opportunity', 'priority', 'confidence_score', 'created_at', 'budget_mentioned']
    search_fields = ['post__title', 'summary', 'intent']
    readonly_fields = ['post', 'created_at']
    ordering = ['-created_at']
    
    def post_title(self, obj):
        return obj.post.title[:50] + "..." if len(obj.post.title) > 50 else obj.post.title
    post_title.short_description = 'Post Title'


@admin.register(Reply)
class ReplyAdmin(admin.ModelAdmin):
    list_display = ['post_title', 'status', 'upvotes', 'downvotes', 'reply_count', 'created_at']
    list_filter = ['status', 'created_at', 'posted_at']
    search_fields = ['content', 'post__title']
    readonly_fields = ['post', 'created_at', 'updated_at']
    ordering = ['-created_at']
    
    def post_title(self, obj):
        return obj.post.title[:50] + "..." if len(obj.post.title) > 50 else obj.post.title
    post_title.short_description = 'Post Title'
    
    actions = ['approve_replies', 'reject_replies']
    
    def approve_replies(self, request, queryset):
        for reply in queryset:
            reply.status = 'approved'
            reply.save()
        self.message_user(request, f"Approved {queryset.count()} replies")
    approve_replies.short_description = "Approve selected replies"
    
    def reject_replies(self, request, queryset):
        for reply in queryset:
            reply.status = 'rejected'
            reply.save()
        self.message_user(request, f"Rejected {queryset.count()} replies")
    reject_replies.short_description = "Reject selected replies"


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ['notification_type', 'message_short', 'is_read', 'created_at']
    list_filter = ['notification_type', 'is_read', 'created_at']
    search_fields = ['message']
    readonly_fields = ['created_at']
    ordering = ['-created_at']
    
    def message_short(self, obj):
        return obj.message[:100] + "..." if len(obj.message) > 100 else obj.message
    message_short.short_description = 'Message'
    
    actions = ['mark_as_read']
    
    def mark_as_read(self, request, queryset):
        queryset.update(is_read=True)
        self.message_user(request, f"Marked {queryset.count()} notifications as read")
    mark_as_read.short_description = "Mark selected notifications as read"


@admin.register(AIPersona)
class AIPersonaAdmin(admin.ModelAdmin):
    list_display = ['name', 'tone', 'is_active', 'include_portfolio', 'include_cta', 'created_at']
    list_filter = ['tone', 'is_active', 'include_portfolio', 'include_cta', 'created_at']
    search_fields = ['name', 'style']
    ordering = ['name']


@admin.register(PerformanceMetrics)
class PerformanceMetricsAdmin(admin.ModelAdmin):
    list_display = ['date', 'posts_scraped', 'opportunities_found', 'replies_posted', 'total_upvotes_received']
    list_filter = ['date']
    readonly_fields = ['date', 'created_at', 'updated_at']
    ordering = ['-date']
    
    def has_add_permission(self, request):
        return False  # Metrics are created automatically
