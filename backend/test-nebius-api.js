const axios = require('axios');

// Test different API endpoints
const endpoints = [
  'https://api.nebius.cloud',
  'https://api.nebius.com',
  'https://api.cloud.yandex.net',
  'https://ai.nebius.cloud'
];

async function testEndpoint(url) {
  console.log(`\n🔍 Testing endpoint: ${url}`);
  
  try {
    // Test basic connectivity
    const response = await axios.get(`${url}/health`, { timeout: 5000 });
    console.log(`✅ Health check successful: ${response.status}`);
    return true;
  } catch (error) {
    console.log(`❌ Health check failed: ${error.code || error.message}`);
    
    // Try a different endpoint
    try {
      const response = await axios.get(`${url}`, { timeout: 5000 });
      console.log(`✅ Basic connectivity successful: ${response.status}`);
      return true;
    } catch (error2) {
      console.log(`❌ Basic connectivity failed: ${error2.code || error2.message}`);
      return false;
    }
  }
}

async function testAllEndpoints() {
  console.log('🧪 Testing Nebius API endpoints...\n');
  
  for (const endpoint of endpoints) {
    const isWorking = await testEndpoint(endpoint);
    if (isWorking) {
      console.log(`🎉 Working endpoint found: ${endpoint}`);
      return endpoint;
    }
  }
  
  console.log('\n❌ No working endpoints found');
  return null;
}

// Test DNS resolution
async function testDNS() {
  console.log('\n🌐 Testing DNS resolution...');
  
  const dns = require('dns').promises;
  
  for (const endpoint of endpoints) {
    try {
      const hostname = new URL(endpoint).hostname;
      const addresses = await dns.resolve4(hostname);
      console.log(`✅ ${hostname} resolves to: ${addresses.join(', ')}`);
    } catch (error) {
      console.log(`❌ ${new URL(endpoint).hostname} DNS resolution failed: ${error.code}`);
    }
  }
}

async function main() {
  await testDNS();
  const workingEndpoint = await testAllEndpoints();
  
  if (workingEndpoint) {
    console.log(`\n💡 Recommendation: Use ${workingEndpoint} as your NEBIUS_API_URL`);
    console.log(`\n📝 Update your backend/.env file:`);
    console.log(`NEBIUS_API_URL=${workingEndpoint}`);
  } else {
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your internet connection');
    console.log('2. Verify that you can access Yandex Cloud services');
    console.log('3. Check if there are any firewall/proxy restrictions');
    console.log('4. Try using a VPN if you\'re in a restricted region');
  }
}

main().catch(console.error); 