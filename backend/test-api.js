const axios = require('axios');
require('dotenv').config();

async function testAPI() {
  const apiKey = process.env.NEBIUS_API_KEY;
  const folderId = process.env.NEBIUS_FOLDER_ID;
  
  if (!apiKey) {
    console.log('❌ NEBIUS_API_KEY not found');
    console.log('Please set it in your backend/.env file');
    return;
  }

  console.log('🧪 Testing Nebius API...');
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  if (folderId) {
    console.log(`📁 Folder ID: ${folderId}`);
  }

  // Test Studio API
  console.log('\n🔍 Testing Studio API...');
  try {
    const studioResponse = await axios.post(
      'https://api.studio.nebius.com/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.3-70B-Instruct',
        max_tokens: 50,
        temperature: 0.6,
        messages: [
          { role: 'user', content: 'Say hello briefly.' }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );
    
    console.log('✅ Studio API works!');
    console.log(`💬 Response: ${studioResponse.data.choices[0].message.content}`);
    return 'studio';
    
  } catch (error) {
    console.log(`❌ Studio API failed: ${error.response?.status || error.code}`);
    
    // Test Foundation API
    if (folderId) {
      console.log('\n🔄 Testing Foundation Models API...');
      try {
        const foundationResponse = await axios.post(
          'https://api.nebius.cloud/foundationModels/v1/completion',
          {
            modelUri: `gpt://${folderId}/yandexgpt-lite`,
            completionOptions: {
              maxTokens: 50,
              temperature: 0.7,
              stream: false
            },
            messages: [
              { role: 'user', text: 'Say hello briefly.' }
            ]
          },
          {
            headers: {
              'Authorization': `Api-Key ${apiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 10000
          }
        );
        
        console.log('✅ Foundation API works!');
        console.log(`💬 Response: ${foundationResponse.data.result.alternatives[0].message.text}`);
        return 'foundation';
        
      } catch (error2) {
        console.log(`❌ Foundation API failed: ${error2.response?.status || error2.code}`);
      }
    } else {
      console.log('⚠️ No folder ID provided, skipping foundation API test');
    }
  }
  
  console.log('\n❌ No working API found');
  return null;
}

testAPI().then((result) => {
  if (result === 'studio') {
    console.log('\n🎉 Use Studio API - no folder ID needed');
  } else if (result === 'foundation') {
    console.log('\n🎉 Use Foundation API - folder ID required');
  } else {
    console.log('\n🔧 Check your API credentials and network connection');
  }
}).catch(console.error); 