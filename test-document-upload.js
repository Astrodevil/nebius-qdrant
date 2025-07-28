const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

// Test script for document upload functionality
async function testDocumentUpload() {
  const baseUrl = 'http://localhost:3001';
  
  console.log('🧪 Testing Document Upload Functionality\n');

  try {
    // Test 1: Upload files
    console.log('📁 Test 1: File Upload');
    const formData = new FormData();
    
    // Create a test text file
    const testContent = `This is a test document for the RAG system.
    
    It contains information about:
    - AI and machine learning
    - Content generation
    - Vector databases
    - Natural language processing
    
    This document will be used to test the document processing and embedding generation capabilities of the system.`;
    
    const testFilePath = path.join(__dirname, 'test-document.txt');
    fs.writeFileSync(testFilePath, testContent);
    
    formData.append('files', fs.createReadStream(testFilePath));
    
    const fileResponse = await axios.post(`${baseUrl}/api/data/files`, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      timeout: 30000
    });
    
    console.log('✅ File upload successful:', fileResponse.data.data.message);
    console.log(`   Processed: ${fileResponse.data.data.successfulCount} files`);
    console.log(`   Total chunks: ${fileResponse.data.data.totalChunks}`);
    
    // Clean up test file
    fs.unlinkSync(testFilePath);
    
    // Test 2: Upload links
    console.log('\n🔗 Test 2: Link Processing');
    const testUrls = [
      'https://en.wikipedia.org/wiki/Artificial_intelligence',
      'https://en.wikipedia.org/wiki/Machine_learning'
    ];
    
    const linkResponse = await axios.post(`${baseUrl}/api/data/links`, {
      urls: testUrls
    }, {
      timeout: 30000
    });
    
    console.log('✅ Link processing successful:', linkResponse.data.data.message);
    console.log(`   Processed: ${linkResponse.data.data.successfulCount} links`);
    console.log(`   Failed: ${linkResponse.data.data.failedCount} links`);
    console.log(`   Total chunks: ${linkResponse.data.data.totalChunks}`);
    
    // Test 3: Get documents
    console.log('\n📚 Test 3: Get Documents');
    const documentsResponse = await axios.get(`${baseUrl}/api/data/documents`);
    
    console.log('✅ Documents retrieved successfully');
    console.log(`   Total documents: ${documentsResponse.data.data.length}`);
    
    documentsResponse.data.data.forEach((doc, index) => {
      console.log(`   ${index + 1}. ${doc.title || doc.fileName || doc.url} (${doc.wordCount} words)`);
    });
    
    // Test 4: Get data stats
    console.log('\n📊 Test 4: Data Statistics');
    const statsResponse = await axios.get(`${baseUrl}/api/data/stats`);
    
    console.log('✅ Stats retrieved successfully');
    console.log(`   Has documents: ${statsResponse.data.data.hasDocuments}`);
    console.log(`   Document count: ${statsResponse.data.data.documentCount}`);
    console.log(`   Vector count: ${statsResponse.data.data.vectorCount}`);
    console.log(`   Qdrant status: ${statsResponse.data.data.qdrantStatus}`);
    
    // Test 5: RAG Query with documents
    console.log('\n🤖 Test 5: RAG Query with Documents');
    const ragResponse = await axios.post(`${baseUrl}/api/content/rag`, {
      query: "What is artificial intelligence and how does it relate to machine learning?",
      companyData: {}
    }, {
      timeout: 30000
    });
    
    console.log('✅ RAG query successful');
    console.log(`   Response length: ${ragResponse.data.data.response.length} characters`);
    console.log(`   Context sources: ${ragResponse.data.data.context.length}`);
    
    // Show context sources
    ragResponse.data.data.context.forEach((ctx, index) => {
      console.log(`   Context ${index + 1}: [${ctx.type}] Score: ${ctx.score.toFixed(3)}`);
      console.log(`     ${ctx.text.substring(0, 100)}...`);
    });
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('\n💡 Next steps:');
    console.log('   1. Check the web interface at http://localhost:3000/document-upload');
    console.log('   2. Upload your own files and links');
    console.log('   3. Test RAG queries in the Content Generator');
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data?.error || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend is running:');
      console.log('   cd backend && npm start');
    }
  }
}

// Run the test
testDocumentUpload().catch(console.error); 