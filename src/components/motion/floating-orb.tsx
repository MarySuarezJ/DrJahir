"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type FloatingOrbProps = {
  className?: string;
  delay?: number;
  size?: number;
};

export function FloatingOrb({ className, delay = 0, size = 260 }: FloatingOrbProps) {
  return (
    <motion.div
      aria-hidden
      className={cn("pointer-events-none absolute rounded-full blur-3xl", className)}
      style={{ width: size, height: size }}
      animate={{ y: [0, -18, 0], opacity: [0.45, 0.75, 0.45] }}
      transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
