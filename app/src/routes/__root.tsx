import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

import { installErrorMonitor } from '../lib/errormon'
import appCss from '../styles.css?url'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      {
        // iOS lockdown: maximum-scale + user-scalable=no kill pinch/double-tap
        // zoom jumps mid-game; viewport-fit=cover handles the notch
        name: 'viewport',
        content:
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover',
      },
      { title: 'MATCHDAY ⚽ WC26 mini games' },
      // pitch-green chrome on iOS standalone / Android task switcher
      { name: 'theme-color', content: '#053a22' },
      { name: 'apple-mobile-web-app-capable', content: 'yes' },
      { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' },
      { name: 'apple-mobile-web-app-title', content: 'MATCHDAY' },
    ],
    links: [
      { rel: 'manifest', href: '/manifest.json' },
      { rel: 'icon', href: '/icon-192.png', type: 'image/png' },
      { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      /* fonts are self-hosted (see styles.css @font-face); preload the two
         latin files the first paint always needs */
      {
        rel: 'preload',
        href: '/fonts/baloo2-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'preload',
        href: '/fonts/nunito-latin.woff2',
        as: 'font',
        type: 'font/woff2',
        crossOrigin: 'anonymous',
      },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [
      /* Cloudflare Web Analytics (visits/referrers, cookieless) — enabled by
         setting VITE_CF_BEACON_TOKEN at build time once the site is live */
      ...(import.meta.env.VITE_CF_BEACON_TOKEN
        ? [
            {
              src: 'https://static.cloudflareinsights.com/beacon.min.js',
              defer: true,
              'data-cf-beacon': JSON.stringify({
                token: import.meta.env.VITE_CF_BEACON_TOKEN as string,
              }),
            },
          ]
        : []),
      // headless test bootstrap: ?anthemtest=N stubs HTMLMediaElement (forcing
      // the synth fallback path — archive.org streaming is not testable
      // headlessly) and loads the matching suite from /tests/. Inert without
      // the query param; the suites drive the game via window.__anthem.
      // build:prod sets VITE_STRIP_TEST_HOOKS so none of this ships to players.
      ...(import.meta.env.VITE_STRIP_TEST_HOOKS
        ? []
        : [
            {
              children:
                "(function(){var m=location.search.match(/[?&]anthemtest=(\\d{1,2})/);if(!m)return;" +
                'HTMLMediaElement.prototype.load=function(){};' +
                "HTMLMediaElement.prototype.play=function(){return Promise.reject(new Error('stubbed'))};" +
                "var s=document.createElement('script');s.src='/tests/anthemtest'+m[1]+'.js';s.defer=true;document.head.appendChild(s);})();",
            },
            // KEEPIES suites drive the canvas engine via window.__kp / __kpSet
            {
              children:
                "(function(){var m=location.search.match(/[?&]keepiestest=(\\d{1,2})/);if(!m)return;" +
                "var s=document.createElement('script');s.src='/tests/keepiestest'+m[1]+'.js';s.defer=true;document.head.appendChild(s);})();",
            },
          ]),
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    installErrorMonitor()
  }, [])
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}
