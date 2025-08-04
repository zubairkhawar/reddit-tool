from rest_framework import serializers
from reddit.models import (
    Group, Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics, SystemConfig, Leaderboard
)
from langagent.models import AILearningData, AIPromptTemplate, AIPerformanceMetrics


class GroupSerializer(serializers.ModelSerializer):
    keywords_count = serializers.SerializerMethodField()
    subreddits_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = '__all__'
    
    def get_keywords_count(self, obj):
        return obj.keywords.count()
    
    def get_subreddits_count(self, obj):
        return obj.subreddits.count()


class KeywordSerializer(serializers.ModelSerializer):
    group = GroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Keyword
        fields = '__all__'


class SubredditSerializer(serializers.ModelSerializer):
    group = GroupSerializer(read_only=True)
    group_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = Subreddit
        fields = '__all__'


class RedditPostSerializer(serializers.ModelSerializer):
    classification = serializers.SerializerMethodField()
    replies_count = serializers.SerializerMethodField()
    
    class Meta:
        model = RedditPost
        fields = '__all__'
    
    def get_classification(self, obj):
        if hasattr(obj, 'classification'):
            return ClassificationSerializer(obj.classification).data
        return None
    
    def get_replies_count(self, obj):
        return obj.replies.count()


class ClassificationSerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_url = serializers.URLField(source='post.url', read_only=True)
    
    class Meta:
        model = Classification
        fields = '__all__'


class ReplySerializer(serializers.ModelSerializer):
    post_title = serializers.CharField(source='post.title', read_only=True)
    post_url = serializers.CharField(source='post.url', read_only=True)
    display_content = serializers.SerializerMethodField()
    
    class Meta:
        model = Reply
        fields = [
            'id', 'post', 'content', 'display_content', 'status', 'reddit_comment_id',
            'upvotes', 'downvotes', 'reply_count', 'posted_at',
            'created_at', 'updated_at', 'error_message',
            'post_title', 'post_url', 'confidence_score', 'requires_manual_approval',
            'edited_content', 'approved_by', 'approved_at',
            'marked_successful', 'marked_successful_at', 'marked_successful_by',
            'success_notes', 'follow_up_sent', 'follow_up_content', 'follow_up_sent_at'
        ]
    
    def get_display_content(self, obj):
        """Return edited content if available, otherwise original content"""
        return obj.edited_content if obj.edited_content else obj.content


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'


class AIPersonaSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPersona
        fields = '__all__'


class PerformanceMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = PerformanceMetrics
        fields = '__all__'


class SystemConfigSerializer(serializers.ModelSerializer):
    class Meta:
        model = SystemConfig
        fields = ['key', 'value', 'description', 'updated_at']


class DashboardStatsSerializer(serializers.Serializer):
    total_posts = serializers.IntegerField()
    opportunities_found = serializers.IntegerField()
    replies_posted = serializers.IntegerField()
    engagement_rate = serializers.FloatField()
    today_posts = serializers.IntegerField()
    today_opportunities = serializers.IntegerField()
    today_replies = serializers.IntegerField()
    top_subreddits = serializers.ListField()
    recent_notifications = serializers.ListField()


class LeadSummarySerializer(serializers.Serializer):
    post = RedditPostSerializer()
    classification = ClassificationSerializer()
    replies = ReplySerializer(many=True)
    engagement_score = serializers.FloatField() 


class LeaderboardSerializer(serializers.ModelSerializer):
    class Meta:
        model = Leaderboard
        fields = '__all__'


class AILearningDataSerializer(serializers.ModelSerializer):
    class Meta:
        model = AILearningData
        fields = '__all__'


class AIPromptTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPromptTemplate
        fields = '__all__'


class AIPerformanceMetricsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIPerformanceMetrics
        fields = '__all__' 


class GroupWithDataSerializer(serializers.ModelSerializer):
    keywords = serializers.SerializerMethodField()
    subreddits = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = '__all__'
    
    def get_keywords(self, obj):
        keywords = obj.keywords.all()
        return KeywordSerializer(keywords, many=True).data
    
    def get_subreddits(self, obj):
        subreddits = obj.subreddits.all()
        return SubredditSerializer(subreddits, many=True).data 