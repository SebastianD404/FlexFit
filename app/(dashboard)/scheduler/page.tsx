'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Sparkles, Save, AlertCircle, Heart, CalendarDays, Trophy, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { DaySelector } from '@/components/scheduler/DaySelector';
import { WorkoutPlanDisplay } from '@/components/scheduler/WorkoutPlan';
import { useWorkoutPlan, useExercises, useAuth } from '@/lib/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SchedulerInput } from '@/types';

export default function SchedulerPage() {
  const router = useRouter();
  const planRef = useRef<HTMLDivElement>(null);
  const { user, loading: authLoading } = useAuth();
  const { exercises, loading: exercisesLoading } = useExercises();
  const { currentPlan, generatePlan, savePlan, loading, error } = useWorkoutPlan(user?.id || '');

  const [input, setInput] = useState<Partial<SchedulerInput>>({
    availableDays: [],
    experience: 'beginner',
    goal: 'General Fitness',
    minutesPerSession: 60,
  });

  const [showRestDayWarning, setShowRestDayWarning] = useState(false);
  const [showNoDaySelected, setShowNoDaySelected] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const incrementMinutes = () => {
    setInput((prev) => ({ ...prev, minutesPerSession: (prev.minutesPerSession || 0) + 5 }));
  };

  const decrementMinutes = () => {
    setInput((prev) => ({ ...prev, minutesPerSession: Math.max(5, (prev.minutesPerSession || 0) - 5) }));
  };

  const handleGeneratePlan = async () => {
    if (!user) { setShowSignInModal(true); return; }
    if (!input.availableDays?.length) { setShowNoDaySelected(true); return; }
    if (input.availableDays.length === 7) { setShowRestDayWarning(true); return; }
    
    try {
      await generatePlan(input as SchedulerInput, exercises);
      setShowPlanModal(true);
    } catch (err) { console.error(err); }
  };

  const handleSavePlan = async () => {
    try {
      await savePlan();
      router.push('/workouts');
    } catch (err) { console.error(err); }
  };

  if (authLoading || exercisesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#121417' }}>
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mb-4 mx-auto" style={{ color: '#A69171' }} />
          <p className="text-sm font-bold uppercase tracking-widest" style={{ color: '#B0B0B0' }}>Loading</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      title="Workout Scheduler" 
      subtitle="Precision-engineered routines tailored to your schedule."
    >
      {/* GLOBAL STYLES FOR ANIMATIONS */}
      <style jsx global>{`
        @keyframes shimmer-sweep {
          0% { transform: translateX(-200%) skewX(-30deg); }
          100% { transform: translateX(300%) skewX(-30deg); }
        }
        @keyframes float-sparkle {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-8px) scale(1.3); }
        }
        /* DaySelector Hover Logic */
        .day-selector-container button:hover {
          box-shadow: 0 0 20px rgba(209, 180, 122, 0.5) !important;
          border-color: #D1B47A !important;
          transform: translateY(-2px);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8 pb-12 px-4 sm:px-6 lg:px-8 pt-8" style={{ backgroundColor: '#121417' }}>
        
        {/* Error Alert */}
        {error && (
          <div className="border p-4 rounded-xl flex items-center gap-3 animate-in fade-in" 
               style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)', color: '#E8E8E8' }}>
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* SECTION 1: AVAILABILITY */}
             <div className="rounded-[2rem] border p-8 shadow-2xl overflow-hidden relative group" 
               style={{ backgroundColor: '#1a1d21', borderColor: 'rgba(166, 145, 113, 0.15)' }}>
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(123, 167, 215, 0.1)' }}>
              <CalendarDays className="w-6 h-6" style={{ color: '#7BA7D7' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#A69171' }}>Select Available Days</h2>
              <p className="text-sm" style={{ color: '#B0B0B0' }}>Choose your active training window.</p>
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-black/20 border border-white/5 day-selector-container">
            <DaySelector onDaysSelect={(days) => setInput({ ...input, availableDays: days })} />
          </div>
        </div>

        {/* SECTION 2: PREFERENCES */}
        <div className="rounded-[2rem] border p-8 shadow-2xl" 
             style={{ backgroundColor: '#1a1d21', borderColor: 'rgba(166, 145, 113, 0.15)' }}>
          <div className="flex items-center gap-4 mb-10">
            <div className="p-3 rounded-xl" style={{ backgroundColor: 'rgba(166, 145, 113, 0.1)' }}>
              <Trophy className="w-6 h-6" style={{ color: '#A69171' }} />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: '#7BA7D7' }}>Training Parameters</h2>
              <p className="text-sm" style={{ color: '#B0B0B0' }}>Calibrate for your current fitness level.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Experience Dropdown */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#B0B0B0' }}>Experience Level</label>
              <Select value={input.experience} onValueChange={(v) => setInput({...input, experience: v as any})}>
                <SelectTrigger className="w-full h-14 bg-zinc-900/50 border border-white/10 text-[#E8E8E8] rounded-xl px-4 flex items-center justify-between transition-all duration-200 hover:border-[#A69171]/60 hover:bg-zinc-800/80 active:scale-[0.98] outline-none ring-0 focus:ring-1 focus:ring-[#A69171]/50 cursor-pointer">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121417] border-white/10 text-[#E8E8E8]">
                  <SelectItem value="beginner" className="cursor-pointer">Beginner</SelectItem>
                  <SelectItem value="intermediate" className="cursor-pointer">Intermediate</SelectItem>
                  <SelectItem value="advanced" className="cursor-pointer">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Goal Dropdown */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#B0B0B0' }}>Primary Goal</label>
              <Select value={input.goal} onValueChange={(v) => setInput({...input, goal: v as any})}>
                <SelectTrigger className="w-full h-14 bg-zinc-900/50 border border-white/10 text-[#E8E8E8] rounded-xl px-4 flex items-center justify-between transition-all duration-200 hover:border-[#A69171]/60 hover:bg-zinc-800/80 active:scale-[0.98] outline-none ring-0 focus:ring-1 focus:ring-[#A69171]/50 cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#121417] border-white/10 text-[#E8E8E8]">
                  <SelectItem value="strength" className="cursor-pointer">Strength</SelectItem>
                  <SelectItem value="muscle" className="cursor-pointer">Hypertrophy</SelectItem>
                  <SelectItem value="Fat loss" className="cursor-pointer">Fat Loss</SelectItem>
                  <SelectItem value="General Fitness" className="cursor-pointer">General Fitness</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Duration Input */}
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#B0B0B0' }}>Session Duration</label>
              <div className="relative">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#A69171' }} />
                  <input
                    type="number"
                    value={input.minutesPerSession}
                    onChange={(e) => setInput({ ...input, minutesPerSession: parseInt(e.target.value || '0') })}
                    className="w-full h-14 pl-12 pr-14 bg-zinc-900/50 border border-white/10 rounded-xl text-[#E8E8E8] outline-none transition-all duration-200 hover:border-[#A69171]/40 focus:border-[#A69171] font-bold no-spinner"
                  />
                  <span className="absolute right-12 top-1/2 -translate-y-1/2 text-sm font-bold" style={{ color: '#E8E8E8' }}>min</span>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                    <button onClick={incrementMinutes} type="button"
                            className="w-5 h-5 rounded-sm bg-zinc-800 text-[10px] text-[#E8E8E8] flex items-center justify-center hover:bg-[#A69171] hover:text-[#121417] active:scale-90 transition">
                      +
                    </button>
                    <button onClick={decrementMinutes} type="button"
                            className="w-5 h-5 rounded-sm bg-zinc-800 text-[10px] text-[#E8E8E8] flex items-center justify-center hover:bg-[#A69171] hover:text-[#121417] active:scale-90 transition">
                      −
                    </button>
                  </div>
                </div>
            </div>
          </div>

          {/* GENERATE BUTTON */}
          <button
            onClick={handleGeneratePlan}
            disabled={loading}
            className="w-full h-16 mt-12 rounded-xl relative overflow-hidden group shadow-xl transition-all duration-300 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: '#4A4338', cursor: loading ? 'default' : 'pointer' }}
          >
            {/* High-Intensity Shimmer Effect */}
            <div className="absolute inset-0 w-[100%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-[shimmer-sweep_1.2s_infinite] pointer-events-none" />
            
            <div className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300" 
                 style={{ background: 'linear-gradient(to right, #7BA7D7, #D1B47A)' }} />
            
            <div className="relative z-10 flex items-center justify-center gap-3 text-[#E8E8E8] font-black uppercase tracking-[0.25em] text-xs">
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Sparkles 
                  className="w-4 h-4 group-hover:animate-[float-sparkle_1.5s_infinite]" 
                  style={{ color: '#D1B47A' }} 
                />
              )}
              {loading ? 'Analyzing...' : 'Generate Workout'}
            </div>
          </button>
        </div>

        {/* RESULTS AREA (modal) */}
        <Dialog.Root open={showPlanModal} onOpenChange={setShowPlanModal}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
            <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-6xl p-8 rounded-[2rem] border text-left"
                            style={{ backgroundColor: '#121417', borderColor: 'rgba(123, 167, 215, 0.2)', maxHeight: '88vh', boxShadow: '0 30px 80px rgba(0,0,0,0.8)' }}>
              <Dialog.Title className="sr-only">Proposed Training Protocol</Dialog.Title>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-black uppercase tracking-tighter" style={{ color: '#E8E8E8' }}>Workout Plan</h3>
                <div className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-[#A69171]/30" 
                     style={{ backgroundColor: 'rgba(166, 145, 113, 0.1)', color: '#A69171' }}>
                  System Optimized
                </div>
              </div>

              <div className="overflow-y-auto pr-3 custom-scrollbar" style={{ maxHeight: 'calc(80vh - 180px)' }}>
                <WorkoutPlanDisplay plan={currentPlan?.plan ?? {}} />
              </div>

              <div className="mt-8 flex items-center justify-end gap-4">
                <button onClick={() => setShowPlanModal(false)}
                  className="px-6 py-3 rounded-xl bg-zinc-800/50 border border-white/5 text-xs font-bold uppercase tracking-widest transition hover:bg-zinc-800"
                  style={{ color: '#E8E8E8' }}>
                  Discard
                </button>

                <button onClick={handleSavePlan}
                        disabled={loading}
                        className="w-40 py-3 rounded-xl bg-[#A69171] text-xs font-black uppercase tracking-[0.2em] transition transform duration-150 ease-out hover:brightness-125 hover:scale-105 hover:shadow-2xl active:scale-95 shadow-lg"
                        style={{ color: '#121417', cursor: loading ? 'default' : 'pointer' }}>
                  {loading ? 'Saving...' : 'Save Workout'}
                </button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>

      {/* MODALS */}
      <AlertDialog.Root open={showRestDayWarning} onOpenChange={setShowRestDayWarning}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md" />
          <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-10 rounded-[2rem] border text-center"
                               style={{ backgroundColor: '#121417', borderColor: 'rgba(166, 145, 113, 0.2)' }}>
            <Heart className="w-12 h-12 mx-auto mb-6" style={{ color: '#7BA7D7' }} fill="currentColor" />
            <AlertDialog.Title className="text-2xl font-bold mb-4" style={{ color: '#E8E8E8' }}>Rest Day Required</AlertDialog.Title>
            <AlertDialog.Description className="mb-8 leading-relaxed text-sm" style={{ color: '#B0B0B0' }}>
              Training 7 days a week increases risk of injury. We recommend at least one day for recovery.
            </AlertDialog.Description>
            <AlertDialog.Cancel className="w-full py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-colors bg-[#4A4338] text-[#E8E8E8]">
              Adjust Schedule
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

      <Dialog.Root open={showSignInModal} onOpenChange={setShowSignInModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xl" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-12 rounded-[2.5rem] border text-center"
                 style={{ backgroundColor: '#121417', borderColor: '#A69171' }}>
            <div className="w-16 h-16 rounded-2xl mx-auto mb-8 flex items-center justify-center bg-gradient-to-br from-[#7BA7D7] to-[#A69171]">
              <Sparkles className="text-black w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight mb-4" style={{ color: '#E8E8E8' }}>Unlock Access</h2>
            <p className="mb-10 text-sm" style={{ color: '#B0B0B0' }}>Create an account to save and track your custom blueprints.</p>
            <a href="/login" className="block w-full py-4 rounded-xl font-black uppercase tracking-[0.2em] text-xs bg-[#A69171] text-[#121417] shadow-lg active:scale-95 transition-transform">
              Sign In
            </a>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <AlertDialog.Root open={showNoDaySelected} onOpenChange={setShowNoDaySelected}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/30" style={{ backdropFilter: 'none', WebkitBackdropFilter: 'none' }} />
          <AlertDialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-8 rounded-[1.5rem] border text-center"
                               style={{ backgroundColor: '#121417', borderColor: 'rgba(166, 145, 113, 0.12)' }}>
            <AlertCircle className="w-12 h-12 mx-auto mb-4" style={{ color: '#E8B75A' }} />
            <AlertDialog.Title className="text-lg font-bold mb-2 text-[#E8E8E8]">Select At Least One Day</AlertDialog.Title>
            <AlertDialog.Description className="mb-6 text-sm text-[#B0B0B0]">
              Please select at least one available day so we can generate a workout tailored to your schedule.
            </AlertDialog.Description>
            <AlertDialog.Cancel className="w-full py-3 rounded-xl font-bold uppercase tracking-widest text-xs bg-[#4A4338] text-[#E8E8E8]">
              Okay
            </AlertDialog.Cancel>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>

    </DashboardLayout>
  );
}