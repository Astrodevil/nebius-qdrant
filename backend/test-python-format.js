const axios = require('axios');

// This test matches the Python example exactly
async function testPythonFormat() {
  const apiKey = process.env.NEBIUS_API_KEY;
  
  if (!apiKey) {
    console.log('❌ NEBIUS_API_KEY not found in environment');
    return;
  }

  console.log('🧪 Testing Python format API call...');
  console.log(`🔑 API Key: ${apiKey.substring(0, 10)}...`);

  // Test different base URLs that might work
  const baseUrls = [
    'https://api.studio.nebius.com/v1',
    'https://api.studio.nebius.com',
    'https://studio.nebius.com/v1',
    'https://studio.nebius.com'
  ];

  for (const baseUrl of baseUrls) {
    console.log(`\n🔍 Testing: ${baseUrl}`);
    
    try {
      const requestBody = {
        model: "meta-llama/Llama-3.3-70B-Instruct",
        max_tokens: 512,
        temperature: 0.6,
        top_p: 0.9,
        extra_body: {
          top_k: 50
        },
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant."
          },
          {
            role: "user", 
            content: "Hello! Please respond with a short greeting."
          }
        ]
      };

      const response = await axios.post(
        `${baseUrl}/chat/completions`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      console.log(`✅ Success! Status: ${response.status}`);
      console.log(`🤖 Model: ${response.data.model}`);
      console.log(`💬 Response: ${response.data.choices[0].message.content}`);
      console.log(`📊 Usage:`, response.data.usage);
      
      console.log(`\n🎉 Working configuration found!`);
      console.log(`📝 Update your backend/.env file:`);
      console.log(`NEBIUS_API_URL=${baseUrl}`);
      
      return baseUrl;
      
    } catch (error) {
      console.log(`❌ Failed: ${error.response?.status || error.code}`);
      if (error.response?.data) {
        console.log(`📄 Error:`, JSON.stringify(error.response.data, null, 2));
      }
    }
  }
  
  console.log('\n❌ No working configurations found');
  return null;
}

// Also test if we need to use a different authentication method
async function testAlternativeAuth() {
  const apiKey = process.env.NEBIUS_API_KEY;
  
  console.log('\n🔄 Testing alternative authentication methods...');
  
  const authMethods = [
    { name: 'Bearer', header: `Bearer ${apiKey}` },
    { name: 'Api-Key', header: `Api-Key ${apiKey}` },
    { name: 'X-API-Key', header: `X-API-Key ${apiKey}` },
    { name: 'Authorization', header: apiKey }
  ];

  for (const auth of authMethods) {
    console.log(`\n🔍 Testing ${auth.name} authentication...`);
    
    try {
      const requestBody = {
        model: "meta-llama/Llama-3.3-70B-Instruct",
        max_tokens: 50,
        temperature: 0.6,
        messages: [
          {
            role: "user",
            content: "Say hello briefly."
          }
        ]
      };

      const response = await axios.post(
        'https://api.studio.nebius.com/v1/chat/completions',
        requestBody,
        {
          headers: {
            'Authorization': auth.header,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      console.log(`✅ ${auth.name} auth works!`);
      console.log(`💬 Response: ${response.data.choices[0].message.content}`);
      return auth.name;
      
    } catch (error) {
      console.log(`❌ ${auth.name} auth failed: ${error.response?.status || error.code}`);
    }
  }
  
  return null;
}

async function main() {
  const workingUrl = await testPythonFormat();
  
  if (!workingUrl) {
    await testAlternativeAuth();
  }
}

main().catch(console.error); 