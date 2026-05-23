import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default:  'BytePress – Where Developers Share Ideas',
    template: '%s | BytePress',
  },
  description:
    'Explore in-depth articles on AI, full-stack development, DevOps, and modern web technologies written by expert engineers.',
  keywords: ['blog', 'technology', 'AI', 'react', 'nodejs', 'mongodb', 'programming'],
  authors: [{ name: 'BytePress Team' }],
  openGraph: {
    type:        'website',
    locale:      'en_US',
    url:         process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    siteName:    'BytePress',
    title:       'BytePress – Where Developers Share Ideas',
    description: 'Explore in-depth articles on AI, full-stack development, and modern web technologies.',
    images: [{
      url:    '/og-default.png',
      width:  1200,
      height: 630,
      alt:    'BytePress',
    }],
  },
  twitter: {
    card:        'summary_large_image',
    site:        '@bytepress',
    creator:     '@bytepress',
    title:       'BytePress – Where Developers Share Ideas',
    description: 'Explore in-depth articles on AI, full-stack development, and modern web technologies.',
    images:      ['/og-default.png'],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Google Fonts — preconnect first, then the actual stylesheet.
            globals.css also @imports this URL; the preconnect here makes
            the browser open the connection earlier, reducing render-blocking. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;800;900&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap"
          rel="stylesheet"
        />
      </head>

       
      <body className="bg-white text-gray-900 antialiased">
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}