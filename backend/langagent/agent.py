import os
import json
import logging
import random
from openai import OpenAI
from decouple import config
from reddit.models import ReplyTemplate, AIPersona

logger = logging.getLogger(__name__)

class RedditLeadAgent:
    def __init__(self):
        self.client = OpenAI(api_key=config('OPENAI_API_KEY'))
        self.default_persona = AIPersona.objects.filter(is_active=True).first()
    
    def classify_post(self, post):
        """Classify if a Reddit post is an opportunity"""
        try:
            # Create classification prompt
            classification_prompt = f"""
            Analyze this Reddit post and determine if it's a freelance/project opportunity.
            
            Post Title: {post.title}
            Post Content: {post.content}
            
            Always respond with valid JSON in this exact format:
            {{
                "is_opportunity": true/false,
                "confidence_score": 0.0-1.0,
                "priority": "high/medium/low",
                "intent": "brief description of what they want",
                "services_needed": "list of services/technologies",
                "budget_amount": "estimated budget or budget range",
                "urgency": "high/medium/low",
                "summary": "brief summary of the opportunity"
            }}
            
            Guidelines:
            - Look for keywords like "need help", "looking for", "hire", "freelancer", "developer", "build", "create"
            - Consider if they're asking for technical work, consulting, or development
            - Assess if they have a clear project description
            - Determine if they seem serious about hiring
            - Consider subreddit rules (avoid platform links in replies)
            
            SKILL-SPECIFIC FILTERING:
            - HIGH PRIORITY: AI automation, LangChain, LangGraph, RAG, PDF chat, voice agents, web development, Django, Next.js, React
            - MEDIUM PRIORITY: Data analysis, business intelligence, analytics, reporting, API development
            - LOW PRIORITY: General programming, basic automation
            - REJECT: Voice recording, transcription, translation, manual data entry, non-technical tasks
            
            Only classify as opportunity if it matches your core skills (AI automation, web development, data analysis)
            """
            
            response = self.client.chat.completions.create(
                model="gpt-4",
                messages=[
                    {"role": "system", "content": "You are a helpful assistant that analyzes Reddit posts for freelance opportunities. Always respond with valid JSON."},
                    {"role": "user", "content": classification_prompt}
                ],
                temperature=0.3,
                max_tokens=300
            )
            
            response_text = response.choices[0].message.content.strip()
            
            # Clean up response (remove markdown if present)
            if response_text.startswith('```json'):
                response_text = response_text.replace('```json', '').replace('```', '').strip()
            elif response_text.startswith('```'):
                response_text = response_text.replace('```', '').strip()
            
            # Parse JSON response
            try:
                classification_data = json.loads(response_text)
                
                # Create classification record
                from reddit.models import Classification
                classification = Classification.objects.create(
                    post=post,
                    is_opportunity=classification_data.get('is_opportunity', False),
                    confidence_score=classification_data.get('confidence_score', 0.0),
                    priority=classification_data.get('priority', 'low'),
                    intent=classification_data.get('intent', ''),
                    services_needed=classification_data.get('services_needed', ''),
                    budget_amount=classification_data.get('budget_amount', ''),
                    urgency_level=classification_data.get('urgency', 'low'),
                    summary=classification_data.get('summary', '')
                )
                
                logger.info(f"Classified post {post.id} as opportunity: {classification.is_opportunity}")
                return classification
                
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse JSON response: {e}")
                # Create default classification
                from reddit.models import Classification
                classification = Classification.objects.create(
                    post=post,
                    is_opportunity=False,
                    confidence_score=0.0,
                    priority='low',
                    intent='Unable to parse',
                    services_needed='',
                    budget_amount='',
                    urgency_level='low',
                    summary='Classification failed'
                )
                return classification
                
        except Exception as e:
            logger.error(f"Error classifying post {post.id}: {e}")
            return None
    
    def generate_reply(self, post, classification):
        """Generate a reply for a Reddit post using dynamic templates"""
        try:
            # Get AI persona
            persona = self.default_persona
            
            # Determine template type based on classification
            template_type = self._determine_template_type(classification)
            
            # Get multiple templates for the type and randomly select one
            templates = self._get_reply_templates(template_type)
            
            if not templates:
                # Fallback to general templates
                templates = self._get_reply_templates('general')
            
            if templates:
                # Randomly select a template
                selected_template = random.choice(templates)
                
                # Fill dynamic placeholders
                filled_content = self._fill_template_placeholders(
                    selected_template.content, 
                    post, 
                    classification
                )
                
                # Create reply prompt with the filled template
                reply_prompt = f"""
                Generate a natural, helpful reply to this Reddit post. The post is classified as an opportunity.
                
                Post Title: {post.title}
                Post Content: {post.content}
                Opportunity Summary: {classification.summary}
                Services Needed: {classification.services_needed}
                
                Use this template as a base but adapt it naturally:
                {filled_content}
                
                Guidelines:
                1. Be helpful and professional
                2. Show understanding of their needs
                3. Offer relevant expertise
                4. Keep it concise but informative
                5. Sound natural and human-like
                6. Don't be overly promotional
                7. Make sure the reply flows naturally
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
                    max_tokens=400
                )
                
                reply_content = response.choices[0].message.content.strip()
                
                # Create reply record
                from reddit.models import Reply
                reply = Reply.objects.create(
                    post=post,
                    content=reply_content,
                    status='pending',  # Will be approved manually or automatically
                    confidence_score=classification.confidence_score
                )
                
                logger.info(f"Generated reply for post {post.id} using template: {selected_template.name}")
                return reply
            else:
                # Fallback reply if no templates available
                fallback_reply = f"""Hello! I can help with your project. Based on your post, it looks like you need {classification.services_needed or 'assistance'}. 

