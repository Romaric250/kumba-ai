import type { Metadata } from "next";
import { Inter, Crimson_Pro } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonPro = Crimson_Pro({
  variable: "--font-crimson",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kumba.AI - Your AI Learning Mentor",
  description: "AI-powered learning mentor for African students. Structured, disciplined learning with no shortcuts.",
  keywords: ["AI", "education", "learning", "Africa", "Cameroon", "tutor", "mentor"],
  authors: [{ name: "Kumba.AI Team" }],
  openGraph: {
    title: "Kumba.AI - Your AI Learning Mentor",
    description: "AI-powered learning mentor for African students",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${crimsonPro.variable} font-serif antialiased bg-earth-50 text-gray-900`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
