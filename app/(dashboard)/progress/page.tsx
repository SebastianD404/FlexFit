"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { 
  Activity, 
  Dumbbell, 
  Ruler, 
  TrendingUp, 
  CheckCircle2, 
  Scale,
  Calendar,
  History,
  Scaling,      // Chest Icon
  Target,       // Waist Icon
  BicepsFlexed, // Arms Icon
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList
} from "lucide-react";
// --- StatCard Component ---
const StatCard = ({ title, subtitle, value, icon, gradientFrom, gradientTo }: any) => (
  <div className="rounded-3xl shadow-lg border border-yellow-400/20 bg-gradient-to-br p-6 flex flex-col justify-between min-h-[140px] transition-transform hover:scale-105 hover:shadow-2xl" style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}>
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <div>
        <div className="text-xs font-bold uppercase text-neutral-500 tracking-widest">{title}</div>
        <div className="text-[10px] text-neutral-400 font-medium uppercase tracking-wider">{subtitle}</div>
      </div>
    </div>
    <div className="flex items-end justify-between mt-2">
      <span className="text-5xl font-black text-yellow-500 drop-shadow-lg">{value}</span>
    </div>
  </div>
);

// --- Dummy/Functional Components for Streak and Plans (replace with real logic if needed) ---
const StreakCount = () => <span>0</span>; // TODO: Replace with real streak logic if needed
const PlansCreated = () => <span>0</span>; // TODO: Replace with real plans logic if needed

// --- Did You Know Section ---
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/lib/hooks";
import { saveUserProgress, saveUserPRs, getUserProgressLogs, getUserPRLogs } from "@/lib/firebase/db";

// --- Chart Registration ---
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend, 
  Filler
);


