'use client'

import Script from 'next/script'

/**
 * GoogleAdScript component loads the Google AdSense and/or Google Ads (gtag.js) scripts
 * when the appropriate Publisher ID or Ads Tag ID is configured in environment variables.
 *
 * Environment variables:
 * - NEXT_PUBLIC_GOOGLE_ADSENSE_ID (e.g. ca-pub-XXXXXXXXXXXXXXXX)
 * - NEXT_PUBLIC_GOOGLE_ADS_ID (e.g. AW-XXXXXXXXX or G-XXXXXXXXX)
 */
export default function GoogleAdScript() {
  const adSenseId = process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_ID
  const googleAdsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID

  return (
    <>
      {/* Google AdSense Script Injection */}
      {adSenseId && (
        <Script
          id="google-adsense-script"
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSenseId}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      )}

      {/* Google Ads / Global Site Tag (gtag.js) Injection */}
      {googleAdsId && (
        <>
          <Script
            id="google-ads-gtag"
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-ads-gtag-init"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  )
}
