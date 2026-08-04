const https = require('https');

async function testUrl(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      resolve({ url, status: res.statusCode, type: res.headers['content-type'], len: res.headers['content-length'] });
    });
    req.on('error', (e) => resolve({ url, status: 'ERR', err: e.message }));
    req.setTimeout(5000, () => { req.destroy(); resolve({ url, status: 'TIMEOUT' }); });
  });
}

async function run() {
  const urls = [
    // K Electric
    'https://ke.com.pk/wp-content/uploads/2025/05/kelogo-150x150.png',
    'https://ke.com.pk/wp-content/uploads/2025/05/kelogo.png',

    // UBL
    'https://www.ubldigital.com/Portals/0/favicon.ico',
    'https://www.ubl.com.pk/favicon.ico',
    'https://www.ubldigital.com/Portals/_default/skins/ubldigital/NewHome/imgs/rda-new-banner/rda-new-logo.png',
    'https://www.ubldigital.com/Portals/0/ubl_logo.png',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/United_Bank_Limited_logo.svg/512px-United_Bank_Limited_logo.svg.png',

    // PARCO
    'https://parco.com.pk/wp-content/uploads/2018/06/favicon.png',
    'https://parco.com.pk/wp-content/uploads/2018/06/parco-logo.png',
    'https://parco.com.pk/favicon.ico',

    // Disrupt.com
    'https://disrupt.com/favicon.ico',
    'https://disrupt.com/assets/images/logo.png',
    'https://disrupt.com/wp-content/uploads/2021/04/cropped-favicon-32x32.png',
    'https://disruptlabs.io/favicon.ico',
    'https://disruptlabs.io/images/logo.svg'
  ];

  for (const u of urls) {
    const res = await testUrl(u);
    console.log(`${res.status} [len: ${res.len || '?'}] (${res.type}) -> ${res.url}`);
  }
}

run();
