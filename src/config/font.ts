import { Poppins, Bricolage_Grotesque } from "next/font/google";

export const ppReg = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppReg",
  weight: ["400"],
});

export const ppL = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppL",
  weight: ["300"],
});

// bold poppins
export const ppB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppB",
  weight: ["600"],
});

// extra bold
export const ppSB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppSB",
  weight: ["600"],
});

export const ppEB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppEB",
  weight: ["900"],
});

// bricolage font
export const blEB = Bricolage_Grotesque({
  variable: "--font-blEB",
  weight: ["800"],
  subsets: ["latin"],
  display: "swap",
});
