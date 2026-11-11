// /app/layout.tsx
import type { Metadata } from "next";
import { Inter, Baloo_2 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

const META_PIXEL_ID = "29314180991547743";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Bold, rounded display font used ONLY for headings within the teacher
// dashboard (echoes the "Right Back at You" book cover's title lettering).
// Adding it here just makes the CSS variable available site-wide - it is
// deliberately NOT referenced by any shared/global CSS rule, so it has zero
// effect on the admin panel, login, or registration pages unless a specific
// dashboard component opts into it inline.
const balooTwo = Baloo_2({
  variable: "--font-heading",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RB@Y",
  description: "Building empathy and connection through literature",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${balooTwo.variable} antialiased`}
      >
        {/* Meta Pixel base code (loads on every page) */}
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
