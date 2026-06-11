import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'

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
      { title: 'MATCHDAY ⚽ World Cup 2026 daily mini games' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
      { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Nunito:wght@600;700;800&display=swap',
      },
      { rel: 'stylesheet', href: appCss },
    ],
    scripts: [
      {
        // headless test bootstrap: ?anthemtest=N stubs HTMLMediaElement (forcing
        // the synth fallback path — archive.org streaming is not testable
        // headlessly) and loads the matching suite from /tests/. Inert without
        // the query param; the suites drive the game via window.__anthem.
        children:
          "(function(){var m=location.search.match(/[?&]anthemtest=([1-7])/);if(!m)return;" +
          'HTMLMediaElement.prototype.load=function(){};' +
          "HTMLMediaElement.prototype.play=function(){return Promise.reject(new Error('stubbed'))};" +
          "var s=document.createElement('script');s.src='/tests/anthemtest'+m[1]+'.js';s.defer=true;document.head.appendChild(s);})();",
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
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
