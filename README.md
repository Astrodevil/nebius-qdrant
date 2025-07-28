# Nebius-Qdrant Content Suggestion Platform

A fullstack application that leverages Qdrant vector database and Nebius text-text model to suggest articles, demo ideas, and social media posts based on company data, targets, and goals.

## Features

- **RAG Pipeline**: Uses Qdrant vector database for efficient similarity search
- **AI-Powered Suggestions**: Leverages Nebius text-text model for content generation
- **Multi-Content Types**: Suggests articles, demo ideas, and social media posts
- **Modern UI**: React-based frontend with beautiful, responsive design
- **Express Backend**: High-performance Node.js API with async operations

## Tech Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React, JavaScript, Tailwind CSS
- **Database**: Qdrant Vector Database
- **AI**: Nebius Text-Text Model API
- **Vectorization**: Sentence Transformers (via Python microservice or direct API)

## Quick Start

1. **Clone and Setup**:
   ```bash
   git clone <repository-url>
   cd nebius-qdrant
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   ```

4. **Environment Configuration**:
   - Copy `.env.example` to `.env` in both backend and frontend
   - Add your Nebius API credentials
   - Configure Qdrant connection settings

5. **Run the Application**:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev
   
   # Terminal 2 - Frontend
   cd frontend
   npm start
   ```

## Project Structure

```
nebius-qdrant/
├── backend/                 # Express.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   ├── controllers/     # Route controllers
│   │   ├── services/        # Business logic
│   │   ├── models/          # Data models
│   │   ├── middleware/      # Custom middleware
│   │   └── app.js           # Express application
│   ├── package.json
│   └── .env.example
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── .env.example
└── README.md
```

## API Endpoints

- `POST /api/content/suggest` - Generate content suggestions
- `POST /api/data/upload` - Upload company data
- `GET /api/content/history` - Get suggestion history
- `POST /api/feedback` - Submit feedback on suggestions

## License

MIT License