I'm a Python AI Developer with experience in building intelligent systems. You can check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

I'd love to discuss your project requirements!"""
                
                from reddit.models import Reply
                reply = Reply.objects.create(
                    post=post,
                    content=fallback_reply,
                    status='pending',
                    confidence_score=classification.confidence_score
                )
                
                logger.info(f"Generated fallback reply for post {post.id}")
                return reply
                
        except Exception as e:
            logger.error(f"Error generating reply for post {post.id}: {e}")
            return None
    
    def _determine_template_type(self, classification):
        """Determine which template type to use based on classification"""
        services_lower = classification.services_needed.lower()
        intent_lower = classification.intent.lower()
        
        # Check for specific project types first
        if any(word in services_lower for word in ['pdf', 'document', 'chat', 'qa', 'rag']):
            return 'ai_automation'  # PDF Chat templates
        elif any(word in services_lower for word in ['voice', 'call', 'phone', 'speech']):
            return 'ai_automation'  # Voice Agent templates
        elif any(word in services_lower for word in ['data', 'analysis', 'analytics', 'reporting', 'excel', 'csv']):
            return 'data_analysis'  # DataWhiz templates
        elif any(word in services_lower for word in ['web', 'website', 'landing', 'frontend', 'backend']):
            return 'web_development'
        elif any(word in services_lower for word in ['ai', 'automation', 'machine learning', 'nlp', 'langchain', 'langgraph']):
            return 'ai_automation'
        elif any(word in services_lower for word in ['mobile', 'app', 'ios', 'android']):
            return 'mobile_app'
        else:
            return 'general'
    
    def _get_reply_templates(self, template_type):
        """Get reply templates for the given type"""
        try:
            return list(ReplyTemplate.objects.filter(
                template_type=template_type,
                is_active=True
            ))
        except Exception as e:
            logger.error(f"Error fetching reply templates for type {template_type}: {e}")
            return []
    
    def _fill_template_placeholders(self, template_content, post, classification):
        """Fill dynamic placeholders in template content"""
        filled_content = template_content
        
        # Extract key information from post and classification
        post_summary = classification.summary or f"your {classification.services_needed or 'project'}"
        tech_stack = self._extract_tech_stack(classification.services_needed)
        
        # Replace placeholders
        replacements = {
            '[brief problem summary]': post_summary,
            '[tool/tech stack]': tech_stack,
            '[tech]': tech_stack,
            '[relevant tech]': tech_stack,
            '[summary of issue]': post_summary,
        }
        
        for placeholder, replacement in replacements.items():
            filled_content = filled_content.replace(placeholder, replacement)
        
        return filled_content
    
    def _extract_tech_stack(self, services_needed):
        """Extract relevant tech stack from services needed"""
        if not services_needed:
            return "modern web technologies"
        
        tech_mapping = {
            'web': 'Django + Next.js',
            'frontend': 'React/Next.js',
            'backend': 'Django/Python',
            'ai': 'LangChain + OpenAI',
            'automation': 'LangGraph + AI agents',
            'pdf': 'LangChain + RAG',
            'voice': 'Speech recognition + AI',
            'data': 'Pandas + Python',
            'mobile': 'React Native',
            'database': 'PostgreSQL',
        }
        
        services_lower = services_needed.lower()
        extracted_tech = []
        
        for keyword, tech in tech_mapping.items():
            if keyword in services_lower:
                extracted_tech.append(tech)
        
        if extracted_tech:
            return ', '.join(extracted_tech)
        else:
            return "modern development tools"
    
    def process_post(self, post):
        """Process a Reddit post through classification and reply generation"""
        try:
            # Classify the post
            classification = self.classify_post(post)
            if not classification:
                return None
            
            # Generate reply if it's an opportunity
            reply = None
            if classification.is_opportunity and classification.confidence_score > 0.5:
                reply = self.generate_reply(post, classification)
            
            return {
                'classification': classification,
                'reply': reply
            }
            
        except Exception as e:
            logger.error(f"Error processing post {post.id}: {e}")
            return None
    
    def process_unclassified_posts(self):
        """Process all posts that haven't been classified yet"""
        from reddit.models import RedditPost
        unclassified_posts = RedditPost.objects.filter(classification__isnull=True)
        
        processed_count = 0
        for post in unclassified_posts:
            result = self.process_post(post)
            if result:
                processed_count += 1
        
        logger.info(f"Processed {processed_count} unclassified posts")
        return processed_count 