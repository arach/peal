import Script from 'next/script'

const GA_MEASUREMENT_ID = 'G-GSHDZPFRZG'
// Analytics only report from the live site; dev servers and local previews stay silent.
const PRODUCTION_HOSTS = ['hudsonkit.com', 'www.hudsonkit.com', 'arach.github.io']

/** Inlined in static export HTML via beforeInteractive (afterInteractive is client-only). */
export default function GoogleAnalytics() {
  return (
    <Script id="google-analytics" strategy="beforeInteractive">
      {`if (${JSON.stringify(PRODUCTION_HOSTS)}.includes(window.location.hostname)) {
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}';
  document.head.appendChild(s);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function(){window.dataLayer.push(arguments);};
  gtag('js', new Date());
  gtag('config', '${GA_MEASUREMENT_ID}');
}`}
    </Script>
  )
}
