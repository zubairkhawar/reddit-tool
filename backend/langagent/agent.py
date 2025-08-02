import openai
from django.conf import settings
from django.utils import timezone
from reddit.models import RedditPost, Classification, Reply, AIPersona, Notification
import logging
import json

logger = logging.getLogger(__name__)

# Configure OpenAI
openai.api_key = settings.OPENAI_API_KEY


class RedditLeadAgent:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
        self.default_persona = self._get_default_persona()
    
    def _get_default_persona(self):
        """Get the default AI persona"""
        try:
            return AIPersona.objects.filter(is_active=True).first()
        except:
            return None
    
    def classify_post(self, post):
        """Classify a Reddit post to determine if it's an opportunity"""
        try:
            # Prepare the content for classification
            content = f"Title: {post.title}\n\nBody: {post.body}"
            
            # Create classification prompt
            classification_prompt = f"""
            Analyze this Reddit post to determine if it represents a freelance/project opportunity.
            
            Post Content:
            {content}
            
            Consider the following factors:
            1. Is someone looking for help with a project or service?
            2. Is there mention of budget, payment, or compensation?
            3. Are they seeking technical skills (AI, automation, web development, etc.)?
            4. Is there urgency or a specific timeline?
            5. Are they asking for quotes, proposals, or direct contact?
            
            Respond with a JSON object containing:
            {{
                "is_opportunity": true/false,
                "priority": "low/medium/high/urgent",
                "confidence_score": 0.0-1.0,
                "summary": "Brief summary of the opportunity",
                "intent": "What the person is looking for",
                "budget_mentioned": true/false,
                "budget_amount": "Amount if mentioned",
                "services_needed": "List of services required",
                "urgency_level": "low/medium/high"
            }}
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are an expert at identifying freelance and project opportunities on Reddit. Be precise and analytical."},
                    {"role": "user", "content": classification_prompt}
                ],
                temperature=0.1,
                max_tokens=500
            )
            
            # Parse the response
            result_text = response.choices[0].message.content
            result = json.loads(result_text)
            
            # Create classification record
            classification = Classification.objects.create(
                post=post,
                is_opportunity=result['is_opportunity'],
                priority=result['priority'],
                confidence_score=result['confidence_score'],
                summary=result['summary'],
                intent=result['intent'],
                budget_mentioned=result['budget_mentioned'],
                budget_amount=result.get('budget_amount', ''),
                services_needed=result['services_needed'],
                urgency_level=result['urgency_level']
            )
            
            logger.info(f"Classified post {post.id}: {result['is_opportunity']} - {result['priority']}")
            
            # Create notification for high priority opportunities
            if result['priority'] in ['high', 'urgent'] and result['is_opportunity']:
                Notification.objects.create(
                    message=f"High priority opportunity found: {post.title[:100]}...",
                    notification_type='high_priority',
                    related_post=post
                )
            
            return classification
            
        except Exception as e:
            logger.error(f"Error classifying post {post.id}: {e}")
            return None
    
    def generate_reply(self, post, classification):
        """Generate a reply for a Reddit post"""
        try:
            # Get AI persona
            persona = self.default_persona
            
            # Create reply prompt
            reply_prompt = f"""
            Generate a natural, helpful reply to this Reddit post. The post is classified as an opportunity.
            
            Post Title: {post.title}
            Post Body: {post.body}
            Opportunity Summary: {classification.summary}
            Services Needed: {classification.services_needed}
            
            Guidelines:
            1. Be helpful and professional
            2. Show understanding of their needs
            3. Offer relevant expertise
            4. Keep it concise but informative
            5. Sound natural and human-like
            6. Don't be overly promotional
            """
            
            if persona:
                reply_prompt += f"\n\nPersona Style: {persona.style}"
                if persona.include_portfolio and persona.portfolio_url:
                    reply_prompt += f"\nInclude portfolio link: {persona.portfolio_url}"
                if persona.include_cta:
                    reply_prompt += f"\nInclude call-to-action: {persona.cta_text}"
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful freelancer responding to Reddit posts. Be genuine and professional."},
                    {"role": "user", "content": reply_prompt}
                ],
                temperature=0.7,
                max_tokens=300
            )
            
            reply_content = response.choices[0].message.content.strip()
            
            # Create reply record
            reply = Reply.objects.create(
                post=post,
                content=reply_content,
                status='pending'  # Will be approved manually or automatically
            )
            
            logger.info(f"Generated reply for post {post.id}")
            return reply
            
        except Exception as e:
            logger.error(f"Error generating reply for post {post.id}: {e}")
            return None
    
    def process_post(self, post):
        """Process a single post: classify and generate reply if appropriate"""
        try:
            # Classify the post
            classification = self.classify_post(post)
            if not classification:
                return None
            
            # Generate reply if it's an opportunity
            if classification.is_opportunity and classification.priority in ['medium', 'high', 'urgent']:
                reply = self.generate_reply(post, classification)
                return {
                    'classification': classification,
                    'reply': reply
                }
            
            return {
                'classification': classification,
                'reply': None
            }
            
        except Exception as e:
            logger.error(f"Error processing post {post.id}: {e}")
            return None
    
    def process_unclassified_posts(self):
        """Process all posts that haven't been classified yet"""
        unclassified_posts = RedditPost.objects.filter(classification__isnull=True)
        
        processed_count = 0
        for post in unclassified_posts:
            result = self.process_post(post)
            if result:
                processed_count += 1
        
        logger.info(f"Processed {processed_count} unclassified posts")
        return processed_count 