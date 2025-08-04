#!/usr/bin/env python3
"""
Management command to set up Reddit-compliant reply templates
Avoids platform links that trigger AutoModerator removal
"""
from django.core.management.base import BaseCommand
from reddit.models import ReplyTemplate

class Command(BaseCommand):
    help = 'Set up Reddit-compliant reply templates that avoid platform links'

    def handle(self, *args, **options):
        templates = [
            {
                'name': 'Portfolio-Focused Professional',
                'template_type': 'general',
                'content': """Hey there! Based on what you shared, it sounds like you're looking for [brief problem summary]. I've previously worked on something similar using [tool/tech stack]. I can help you build or automate this quickly. 

You can check out my portfolio: https://zubairkhawar.vercel.app/

Feel free to drop a message if you'd prefer direct support!"""
            },
            {
                'name': 'Developer-to-Developer (Technical)',
                'template_type': 'ai_automation',
                'content': """Interesting use case. You could totally handle this using LangChain + vector DB (like Pinecone or Chroma). I recently did something similar with Django + Next.js. 

If you're looking for someone to build it with you, happy to collaborate. My portfolio: https://zubairkhawar.vercel.app/

DM if you prefer quick chat."""
            },
            {
                'name': 'AI Automation Specialist',
                'template_type': 'ai_automation',
                'content': """AI automation can definitely solve this. LangGraph (or LangChain) + an async agent setup would work great here. I specialize in AI agents and workflow automation.

Check out my portfolio: https://zubairkhawar.vercel.app/

Feel free to ping me for more details!"""
            },
            {
                'name': 'Professional Freelancer (Corporate tone)',
                'template_type': 'general',
                'content': """Hi! I'm a freelance AI automation developer with experience in [relevant tech]. What you're asking for is 100% doable using [tech]. 

If you're open to working with a freelancer, I'd love to assist. You can check my portfolio: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'Problem-Specific Solver',
                'template_type': 'web_development',
                'content': """Saw your post about [summary of issue]. Just wrapped up something very similar — built using Django for backend + Next.js frontend, OpenAI agent + LangGraph for the logic. 

Want help setting it up? Happy to hop on a call or share code snippets. 

Portfolio: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'Plug-n-Play Solution',
                'template_type': 'general',
                'content': """You don't need to build this from scratch! I can help you set up a plug-and-play solution that does exactly what you need. Been doing this for small teams/founders using LangChain & AI agents. 

Portfolio: https://zubairkhawar.vercel.app/

DM me directly for details."""
            },
            {
                'name': 'Rapid Response (Value-first)',
                'template_type': 'general',
                'content': """You can totally solve this using [tech]. I've built a few automations like that — happy to help you set it up. Quick call or async support available. 

My portfolio: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'Showcase Style (Portfolio-forward)',
                'template_type': 'general',
                'content': """Cool project idea! I've done similar work before. Check this: https://zubairkhawar.vercel.app/

If you're interested in getting it built fast, I'm available for direct collaboration."""
            },
            {
                'name': 'Niche Authority (AI Focus)',
                'template_type': 'ai_automation',
                'content': """This is something a lot of founders/devs get stuck with. Best approach: async agent with tool calling using LangGraph. Let me know if you need help — I specialize in AI agents and workflow orchestration. 

Work samples: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'PDF Chat/Document QA Tool',
                'template_type': 'ai_automation',
                'content': """I've recently built a similar solution where users can upload PDFs and chat directly with their content using LangChain embeddings and Retrieval-Augmented Generation (RAG).

It's powered by a Django backend, PostgreSQL, and LangChain, with a Next.js frontend styled for a clean and modern UX. The AI accurately extracts, indexes, and answers queries from large documents.

🔗 Here's a quick demo: https://www.loom.com/share/775b140132ef4e8e9637caba49646fff?sid=3dce0123-4d76-4c0b-a17c-d6d1652dc619

Let me know how closely this aligns with your project—I'd be happy to tailor this for your use case.

Portfolio: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'DataWhiz – AI Business Intelligence',
                'template_type': 'data_analysis',
                'content': """I've built a comprehensive AI-powered business intelligence platform that transforms raw data into actionable insights. It features automated data processing, predictive analytics, and interactive dashboards.

The system uses advanced ML algorithms for trend analysis, anomaly detection, and forecasting. It's designed to handle large datasets efficiently with real-time processing capabilities.

🔗 Demo: https://www.loom.com/share/775b140132ef4e8e9637caba49646fff?sid=3dce0123-4d76-4c0b-a17c-d6d1652dc619

Perfect for businesses looking to make data-driven decisions. Let me know if this aligns with your needs!

Portfolio: https://zubairkhawar.vercel.app/"""
            },
            {
                'name': 'Voice Agent – AI Call Handler',
                'template_type': 'ai_automation',
                'content': """I've developed an AI voice agent that handles customer calls intelligently. It features natural language processing, sentiment analysis, and can handle complex customer inquiries with human-like responses.

The system integrates with existing phone systems and can be customized for specific business needs. It's perfect for customer service automation and lead qualification.

🔗 Demo: https://www.loom.com/share/775b140132ef4e8e9637caba49646fff?sid=3dce0123-4d76-4c0b-a17c-d6d1652dc619

Great for businesses looking to scale their customer support operations.

Portfolio: https://zubairkhawar.vercel.app/"""
            }
        ]
        
        # Clear existing templates
        ReplyTemplate.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing templates'))
        
        # Create new templates
        for template_data in templates:
            template, created = ReplyTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults={
                    'template_type': template_data['template_type'],
                    'content': template_data['content'],
                    'is_active': True
                }
            )
            
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                template.template_type = template_data['template_type']
                template.content = template_data['content']
                template.is_active = True
                template.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated template: {template.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully set up {len(templates)} Reddit-compliant templates')
        ) 