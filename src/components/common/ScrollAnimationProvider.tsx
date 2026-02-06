'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

export default function ScrollAnimationProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <>{children}</>;
}
