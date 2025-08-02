from celery import shared_task
import logging
from django.utils import timezone
from datetime import timedelta
from decouple import config
import openai

logger = logging.getLogger(__name__)

@shared_task
def process_ai_feedback():
    """Process user feedback to improve AI models"""
    from .models import AILearningData, AIPromptTemplate
    from reddit.models import Reply
    
    # Get recent feedback data
    recent_feedback = AILearningData.objects.filter(
        used_for_training=False,
        created_at__gte=timezone.now() - timedelta(days=7)
    )
    
    for feedback in recent_feedback:
        try:
            # Analyze feedback and update prompt templates
            update_prompt_templates.delay(feedback.id)
            
            # Mark as used for training
            feedback.used_for_training = True
            feedback.save()
            
        except Exception as e:
            logger.error(f"Error processing feedback {feedback.id}: {e}")

@shared_task
def update_prompt_templates(feedback_id):
    """Update AI prompt templates based on feedback"""
    from .models import AILearningData, AIPromptTemplate
    
    try:
        feedback = AILearningData.objects.get(id=feedback_id)
        
        # Get current active template
        current_template = AIPromptTemplate.objects.filter(
            template_type='reply_generation',
            is_active=True
        ).first()
        
        if not current_template:
            return
        
        # Analyze feedback to improve template
        improved_template = analyze_and_improve_template(feedback, current_template)
        
        if improved_template:
            # Create new version
            new_template = AIPromptTemplate.objects.create(
                template_type=current_template.template_type,
                name=current_template.name,
                prompt_template=improved_template,
                version=current_template.version + 1,
                is_active=True
            )
            
            # Deactivate old template
            current_template.is_active = False
            current_template.save()
            
            logger.info(f"Updated prompt template to version {new_template.version}")
            
    except Exception as e:
        logger.error(f"Error updating prompt templates: {e}")

def analyze_and_improve_template(feedback, template):
    """Use AI to analyze feedback and improve prompt template"""
    try:
        client = openai.OpenAI(api_key=config('OPENAI_API_KEY'))
        
        analysis_prompt = f"""
        Analyze this feedback and improve the AI prompt template:
        
        Original Post: {feedback.post_title}
        Post Content: {feedback.post_content}
        Original AI Reply: {feedback.original_reply}
        User Feedback: {feedback.user_feedback}
        Improved Reply: {feedback.improved_reply}
        Feedback Type: {feedback.get_feedback_type_display()}
        
        Current Prompt Template:
        {template.prompt_template}
        
        Based on this feedback, provide an improved version of the prompt template that would generate better replies.
        Focus on:
        1. Better understanding of user intent
        2. More natural and contextual responses
        3. Addressing the specific issues mentioned in feedback
        
        Return only the improved prompt template:
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": analysis_prompt}],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Error analyzing template: {e}")
        return None

@shared_task
def update_ai_performance_metrics():
    """Update AI performance metrics daily"""
    from .models import AIPerformanceMetrics, AIPromptTemplate
    from reddit.models import Reply
    
    today = timezone.now().date()
    
    for template_type, _ in AIPromptTemplate.TEMPLATE_TYPE_CHOICES:
        try:
            # Get today's metrics
            metrics, created = AIPerformanceMetrics.objects.get_or_create(
                date=today,
                template_type=template_type
            )
            
            # Calculate metrics based on recent activity
            recent_replies = Reply.objects.filter(
                created_at__date=today
            )
            
            if template_type == 'reply_generation':
                total_requests = recent_replies.count()
                successful_requests = recent_replies.filter(
                    status='posted',
                    upvotes__gt=0
                ).count()
                failed_requests = recent_replies.filter(status='failed').count()
                
                # Calculate engagement scores
                engagement_scores = [
                    reply.upvotes for reply in recent_replies if reply.upvotes > 0
                ]
                avg_engagement = sum(engagement_scores) / len(engagement_scores) if engagement_scores else 0
                
                # Calculate success scores
                success_scores = [
                    reply.upvotes / (reply.upvotes + reply.downvotes) 
                    for reply in recent_replies 
                    if reply.upvotes + reply.downvotes > 0
                ]
                avg_success = sum(success_scores) / len(success_scores) if success_scores else 0
                
                # Update metrics
                metrics.total_requests = total_requests
                metrics.successful_requests = successful_requests
                metrics.failed_requests = failed_requests
                metrics.avg_engagement_score = avg_engagement
                metrics.avg_success_score = avg_success
                metrics.save()
                
        except Exception as e:
            logger.error(f"Error updating AI performance metrics: {e}")

@shared_task
def retrain_ai_models():
    """Retrain AI models based on accumulated feedback"""
    from .models import AILearningData, AIPromptTemplate
    
    try:
        # Get all feedback data
        feedback_data = AILearningData.objects.filter(
            used_for_training=False
        )
        
        if feedback_data.count() < 10:  # Need minimum data
            logger.info("Insufficient feedback data for retraining")
            return
        
        # Group feedback by type
        success_feedback = feedback_data.filter(feedback_type='success')
        failure_feedback = feedback_data.filter(feedback_type='failure')
        improvement_feedback = feedback_data.filter(feedback_type='improvement')
        
        # Update templates based on feedback patterns
        update_templates_from_patterns.delay(
            success_feedback.count(),
            failure_feedback.count(),
            improvement_feedback.count()
        )
        
        # Mark all as used
        feedback_data.update(used_for_training=True)
        
        logger.info(f"Retrained AI models with {feedback_data.count()} feedback samples")
        
    except Exception as e:
        logger.error(f"Error retraining AI models: {e}")

@shared_task
def update_templates_from_patterns(success_count, failure_count, improvement_count):
    """Update AI templates based on feedback patterns"""
    from .models import AIPromptTemplate
    
    try:
        # Get current templates
        templates = AIPromptTemplate.objects.filter(is_active=True)
        
        for template in templates:
            # Analyze patterns and suggest improvements
            improved_template = analyze_patterns_and_improve(
                template, success_count, failure_count, improvement_count
            )
            
            if improved_template and improved_template != template.prompt_template:
                # Create new version
                AIPromptTemplate.objects.create(
                    template_type=template.template_type,
                    name=template.name,
                    prompt_template=improved_template,
                    version=template.version + 1,
                    is_active=True
                )
                
                # Deactivate old template
                template.is_active = False
                template.save()
                
    except Exception as e:
        logger.error(f"Error updating templates from patterns: {e}")

def analyze_patterns_and_improve(template, success_count, failure_count, improvement_count):
    """Analyze feedback patterns and improve template"""
    try:
        client = openai.OpenAI(api_key=config('OPENAI_API_KEY'))
        
        analysis_prompt = f"""
        Analyze these feedback patterns and improve the AI prompt template:
        
        Success Cases: {success_count}
        Failure Cases: {failure_count}
        Improvement Cases: {improvement_count}
        
        Current Template:
        {template.prompt_template}
        
        Based on these patterns, suggest improvements to the template that would:
        1. Increase success rate
        2. Reduce failure rate
        3. Improve overall quality
        
        Return only the improved prompt template:
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[{"role": "user", "content": analysis_prompt}],
            max_tokens=1000,
            temperature=0.7
        )
        
        return response.choices[0].message.content.strip()
        
    except Exception as e:
        logger.error(f"Error analyzing patterns: {e}")
        return None 