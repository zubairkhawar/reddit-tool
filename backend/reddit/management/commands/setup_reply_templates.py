#!/usr/bin/env python3
"""
Management command to set up default reply templates
"""
from django.core.management.base import BaseCommand
from reddit.models import ReplyTemplate

class Command(BaseCommand):
    help = 'Set up default reply templates'

    def handle(self, *args, **options):
        templates = [
            {
                'name': 'Web Development - Professional',
                'template_type': 'web_development',
                'content': """Hello! 

I'm a full-stack developer with extensive experience in web development. I can help you create a professional, responsive website that meets your requirements.

Based on your project description, I can deliver:
- Modern, mobile-friendly design
- Clean, optimized code
- Payment gateway integration
- SEO optimization
- Fast loading times

You can check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

I'm confident I can complete this project within your timeline. Would love to discuss the details further!"""
            },
            {
                'name': 'AI/Automation - Expert',
                'template_type': 'ai_automation',
                'content': """Hi there!

I'm a Python AI Developer with 2+ years of experience building intelligent systems. I specialize in:
- LangChain and LangGraph for agent-based workflows
- Custom AI models and API integrations
- AI workflow automation
- NLP applications

I can help you implement AI solutions that are both powerful and practical. Check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

Let's discuss how I can help with your AI project!"""
            },
            {
                'name': 'Mobile App - Experienced',
                'template_type': 'mobile_app',
                'content': """Hello!

I'm a mobile app developer with experience in React Native and cross-platform development. I can help you build:
- Native and cross-platform apps
- User-friendly interfaces
- Backend integration
- App store deployment

You can see my work at: https://zubairkhawar.vercel.app/ and Upwork: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

Would love to discuss your app requirements!"""
            },
            {
                'name': 'Data Analysis - Specialist',
                'template_type': 'data_analysis',
                'content': """Hi!

I'm a data analyst with expertise in Python, machine learning, and data visualization. I can help with:
- Data extraction and analysis
- Machine learning models
- Interactive dashboards
- Automated reporting systems

Check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

Let's discuss your data needs!"""
            },
            {
                'name': 'General - Professional',
                'template_type': 'general',
                'content': """Hello!

I'm a Python AI Developer with 2 years of experience building intelligent systems. I can help with various projects including web development, AI automation, and data analysis.

You can check out my portfolio: https://zubairkhawar.vercel.app/ and Upwork profile: https://www.upwork.com/freelancers/~019a4c467a99a10da1?s=1623717017731600384

I'd love to discuss your project requirements and see how I can help!"""
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
            self.style.SUCCESS('Successfully set up reply templates!')
        ) 