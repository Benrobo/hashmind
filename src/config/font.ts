import { Poppins, Bricolage_Grotesque } from "next/font/google";

export const ppReg = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppReg",
  weight: ["400"],
  preload: true,
});

export const ppL = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppL",
  weight: ["300"],
  preload: true,
});

// bold poppins
export const ppB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppB",
  weight: ["600"],
  preload: true,
});

// extra bold
export const ppSB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppSB",
  weight: ["600"],
  preload: true,
});

export const ppEB = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ppEB",
  weight: ["900"],
  preload: true,
});

// bricolage font
export const blEB = Bricolage_Grotesque({
  variable: "--font-blEB",
  weight: ["800"],
  preload: true,
  subsets: ["latin"],
  display: "swap",
});
