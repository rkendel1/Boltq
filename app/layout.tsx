import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ConvexClientProvider } from "@/providers/ConvexClientProvider";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Bolt New Clone",
  description: "Bolt New Clone",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph:{
    title: "Bolt New Clone",
    description: "Bolt New Clone",
    images: "/favicon.ico",
    url: "https://boltnewclone.vercel.app",
    siteName: "Bolt New Clone",
    locale: "en_US",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
       <ConvexClientProvider>
       <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            disableTransitionOnChange >
              <Header/>
            {children}
          </ThemeProvider>
       </ConvexClientProvider>
      </body>
    </html>
  );
}
