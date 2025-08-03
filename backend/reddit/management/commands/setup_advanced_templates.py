#!/usr/bin/env python3
"""
Management command to set up advanced, dynamic reply templates
"""
from django.core.management.base import BaseCommand
from reddit.models import ReplyTemplate

class Command(BaseCommand):
    help = 'Set up advanced dynamic reply templates'

    def handle(self, *args, **options):
        templates = [
            {
                'name': 'Solution-Oriented (Polished & Helpful)',
                'template_type': 'general',
                'content': """Hey there! Based on what you shared, it sounds like you're looking for [brief problem summary]. I've previously worked on something similar using [tool/tech stack]. I can help you build or automate this quickly. 

You can check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

Feel free to drop a message if you'd prefer direct support!"""
            },
            {
                'name': 'Developer-to-Developer (Casual, Technical)',
                'template_type': 'ai_automation',
                'content': """Interesting use case. You could totally handle this using LangChain + vector DB (like Pinecone or Chroma). I recently did something similar with Django + Next.js. 

If you're looking for someone to build it with you, happy to collaborate. My portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

DM if you prefer quick chat."""
            },
            {
                'name': 'AI Whisperer (Targeting automation seekers)',
                'template_type': 'ai_automation',
                'content': """AI automation can definitely solve this. LangGraph (or LangChain) + an async agent setup would work great here. I specialize in AI agents and workflow automation.

Check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

Feel free to ping me for more details!"""
            },
            {
                'name': 'Professional Freelancer Pitch (Corporate tone)',
                'template_type': 'general',
                'content': """Hi! I'm a freelance AI automation developer with experience in [relevant tech]. What you're asking for is 100% doable using [tech]. 

If you're open to working with a freelancer, I'd love to assist. You can check my portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'Problem-Specific Solver (Contextual hook)',
                'template_type': 'web_development',
                'content': """Saw your post about [summary of issue]. Just wrapped up something very similar — built using Django for backend + Next.js frontend, OpenAI agent + LangGraph for the logic. 

Want help setting it up? Happy to hop on a call or share code snippets. 

Portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'Plug-n-Play (Targeting small business owners/non-devs)',
                'template_type': 'general',
                'content': """You don't need to build this from scratch! I can help you set up a plug-and-play solution that does exactly what you need. Been doing this for small teams/founders using LangChain & AI agents. 

Portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

DM me directly for details."""
            },
            {
                'name': 'Rapid Response (Short, actionable, value-first)',
                'template_type': 'general',
                'content': """You can totally solve this using [tech]. I've built a few automations like that — happy to help you set it up. Quick call or async support available. 

My portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'Showcase Style (Portfolio-forward)',
                'template_type': 'general',
                'content': """Cool project idea! I've done similar work before. Check this: https://zubairkhawar.vercel.app/

If you're interested in getting it built fast, I'm available on Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'Niche Authority Tone',
                'template_type': 'ai_automation',
                'content': """This is something a lot of founders/devs get stuck with. Best approach: async agent with tool calling using LangGraph. Let me know if you need help — I specialize in AI agents and workflow orchestration. 

Work samples: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'PDF Chat/Document QA Tool',
                'template_type': 'ai_automation',
                'content': """I've recently built a similar solution where users can upload PDFs and chat directly with their content using LangChain embeddings and Retrieval-Augmented Generation (RAG).

It's powered by a Django backend, PostgreSQL, and LangChain, with a Next.js frontend styled for a clean and modern UX. The AI accurately extracts, indexes, and answers queries from large documents.

🔗 Here's a quick demo: https://www.loom.com/share/775b140132ef4e8e9637caba49646fff?sid=3dce0123-4d76-4c0b-a17c-d6d1652dc619

Let me know how closely this aligns with your project—I'd be happy to tailor this for your use case.

Portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'DataWhiz – AI Business Intelligence',
                'template_type': 'data_analysis',
                'content': """I built DataWhiz — an AI-powered business intelligence and document analysis tool.

It lets users upload PDFs, Excel, CSV, or even image files and chat with their data in plain English. The system parses files using OCR + Pandas + OpenAI + LangChain, and returns smart insights, charts, and summaries.

Built with Django REST backend and Next.js frontend with a modern UI, it's ideal for non-technical users needing fast, automated business reporting.

Would love to hear more about your exact workflow to suggest how this can be customized for your use case.

Portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            },
            {
                'name': 'AI Voice Agent for Real-Time Phone Calls',
                'template_type': 'ai_automation',
                'content': """I recently built a custom AI voice agent that makes autonomous outbound phone calls using real-time speech recognition, intent analysis, and AI-driven dialogue generation.

It listens, understands, and responds just like a human—perfect for appointment reminders, lead qualification, or even cold calling.

📄 Here's a detailed breakdown of the project:
https://docs.google.com/document/d/1Pmyis9XFr4rigJrv0fIj9aGG8RjUDkkfzJNIbQvvHWY/edit?tab=t.0

If you're thinking of integrating voice AI into your process, I can help deploy a robust and scalable system with custom intents, fallback handling, and analytics.

Portfolio: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384"""
            }
        ]

        for template_data in templates:
            template, created = ReplyTemplate.objects.get_or_create(
                name=template_data['name'],
                defaults=template_data
            )
            if created:
                self.stdout.write(
                    self.style.SUCCESS(f'Created template: {template.name}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'Template already exists: {template.name}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully set up advanced dynamic reply templates!')
        ) 