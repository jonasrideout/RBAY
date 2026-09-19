// /app/layout.tsx
import type { Metadata } from "next";
import { Inter, Baloo_2 } from "next/font/google";
import "./globals.css";
import SessionProvider from "./components/SessionProvider";

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
  title: "Right Back at You Project",
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
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
