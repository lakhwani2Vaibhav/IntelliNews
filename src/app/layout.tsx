import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins' 
});


export const metadata: Metadata = {
  title: 'IntelliNews: AI-Powered News, Curated For You',
  description: 'Welcome to intellinews.co.in, your premier source for AI-powered news. Get personalized summaries, explore trending topics, and experience the future of news consumption.',
  icons: {
    icon: '/Intelli News Logo.gif',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
