const axios = require('axios');

class QdrantService {
  constructor() {
    this.baseUrl = process.env.QDRANT_URL || 'http://localhost:6333';
    this.collectionName = process.env.QDRANT_COLLECTION_NAME || 'company_data';
    this.vectorSize = 1536; // OpenAI embedding size
  }

  async init() {
    try {
      // Check if collection exists, create if not
      const collectionExists = await this.collectionExists();
      if (!collectionExists) {
        await this.createCollection();
      }
      console.log('✅ Qdrant service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Qdrant service:', error);
      throw error;
    }
  }

  async collectionExists() {
    try {
      const response = await axios.get(`${this.baseUrl}/collections/${this.collectionName}`);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async createCollection() {
    const collectionConfig = {
      vectors: {
        size: this.vectorSize,
        distance: 'Cosine'
      },
      optimizers_config: {
        default_segment_number: 2
      },
      replication_factor: 1
    };

    try {
      await axios.put(`${this.baseUrl}/collections/${this.collectionName}`, collectionConfig);
      console.log(`✅ Collection '${this.collectionName}' created successfully`);
    } catch (error) {
      console.error('❌ Failed to create collection:', error.response?.data || error.message);
      throw error;
    }
  }

  async addPoints(points) {
    try {
      const payload = {
        points: points.map(point => ({
          id: point.id,
          vector: point.vector,
          payload: point.payload
        }))
      };

      const response = await axios.put(
        `${this.baseUrl}/collections/${this.collectionName}/points?wait=true`,
        payload
      );

      console.log(`✅ Added ${points.length} points to collection`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to add points:', error.response?.data || error.message);
      throw error;
    }
  }

  async searchSimilar(vector, limit = 5, scoreThreshold = 0.7) {
    try {
      const searchPayload = {
        vector: vector,
        limit: limit,
        score_threshold: scoreThreshold,
        with_payload: true
      };

      const response = await axios.post(
        `${this.baseUrl}/collections/${this.collectionName}/points/search`,
        searchPayload
      );

      return response.data.result;
    } catch (error) {
      console.error('❌ Failed to search similar vectors:', error.response?.data || error.message);
      throw error;
    }
  }

  async deletePoint(pointId) {
    try {
      await axios.delete(
        `${this.baseUrl}/collections/${this.collectionName}/points?wait=true`,
        {
          data: { points: [pointId] }
        }
      );
      console.log(`✅ Deleted point ${pointId}`);
    } catch (error) {
      console.error('❌ Failed to delete point:', error.response?.data || error.message);
      throw error;
    }
  }

  async getCollectionInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/collections/${this.collectionName}`);
      return response.data;
    } catch (error) {
      console.error('❌ Failed to get collection info:', error.response?.data || error.message);
      throw error;
    }
  }

  async clearCollection() {
    try {
      await axios.delete(`${this.baseUrl}/collections/${this.collectionName}/points?wait=true`);
      console.log(`✅ Cleared collection '${this.collectionName}'`);
    } catch (error) {
      console.error('❌ Failed to clear collection:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new QdrantService(); 