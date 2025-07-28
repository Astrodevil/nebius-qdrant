# Nebius-Qdrant Content Generation Platform

A simplified content generation platform that creates social media posts and articles using Nebius AI and Qdrant vector database.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker and Docker Compose
- Nebius API key
- OpenAI API key (for embeddings)

### Setup

1. **Clone and setup environment:**
```bash
git clone <repository-url>
cd nebius-qdrant
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env
```

2. **Configure environment variables:**
```bash
# Backend (.env)
NEBIUS_API_KEY=your_nebius_api_key
EMBEDDING_SERVICE_API_KEY=your_openai_api_key
QDRANT_URL=http://localhost:6333

# Frontend (.env)
REACT_APP_API_URL=http://localhost:5000
```

3. **Start the application:**
```bash
# Start all services
docker-compose up -d

# Or start manually
cd backend && npm install && npm start
cd frontend && npm install && npm start
```

## 🎯 Simplified Workflow

The application now works with a simplified workflow:

### 1. Content Generation
- **Social Media Posts**: Generate engaging posts for various platforms
- **Articles**: Create blog posts and articles
- **Demos**: Generate demo content and tutorials

### 2. Document Upload
- Upload text files (.txt, .md) and URLs
- Documents are automatically chunked and embedded
- Content is stored in Qdrant for RAG (Retrieval-Augmented Generation)

### 3. RAG Content Generation
- Ask questions about uploaded documents
- Get AI-generated responses based on document content
- Perfect for creating content that references your uploaded materials

## 🔧 Recent Fixes

### Fixed Point ID Issue
- **Problem**: URLs were being used as Qdrant point IDs, causing "Bad Request" errors
- **Solution**: Now using UUID-based IDs for all Qdrant points
- **Impact**: Document uploads and embeddings now work correctly

### Simplified Company Data
- **Problem**: Complex validation was blocking basic usage
- **Solution**: Default company data is provided, with optional custom data
- **Impact**: App works immediately without complex setup

### Streamlined API
- **Problem**: Overly complex API endpoints
- **Solution**: Simplified endpoints with sensible defaults
- **Impact**: Easier to use and more reliable

## 📁 Project Structure

```
nebius-qdrant/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   ├── services/        # Business logic
│   │   └── utils/          # Utilities
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── services/      # API client
└── docker-compose.yml     # Docker configuration
```

## 🛠️ API Endpoints

### Content Generation
- `POST /api/content/suggest` - Generate content suggestions
- `POST /api/content/rag` - Generate RAG responses
- `GET /api/content/stats` - Get content statistics

### Data Management
- `POST /api/data/company` - Upload company data
- `POST /api/data/files` - Upload documents
- `POST /api/data/links` - Upload URLs
- `GET /api/data/documents` - Get uploaded documents
- `GET /api/data/stats` - Get data statistics

## 🎨 Features

- **AI-Powered Content**: Uses Nebius AI for high-quality content generation
- **Vector Search**: Qdrant integration for semantic search
- **Document Processing**: Automatic chunking and embedding
- **Modern UI**: Clean, responsive React interface
- **Real-time Feedback**: Live content generation and editing

## 🐛 Troubleshooting

### Common Issues

1. **"No company data" error**
   - The app now includes default company data
   - You can still upload custom company data if needed

2. **Document upload failures**
   - Point ID issue has been fixed with UUID-based IDs
   - Check that your embedding API key is configured

3. **Qdrant connection issues**
   - Ensure Qdrant is running: `docker-compose up qdrant`
   - Check the QDRANT_URL in your environment variables

## 📝 License

MIT License - see LICENSE file for details.
