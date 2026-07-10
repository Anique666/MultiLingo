import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "Duolingo Clone",
  description: "Language learning app clone",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${nunito.variable} antialiased min-h-screen bg-white`}>
      <body className="min-h-screen flex flex-col font-sans">
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6">
          {children}
        </main>
      </body>
    </html>
  );
}
