import type { Metadata } from "next";
import { Geist, Newsreader } from "next/font/google";
import { AuthProvider } from "@/components/AuthProvider";
import { defaultDescription, defaultTitle, getSiteUrl, siteName } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: `%s · ${siteName}`,
  },
  description: defaultDescription,
  applicationName: siteName,
  keywords: [
    "Naukri resume parser",
    "Indian ATS resume",
    "IIMJobs resume",
    "LinkedIn resume India",
    "ATS resume fixer",
    "Naukri ATS",
    "resume .docx Naukri",
  ],
  authors: [{ name: siteName }],
  creator: siteName,
  publisher: siteName,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "/",
    siteName,
    title: defaultTitle,
    description: defaultDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "productivity",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans text-ink">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
