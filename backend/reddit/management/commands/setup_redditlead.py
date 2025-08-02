from django.core.management.base import BaseCommand
from reddit.models import Keyword, Subreddit, AIPersona


class Command(BaseCommand):
    help = 'Set up initial data for RedditLead.AI'

    def handle(self, *args, **options):
        self.stdout.write('Setting up RedditLead.AI...')
        
        # Create default keywords
        default_keywords = [
            'AI automation',
            'LangChain',
            'chatbot',
            'web development',
            'freelance',
            'project',
            'help needed',
            'budget',
            'payment',
            'automation',
            'script',
            'API',
            'integration',
            'data processing',
            'machine learning',
            'Python',
            'JavaScript',
            'React',
            'Node.js',
            'database',
        ]
        
        for keyword_text in default_keywords:
            Keyword.objects.get_or_create(
                keyword=keyword_text,
                defaults={'is_active': True}
            )
        
        self.stdout.write(f'Created {len(default_keywords)} default keywords')
        
        # Create default subreddits
        default_subreddits = [
            'forhire',
            'freelance',
            'webdev',
            'programming',
            'learnprogramming',
            'python',
            'javascript',
            'reactjs',
            'node',
            'automation',
            'MachineLearning',
            'artificial',
            'datascience',
            'startups',
            'entrepreneur',
        ]
        
        for subreddit_name in default_subreddits:
            Subreddit.objects.get_or_create(
                name=subreddit_name,
                defaults={'is_active': True}
            )
        
        self.stdout.write(f'Created {len(default_subreddits)} default subreddits')
        
        # Create default AI persona
        default_persona, created = AIPersona.objects.get_or_create(
            name='Professional Freelancer',
            defaults={
                'tone': 'professional',
                'style': 'I am a professional freelancer with expertise in AI automation, web development, and data processing. I provide clear, helpful responses that demonstrate my understanding of the client\'s needs while maintaining a professional and approachable tone.',
                'include_portfolio': True,
                'portfolio_url': 'https://your-portfolio-url.com',
                'include_cta': True,
                'cta_text': 'DM me if this sounds like a good fit! I\'d love to discuss your project in detail.',
                'is_active': True
            }
        )
        
        if created:
            self.stdout.write('Created default AI persona')
        else:
            self.stdout.write('Default AI persona already exists')
        
        self.stdout.write(
            self.style.SUCCESS('RedditLead.AI setup completed successfully!')
        ) 