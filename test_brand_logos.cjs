const https = require('https');

function fetchFollow(url, redirects = 0) {
  return new Promise((resolve) => {
    if (redirects > 5) return resolve({ url, status: 'TOO_MANY_REDIRECTS' });
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        let loc = res.headers.location;
        if (loc.startsWith('/')) {
          const u = new URL(url);
          loc = `${u.protocol}//${u.host}${loc}`;
        }
        return resolve(fetchFollow(loc, redirects + 1));
      }
      resolve({ url, status: res.statusCode, contentType: res.headers['content-type'], contentLength: res.headers['content-length'] });
    }).on('error', (e) => {
      resolve({ url, status: 'ERROR', error: e.message });
    });
  });
}

const testDomains = [
  { name: 'K Electric', domains: ['ke.com.pk', 'k-electric.com.pk', 'ke.com'] },
  { name: 'UBL', domains: ['ubl.com.pk', 'ubldigital.com'] },
  { name: 'Parco', domains: ['parco.com.pk'] },
  { name: 'Disrupt.com', domains: ['disrupt.com', 'disruptlabs.io', 'disrupt.com.pk', 'disrupt.net'] }
];

async function run() {
  for (const item of testDomains) {
    console.log(`=== ${item.name} ===`);
    for (const domain of item.domains) {
      const googleUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=256`;
      const resG = await fetchFollow(googleUrl);
      console.log(`Domain [${domain}]: Google status ${resG.status}, type: ${resG.contentType}, len: ${resG.contentLength}`);
    }
  }
}

run();
