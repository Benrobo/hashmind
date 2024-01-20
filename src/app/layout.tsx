import { ppReg, ppB, ppEB, ppSB, ppL, blEB } from "@/config/font";
import "../styles/globals.css";
import { cn } from "@/lib/utils";
import NextTopLoader from "@/components/toploader";
import DataContextProvider from "@/context/DataContext";
import { Toaster } from "react-hot-toast";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={cn(
          `${ppReg.variable} ${ppB.variable} ${ppEB.variable} ${ppSB.variable} ${ppL.variable} ${blEB.variable}`,
          "h-screen hideScrollBar2 scroll-smooth"
        )}
        suppressHydrationWarning
      >
        <DataContextProvider>{children}</DataContextProvider>
        <NextTopLoader />
        <Toaster />
      </body>
    </html>
  );
}
