const axios = require('axios');

// Test different possible Nebius Studio API endpoints
const endpoints = [
  'https://api.studio.nebius.com/v1',
  'https://api.studio.nebius.com',
  'https://studio.nebius.com/v1',
  'https://studio.nebius.com',
  'https://api.nebius.cloud/v1',
  'https://api.nebius.cloud'
];

async function testEndpoint(url, apiKey) {
  console.log(`\n🔍 Testing endpoint: ${url}`);
  
  try {
    const requestBody = {
      model: 'meta-llama/Llama-3.3-70B-Instruct',
      max_tokens: 50,
      temperature: 0.6,
      top_p: 0.9,
      extra_body: {
        top_k: 50
      },
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          content: 'Say hello briefly.'
        }
      ]
    };

    const response = await axios.post(
      `${url}/chat/completions`,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ Success! Status: ${response.status}`);
    console.log(`🤖 Model: ${response.data.model}`);
    console.log(`💬 Response: ${response.data.choices[0].message.content}`);
    return { success: true, url, response: response.data };
    
  } catch (error) {
    console.log(`❌ Failed: ${error.response?.status || error.code} - ${error.response?.data?.message || error.message}`);
    return { success: false, url, error: error.response?.data || error.message };
  }
}

async function testAllEndpoints() {
  // You can set your API key here for testing, or it will prompt you
  let apiKey = process.env.NEBIUS_API_KEY;
  
  if (!apiKey) {
    console.log('⚠️  No NEBIUS_API_KEY found in environment');
    console.log('Please set your API key in the environment or update this script');
    return;
  }

  console.log('🧪 Testing Nebius Studio API endpoints...');
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  
  for (const endpoint of endpoints) {
    const result = await testEndpoint(endpoint, apiKey);
    if (result.success) {
      console.log(`\n🎉 Working endpoint found: ${endpoint}`);
      console.log(`\n📝 Update your backend/.env file:`);
      console.log(`NEBIUS_API_URL=${endpoint}`);
      return endpoint;
    }
  }
  
  console.log('\n❌ No working endpoints found');
  console.log('\n🔧 Possible issues:');
  console.log('1. API key might be invalid');
  console.log('2. Endpoint URL might be different');
  console.log('3. Network connectivity issues');
  console.log('4. API might require different authentication method');
  
  return null;
}

// Also test the old foundation models endpoint for comparison
async function testOldEndpoint() {
  console.log('\n🔄 Testing old foundation models endpoint for comparison...');
  
  const apiKey = process.env.NEBIUS_API_KEY;
  const folderId = process.env.NEBIUS_FOLDER_ID;
  
  if (!apiKey || !folderId) {
    console.log('⚠️  Missing API key or folder ID for old endpoint test');
    return;
  }
  
  try {
    const requestBody = {
      modelUri: `gpt://${folderId}/yandexgpt-lite`,
      completionOptions: {
        maxTokens: 50,
        temperature: 0.7,
        stream: false
      },
      messages: [
        {
          role: 'system',
          text: 'You are a helpful assistant.'
        },
        {
          role: 'user',
          text: 'Say hello briefly.'
        }
      ]
    };

    const response = await axios.post(
      'https://api.nebius.cloud/foundationModels/v1/completion',
      requestBody,
      {
        headers: {
          'Authorization': `Api-Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 10000
      }
    );

    console.log(`✅ Old endpoint works! Status: ${response.status}`);
    console.log(`💬 Response: ${response.data.result.alternatives[0].message.text}`);
    
  } catch (error) {
    console.log(`❌ Old endpoint failed: ${error.response?.status || error.code} - ${error.response?.data?.message || error.message}`);
  }
}

async function main() {
  const workingEndpoint = await testAllEndpoints();
  
  if (!workingEndpoint) {
    await testOldEndpoint();
  }
}

main().catch(console.error); 