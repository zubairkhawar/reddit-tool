from django.core.management.base import BaseCommand
from reddit.models import SystemConfig

class Command(BaseCommand):
    help = 'Set up initial system configuration'

    def handle(self, *args, **options):
        self.stdout.write('Setting up system configuration...')
        
        # AI Confidence Threshold (0.0 to 1.0)
        SystemConfig.set_value(
            'ai_confidence_threshold',
            '0.7',
            'Minimum confidence score for auto-posting replies (0.0-1.0)'
        )
        
        # Manual Approval Required
        SystemConfig.set_value(
            'manual_approval_required',
            'true',
            'Whether manual approval is required for all replies'
        )
        
        # Follow-up Delay (hours)
        SystemConfig.set_value(
            'follow_up_delay_hours',
            '24',
            'Hours to wait before sending follow-up replies'
        )
        
        # Old Lead Monitoring (days)
        SystemConfig.set_value(
            'old_lead_monitoring_days',
            '7',
            'Days to monitor old posts for new activity'
        )
        
        # WhatsApp Bot Enabled
        SystemConfig.set_value(
            'whatsapp_bot_enabled',
            'false',
            'Whether WhatsApp bot notifications are enabled'
        )
        
        # Telegram Bot Enabled
        SystemConfig.set_value(
            'telegram_bot_enabled',
            'true',
            'Whether Telegram bot notifications are enabled'
        )
        
        self.stdout.write(
            self.style.SUCCESS('System configuration set up successfully!')
        ) 