export default function ProgressPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [weightData, setWeightData] = useState([
    { date: "2026-01-01", weight: 60, chest: 88, waist: 72, arms: 30 },
    { date: "2026-01-08", weight: 60.5, chest: 88.5, waist: 71.5, arms: 30.2 },
    { date: "2026-01-15", weight: 60.2, chest: 89, waist: 71, arms: 30.5 },
    { date: "2026-01-22", weight: 60.0, chest: 89.5, waist: 70.5, arms: 30.8 },
    { date: "2026-01-29", weight: 59.8, chest: 90, waist: 70, arms: 31 },
  ]);
  const [measurements, setMeasurements] = useState({
    weight: 60,
    chest: 100,
    waist: 80,
    arms: 35,
  });
  const [prs, setPrs] = useState({
    bench: 100,
    squat: 120,
    deadlift: 140,
  });
  const [successMsg, setSuccessMsg] = useState<{ type: 'meas' | 'pr' | null, active: boolean }>({ type: null, active: false });

  // Ripple trigger for Save Records button
  const [recordRipple, setRecordRipple] = useState(0);

  // --- New: Workout stats ---
  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalHours, setTotalHours] = useState(0);

  // --- New: Fetch workout plans and compute stats ---
  const [skippedPlans, setSkippedPlans] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Fetch all workout plans for the user
      const { getUserWorkoutPlans } = await import("@/lib/firebase/db");
      const { shouldMarkSkip } = await import('@/lib/utils');
      const plans = await getUserWorkoutPlans(user.id);
      let completedSessions = 0;
      let minutes = 0;
      const skips: Record<string, boolean> = {};

      plans.forEach((plan: any) => {
        // Count completed sessions (days where all exercises are completed)
        if (plan.plan && plan.exerciseStatus) {
          Object.entries(plan.plan).forEach(([dayName, day]) => {
            // Type guard: ensure day is an object with exercises array
            if (typeof day === 'object' && Array.isArray((day as any).exercises)) {
              const allCompleted = (day as any).exercises.length > 0 && (day as any).exercises.every((ex: any) => {
                const status = plan.exerciseStatus?.[`${dayName}-${ex.id}`];
                return status && status.completed;
              });
              if (allCompleted) completedSessions++;
            }
          });
        }
        // Add up minutes per session for each completed session
        if (plan.minutesPerSession) {
          minutes += plan.minutesPerSession * Object.keys(plan.plan || {}).length;
        }

        // Client-side skip detection (non-persistent)
        try {
          const skip = shouldMarkSkip(plan, new Date());
          if (skip && plan.id) skips[plan.id] = true;
        } catch (err) {
          console.error('skip check failed for plan', plan.id, err);
        }
      });

      setTotalWorkouts(completedSessions);
      setTotalHours(Math.round((minutes / 60) * 10) / 10); // 1 decimal place
      setSkippedPlans(skips);
      if (Object.keys(skips).length) console.log('Client-detected skipped plans:', skips);
    })();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      setLoading(true);
      // Fetch progress logs
      const logs = await getUserProgressLogs(user.id);
      if (logs && logs.length > 0) {
        // Sort by timestamp if available, else by date
        logs.sort((a, b) => new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime());
        // Map and type-cast logs to expected structure
        const typedLogs = logs.map((log) => ({
          date: log.date,
          weight: Number(log.weight),
          chest: Number(log.chest),
          waist: Number(log.waist),
          arms: Number(log.arms),
        }));
        setWeightData(typedLogs);
        // Set latest measurements
        const latest = typedLogs[typedLogs.length - 1];
        setMeasurements({ weight: latest.weight, chest: latest.chest, waist: latest.waist, arms: latest.arms });
      }
      // Fetch PR logs
      const prLogs = await getUserPRLogs(user.id);
      if (prLogs && prLogs.length > 0) {
        // Set latest PRs
        const latestPR = prLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[prLogs.length - 1];
        setPrs({ bench: latestPR.bench, squat: latestPR.squat, deadlift: latestPR.deadlift });
      }
      setLoading(false);
    })();
  }, [user]);

  // --- Actions ---
  const handleMeasurementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMeasurements({ ...measurements, [e.target.name]: Number(e.target.value) });
  };

  const saveMeasurements = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    // Save to Firestore (always creates/updates for the date)
    await saveUserProgress(user.id, { ...measurements, date: today });
    // Reload all logs from Firestore to update chart and history
    const logs = await getUserProgressLogs(user.id);
    if (logs && logs.length > 0) {
      logs.sort((a, b) => new Date(a.timestamp || a.date).getTime() - new Date(b.timestamp || b.date).getTime());
      const typedLogs = logs.map((log) => ({
        date: log.date,
        weight: Number(log.weight),
        chest: Number(log.chest),
        waist: Number(log.waist),
        arms: Number(log.arms),
      }));
      setWeightData(typedLogs);
      const latest = typedLogs[typedLogs.length - 1];
      setMeasurements({ weight: latest.weight, chest: latest.chest, waist: latest.waist, arms: latest.arms });
    }
    triggerSuccess('meas');
  };

  const triggerSuccess = (type: 'meas' | 'pr') => {
    setSuccessMsg({ type, active: true });
    setTimeout(() => setSuccessMsg({ type: null, active: false }), 2000);
  };

  // --- Chart Configuration ---
  const chartData = {
    labels: weightData.map((d) => d.date),
    datasets: [
      {
        label: "Weight",
        data: weightData.map((d) => d.weight),
        borderColor: "#FACC15",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, "rgba(250, 204, 21, 0.15)"); 
          gradient.addColorStop(1, "rgba(250, 204, 21, 0.0)");
          return gradient;
        },
        borderWidth: 3,
        pointBackgroundColor: "#1c1c1c",
        pointBorderColor: "#FACC15",
        pointBorderWidth: 2,
        pointRadius: 6,
        tension: 0.4, 
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#262626",
        titleColor: "#FACC15",
        bodyColor: "#fff",
        borderColor: "#404040",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#737373", font: { size: 10, weight: 'bold' } }, 
      },
      y: {
        border: { display: false },
        grid: { color: "#333", borderDash: [5, 5] }, 
        ticks: { color: "#737373", font: { size: 11 } },
      },
    },
  };

  // --- Logic for displaying history (Toggle Show All) ---
  const displayedHistory = showAllHistory ? [...weightData].reverse() : [...weightData].reverse().slice(0, 5);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full animate-spin" style={{ border: '4px solid rgba(255,255,255,0.03)', borderTopColor: '#B8935E', borderRightColor: 'transparent', borderBottomColor: 'transparent', borderLeftColor: 'transparent' }} />
        <div className="text-sm text-neutral-400 tracking-widest uppercase">Loading</div>
      </div>
    </div>
  );

  return (
    <DashboardLayout title="Progress Overview">
      <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-6 lg:p-10 flex justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-7xl bg-[#121212] rounded-[2.5rem] shadow-2xl border border-white/[0.03] overflow-hidden"
        >
          <div className="p-6 md:p-10 space-y-10">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/[0.05] pb-8">
              <div>
                <h1 className="text-4xl font-black text-white tracking-tight">
                  Physical <span className="text-yellow-400">Progress</span>
                </h1>
                <p className="text-neutral-500 font-medium mt-1">Track your measurements and personal bests.</p>
              </div>
            </header>

            {/* --- Improved Cards Row --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Workouts"
                subtitle="Completed"
                value={totalWorkouts}
                icon={<CheckCircle2 size={32} className="text-yellow-500" />}
                gradientFrom="#ac921d"
                gradientTo="#ece7ca"
              />
              <StatCard
                title="Current Streak"
                subtitle="Days Active"
                value={<StreakCount />}
                icon={<Sparkles size={32} className="text-yellow-500" />}
                gradientFrom="#ac921d"
                gradientTo="#ece7ca"
              />
              <StatCard
                title="Plans Created"
                subtitle="Saved Schedules"
                value={<PlansCreated />}
                icon={<ClipboardList size={32} className="text-yellow-500" />}
                gradientFrom="#ac921d"
                gradientTo="#ece7ca"
              />
              <StatCard
                title="Hours Trained"
                subtitle="Total Time"
                value={`${totalHours}h`}
                icon={<Activity size={32} className="text-yellow-500" />}
                gradientFrom="#ac921d"
                gradientTo="#ece7ca"
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* LEFT COL: Chart & History */}
              <div className="lg:col-span-2 space-y-8">
                {/* Weight Trend Chart */}
                <div className="bg-[#1c1c1c] rounded-3xl p-8 border border-white/[0.03] shadow-lg relative">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-400/10 rounded-2xl text-yellow-400">
                        <TrendingUp size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">Weight Trend</h3>
                        <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider">Last 30 Days</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-4xl font-black text-white tracking-tighter">
                        {weightData[weightData.length -1].weight}
                      </span>
                      <span className="text-sm font-black text-yellow-500 ml-1">KG</span>
                    </div>
                  </div>

                  <div className="h-[300px] w-full">
                    <Line data={chartData} options={chartOptions as any} />
                  </div>
                </div>

                {/* History Log - WEIGHT ONLY */}
                <div className="bg-[#1c1c1c] rounded-3xl p-8 border border-white/[0.03] shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-neutral-800/50 rounded-2xl text-neutral-400">
                        <History size={20} />
                      </div>
                      <h3 className="text-xl font-bold text-white">History Log</h3>
                    </div>
                    {/* Toggle Button */}
                    <button 
                      onClick={() => setShowAllHistory(!showAllHistory)}
                      className="text-xs font-black uppercase tracking-widest text-yellow-500 hover:text-yellow-400 flex items-center gap-2 transition-colors"
                    >
                      {showAllHistory ? (
                        <><ChevronUp size={14} /> Show Less</>
                      ) : (
                        <><ChevronDown size={14} /> View Full History</>
                      )}
                    </button>
                  </div>

                  <div className="overflow-hidden rounded-2xl border border-white/[0.03]">
                    <table className="w-full text-left text-sm text-neutral-400">
                      <thead className="bg-[#262626] text-neutral-200 uppercase font-black text-[10px] tracking-widest">
                        <tr>
                          <th className="px-6 py-4">Date</th>
                          <th className="px-6 py-4">Weight</th>
                          <th className="px-6 py-4 text-right">Change</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.03] bg-[#171717]">
                        {displayedHistory.map((entry, idx, arr) => {
                          const prev = arr[idx + 1];
                          const change = prev ? Number((entry.weight - prev.weight).toFixed(1)) : 0;
                          
                          return (
                            <tr key={`${entry.date}-${idx}`} className="hover:bg-white/[0.02] transition-colors">
                              <td className="px-6 py-4 font-bold flex items-center gap-2">
                                <Calendar size={14} className="text-yellow-500/40" />
                                {entry.date}
                              </td>
                              <td className="px-6 py-4 text-white font-bold">{entry.weight} kg</td>
                              
                              <td className={`px-6 py-4 text-right font-black ${
                                change > 0 
                                  ? 'text-green-400' 
                                  : change < 0 
                                    ? 'text-red-400' 
                                    : 'text-neutral-600'
                              }`}>
                                {change > 0 ? '+' : ''}{change === 0 ? '-' : `${change} kg`}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT COL: Update Stats Form (Includes all inputs) */}
              <div className="bg-[#1c1c1c] rounded-3xl p-8 border border-white/[0.03] shadow-lg h-fit relative">
                <AnimatePresence>
                  {successMsg.active && successMsg.type === 'meas' && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                      className="absolute top-8 right-8 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
                    >
                      <CheckCircle2 size={14} /> Saved
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 bg-neutral-800/50 rounded-2xl text-white">
                    <Ruler size={22} />
                  </div>
                  <h3 className="text-xl font-bold text-white">Update Stats</h3>
                </div>

                <form onSubmit={saveMeasurements} className="space-y-6">
                  {/* Weight Input */}
                  <InputGroup 
                    icon={<Scale size={18} />}
                    label="Current Weight (kg)" 
                    id="weight" 
                    name="weight"
                    value={measurements.weight} 
                    onChange={handleMeasurementChange} 
                    highlight 
                  />
                  
                  <div className="h-px bg-white/[0.05] w-full" />
                  
                  {/* Chest Input (Updated Icon: Scaling) */}
                  <InputGroup 
                    icon={<Scaling size={18} />} 
                    label="Chest (cm)" 
                    id="chest" 
                    name="chest" 
                    value={measurements.chest} 
                    onChange={handleMeasurementChange} 
                  />
                  
                  {/* Waist Input (Updated Icon: Target) */}
                  <InputGroup 
                    icon={<Target size={18} />} 
                    label="Waist (cm)" 
                    id="waist" 
                    name="waist" 
                    value={measurements.waist} 
                    onChange={handleMeasurementChange} 
                  />
                  
                  {/* Arms Input (Updated Icon: BicepsFlexed) */}
                  <InputGroup 
                    icon={<BicepsFlexed size={18} />} 
                    label="Arms (cm)" 
                    id="arms" 
                    name="arms" 
                    value={measurements.arms} 
                    onChange={handleMeasurementChange} 
                  />

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full mt-4 bg-yellow-400 hover:bg-yellow-300 text-[#0a0a0a] font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(250,204,21,0.15)] transition-all uppercase tracking-wide text-sm"
                  >
                    <TrendingUp size={18} /> Update Log
                  </motion.button>
                </form>
              </div>
            </div>

            {/* BOTTOM: Personal Records */}
            <section className="bg-[#1c1c1c] rounded-3xl p-8 border border-white/[0.03] shadow-lg relative">
              <AnimatePresence>
                {successMsg.active && successMsg.type === 'pr' && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    className="absolute top-8 right-8 bg-green-500/10 text-green-400 border border-green-500/20 px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-2"
                  >
                    <CheckCircle2 size={14} /> Updated
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="mb-8">
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  <Activity className="text-yellow-400" /> Personal Records
                </h2>
              </div>
              
              <form onSubmit={async (e) => {
                e.preventDefault();
                if (!user) return;
                const today = new Date().toISOString().slice(0, 10);
                await saveUserPRs(user.id, { ...prs, date: today });
                triggerSuccess('pr');
              }}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <BigInput 
                    label="Bench Press" 
                    name="bench" 
                    value={prs.bench} 
                    onChange={(e: any) => setPrs({...prs, bench: e.target.value})} 
                  />
                  <BigInput 
                    label="Back Squat" 
                    name="squat" 
                    value={prs.squat} 
                    onChange={(e: any) => setPrs({...prs, squat: e.target.value})} 
                  />
                  <BigInput 
                    label="Deadlift" 
                    name="deadlift" 
                    value={prs.deadlift} 
                    onChange={(e: any) => setPrs({...prs, deadlift: e.target.value})} 
                  />
                </div>

                <div className="flex justify-end mt-8">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    onClick={() => setRecordRipple((r) => r + 1)}
                    className="relative overflow-hidden bg-[#262626] text-yellow-400 border border-yellow-400/20 font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-[#333] hover:border-yellow-400/40 transition-all"
                  >
                    <Dumbbell size={18} /> Save Records
                    <AnimatePresence>
                      {recordRipple > 0 && (
                        <motion.span
                          key={recordRipple}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 0.18, scale: 6 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.55, ease: "easeOut" }}
                          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-400 rounded-full w-6 h-6 pointer-events-none"
                        />
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </form>
            </section>

          </div>

          {/* --- Removed: Did You Know Section --- */}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}

// --- Components ---

const InputGroup = ({ label, id, name, value, onChange, highlight = false, icon }: any) => (
  <div className="flex flex-col gap-2">
    <label htmlFor={id} className={`text-[10px] uppercase tracking-widest font-black ${highlight ? 'text-yellow-500' : 'text-neutral-500'}`}>
      {label}
    </label>
    <div className="relative group">
      {icon && (
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-yellow-400 transition-colors pointer-events-none">
          {icon}
        </div>
      )}
      <input
        id={id}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className={`w-full bg-[#262626] border ${highlight ? 'border-yellow-500/30 focus:border-yellow-400' : 'border-white/5 focus:border-white/20'} rounded-2xl py-3.5 ${icon ? 'pl-12' : 'px-4'} pr-4 text-white font-bold placeholder-neutral-700 outline-none transition-all shadow-inner`}
      />
    </div>
  </div>
);

const BigInput = ({ label, name, value, onChange }: any) => (
  <div className="group bg-[#262626] border border-white/5 p-6 rounded-3xl focus-within:border-yellow-500/30 focus-within:ring-1 focus-within:ring-yellow-500/10 transition-all shadow-inner relative overflow-hidden">
    <div className="absolute inset-0 bg-yellow-400/0 group-focus-within:bg-yellow-400/[0.02] transition-colors pointer-events-none" />
    <label htmlFor={name} className="block text-neutral-500 text-[10px] font-black uppercase tracking-widest mb-3 group-focus-within:text-yellow-400 transition-colors">
      {label}
    </label>
    <div className="flex items-baseline gap-2">
      <input
        id={name}
        name={name}
        type="number"
        value={value}
        onChange={onChange}
        className="bg-transparent text-4xl font-black text-white w-full outline-none p-0 border-none placeholder-neutral-800 z-10"
      />
      <span className="text-neutral-600 font-black text-sm uppercase">KG</span>
    </div>
  </div>
);