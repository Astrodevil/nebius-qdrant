const qdrantService = require('../services/qdrantService');
const embeddingService = require('../services/embeddingService');

// In-memory storage for demo purposes (replace with database in production)
let companyData = null;

class DataController {
  async uploadCompanyData(req, res) {
    try {
      const { companyData: newCompanyData } = req.body;

      if (!newCompanyData) {
        return res.status(400).json({
          error: 'Company data is required'
        });
      }

      // Validate company data structure
      const validationResult = validateCompanyData(newCompanyData);
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Invalid company data structure',
          details: validationResult.errors
        });
      }

      // Process company data and generate embeddings
      const points = await embeddingService.processCompanyData(newCompanyData);

      // Store in Qdrant
      await qdrantService.addPoints(points);

      // Store in memory
      companyData = {
        ...newCompanyData,
        id: Date.now().toString(),
        uploadedAt: new Date().toISOString(),
        vectorCount: points.length
      };

      res.json({
        success: true,
        data: {
          message: 'Company data uploaded successfully',
          vectorCount: points.length,
          companyData: companyData
        },
        metadata: {
          timestamp: companyData.uploadedAt,
          id: companyData.id
        }
      });
    } catch (error) {
      console.error('❌ Error uploading company data:', error);
      res.status(500).json({
        error: 'Failed to upload company data',
        details: error.message
      });
    }
  }

  async getCompanyData(req, res) {
    try {
      if (!companyData) {
        return res.status(404).json({
          error: 'No company data found'
        });
      }

      res.json({
        success: true,
        data: companyData
      });
    } catch (error) {
      console.error('❌ Error getting company data:', error);
      res.status(500).json({
        error: 'Failed to get company data',
        details: error.message
      });
    }
  }

  async updateCompanyData(req, res) {
    try {
      const { companyData: updatedData } = req.body;

      if (!updatedData) {
        return res.status(400).json({
          error: 'Updated company data is required'
        });
      }

      if (!companyData) {
        return res.status(404).json({
          error: 'No existing company data to update'
        });
      }

      // Validate updated data
      const validationResult = validateCompanyData(updatedData);
      if (!validationResult.valid) {
        return res.status(400).json({
          error: 'Invalid company data structure',
          details: validationResult.errors
        });
      }

      // Clear existing vectors from Qdrant
      await qdrantService.clearCollection();

      // Process updated data and generate new embeddings
      const points = await embeddingService.processCompanyData(updatedData);

      // Store new vectors in Qdrant
      await qdrantService.addPoints(points);

      // Update in memory
      companyData = {
        ...updatedData,
        id: companyData.id,
        uploadedAt: companyData.uploadedAt,
        updatedAt: new Date().toISOString(),
        vectorCount: points.length
      };

      res.json({
        success: true,
        data: {
          message: 'Company data updated successfully',
          vectorCount: points.length,
          companyData: companyData
        },
        metadata: {
          timestamp: companyData.updatedAt,
          id: companyData.id
        }
      });
    } catch (error) {
      console.error('❌ Error updating company data:', error);
      res.status(500).json({
        error: 'Failed to update company data',
        details: error.message
      });
    }
  }

  async deleteCompanyData(req, res) {
    try {
      if (!companyData) {
        return res.status(404).json({
          error: 'No company data to delete'
        });
      }

      // Clear vectors from Qdrant
      await qdrantService.clearCollection();

      // Clear from memory
      const deletedData = companyData;
      companyData = null;

      res.json({
        success: true,
        data: {
          message: 'Company data deleted successfully',
          deletedData: deletedData
        }
      });
    } catch (error) {
      console.error('❌ Error deleting company data:', error);
      res.status(500).json({
        error: 'Failed to delete company data',
        details: error.message
      });
    }
  }

  async getDataStats(req, res) {
    try {
      let collectionInfo = null;
      try {
        collectionInfo = await qdrantService.getCollectionInfo();
      } catch (qdrantError) {
        console.warn('⚠️ Qdrant not available:', qdrantError.message);
      }
      
      const stats = {
        hasCompanyData: !!companyData,
        vectorCount: collectionInfo?.points_count || 0,
        collectionSize: collectionInfo?.vectors_count || 0,
        lastUpload: companyData?.uploadedAt,
        lastUpdate: companyData?.updatedAt,
        qdrantStatus: collectionInfo ? 'connected' : 'disconnected'
      };

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('❌ Error getting data stats:', error);
      res.status(500).json({
        error: 'Failed to get data stats',
        details: error.message
      });
    }
  }

}

// Helper function for data validation
function validateCompanyData(data) {
  const errors = [];
  const requiredFields = ['description', 'goals', 'targets'];

  // Check required fields
  requiredFields.forEach(field => {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  // Validate goals array
  if (data.goals && !Array.isArray(data.goals)) {
    errors.push('Goals must be an array');
  }

  // Validate targets array
  if (data.targets && !Array.isArray(data.targets)) {
    errors.push('Targets must be an array');
  }

  // Validate products array
  if (data.products && !Array.isArray(data.products)) {
    errors.push('Products must be an array');
  }

  // Validate values array
  if (data.values && !Array.isArray(data.values)) {
    errors.push('Values must be an array');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = new DataController(); 