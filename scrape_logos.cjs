const https = require('https');
const http = require('http');

function fetchPage(urlStr) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const client = url.protocol === 'https:' ? https : http;
    const req = client.get(urlStr, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
      }
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data, headers: res.headers }));
    });
    req.on('error', (e) => resolve({ status: 'ERR', data: e.message }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ status: 'TIMEOUT', data: '' }); });
  });
}

async function run() {
  const sites = [
    { name: 'UBL', url: 'https://www.ubldigital.com/' },
    { name: 'PARCO', url: 'https://www.parco.com.pk/' },
    { name: 'Disrupt.com', url: 'https://disrupt.com/' }
  ];

  for (const s of sites) {
    console.log(`\n=== ${s.name} (${s.url}) ===`);
    const res = await fetchPage(s.url);
    console.log('Status:', res.status);
    if (res.data) {
      const links = res.data.match(/<link[^>]+>/gi) || [];
      const icons = links.filter(l => l.includes('icon') || l.includes('apple'));
      console.log('Icons:', icons);
      const imgs = res.data.match(/<img[^>]+>/gi) || [];
      const logos = imgs.filter(i => i.toLowerCase().includes('logo'));
      console.log('Logo Images:', logos.slice(0, 5));
    }
  }
}

run();
