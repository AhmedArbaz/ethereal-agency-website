import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ethereal-agency-website.vercel.app";
const TITLE = "Ethereal Web Agency — Next.js, Salesforce & Design";
const DESCRIPTION =
  "Ethereal designs and develops Next.js websites, Salesforce systems, and brand visuals for businesses across the US and UK — from a single logo to a full production build.";

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s — Ethereal Web Agency",
  },
  description: DESCRIPTION,
  keywords: [
    "Next.js development agency",
    "Salesforce development",
    "web design agency",
    "UI UX design",
    "brand identity design",
  ],
  icons: {
    icon: "/images/logo.png",
    apple: "/images/logo.png",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "Ethereal Web Agency",
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: "/images/logo.png", width: 400, height: 400 }],
  },
  twitter: {
    card: "summary",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/images/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport = {
  themeColor: "#150e0a",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;0,700;1,500&family=Jost:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
