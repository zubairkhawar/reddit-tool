#!/usr/bin/env python3
"""
Management command to set up smart keywords for better filtering
Focuses on real AI automation and web development opportunities
"""
from django.core.management.base import BaseCommand
from reddit.models import Keyword, Subreddit

class Command(BaseCommand):
    help = 'Set up smart keywords and subreddits for real AI automation and web development opportunities'

    def handle(self, *args, **options):
        # Clear existing keywords and subreddits
        Keyword.objects.all().delete()
        Subreddit.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing keywords and subreddits'))
        
        # Real AI/Agent Keywords (High Priority)
        ai_keywords = [
            # Core AI Agent Technologies
            {'keyword': 'LangChain agent', 'is_active': True},
            {'keyword': 'LangGraph workflow', 'is_active': True},
            {'keyword': 'AI automation', 'is_active': True},
            {'keyword': 'voice agent', 'is_active': True},
            {'keyword': 'AI calling agent', 'is_active': True},
            {'keyword': 'chatbot', 'is_active': True},
            {'keyword': 'GPT-4 agent', 'is_active': True},
            {'keyword': 'RAG assistant', 'is_active': True},
            {'keyword': 'PDF chatbot', 'is_active': True},
            {'keyword': 'AI workflow automation', 'is_active': True},
            {'keyword': 'document embeddings LangChain', 'is_active': True},
            {'keyword': 'OCR chatbot', 'is_active': True},
            {'keyword': 'Twilio voice bot', 'is_active': True},
            {'keyword': 'NLP agent Python', 'is_active': True},
            {'keyword': 'vector DB chatbot', 'is_active': True},
            {'keyword': 'API automation bot', 'is_active': True},
            
            # AI Agent Frameworks
            {'keyword': 'AutoGPT', 'is_active': True},
            {'keyword': 'AI agent', 'is_active': True},
            {'keyword': 'generative AI', 'is_active': True},
            {'keyword': 'genai', 'is_active': True},
            {'keyword': 'ChatGPT coding', 'is_active': True},
            {'keyword': 'machine learning', 'is_active': True},
            {'keyword': 'voice tech', 'is_active': True},
            {'keyword': 'AI integration', 'is_active': True},
            
            # Development Keywords
            {'keyword': 'Next.js + Django', 'is_active': True},
            {'keyword': 'React + AI integration', 'is_active': True},
            {'keyword': 'Python automation', 'is_active': True},
            {'keyword': 'OpenAI agent', 'is_active': True},
        ]
        
        # Real Hiring/Opportunity Keywords (High Priority)
        hiring_keywords = [
            # Direct Hiring Keywords
            {'keyword': 'need help', 'is_active': True},
            {'keyword': 'freelancer', 'is_active': True},
            {'keyword': 'hiring', 'is_active': True},
            {'keyword': 'looking for developer', 'is_active': True},
            {'keyword': 'want to hire', 'is_active': True},
            {'keyword': 'for hire', 'is_active': True},
            {'keyword': 'freelance developer', 'is_active': True},
            {'keyword': 'developer needed', 'is_active': True},
            {'keyword': 'help with project', 'is_active': True},
            {'keyword': 'hiring someone', 'is_active': True},
            {'keyword': 'webdev', 'is_active': True},
            
            # Project Keywords
            {'keyword': 'build', 'is_active': True},
            {'keyword': 'create', 'is_active': True},
            {'keyword': 'develop', 'is_active': True},
            {'keyword': 'implement', 'is_active': True},
            {'keyword': 'setup', 'is_active': True},
            {'keyword': 'configure', 'is_active': True},
            {'keyword': 'deploy', 'is_active': True},
            {'keyword': 'project', 'is_active': True},
            {'keyword': 'work', 'is_active': True},
            {'keyword': 'job', 'is_active': True},
            {'keyword': 'gig', 'is_active': True},
            {'keyword': 'contract', 'is_active': True},
            {'keyword': 'budget', 'is_active': True},
            {'keyword': 'paid', 'is_active': True},
            {'keyword': 'compensation', 'is_active': True},
            {'keyword': 'hourly', 'is_active': True},
            {'keyword': 'project rate', 'is_active': True},
        ]
        
        # Real High-Quality Subreddits
        real_subreddits = [
            # AI/Agent Focused Subreddits
            'AI_Agents',
            'aiagents', 
            'LangChain',
            'AutoGPT',
            'generativeAI',
            'genai',
            'ChatGPTCoding',
            'MachineLearning',
            'LearnMachineLearning',
            'automation',
            'VoiceTech',
            
            # Web Development Subreddits
            'reactjs',
            'nextjs',
            'django',
            'python',
            'webdev',
            'javascript',
            
            # Freelance/Hiring Subreddits
            'FreelanceProgramming',
            'forhire',
            'technology',
            
            # Additional Tech Subreddits
            'programming',
            'webdevelopment',
            'startups',
            'entrepreneur',
            'smallbusiness',
            'coding',
            'software',
            'tech',
        ]
        
        # Create AI keywords
        ai_created_count = 0
        for keyword_data in ai_keywords:
            keyword, created = Keyword.objects.get_or_create(
                keyword=keyword_data['keyword'],
                defaults={'is_active': keyword_data['is_active']}
            )
            
            if created:
                ai_created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created AI keyword: {keyword.keyword}')
                )
            else:
                keyword.is_active = keyword_data['is_active']
                keyword.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated AI keyword: {keyword.keyword}')
                )
        
        # Create Hiring keywords
        hiring_created_count = 0
        for keyword_data in hiring_keywords:
            keyword, created = Keyword.objects.get_or_create(
                keyword=keyword_data['keyword'],
                defaults={'is_active': keyword_data['is_active']}
            )
            
            if created:
                hiring_created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created Hiring keyword: {keyword.keyword}')
                )
            else:
                keyword.is_active = keyword_data['is_active']
                keyword.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated Hiring keyword: {keyword.keyword}')
                )
        
        # Create Real Subreddits
        subreddit_count = 0
        for subreddit_name in real_subreddits:
            subreddit, created = Subreddit.objects.get_or_create(
                name=subreddit_name,
                defaults={'is_active': True}
            )
            
            if created:
                subreddit_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created subreddit: r/{subreddit.name}')
                )
            else:
                subreddit.is_active = True
                subreddit.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated subreddit: r/{subreddit.name}')
                )
        
        # Show summary
        total_keywords = Keyword.objects.filter(is_active=True).count()
        total_subreddits = Subreddit.objects.filter(is_active=True).count()
        
        self.stdout.write(
            self.style.SUCCESS(f'\n=== SETUP SUMMARY ===')
        )
        self.stdout.write(
            self.style.SUCCESS(f'AI/Agent Keywords: {ai_created_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Hiring/Opportunity Keywords: {hiring_created_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Real Subreddits: {subreddit_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Active Keywords: {total_keywords}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Active Subreddits: {total_subreddits}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Items: {total_keywords + total_subreddits}')
        )
        
        # Show keyword categories
        ai_keywords_count = Keyword.objects.filter(
            is_active=True, 
            keyword__icontains='ai'
        ).count()
        hiring_keywords_count = Keyword.objects.filter(
            is_active=True, 
            keyword__icontains='hire'
        ).count()
        
        self.stdout.write(
            self.style.WARNING(f'\n=== KEYWORD BREAKDOWN ===')
        )
        self.stdout.write(
            self.style.SUCCESS(f'AI/Agent keywords: {ai_keywords_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Hiring/Opportunity keywords: {hiring_keywords_count}')
        )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Setup completed successfully with REAL opportunities!')
        ) 