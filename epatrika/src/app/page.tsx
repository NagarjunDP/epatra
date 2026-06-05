"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { DEFAULT_INVITATION } from "@/lib/constants";

export default function Home() {
  return (
    <main className="landing">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2 }}
      >
        <p className="eyebrow">{DEFAULT_INVITATION.eventLabel}</p>
        <h1>{DEFAULT_INVITATION.brideName} &amp; {DEFAULT_INVITATION.groomName}</h1>
        <p className="date-line">{DEFAULT_INVITATION.dateText}</p>
        <Link href="/card/demo" className="open-cta">Tap to open</Link>
      </motion.div>
    </main>
  );
}
