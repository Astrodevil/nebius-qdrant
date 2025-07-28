const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// Upload company data
router.post('/upload', dataController.uploadCompanyData);

// Get company data
router.get('/company', dataController.getCompanyData);

// Update company data
router.put('/company', dataController.updateCompanyData);

// Delete company data
router.delete('/company', dataController.deleteCompanyData);

// Get data statistics
router.get('/stats', dataController.getDataStats);

module.exports = router; 