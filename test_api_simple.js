const http = require('http');

const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYVRLIjoyMSwiRW1haWwiOiJ0aGFuaHR1QGdtYWlsLmNvbSIsIlZhaVRybyI6Ik5oYW5WaWVuR2lhb0hhbmciLCJpZCI6MjEsImlhdCI6MTc1NDQ2ODc2NCwiZXhwIjoxNzU0NTU1MTY0fQ.nrVlkjKCbCxQDKQCeM3r_DUtZmU5mp53wHJp_WL7zuw';

function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${JWT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

async function testAPI() {
  try {
    console.log('🔍 Testing API with status=1...');
    
    const response1 = await makeRequest('/api/orders/delivery/assigned?page=1&limit=10&status=1');
    console.log('✅ Status 1 - Success:', response1.status);
    console.log('Data:', response1.data);
    
  } catch (error) {
    console.log('❌ Status 1 - Error:', error.message);
  }
  
  try {
    console.log('\n🔍 Testing API with status=3...');
    
    const response2 = await makeRequest('/api/orders/delivery/assigned?page=1&limit=10&status=3');
    console.log('✅ Status 3 - Success:', response2.status);
    console.log('Data:', response2.data);
    
  } catch (error) {
    console.log('❌ Status 3 - Error:', error.message);
  }
}

testAPI(); 