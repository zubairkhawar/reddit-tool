#!/usr/bin/env python3
"""
Management command to set up focused subreddits for better opportunities
Focuses on subreddits with technical/development opportunities
"""
from django.core.management.base import BaseCommand
from reddit.models import Subreddit

class Command(BaseCommand):
    help = 'Set up focused subreddits for better opportunity filtering'

    def handle(self, *args, **options):
        # Clear existing subreddits
        Subreddit.objects.all().delete()
        self.stdout.write(self.style.SUCCESS('Cleared existing subreddits'))
        
        # Define focused subreddits based on your skills
        subreddits = [
            # High-Quality Technical Subreddits
            {'name': 'forhire', 'is_active': True},  # General freelance
            {'name': 'freelance', 'is_active': True},  # Freelance opportunities
            {'name': 'webdev', 'is_active': True},  # Web development
            {'name': 'programming', 'is_active': True},  # Programming jobs
            {'name': 'django', 'is_active': True},  # Django-specific
            {'name': 'reactjs', 'is_active': True},  # React opportunities
            {'name': 'nextjs', 'is_active': True},  # Next.js projects
            {'name': 'MachineLearning', 'is_active': True},  # AI/ML opportunities
            {'name': 'artificial', 'is_active': True},  # AI projects
            {'name': 'datascience', 'is_active': True},  # Data science
            {'name': 'startups', 'is_active': True},  # Startup opportunities
            {'name': 'entrepreneur', 'is_active': True},  # Business opportunities
            {'name': 'sidehustle', 'is_active': True},  # Side project opportunities
            {'name': 'startupjobs', 'is_active': True},  # Startup jobs
            {'name': 'remotejs', 'is_active': True},  # Remote JavaScript jobs
            {'name': 'pythonjobs', 'is_active': True},  # Python opportunities
            {'name': 'webdevjobs', 'is_active': True},  # Web development jobs
            {'name': 'techjobs', 'is_active': True},  # General tech jobs
            {'name': 'softwarejobs', 'is_active': True},  # Software development
            {'name': 'automation', 'is_active': True},  # Automation projects
        ]
        
        # Create subreddits
        created_count = 0
        for subreddit_data in subreddits:
            subreddit, created = Subreddit.objects.get_or_create(
                name=subreddit_data['name'],
                defaults={'is_active': subreddit_data['is_active']}
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'Created subreddit: r/{subreddit.name}')
                )
            else:
                subreddit.is_active = subreddit_data['is_active']
                subreddit.save()
                self.stdout.write(
                    self.style.SUCCESS(f'Updated subreddit: r/{subreddit.name}')
                )
        
        self.stdout.write(
            self.style.SUCCESS(f'Successfully set up {created_count} focused subreddits')
        )
        
        # Show summary
        active_subreddits = Subreddit.objects.filter(is_active=True)
        self.stdout.write(
            self.style.WARNING(f'\nActive subreddits: {active_subreddits.count()}')
        )
        
        # Show subreddit categories
        tech_subreddits = active_subreddits.filter(name__in=['webdev', 'programming', 'django', 'reactjs', 'nextjs']).count()
        ai_subreddits = active_subreddits.filter(name__in=['MachineLearning', 'artificial', 'datascience']).count()
        freelance_subreddits = active_subreddits.filter(name__in=['forhire', 'freelance', 'startups', 'entrepreneur']).count()
        
        self.stdout.write(
            self.style.SUCCESS(f'Tech/Development subreddits: {tech_subreddits}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'AI/ML subreddits: {ai_subreddits}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'Freelance/Business subreddits: {freelance_subreddits}')
        ) 