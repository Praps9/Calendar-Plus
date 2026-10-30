
import type { Metadata } from "next";
import localFont from "next/font/local";
// Next.js processes this global stylesheet even when TypeScript cannot resolve its side-effect import.
// @ts-ignore
import "./globals.css";
import EventForm from "@/components/EventForm";
import SessionProvider from "@/components/providers/SessionProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Calendar-Plus",
  description: "Making Scheduling possible",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SessionProvider>
          {children}
          <EventForm />
        </SessionProvider>
      </body>
    </html>
  );
}
