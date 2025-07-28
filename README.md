# Nebius-Qdrant Content Generation Platform

A modern content generation platform that creates social media posts, articles, and demo applications using Nebius AI and Qdrant vector database. The platform supports RAG (Retrieval-Augmented Generation) for context-aware content creation.

## Quick Start

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
PORT=3001
NODE_ENV=development
QDRANT_URL=http://localhost:6333
NEBIUS_API_KEY=your_nebius_api_key_here
EMBEDDING_SERVICE_API_KEY=your_openai_api_key_here
CORS_ORIGIN=http://localhost:3000

# Frontend (.env)
REACT_APP_API_BASE_URL=http://localhost:3001
REACT_APP_API_TIMEOUT=30000
```

3. **Start the application:**
```bash
# Start all services with Docker
docker-compose up -d

# Or start manually for development
cd backend && npm install && npm start
cd frontend && npm install && npm start
```

## Current Workflows

The platform supports three main workflows for content generation:

### 1. Content Generation Workflow
**Purpose**: Generate AI-powered content suggestions for various content types.

**Content Types**:
- **Social Media Posts**: Generate engaging posts for LinkedIn, Twitter, Instagram, etc.
- **Articles**: Create blog posts and articles with structured content
- **Demo Applications**: Generate demo ideas and application concepts

**Process**:
1. Select content type (social media, article, or demo)
2. Add optional goals or requirements
3. AI generates multiple suggestions with:
   - Titles and descriptions
   - Key points or features
   - Target audience
   - Platform recommendations
   - Engagement strategies

**Features**:
- Uses Nebius AI (Llama-3.3-70B-Instruct model)
- Incorporates uploaded document context
- Provides formatted, ready-to-use content
- Stores generation history

### 2. Document Upload & Processing Workflow
**Purpose**: Upload and process documents for RAG-enabled content generation.

**Supported Formats**:
- Text files (.txt, .md)
- URLs (web pages)
- JSON files
- CSV files

**Process**:
1. Upload documents through the web interface
2. Automatic content extraction and processing
3. Document chunking (1000 words with 200-word overlap)
4. Vector embedding generation using OpenAI
5. Storage in Qdrant vector database
6. Semantic search capabilities

**Features**:
- Automatic content extraction from URLs
- Intelligent document chunking
- Vector embedding for semantic search
- UUID-based point IDs for reliability

### 3. RAG (Retrieval-Augmented Generation) Workflow
**Purpose**: Generate context-aware responses based on uploaded documents.

**Process**:
1. Ask questions about uploaded documents
2. System searches for relevant document chunks
3. AI generates responses using document context
4. Provides source references and confidence scores

**Features**:
- Semantic search with similarity scoring
- Context-aware AI responses
- Source attribution
- Real-time query processing

## Local Development

### Development Setup

1. **Clone the repository:**
```bash
git clone <repository-url>
cd nebius-qdrant
```

2. **Install dependencies:**
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. **Configure environment:**
```bash
# Copy environment files
cp backend/env.example backend/.env
cp frontend/env.example frontend/.env

# Edit backend/.env with your API keys
NEBIUS_API_KEY=your_nebius_api_key
EMBEDDING_SERVICE_API_KEY=your_openai_api_key
```

4. **Start Qdrant database:**
```bash
# Using Docker
docker run -d -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest

# Or using docker-compose for just Qdrant
docker-compose up qdrant -d
```

5. **Start development servers:**
```bash
# Terminal 1: Backend
cd backend
npm start

# Terminal 2: Frontend
cd frontend
npm start
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Qdrant**: http://localhost:6333

### Development Features
- Hot reloading for both frontend and backend
- Real-time API testing
- Vector database management
- Content generation history
- Document processing logs

## Project Structure

```
nebius-qdrant/
├── backend/                 # Node.js API server
│   ├── src/
│   │   ├── controllers/     # API endpoints
│   │   │   ├── contentController.js    # Content generation logic
│   │   │   ├── dataController.js       # Document upload & management
│   │   │   └── feedbackController.js   # User feedback handling
│   │   ├── services/        # Business logic
│   │   │   ├── nebiusService.js        # Nebius AI integration
│   │   │   ├── qdrantService.js        # Vector database operations
│   │   │   ├── embeddingService.js     # OpenAI embeddings
│   │   │   └── documentService.js      # Document processing
│   │   └── utils/          # Utilities
│   │       └── formatter.js            # Response formatting
│   ├── examples/           # Usage examples
│   │   └── rag-usage-example.js        # RAG workflow demo
│   └── uploads/            # Temporary file storage
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # React components
│   │   │   ├── DocumentUpload.js       # File upload interface
│   │   │   ├── Header.js               # Navigation header
│   │   │   └── Sidebar.js              # Side navigation
│   │   ├── pages/         # Page components
│   │   │   ├── Dashboard.js            # Main dashboard
│   │   │   ├── ContentGenerator.js     # Content generation UI
│   │   │   ├── DataUpload.js           # Document management
│   │   │   ├── Analytics.js            # Usage analytics
│   │   │   └── History.js              # Generation history
│   │   └── services/      # API client
│   │       └── api.js                  # API integration
│   └── public/            # Static assets
└── docker-compose.yml     # Docker configuration
```

## API Endpoints

### Content Generation
- `POST /api/content/suggest` - Generate content suggestions
- `POST /api/content/rag` - Generate RAG responses
- `GET /api/content/stats` - Get content statistics
- `GET /api/content/history` - Get generation history

### Data Management
- `POST /api/data/company` - Upload company data
- `POST /api/data/files` - Upload documents
- `POST /api/data/links` - Upload URLs
- `GET /api/data/documents` - Get uploaded documents
- `GET /api/data/stats` - Get data statistics

### Feedback
- `POST /api/feedback` - Submit user feedback

## Features

- **AI-Powered Content**: Uses Nebius AI (Llama-3.3-70B-Instruct) for high-quality content generation
- **Vector Search**: Qdrant integration for semantic search and similarity matching
- **Document Processing**: Automatic chunking, embedding, and storage
- **RAG Capabilities**: Context-aware content generation using uploaded documents
- **Modern UI**: Clean, responsive React interface with Tailwind CSS
- **Real-time Processing**: Live content generation and document processing
- **Multi-format Support**: Text files, URLs, JSON, and CSV processing
- **History Tracking**: Complete generation history and analytics

