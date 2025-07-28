const qdrantService = require('../services/qdrantService');
const embeddingService = require('../services/embeddingService');
const documentService = require('../services/documentService');
const path = require('path');
const fs = require('fs');

// In-memory storage for demo purposes (replace with database in production)
let companyData = null;
let documents = [];

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
      let points = [];
      try {
        points = await embeddingService.processCompanyData(newCompanyData);
        // Store in Qdrant
        await qdrantService.addPoints(points);
      } catch (embeddingError) {
        console.error('❌ Embedding processing failed:', embeddingError);
        // Continue without embeddings for now
      }

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
      let points = [];
      try {
        points = await embeddingService.processCompanyData(updatedData);
        // Store new vectors in Qdrant
        await qdrantService.addPoints(points);
      } catch (embeddingError) {
        console.error('❌ Embedding processing failed:', embeddingError);
        // Continue without embeddings for now
      }

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

  async uploadFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          error: 'No files uploaded'
        });
      }

      const uploadedFiles = [];
      const uploadDir = path.join(__dirname, '../uploads');

      // Ensure upload directory exists
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      for (const file of req.files) {
        try {
          // Validate file type
          if (!documentService.validateFileType(file.originalname)) {
            throw new Error(`Unsupported file type: ${path.extname(file.originalname)}`);
          }

          // Save file temporarily
          const filePath = path.join(uploadDir, file.filename);
          fs.writeFileSync(filePath, file.buffer);

          // Process file
          const processedFile = await documentService.processFile(filePath, file.originalname);
          
          // Clean up temporary file
          fs.unlinkSync(filePath);

          uploadedFiles.push(processedFile);
        } catch (error) {
          console.error(`❌ Failed to process file ${file.originalname}:`, error);
          uploadedFiles.push({
            fileName: file.originalname,
            error: error.message
          });
        }
      }

      // Process documents and generate embeddings
      const successfulFiles = uploadedFiles.filter(f => !f.error);
      if (successfulFiles.length > 0) {
        try {
          const chunks = await documentService.processDocuments(successfulFiles);
          const points = await embeddingService.processDocumentChunks(chunks);
          
          // Store in Qdrant
          await qdrantService.addPoints(points);
        } catch (embeddingError) {
          console.error('❌ Embedding processing failed:', embeddingError);
          // Continue without embeddings for now
        }

        // Store in memory
        documents.push(...successfulFiles);
      }

      res.json({
        success: true,
        data: {
          message: 'Files uploaded and processed successfully',
          uploadedFiles,
          successfulCount: successfulFiles.length,
          failedCount: uploadedFiles.length - successfulFiles.length,
          totalChunks: successfulFiles.length > 0 ? await documentService.processDocuments(successfulFiles).then(chunks => chunks.length) : 0
        }
      });
    } catch (error) {
      console.error('❌ Error uploading files:', error);
      res.status(500).json({
        error: 'Failed to upload files',
        details: error.message
      });
    }
  }

  async uploadLinks(req, res) {
    try {
      const { urls } = req.body;

      if (!urls || !Array.isArray(urls) || urls.length === 0) {
        return res.status(400).json({
          error: 'URLs array is required'
        });
      }

      const processedUrls = [];
      const failedUrls = [];

      for (const url of urls) {
        try {
          // Validate URL
          if (!documentService.validateUrl(url)) {
            throw new Error('Invalid URL format');
          }

          // Extract content from URL
          const extractedContent = await documentService.extractUrlContent(url);
          processedUrls.push(extractedContent);
        } catch (error) {
          console.error(`❌ Failed to process URL ${url}:`, error);
          failedUrls.push({ url, error: error.message });
        }
      }

      // Process documents and generate embeddings
      if (processedUrls.length > 0) {
        try {
          const chunks = await documentService.processDocuments(processedUrls);
          const points = await embeddingService.processDocumentChunks(chunks);
          
          // Store in Qdrant
          await qdrantService.addPoints(points);
        } catch (embeddingError) {
          console.error('❌ Embedding processing failed:', embeddingError);
          // Continue without embeddings for now
        }

        // Store in memory
        documents.push(...processedUrls);
      }

      res.json({
        success: true,
        data: {
          message: 'Links processed successfully',
          processedUrls,
          failedUrls,
          successfulCount: processedUrls.length,
          failedCount: failedUrls.length,
          totalChunks: processedUrls.length > 0 ? await documentService.processDocuments(processedUrls).then(chunks => chunks.length) : 0
        }
      });
    } catch (error) {
      console.error('❌ Error processing links:', error);
      res.status(500).json({
        error: 'Failed to process links',
        details: error.message
      });
    }
  }

  async getDocuments(req, res) {
    try {
      res.json({
        success: true,
        data: documents
      });
    } catch (error) {
      console.error('❌ Error getting documents:', error);
      res.status(500).json({
        error: 'Failed to get documents',
        details: error.message
      });
    }
  }

  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          error: 'Document ID is required'
        });
      }

      // Remove from memory
      const documentIndex = documents.findIndex(doc => doc.id === id || doc.fileName === id || doc.url === id);
      if (documentIndex === -1) {
        return res.status(404).json({
          error: 'Document not found'
        });
      }

      const deletedDocument = documents.splice(documentIndex, 1)[0];

      // TODO: Remove vectors from Qdrant (this would require tracking vector IDs)

      res.json({
        success: true,
        data: {
          message: 'Document deleted successfully',
          deletedDocument
        }
      });
    } catch (error) {
      console.error('❌ Error deleting document:', error);
      res.status(500).json({
        error: 'Failed to delete document',
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
        hasDocuments: documents.length > 0,
        documentCount: documents.length,
        vectorCount: collectionInfo?.points_count || 0,
        collectionSize: collectionInfo?.vectors_count || 0,
        lastUpload: companyData?.uploadedAt,
        lastUpdate: companyData?.updatedAt,
        lastDocumentUpload: documents.length > 0 ? documents[documents.length - 1].timestamp : null,
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