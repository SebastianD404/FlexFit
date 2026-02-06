// Utilities for skip-detection and date helpers
export function toDateKey(d: Date) {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function extractDateString(d: any): string | null {
  if (!d) return null;
  if (typeof d === 'string') return d.slice(0, 10);
  if (typeof d === 'object' && 'seconds' in d) {
    return new Date(d.seconds * 1000).toISOString().slice(0, 10);
  }
  if (d instanceof Date) return toDateKey(d);
  return null;
}

export function isPlannedOnDay(plan: any, date = new Date()) {
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  return Array.isArray(plan.availableDays) && plan.availableDays.includes(weekday);
}

export function hasCompletedForDate(plan: any, date = new Date()) {
  const dateKey = toDateKey(date);

  if (plan.exerciseStatus) {
    for (const s of Object.values(plan.exerciseStatus)) {
      const status: any = s;
      if (status && status.completed) {
        const cd = extractDateString(status.completedDate || status.date || status.lastCompletedDate);
        if (cd === dateKey) return true;
      }
    }
  }

  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  const dayPlan = plan.plan?.[weekday];
  if (dayPlan && Array.isArray(dayPlan.exercises) && dayPlan.exercises.length > 0) {
    const all = dayPlan.exercises.every((ex: any) => {
      const key = `${weekday}-${ex.id}`;
      const s = plan.exerciseStatus?.[key];
      const cd = extractDateString(s?.completedDate || s?.date);
      return s?.completed && cd === dateKey;
    });
    if (all) return true;
  }

  return false;
}

export function shouldMarkSkip(plan: any, date = new Date()) {
  if (!plan) return false;
  if (!isPlannedOnDay(plan, date)) return false;
  if (hasCompletedForDate(plan, date)) return false;
  return true;
}

export default {
  toDateKey,
  isPlannedOnDay,
  hasCompletedForDate,
  shouldMarkSkip,
};
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
