import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Hilmi OS | Personal Command Center",
    template: "%s | Hilmi OS",
  },
  description: "Personal Operating System & Portfolio of Muhammad Hilmi Mu'afa - Technology Enthusiast, Network Engineer, and Web Developer.",
  keywords: ["Muhammad Hilmi Mu'afa", "Hilmi OS", "Portfolio", "Web Developer", "Network Engineer", "Technology Enthusiast"],
  authors: [{ name: "Muhammad Hilmi Mu'afa", url: "https://www.muhlim.my.id" }],
  creator: "Muhammad Hilmi Mu'afa",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "https://www.muhlim.my.id",
    title: "Hilmi OS | Personal Command Center",
    description: "Personal Operating System & Portfolio of Muhammad Hilmi Mu'afa.",
    siteName: "Hilmi OS",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hilmi OS | Personal Command Center",
    description: "Personal Operating System & Portfolio of Muhammad Hilmi Mu'afa.",
    creator: "@muhammadhilmimu",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
