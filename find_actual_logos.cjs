const https = require('https');

async function getPageHtml(url) {
  return new Promise((resolve) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', (e) => resolve({ status: 'ERR', data: e.message }));
  });
}

async function run() {
  const sites = [
    { name: 'K Electric', urls: ['https://www.ke.com.pk', 'https://ke.com.pk'] },
    { name: 'UBL', urls: ['https://www.ubldigital.com', 'https://www.ubl.com.pk'] },
    { name: 'Parco', urls: ['https://www.parco.com.pk'] },
    { name: 'Disrupt.com', urls: ['https://disrupt.com', 'https://www.disrupt.com'] }
  ];

  for (const s of sites) {
    console.log(`\n=== ${s.name} ===`);
    for (const u of s.urls) {
      const res = await getPageHtml(u);
      console.log(`URL ${u}: Status ${res.status}`);
      if (res.data) {
        const matches = res.data.match(/<link[^>]*rel=["'](?:shortcut )?icon["'][^>]*>/gi) || [];
        console.log(`  Icons:`, matches);
        const imgMatches = res.data.match(/<img[^>]*src=["'][^"']*logo[^"']*["'][^>]*>/gi) || [];
        console.log(`  Logo images:`, imgMatches.slice(0, 3));
      }
    }
  }
}

run();
