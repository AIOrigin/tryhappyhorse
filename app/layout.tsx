import type { Metadata, Viewport } from 'next';
import '../src/app/globals.css';
import { SITE_NAME, THEME_COLOR } from '@/lib/seo';
import { siteUrl } from '@/lib/content';
import { DEFAULT_LOCALE, getHtmlLang } from '@/lib/i18n';
import { getSiteCopy } from '@/lib/site-copy';

const gtmContainerId = 'GTM-WGQVVGFZ';
const siteCopy = getSiteCopy(DEFAULT_LOCALE);

export const metadata: Metadata = {
  metadataBase: siteUrl,
  applicationName: SITE_NAME,
  title: SITE_NAME,
  description: siteCopy.metadata.siteDescription,
  verification: {
    other: {
      'baidu-site-verification': 'codeva-4MsLl56Xlo',
    },
  },
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico' },
    ],
    shortcut: ['/favicon.ico'],
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={getHtmlLang(DEFAULT_LOCALE)}>
      <body>
        <script
          id="gtm-loader"
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmContainerId}');`,
          }}
        />
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${gtmContainerId}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
