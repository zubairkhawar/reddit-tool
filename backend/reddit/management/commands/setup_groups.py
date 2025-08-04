#!/usr/bin/env python3
"""
Management command to set up default groups for keywords and subreddits
"""
from django.core.management.base import BaseCommand
from reddit.models import Group, Keyword, Subreddit

class Command(BaseCommand):
    help = 'Set up default groups for organizing keywords and subreddits'

    def handle(self, *args, **options):
        # Clear existing groups
        Group.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing groups'))
        
        # Create default groups
        groups_data = [
            {
                'name': 'AI Automation',
                'description': 'AI agents, automation, LangChain, RAG, chatbots',
                'color': 'purple',
                'icon': 'bot',
                'keywords': [
                    'LangChain agent', 'LangGraph workflow', 'AI automation', 'voice agent',
                    'AI calling agent', 'chatbot', 'GPT-4 agent', 'RAG assistant',
                    'PDF chatbot', 'AI workflow automation', 'document embeddings LangChain',
                    'OCR chatbot', 'Twilio voice bot', 'NLP agent Python', 'vector DB chatbot',
                    'API automation bot', 'AutoGPT', 'AI agent', 'generative AI', 'genai',
                    'ChatGPT coding', 'machine learning', 'voice tech', 'AI integration',
                    'Next.js + Django', 'React + AI integration', 'Python automation', 'OpenAI agent'
                ],
                'subreddits': [
                    'AI_Agents', 'aiagents', 'LangChain', 'AutoGPT', 'generativeAI',
                    'genai', 'ChatGPTCoding', 'MachineLearning', 'LearnMachineLearning',
                    'automation', 'VoiceTech'
                ]
            },
            {
                'name': 'Web Development',
                'description': 'Web development, frontend, backend, full-stack',
                'color': 'blue',
                'icon': 'code',
                'keywords': [
                    'web development', 'webdev', 'frontend', 'backend', 'full stack',
                    'React', 'Next.js', 'Django', 'Python', 'JavaScript', 'TypeScript',
                    'HTML', 'CSS', 'Node.js', 'Express', 'MongoDB', 'PostgreSQL',
                    'landing page', 'website', 'web app', 'API development', 'database'
                ],
                'subreddits': [
                    'reactjs', 'nextjs', 'django', 'python', 'webdev', 'javascript',
                    'programming', 'webdevelopment', 'coding', 'software', 'tech'
                ]
            },
            {
                'name': 'Freelance & Hiring',
                'description': 'Hiring posts, freelance opportunities, job offers',
                'color': 'green',
                'icon': 'briefcase',
                'keywords': [
                    'need help', 'freelancer', 'hiring', 'looking for developer',
                    'want to hire', 'for hire', 'freelance developer', 'developer needed',
                    'help with project', 'hiring someone', 'build', 'create', 'develop',
                    'implement', 'setup', 'configure', 'deploy', 'project', 'work',
                    'job', 'gig', 'contract', 'budget', 'paid', 'compensation',
                    'hourly', 'project rate'
                ],
                'subreddits': [
                    'forhire', 'FreelanceProgramming', 'startups', 'entrepreneur',
                    'smallbusiness', 'technology'
                ]
            },
            {
                'name': 'Machine Learning',
                'description': 'ML, data science, analytics, AI research',
                'color': 'orange',
                'icon': 'brain',
                'keywords': [
                    'machine learning', 'data science', 'analytics', 'ML', 'deep learning',
                    'neural networks', 'data analysis', 'predictive modeling', 'AI research',
                    'computer vision', 'NLP', 'natural language processing', 'data mining',
                    'statistics', 'python', 'tensorflow', 'pytorch', 'scikit-learn'
                ],
                'subreddits': [
                    'MachineLearning', 'LearnMachineLearning', 'datascience', 'artificial',
                    'AI', 'python', 'programming'
                ]
            }
        ]
        
        created_groups = 0
        updated_keywords = 0
        updated_subreddits = 0
        
        for group_data in groups_data:
            # Create group
            group, created = Group.objects.get_or_create(
                name=group_data['name'],
                defaults={
                    'description': group_data['description'],
                    'color': group_data['color'],
                    'icon': group_data['icon'],
                    'is_active': True
                }
            )
            
            if created:
                created_groups += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created group: {group.name}')
                )
            else:
                # Update existing group
                group.description = group_data['description']
                group.color = group_data['color']
                group.icon = group_data['icon']
                group.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated group: {group.name}')
                )
            
            # Assign keywords to group
            for keyword_name in group_data['keywords']:
                try:
                    keyword = Keyword.objects.get(keyword=keyword_name)
                    keyword.group = group
                    keyword.save()
                    updated_keywords += 1
                except Keyword.DoesNotExist:
                    # Create keyword if it doesn't exist
                    keyword = Keyword.objects.create(
                        keyword=keyword_name,
                        group=group,
                        is_active=True
                    )
                    updated_keywords += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created keyword: {keyword.keyword} in {group.name}')
                    )
            
            # Assign subreddits to group
            for subreddit_name in group_data['subreddits']:
                try:
                    subreddit = Subreddit.objects.get(name=subreddit_name)
                    subreddit.group = group
                    subreddit.save()
                    updated_subreddits += 1
                except Subreddit.DoesNotExist:
                    # Create subreddit if it doesn't exist
                    subreddit = Subreddit.objects.create(
                        name=subreddit_name,
                        group=group,
                        is_active=True
                    )
                    updated_subreddits += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'Created subreddit: r/{subreddit.name} in {group.name}')
                    )
        
        # Show summary
        total_groups = Group.objects.count()
        total_keywords = Keyword.objects.count()
        total_subreddits = Subreddit.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(f'\n=== GROUPS SETUP SUMMARY ===')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Groups Created/Updated: {created_groups}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Keywords Updated: {updated_keywords}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Subreddits Updated: {updated_subreddits}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Groups: {total_groups}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Keywords: {total_keywords}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Total Subreddits: {total_subreddits}')
        )
        
        # Show groups
        self.stdout.write(
            self.style.WARNING(f'\n=== GROUPS CREATED ===')
        )
        for group in Group.objects.all():
            keywords_count = group.keywords.count()
            subreddits_count = group.subreddits.count()
            self.stdout.write(
                self.style.SUCCESS(f'{group.name}: {keywords_count} keywords, {subreddits_count} subreddits')
            )
        
        self.stdout.write(
            self.style.SUCCESS(f'\n✅ Groups setup completed successfully!')
        ) 