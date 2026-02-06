'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollAnimateProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function ScrollAnimate({ children, delay = 0, className = '' }: ScrollAnimateProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
      viewport={{ once: true, amount: 0.3 }}
    >
      {children}
    </motion.div>
  );
}
