/**
 * Script to mark skips for workout plans.
 *
 * Usage (local): set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON
 * and run `node ./scripts/mark-skips.ts` with ts-node or compile to JS.
 *
 * This script is a starter; run as a scheduled job (Cloud Run / Cloud Function / cron).
 */
import admin from 'firebase-admin';

// Initialize admin with default credentials (expect GOOGLE_APPLICATION_CREDENTIALS env)
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function toDateKey(d: Date) {
  const tzOffset = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 10);
}

function isPlannedOnDay(plan: any, date = new Date()) {
  const weekday = date.toLocaleString('en-US', { weekday: 'long' });
  return Array.isArray(plan.availableDays) && plan.availableDays.includes(weekday);
}

function hasCompletedForDate(plan: any, date = new Date()) {
  const dateKey = toDateKey(date);
  if (plan.exerciseStatus) {
    for (const s of Object.values(plan.exerciseStatus)) {
      const status: any = s;
      if (status && status.completed) {
        const cd = status.completedDate ? (status.completedDate.seconds ? new Date(status.completedDate.seconds*1000).toISOString().slice(0,10) : (''+status.completedDate).slice(0,10)) : null;
        if (cd === dateKey) return true;
      }
    }
  }
  return false;
}

async function markSkips() {
  const today = new Date();
  // We'll mark skips for yesterday so the whole day had a chance to complete
  const checkDate = new Date(today);
  checkDate.setDate(checkDate.getDate() - 1);
  const dateKey = toDateKey(checkDate);

  const plansSnap = await db.collection('workoutPlans').where('isActive', '==', true).get();
  for (const doc of plansSnap.docs) {
    const plan = doc.data();
    try {
      if (!isPlannedOnDay(plan, checkDate)) continue;
      if (hasCompletedForDate(plan, checkDate)) continue;

      // It's a skip for checkDate — update counters idempotently
      const lastSkip = plan.lastSkipDate || null;
      if (lastSkip === dateKey) {
        console.log('Already marked skip for', doc.id, dateKey);
        continue;
      }

      const consecutive = (plan.consecutiveSkips || 0) + 1;
      await db.collection('workoutPlans').doc(doc.id).update({
        consecutiveSkips: consecutive,
        lastSkipDate: dateKey,
      });
      console.log('Marked skip for plan', doc.id, dateKey);
    } catch (err) {
      console.error('Error handling plan', doc.id, err);
    }
  }
}

markSkips().then(() => {
  console.log('Done');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
