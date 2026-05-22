"use client";

import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import UploadZone from "@/components/UploadZone";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Navbar />
      <main>
        <Hero />
        <UploadZone />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
