# Qdrant RAG Implementation Guide

This guide explains how to use Qdrant for Retrieval-Augmented Generation (RAG) in the Nebius-Qdrant demo.

## Overview

The demo implements a complete RAG pipeline using:
- **Qdrant**: Vector database for similarity search
- **OpenAI Embeddings**: Text-to-vector conversion
- **Nebius**: LLM for response generation
- **React Frontend**: User interface

## Architecture

```
User Query → Embedding → Qdrant Search → Context Retrieval → Nebius Generation → Response
```

## Setup Instructions

### 1. Environment Configuration

Create a `.env` file in the `backend/` directory:

```bash
# Server Configuration
PORT=3001
NODE_ENV=development

# Qdrant Configuration
QDRANT_URL=http://localhost:6333
QDRANT_COLLECTION_NAME=company_data

# Nebius API Configuration
NEBIUS_API_URL=https://api.studio.nebius.com/v1
NEBIUS_API_KEY=your_nebius_api_key_here
NEBIUS_FOLDER_ID=your_folder_id_here

# Vector Embedding Service (OpenAI for embeddings)
EMBEDDING_SERVICE_URL=https://api.openai.com/v1/embeddings
EMBEDDING_SERVICE_API_KEY=your_openai_api_key_here

# Security
JWT_SECRET=your_jwt_secret_here
CORS_ORIGIN=http://localhost:3000

# RAG Configuration
RAG_SEARCH_LIMIT=5
RAG_SCORE_THRESHOLD=0.7
VECTOR_SIZE=1536
```

### 2. Start the Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually:
# 1. Start Qdrant
docker run -p 6333:6333 -p 6334:6334 qdrant/qdrant:latest

# 2. Start Backend
cd backend
npm install
npm start

# 3. Start Frontend
cd frontend
npm install
npm start
```

## How to Use the RAG Implementation

### Step 1: Upload Company Data

First, upload your company data through the Data Upload page or API:

```javascript
// Example API call
const companyData = {
  description: "We are a tech company specializing in AI solutions...",
  goals: [
    "Increase market share by 20%",
    "Launch new AI product line",
    "Expand to European markets"
  ],
  targets: [
    "Enterprise customers",
    "Tech startups",
    "Healthcare organizations"
  ],
  products: [
    "AI-powered analytics platform",
    "Machine learning consulting services"
  ],
  industry: "Artificial Intelligence",
  values: [
    "Innovation",
    "Customer success",
    "Data-driven decisions"
  ]
};

// POST to /api/data/upload
fetch('/api/data/upload', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ companyData })
});
```

### Step 2: Use RAG Query

Navigate to the Content Generator page and use the "RAG Query" tab:

1. Enter your question in the query field
2. Click "Generate RAG Response"
3. The system will:
   - Convert your query to embeddings
   - Search Qdrant for similar content
   - Retrieve relevant context
   - Generate a response using Nebius

### Step 3: API Usage

You can also use the RAG API directly:

```javascript
// RAG Query API
const response = await fetch('/api/content/rag', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: "What are our main business goals?",
    companyData: {} // Optional, uses stored data if empty
  })
});

const result = await response.json();
console.log(result.data.response); // Generated response
console.log(result.data.context); // Retrieved context
```

## RAG Pipeline Details

### 1. Data Processing (`embeddingService.js`)

```javascript
// Company data is processed into chunks
const points = await embeddingService.processCompanyData(companyData);

// Each chunk becomes a vector point:
{
  id: "timestamp_index",
  vector: [0.1, 0.2, ...], // 1536-dimensional embedding
  payload: {
    text: "Original text chunk",
    type: "description|goal|target|product|industry|value",
    source: "company_data",
    timestamp: "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Vector Storage (`qdrantService.js`)

```javascript
// Points are stored in Qdrant collection
await qdrantService.addPoints(points);

// Collection configuration:
{
  vectors: {
    size: 1536,        // OpenAI embedding size
    distance: 'Cosine' // Similarity metric
  }
}
```

### 3. Similarity Search

```javascript
// Query is converted to embedding
const queryEmbedding = await embeddingService.processQuery(query);

// Qdrant finds similar vectors
const similarResults = await qdrantService.searchSimilar(
  queryEmbedding, 
  5,    // limit
  0.7   // score threshold
);
```

### 4. Context Retrieval

```javascript
// Extract context from search results
const contextData = similarResults.map(result => ({
  text: result.payload.text,
  type: result.payload.type,
  score: result.score
}));
```

### 5. Response Generation

```javascript
// Nebius generates response using context
const ragResponse = await nebiusService.generateRAGResponse(query, contextData);
```

## Configuration Options

### Qdrant Settings

```javascript
// In qdrantService.js
this.vectorSize = 1536;           // Embedding dimensions
this.collectionName = 'company_data'; // Collection name
this.baseUrl = 'http://localhost:6333'; // Qdrant URL
```

### Search Parameters

```javascript
// In contentController.js
const similarResults = await qdrantService.searchSimilar(
  queryEmbedding, 
  5,    // Number of results to retrieve
  0.7   // Minimum similarity score (0-1)
);
```

### Embedding Model

```javascript
// In embeddingService.js
this.model = 'text-embedding-ada-002'; // OpenAI embedding model
```

## Advanced Usage

### 1. Multiple Collections

You can create multiple collections for different data types:

```javascript
// Create separate collections
await qdrantService.createCollection('products');
await qdrantService.createCollection('documents');
await qdrantService.createCollection('knowledge_base');
```

### 2. Hybrid Search

Combine vector search with metadata filtering:

```javascript
// Search with filters
const searchPayload = {
  vector: queryEmbedding,
  limit: 5,
  score_threshold: 0.7,
  filter: {
    must: [
      { key: 'type', match: { value: 'product' } }
    ]
  },
  with_payload: true
};
```

### 3. Batch Operations

Process large datasets efficiently:

```javascript
// Batch embedding generation
const embeddings = await embeddingService.generateEmbeddings(texts);

// Batch point insertion
await qdrantService.addPoints(points);
```

## Monitoring and Debugging

### 1. Check Qdrant Status

```javascript
// Get collection info
const info = await qdrantService.getCollectionInfo();
console.log('Points count:', info.points_count);
console.log('Vectors count:', info.vectors_count);
```

### 2. View Search Results

The frontend displays:
- Retrieved context with similarity scores
- Source types and text snippets
- Generated response

### 3. API Endpoints

- `GET /api/data/stats` - View data statistics
- `GET /api/content/history` - View RAG query history
- `POST /api/content/rag` - Execute RAG query

## Best Practices

1. **Data Quality**: Ensure company data is well-structured and comprehensive
2. **Chunking**: Break large documents into meaningful chunks
3. **Metadata**: Include relevant metadata for better filtering
4. **Thresholds**: Adjust similarity thresholds based on your use case
5. **Monitoring**: Track query performance and result quality

## Troubleshooting

### Common Issues

1. **Qdrant Connection**: Ensure Qdrant is running on port 6333
2. **API Keys**: Verify Nebius and OpenAI API keys are valid
3. **Embeddings**: Check embedding service connectivity
4. **Memory**: Monitor Qdrant memory usage for large datasets

### Debug Commands

```bash
# Test Qdrant connection
curl http://localhost:6333/collections

# Test embedding service
curl -X POST http://localhost:3001/api/test/embeddings

# Test Nebius API
curl -X POST http://localhost:3001/api/test/nebius
```

This RAG implementation provides a robust foundation for building AI-powered applications with contextual knowledge retrieval. 