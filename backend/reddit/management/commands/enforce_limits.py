from django.core.management.base import BaseCommand
from reddit.models import Group, Keyword, Subreddit
from django.db.models import Count

class Command(BaseCommand):
    help = 'Enforce keyword and subreddit limits by deleting excess items'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be deleted without actually deleting',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        
        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN MODE - No changes will be made'))
        
        # Process each group
        groups = Group.objects.all()
        
        for group in groups:
            self.stdout.write(f"\nProcessing group: {group.name}")
            
            # Check keywords
            keywords = group.keywords.all()
            keyword_count = keywords.count()
            
            if keyword_count > 20:
                excess_keywords = keyword_count - 20
                self.stdout.write(f"  Keywords: {keyword_count}/20 (excess: {excess_keywords})")
                
                if not dry_run:
                    # Delete the oldest excess keywords
                    keywords_to_delete = keywords.order_by('created_at')[:excess_keywords]
                    keyword_ids = list(keywords_to_delete.values_list('id', flat=True))
                    deleted_count = len(keyword_ids)
                    Keyword.objects.filter(id__in=keyword_ids).delete()
                    self.stdout.write(f"    Deleted {deleted_count} excess keywords")
                else:
                    self.stdout.write(f"    Would delete {excess_keywords} excess keywords")
            else:
                self.stdout.write(f"  Keywords: {keyword_count}/20 (OK)")
            
            # Check subreddits
            subreddits = group.subreddits.all()
            subreddit_count = subreddits.count()
            
            if subreddit_count > 10:
                excess_subreddits = subreddit_count - 10
                self.stdout.write(f"  Subreddits: {subreddit_count}/10 (excess: {excess_subreddits})")
                
                if not dry_run:
                    # Delete the oldest excess subreddits
                    subreddits_to_delete = subreddits.order_by('created_at')[:excess_subreddits]
                    subreddit_ids = list(subreddits_to_delete.values_list('id', flat=True))
                    deleted_count = len(subreddit_ids)
                    Subreddit.objects.filter(id__in=subreddit_ids).delete()
                    self.stdout.write(f"    Deleted {deleted_count} excess subreddits")
                else:
                    self.stdout.write(f"    Would delete {excess_subreddits} excess subreddits")
            else:
                self.stdout.write(f"  Subreddits: {subreddit_count}/10 (OK)")
        
        if not dry_run:
            self.stdout.write(self.style.SUCCESS('\n✅ Limits enforced successfully!'))
        else:
            self.stdout.write(self.style.WARNING('\n📋 Dry run completed - no changes made')) 