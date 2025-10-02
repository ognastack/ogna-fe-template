"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import React, { useMemo, useState } from "react";
import { OgnaClient, Session } from "@/api/OgnaClient";

import "./globals.css";
import { OgnaContext } from "@/api/OgnaContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const client = useMemo(() => new OgnaClient("http://localhost:8000"), []);

  const [session, setSession] = useState<Session | null>(client.getSession());

  const updateSession = (s: Session | null) => {
    client.setSession(s);
    setSession(s);
  };

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <OgnaContext.Provider
          value={{ client, session, setSession: updateSession }}
        >
          {children}
        </OgnaContext.Provider>
        <Toaster />
      </body>
    </html>
  );
}
