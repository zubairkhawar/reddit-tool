# RedditLead.AI 🤖

Your personal AI agent that hunts for work on Reddit while you sleep.

## 🚀 Overview

RedditLead.AI is an intelligent lead generation system that:
- Continuously monitors Reddit for freelance/project opportunities
- Uses LangGraph + GPT to classify and respond to real leads
- Automatically generates contextual, human-like replies
- Tracks all activity in a modern dashboard
- Provides real-time notifications for high-priority opportunities

## 🏗️ Architecture

### Frontend (Next.js + Vercel)
- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + Shadcn/UI
- **Charts**: Recharts
- **State Management**: SWR for API data
- **Deployment**: Vercel

### Backend (Django + Railway)
- **Framework**: Django + Django REST Framework
- **AI Agent**: LangGraph + OpenAI
- **Background Tasks**: Celery + Redis
- **Reddit Integration**: PRAW
- **Database**: PostgreSQL
- **Deployment**: Railway/Render

## 🧠 AI Agent Flow

```mermaid
graph TD
    A[New Reddit Post] --> B[Keyword Filter]
    B --> C[LangGraph: Is it a lead?]
    C -->|Yes| D[LangGraph: Extract intent]
    D --> E[LangGraph: Generate Reply]
    E --> F[Post to Reddit (PRAW)]
    F --> G[Log to DB]
```

## 🛠️ Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Redis
- OpenAI API Key
- Reddit API Credentials

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (.env)
```env
DEBUG=True
SECRET_KEY=your-secret-key
DATABASE_URL=postgresql://user:pass@localhost/redditlead
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your-openai-key
REDDIT_CLIENT_ID=your-reddit-client-id
REDDIT_CLIENT_SECRET=your-reddit-secret
REDDIT_USER_AGENT=RedditLead.AI/1.0
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## 📊 Features

### Core Features
- ✅ Real-time Reddit monitoring
- ✅ AI-powered lead classification
- ✅ Automated contextual replies
- ✅ Modern dashboard with analytics
- ✅ Keyword and subreddit management
- ✅ Performance tracking and reports

### Advanced Features
- 🧠 Smart warmup mode (manual approval)
- 💬 Engagement tracking
- 📩 Telegram/WhatsApp notifications
- 🔁 Retargeting agent
- 🎯 Custom AI persona tuning
- 📊 Daily/weekly reports

## 🗃️ Database Schema

### Core Tables
- `keywords`: Keyword management
- `subreddits`: Subreddit monitoring
- `reddit_posts`: Post data and metadata
- `classifications`: AI classification results
- `replies`: Reply tracking and engagement
- `notifications`: System notifications

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repository
2. Set environment variables
3. Deploy automatically

### Backend (Railway/Render)
1. Connect repository
2. Set environment variables
3. Configure PostgreSQL and Redis
4. Deploy with Celery workers

## 🔒 Security & Best Practices

- API key encryption and rotation
- Reddit OAuth with proxy support
- Rate limiting and delays
- Database backups
- Sanitized logging

## 📈 Monitoring & Analytics

- Real-time lead feed
- Performance metrics
- Engagement tracking
- Success rate analysis
- Cost monitoring

## 🤝 Contributing

This is a personal AI agent project. For questions or suggestions, please open an issue.

## 📄 License

MIT License - see LICENSE file for details.

---

**Built with ❤️ using Next.js, Django, LangGraph, and OpenAI** 