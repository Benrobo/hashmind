import Footer from "@/components/footer";
import Hero from "@/components/landing/hero";
import Overview from "@/components/landing/overview";
import HomeTopBar from "@/components/navbar";
import Image from "next/image";

export default function Home() {
  return (
    <main className=" bg-dark-100">
      <HomeTopBar />
      <Hero />
      <Overview />
      <Footer />
    </main>
  );
}
