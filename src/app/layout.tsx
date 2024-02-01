"use client";
import { ppReg, ppB, ppEB, ppSB, ppL, blEB } from "@/config/font";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from "@/components/toploader";
import DataContextProvider from "@/context/DataContext";
import { Toaster } from "react-hot-toast";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Seo from "@/components/seo";
import Head from "next/head";

// tanstack reqct query
const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <Seo />
      {/* @ts-ignore */}
      <Head></Head>
      <body
        className={cn(
          `${ppReg.variable} ${ppB.variable} ${ppEB.variable} ${ppSB.variable} ${ppL.variable} ${blEB.variable}`,
          "h-screen hideScrollBar2 scroll-smooth"
        )}
        suppressHydrationWarning>
        <ClerkProvider>
          <QueryClientProvider client={queryClient}>
            <DataContextProvider>{children}</DataContextProvider>
            <NextTopLoader />
            <Toaster />
          </QueryClientProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
