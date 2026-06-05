"use client";

import { motion } from "framer-motion";
import { PAGE_TURN_DURATION, PAGE_TURN_EASING } from "@/lib/constants";

interface PageProps {
  rotation: number;
  zIndex: number;
  children: React.ReactNode;
}

export default function Page({ rotation, zIndex, children }: PageProps) {
  const progress = Math.abs(rotation) / 180;
  const shadow = Math.sin(progress * Math.PI) * 0.42;

  return (
    <motion.div
      className="card-page"
      style={{ zIndex }}
      animate={{ rotateY: rotation }}
      transition={{ duration: PAGE_TURN_DURATION, ease: PAGE_TURN_EASING }}
    >
      <div className="page-face">{children}</div>
      <div className="page-shadow" style={{ opacity: shadow }} />
    </motion.div>
  );
}
