const https = require('https');

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], len: res.headers['content-length'] });
    });
    req.on('error', (e) => resolve({ url, status: 'ERR', err: e.message }));
    req.setTimeout(6000, () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
  });
}

async function run() {
  const candidateUrls = [
    // K-Electric
    'https://ke.com.pk/wp-content/uploads/2025/05/kelogo-150x150.png',
    'https://ke.com.pk/wp-content/uploads/2025/05/kelogo.png',

    // UBL
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/United_Bank_Limited_logo.svg/512px-United_Bank_Limited_logo.svg.png',
    'https://www.ubldigital.com/Portals/_default/skins/ubldigital/NewHome/imgs/rda-new-banner/rda-new-logo.png',

    // PARCO
    'https://www.parco.com.pk/wp-content/uploads/2023/07/Logo-1.png',
    'https://www.parco.com.pk/wp-content/uploads/2023/06/cropped-total-parco-logo-B8C540902D-seeklogo.com_-192x192.png',

    // Disrupt.com
    'https://www.disrupt.com/favicon.png'
  ];

  for (const u of candidateUrls) {
    const res = await testUrl(u);
    console.log(`${res.status} [len: ${res.len || '?'}] (${res.type}) -> ${res.url}`);
  }
}

run();
