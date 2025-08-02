from rest_framework import serializers
from reddit.models import (
    Keyword, Subreddit, RedditPost, Classification, Reply, 
    Notification, AIPersona, PerformanceMetrics
)


class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = '__all__'


class SubredditSerializer(serializers.ModelSerializer):
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
    post_url = serializers.URLField(source='post.url', read_only=True)
    
    class Meta:
        model = Reply
        fields = '__all__'


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