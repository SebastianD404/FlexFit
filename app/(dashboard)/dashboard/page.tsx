'use client';

import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardCard } from '@/components/layout/DashboardCard';
import { FileText, Dumbbell, BarChart2, Rocket, Settings } from 'lucide-react';
import { getUserWorkoutPlans } from '@/lib/firebase/db';
import { WorkoutPlan } from '@/types';

// (Did You Know removed)

export default function DashboardPage() {
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [hasPlans, setHasPlans] = useState<boolean>(false);
  const [loadingPlans, setLoadingPlans] = useState<boolean>(true);
  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  
  // Statistics state
  const [totalWorkouts, setTotalWorkouts] = useState<number>(0);
  const [currentStreak, setCurrentStreak] = useState<number>(0);
  const [plansCreated, setPlansCreated] = useState<number>(0);
  const [hoursTrained, setHoursTrained] = useState<number>(0);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setHasPlans(false);
        setLoadingPlans(false);
        setWorkoutPlans([]);
        return;
      }

      setLoadingPlans(true);
      try {
        const plans = await getUserWorkoutPlans(user.id);
        const plansArray = Array.isArray(plans) ? plans : [];
        setWorkoutPlans(plansArray);
        setHasPlans(plansArray.length > 0);
        
        // Calculate statistics
        calculateStatistics(plansArray);
      } catch (err) {
        console.error('Failed to check user plans:', err);
        setHasPlans(false);
        setWorkoutPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    };

    load();
  }, [user?.id]);

  const calculateStatistics = (plans: WorkoutPlan[]) => {
    if (!plans || plans.length === 0) {
      setTotalWorkouts(0);
      setCurrentStreak(0);
      setPlansCreated(0);
      setHoursTrained(0);
      return;
    }

    // Plans Created - total number of plans
    setPlansCreated(plans.length);

    // Current Streak - get the highest streak from all plans
    const maxStreak = Math.max(...plans.map(p => p.streakCount || 0));
    setCurrentStreak(maxStreak);

    // Total Workouts - count completed workout days
    let totalCompletedWorkouts = 0;
    let totalMinutes = 0;

    plans.forEach(plan => {
      if (plan.exerciseStatus) {
        // Group exercises by day to count completed workout days
        const exercisesByDay: Record<string, string[]> = {};
        
        Object.keys(plan.plan).forEach(dayName => {
          exercisesByDay[dayName] = plan.plan[dayName].exercises.map(ex => ex.id);
        });

        // Count days where all exercises are completed
        Object.entries(exercisesByDay).forEach(([dayName, exerciseIds]) => {
          const allCompleted = exerciseIds.every(exId => 
            plan.exerciseStatus?.[exId]?.completed
          );
          
          if (allCompleted && exerciseIds.length > 0) {
            totalCompletedWorkouts++;
            
            // Estimate training time for completed workouts
            // Average time per exercise: sets * reps * 2 seconds per rep + 1 min rest between sets
            const exercises = plan.plan[dayName].exercises;
            exercises.forEach(ex => {
              // Rough estimate: each set takes about 2-3 minutes (exercise + rest)
              const estimatedMinutes = ex.sets * 2.5;
              totalMinutes += estimatedMinutes;
            });
          }
        });

        // Also count partially completed workout sessions
        // If user has completed any exercises, count them towards total time
        Object.entries(plan.exerciseStatus).forEach(([exId, status]) => {
          if (status.completed && status.timesCompleted) {
            // Find the exercise to get sets info
            for (const dayPlan of Object.values(plan.plan)) {
              const exercise = dayPlan.exercises.find(e => e.id === exId);
              if (exercise) {
                // Already counted in completed workouts, skip
                break;
              }
            }
          }
        });
      }
    });

    setTotalWorkouts(totalCompletedWorkouts);
    setHoursTrained(Math.round(totalMinutes / 60 * 10) / 10); // Round to 1 decimal
  };

  const quickActions = [
    {
      title: 'Create Plan',
      description: 'Generate your personalized workout schedule',
      href: '/scheduler',
      icon: FileText,
      color: 'bronze-1',
      bgImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80',
      requireAuth: true,
    },
    {
      title: 'My Workouts',
      description: 'View your saved workout plans',
      href: '/workouts',
      icon: Dumbbell,
      color: 'bronze-2',
      bgImage: '/myWorkouts.jpg',
      requireAuth: false,
    },
    {
      title: 'Progress',
      description: 'Track your fitness journey',
      href: '/progress',
      icon: BarChart2,
      color: 'bronze-3',
      bgImage: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80',
      requireAuth: true,
    },
  ];

  return (
    <DashboardLayout
      title={"Welcome, Crusher!"}
      subtitle="Ready to dominate your fitness goals? Your personalized workout journey starts here."
    >
      {/* SVG Gradient Definition */}
      <svg width="0" height="0" style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#E6C878', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#B8935E', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </svg>

      

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
        {quickActions.map((action, idx) => {
          const Icon = action.icon as React.ComponentType<any>;
          const handleClick = (e: React.MouseEvent) => {
            if (action.requireAuth && !user) {
              e.preventDefault();
              e.stopPropagation();
              setShowSignInModal(true);
            }
          };
          return (
            <a key={action.href} href={action.href} className="group" onClickCapture={handleClick}>
              <div
                className={`h-full cursor-pointer transform transition-all duration-500 ease-out relative overflow-hidden`} 
                style={{ 
                  minHeight: '320px',
                  borderRadius: '24px',
                  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                  e.currentTarget.style.boxShadow = '0 25px 60px rgba(196, 169, 98, 0.25), 0 15px 35px rgba(0, 0, 0, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  e.currentTarget.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
                }}
              >
                {/* Background Image */}
                <div 
                  className="absolute inset-0" 
                  style={{ 
                    backgroundImage: `url("${action.bgImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'brightness(0.7) contrast(1.1)',
                  }}
                ></div>
                {/* ...existing code... */}
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0, 0, 0, 0.95) 0%, rgba(0, 0, 0, 0.7) 40%, rgba(0, 0, 0, 0.3) 100%)' }}></div>
                <div className="absolute inset-0" style={{ 
                  border: '2px solid transparent',
                  borderRadius: '24px',
                  background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.4), rgba(184, 147, 94, 0.2)) border-box',
                  WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)',
                  WebkitMaskComposite: 'xor',
                  maskComposite: 'exclude',
                }}></div>
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ background: 'radial-gradient(circle at 50% 0%, rgba(230, 200, 120, 0.15) 0%, transparent 70%)' }}></div>
                <div className="flex flex-col h-full relative z-10 p-8">
                  <div 
                    className="mb-auto p-5 w-fit rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3" 
                    style={{ 
                      background: 'rgba(0, 0, 0, 0.6)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: '1px solid rgba(230, 200, 120, 0.3)',
                      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
                    }}
                  >
                    <Icon className="w-10 h-10" style={{ color: '#E6C878', strokeWidth: 2, filter: 'drop-shadow(0 2px 8px rgba(230, 200, 120, 0.5))' }} />
                  </div>
                  <div className="mt-auto">
                    <h3 
                      className="text-2xl font-black mb-3 uppercase tracking-tight transition-all duration-300 group-hover:tracking-wide" 
                      style={{ 
                        color: '#FFFFFF',
                        textShadow: '0 2px 12px rgba(0, 0, 0, 0.8), 0 0 40px rgba(230, 200, 120, 0.3)',
                        fontWeight: 900,
                      }}
                    >
                      {action.title}
                    </h3>
                    <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255, 255, 255, 0.8)', lineHeight: '1.6', textShadow: '0 1px 4px rgba(0, 0, 0, 0.8)' }}>
                      {action.description}
                    </p>
                    <div 
                      className="inline-flex items-center gap-3 px-6 py-3 rounded-full transition-all duration-300 group-hover:gap-5 group-hover:pr-5"
                      style={{ 
                        background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.15), rgba(184, 147, 94, 0.15))',
                        backdropFilter: 'blur(10px)',
                        WebkitBackdropFilter: 'blur(10px)',
                        border: '1px solid rgba(230, 200, 120, 0.3)',
                      }}
                    >
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#E6C878', textShadow: '0 1px 3px rgba(0, 0, 0, 0.5)' }}>Explore</span>
                      <span className="transition-transform duration-500 group-hover:translate-x-2 text-lg" style={{ color: '#E6C878' }}>→</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Sign In Modal (restored styled version) */}
      <Dialog.Root open={showSignInModal} onOpenChange={setShowSignInModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 animate-fade-in" />
          <Dialog.Content className="fixed z-50 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm p-0 rounded-2xl shadow-2xl border-none outline-none">
            <div className="relative overflow-hidden group" style={{
              background: '#070707',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              padding: '1.5rem 1.25rem',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8)',
            }}>
              <div className="absolute inset-0 opacity-40 pointer-events-none" style={{
                background: 'radial-gradient(ellipse at top left, rgba(230, 200, 120, 0.15) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(184, 147, 94, 0.12) 0%, transparent 50%), radial-gradient(circle at center, rgba(138, 111, 61, 0.08) 0%, transparent 70%)'
              }}></div>
              <div className="absolute -right-16 -top-16 w-40 h-40 opacity-25 blur-3xl animate-pulse transition-all duration-700 group-hover:opacity-40 group-hover:scale-110"
                style={{ background: 'radial-gradient(circle, #E6C878 0%, #B8935E 50%, transparent 75%)', animationDuration: '4s' }}></div>
              <div className="absolute -left-16 -bottom-16 w-44 h-44 opacity-20 blur-3xl animate-pulse transition-all duration-700 group-hover:opacity-30 group-hover:scale-110"
                style={{ background: 'radial-gradient(circle, #8a6f3d 0%, #5a4a32 50%, transparent 75%)', animationDuration: '5s', animationDelay: '1s' }}></div>
              <div className="mb-5 p-4 rounded-xl relative transform transition-all duration-300 mx-auto w-fit" style={{
                background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.18) 0%, rgba(184, 147, 94, 0.12) 100%)',
                border: '1.5px solid rgba(230, 200, 120, 0.35)',
                boxShadow: '0 10px 40px rgba(230, 200, 120, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 0 30px rgba(230, 200, 120, 0.1)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
              }}>
                <AlertCircle className="w-12 h-12 mx-auto" style={{ color: '#E6C878', filter: 'drop-shadow(0 2px 8px rgba(230, 200, 120, 0.4))' }} />
              </div>
              <Dialog.Title className="text-xl md:text-2xl font-black mb-2 uppercase tracking-wide text-center" style={{
                letterSpacing: '0.03em',
                textShadow: '0 4px 16px rgba(0, 0, 0, 0.6), 0 0 30px rgba(230, 200, 120, 0.3)',
                background: 'linear-gradient(135deg, #FFFFFF 0%, #E6C878 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                Sign In Required
              </Dialog.Title>
              <Dialog.Description className="text-base md:text-lg leading-relaxed mb-6 px-4 text-center" style={{ color: 'rgba(230, 200, 120, 0.9)', textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>
                You need to be logged in to create a workout plan.
              </Dialog.Description>
              <div className="flex justify-center">
                <a
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-4 py-3 font-bold text-sm uppercase tracking-widest transition-all duration-200"
                  style={{
                    background: 'linear-gradient(180deg, rgba(230,200,120,0.16), rgba(184,147,94,0.12))',
                    color: '#E6C878',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.03)',
                    borderRadius: '8px',
                    width: 110,
                    height: 48,
                    textAlign: 'center'
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 36px rgba(0,0,0,0.7)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.6)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  Sign in
                </a>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group cursor-default transition-all duration-500" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(230, 200, 120, 0.3)', borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(135deg, rgba(255, 253, 250, 0.98) 0%, rgba(250, 245, 238, 0.95) 100%), linear-gradient(180deg, #E6C878 0%, #B8935E 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 200, 120, 0.25), 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 transition-opacity duration-500 group-hover:opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #E6C878 0%, #B8935E 40%, transparent 70%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-8" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(230, 200, 120, 0.04) 10px, rgba(230, 200, 120, 0.04) 11px)' }}></div>
          <h3 className="text-xs font-bold mb-1 uppercase tracking-wider relative z-10" style={{ color: '#3d342b', letterSpacing: '0.12em', fontWeight: 600 }}>Total Workouts</h3>
          <p className="text-[10px] mb-5 uppercase tracking-widest relative z-10" style={{ color: '#9a8872' }}>Completed</p>
          <div className="text-5xl font-black relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900, filter: 'drop-shadow(0 4px 12px rgba(196, 169, 98, 0.2))' }}>
            {loadingPlans ? '...' : totalWorkouts}
          </div>
        </div>
        <div className="group cursor-default transition-all duration-500" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(230, 200, 120, 0.3)', borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(135deg, rgba(255, 253, 250, 0.98) 0%, rgba(250, 245, 238, 0.95) 100%), linear-gradient(180deg, #E6C878 0%, #B8935E 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 200, 120, 0.25), 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 transition-opacity duration-500 group-hover:opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #E6C878 0%, #B8935E 40%, transparent 70%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-8" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(230, 200, 120, 0.04) 10px, rgba(230, 200, 120, 0.04) 11px)' }}></div>
          <h3 className="text-xs font-bold mb-1 uppercase tracking-wider relative z-10" style={{ color: '#3d342b', letterSpacing: '0.12em', fontWeight: 600 }}>Current Streak</h3>
          <p className="text-[10px] mb-5 uppercase tracking-widest relative z-10" style={{ color: '#9a8872' }}>Days Active</p>
          <div className="text-5xl font-black relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900, filter: 'drop-shadow(0 4px 12px rgba(196, 169, 98, 0.2))' }}>
            {loadingPlans ? '...' : currentStreak}
          </div>
        </div>
        <div className="group cursor-default transition-all duration-500" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(230, 200, 120, 0.3)', borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(135deg, rgba(255, 253, 250, 0.98) 0%, rgba(250, 245, 238, 0.95) 100%), linear-gradient(180deg, #E6C878 0%, #B8935E 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 200, 120, 0.25), 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 transition-opacity duration-500 group-hover:opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #E6C878 0%, #B8935E 40%, transparent 70%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-8" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(230, 200, 120, 0.04) 10px, rgba(230, 200, 120, 0.04) 11px)' }}></div>
          <h3 className="text-xs font-bold mb-1 uppercase tracking-wider relative z-10" style={{ color: '#3d342b', letterSpacing: '0.12em', fontWeight: 600 }}>Plans Created</h3>
          <p className="text-[10px] mb-5 uppercase tracking-widest relative z-10" style={{ color: '#9a8872' }}>Saved Schedules</p>
          <div className="text-5xl font-black relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900, filter: 'drop-shadow(0 4px 12px rgba(196, 169, 98, 0.2))' }}>
            {loadingPlans ? '...' : plansCreated}
          </div>
        </div>
        <div className="group cursor-default transition-all duration-500" style={{ backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', border: '1px solid rgba(230, 200, 120, 0.3)', borderLeft: '4px solid transparent', backgroundImage: 'linear-gradient(135deg, rgba(255, 253, 250, 0.98) 0%, rgba(250, 245, 238, 0.95) 100%), linear-gradient(180deg, #E6C878 0%, #B8935E 100%)', backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box', padding: '2rem', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)', borderRadius: '16px', position: 'relative', overflow: 'hidden' }} onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 12px 40px rgba(230, 200, 120, 0.25), 0 4px 16px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 1)'} onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(230, 200, 120, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8)'}>
          <div className="absolute bottom-0 right-0 w-32 h-32 opacity-15 transition-opacity duration-500 group-hover:opacity-30 blur-3xl" style={{ background: 'radial-gradient(circle, #E6C878 0%, #B8935E 40%, transparent 70%)' }}></div>
          <div className="absolute top-0 left-0 w-full h-full opacity-8" style={{ background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(230, 200, 120, 0.04) 10px, rgba(230, 200, 120, 0.04) 11px)' }}></div>
          <h3 className="text-xs font-bold mb-1 uppercase tracking-wider relative z-10" style={{ color: '#3d342b', letterSpacing: '0.12em', fontWeight: 600 }}>Hours Trained</h3>
          <p className="text-[10px] mb-5 uppercase tracking-widest relative z-10" style={{ color: '#9a8872' }}>Total Time</p>
          <div className="text-5xl font-black relative z-10 transition-transform duration-500 group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', fontWeight: 900, filter: 'drop-shadow(0 4px 12px rgba(196, 169, 98, 0.2))' }}>
            {loadingPlans ? '...' : `${hoursTrained}h`}
          </div>
        </div>
      </div>

      {/* Call to Action removed */}

      </DashboardLayout>
  );
}