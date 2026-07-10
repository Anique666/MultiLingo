import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["400", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "MultiLingo",
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
        <AuthProvider>
          <main className="min-h-screen w-full">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
