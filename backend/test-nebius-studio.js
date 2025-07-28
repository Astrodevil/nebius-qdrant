const axios = require('axios');

// Test different API configurations
const configs = [
  {
    name: 'Studio API v1 with /v1',
    baseUrl: 'https://api.studio.nebius.com/v1',
    endpoint: '/chat/completions',
    auth: 'Bearer'
  },
  {
    name: 'Studio API without /v1',
    baseUrl: 'https://api.studio.nebius.com',
    endpoint: '/chat/completions',
    auth: 'Bearer'
  },
  {
    name: 'Studio API with /v1/chat',
    baseUrl: 'https://api.studio.nebius.com/v1',
    endpoint: '/chat/completions',
    auth: 'Bearer'
  },
  {
    name: 'Alternative Studio domain',
    baseUrl: 'https://studio.nebius.com',
    endpoint: '/v1/chat/completions',
    auth: 'Bearer'
  },
  {
    name: 'Cloud API with OpenAI format',
    baseUrl: 'https://api.nebius.cloud',
    endpoint: '/v1/chat/completions',
    auth: 'Bearer'
  },
  {
    name: 'Cloud API with foundation models',
    baseUrl: 'https://api.nebius.cloud',
    endpoint: '/foundationModels/v1/completion',
    auth: 'Api-Key',
    useOldFormat: true
  }
];

async function testConfig(config, apiKey, folderId) {
  console.log(`\n🔍 Testing: ${config.name}`);
  console.log(`📍 URL: ${config.baseUrl}${config.endpoint}`);
  
  try {
    let requestBody;
    let headers = {
      'Content-Type': 'application/json',
      'timeout': 10000
    };

    if (config.useOldFormat) {
      // Old foundation models format
      requestBody = {
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
      headers['Authorization'] = `${config.auth} ${apiKey}`;
    } else {
      // New OpenAI-compatible format
      requestBody = {
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
      headers['Authorization'] = `${config.auth} ${apiKey}`;
    }

    const response = await axios.post(
      `${config.baseUrl}${config.endpoint}`,
      requestBody,
      { headers }
    );

    console.log(`✅ Success! Status: ${response.status}`);
    
    if (config.useOldFormat) {
      console.log(`💬 Response: ${response.data.result.alternatives[0].message.text}`);
    } else {
      console.log(`🤖 Model: ${response.data.model}`);
      console.log(`💬 Response: ${response.data.choices[0].message.content}`);
    }
    
    return { success: true, config, response: response.data };
    
  } catch (error) {
    console.log(`❌ Failed: ${error.response?.status || error.code}`);
    if (error.response?.data) {
      console.log(`📄 Error details:`, JSON.stringify(error.response.data, null, 2));
    }
    return { success: false, config, error: error.response?.data || error.message };
  }
}

async function main() {
  const apiKey = process.env.NEBIUS_API_KEY;
  const folderId = process.env.NEBIUS_FOLDER_ID;
  
  if (!apiKey) {
    console.log('❌ NEBIUS_API_KEY not found in environment');
    console.log('Please set your API key: export NEBIUS_API_KEY=your_key_here');
    return;
  }

  console.log('🧪 Testing Nebius API configurations...');
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);
  if (folderId) {
    console.log(`📁 Folder ID: ${folderId}`);
  }
  
  let workingConfig = null;
  
  for (const config of configs) {
    const result = await testConfig(config, apiKey, folderId);
    if (result.success) {
      workingConfig = result.config;
      console.log(`\n🎉 Working configuration found: ${config.name}`);
      break;
    }
  }
  
  if (workingConfig) {
    console.log(`\n📝 Update your backend/.env file:`);
    console.log(`NEBIUS_API_URL=${workingConfig.baseUrl}`);
    if (workingConfig.useOldFormat) {
      console.log(`NEBIUS_FOLDER_ID=${folderId}`);
      console.log(`# Note: Using old foundation models API`);
    }
  } else {
    console.log('\n❌ No working configurations found');
    console.log('\n🔧 Troubleshooting suggestions:');
    console.log('1. Verify your API key is correct');
    console.log('2. Check if you have access to Nebius Studio API');
    console.log('3. Try using the old foundation models API');
    console.log('4. Contact Nebius support for correct endpoint');
  }
}

main().catch(console.error); 