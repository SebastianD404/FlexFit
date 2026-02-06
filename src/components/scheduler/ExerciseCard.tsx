'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Loader2, AlertCircle, RefreshCw, ChevronDown, X } from 'lucide-react';
import { Exercise } from '@/types';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Button } from '@/components/ui/button';
import exercisesData from '@/data/exercises.json';

interface ExerciseCardProps {
  exercise: Exercise;
  dayName: string;
  isCompleted?: boolean;
  onMarkComplete?: () => Promise<void>;
  onUnmark?: () => Promise<void>;
  onChangeExercise?: (newExercise: Exercise) => Promise<void>;
  onAddExercise?: (newExercise: Exercise) => Promise<void>;
  onDeleteExercise?: () => Promise<void>;
  workoutId: string;
}

interface GroupedData {
  [muscleGroup: string]: {
    [targetMuscle: string]: Exercise[];
  };
}

export function ExerciseCard({
  exercise,
  dayName,
  isCompleted = false,
  onMarkComplete,
  onUnmark,
  onChangeExercise,
  onAddExercise,
  onDeleteExercise,
  workoutId,
}: ExerciseCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [modalMode, setModalMode] = useState<'change' | 'add'>('change');
  const [groupedExercises, setGroupedExercises] = useState<GroupedData>({});
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  useEffect(() => {
    // When onAddExercise is passed (triggered by day header button), open modal in add mode
    if (onAddExercise) {
      setModalMode('add');
      setShowAlternatives(true);
    }
  }, [onAddExercise]);

  useEffect(() => {
    // Group exercises by muscle group then target muscle
    const grouped = (exercisesData as Exercise[]).reduce((acc, ex) => {
      const group = ex.muscleGroup || 'other';
      const target = ex.targetMuscle || 'general';
      if (!acc[group]) acc[group] = {};
      if (!acc[group][target]) acc[group][target] = [];
      acc[group][target].push(ex);
      return acc;
    }, {} as GroupedData);
    setGroupedExercises(grouped);
  }, []);

  const handleMarkComplete = async () => {
    if (isCompleted && onUnmark) {
      // Unmark if already completed
      try {
        setLoading(true);
        await onUnmark();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    } else if (!isCompleted && onMarkComplete) {
      // Mark as complete
      try {
        setLoading(true);
        await onMarkComplete();
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSelectAlternative = async (newExercise: Exercise) => {
    if (modalMode === 'add') {
      if (!onAddExercise) return;
    } else if (!onChangeExercise) {
      return;
    }
    try {
      setLoading(true);
      setError(null);
      if (modalMode === 'add' && onAddExercise) {
        await onAddExercise(newExercise);
      } else if (onChangeExercise) {
        await onChangeExercise(newExercise);
      }
      setShowAlternatives(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty === 1) return 'Beginner';
    if (difficulty === 2) return 'Intermediate';
    if (difficulty === 3) return 'Advanced';
    return 'Unknown';
  };

  const getDifficultyColor = (difficulty: number) => {
    if (difficulty === 1) return 'bg-emerald-600/30 text-emerald-300 border-emerald-600/30';
    if (difficulty === 2) return 'bg-amber-600/30 text-amber-300 border-amber-600/30';
    return 'bg-rose-600/30 text-rose-300 border-rose-600/30';
  };

  const formatTargetMuscle = (target: string) => {
    return target
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const capitalizeGroup = (group: string) => {
    return group.charAt(0).toUpperCase() + group.slice(1);
  };

  const toggleGroup = (group: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(group)) {
      newExpanded.delete(group);
    } else {
      newExpanded.add(group);
    }
    setExpandedGroups(newExpanded);
  };

  return (
    <div
      className="rounded-xl p-5 border flex flex-col gap-3 transition-all duration-300 relative overflow-hidden group"
      style={{
        background: isCompleted 
          ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.08) 0%, rgba(184, 147, 94, 0.12) 100%)' 
          : 'linear-gradient(135deg, rgba(26, 26, 26, 0.6) 0%, rgba(20, 20, 30, 0.7) 100%)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        borderColor: isCompleted ? 'rgba(230, 200, 120, 0.4)' : 'rgba(196, 169, 98, 0.15)',
        boxShadow: isCompleted 
          ? '0 4px 16px rgba(230, 200, 120, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)' 
          : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = isCompleted ? 'rgba(230, 200, 120, 0.6)' : 'rgba(196, 169, 98, 0.3)';
        e.currentTarget.style.boxShadow = isCompleted 
          ? '0 8px 24px rgba(230, 200, 120, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.08)'
          : '0 4px 16px rgba(196, 169, 98, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isCompleted ? 'rgba(230, 200, 120, 0.4)' : 'rgba(196, 169, 98, 0.15)';
        e.currentTarget.style.boxShadow = isCompleted 
          ? '0 4px 16px rgba(230, 200, 120, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
          : '0 2px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.03)';
      }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'radial-gradient(circle at top right, rgba(196, 169, 98, 0.05) 0%, transparent 60%)' }}></div>
      
      <div className="flex justify-between items-start gap-3 relative z-10">
        <div className="flex-1">
          <h4 className="text-lg font-bold mb-1" style={{ color: '#FFFFFF', letterSpacing: '0.01em' }}>{exercise.name}</h4>
          <p className="text-sm" style={{ color: '#A0A0A0' }}>
            <span style={{ color: '#E6C878' }}>{exercise.muscleGroup}</span> • {exercise.sets}x{exercise.reps}
          </p>
          {exercise.equipment && exercise.equipment.length > 0 && (
            <p className="text-xs mt-2 flex items-center gap-1.5" style={{ color: '#888888' }}>
              <span className="w-1 h-1 rounded-full" style={{ background: '#E6C878' }}></span>
              Equipment: {exercise.equipment.join(', ')}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onDeleteExercise && (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="hover:bg-red-500/10"
              style={{ color: '#FCA5A5' }}
              onClick={onDeleteExercise}
              aria-label="Delete exercise"
              disabled={loading}
            >
              <X className="w-5 h-5" />
            </Button>
          )}
          {isCompleted && (
            <div className="flex-shrink-0 mt-1 p-2 rounded-lg" style={{ background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.15) 0%, rgba(184, 147, 94, 0.2) 100%)' }}>
              <CheckCircle className="w-5 h-5" style={{ color: '#E6C878' }} />
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap relative z-10">
        <button
          onClick={handleMarkComplete}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: isCompleted 
              ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.2) 0%, rgba(184, 147, 94, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(196, 169, 98, 0.15) 0%, rgba(230, 200, 120, 0.2) 100%)',
            color: '#FFFFFF',
            border: `1px solid ${isCompleted ? 'rgba(230, 200, 120, 0.3)' : 'rgba(196, 169, 98, 0.2)'}`,
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = isCompleted 
                ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.3) 0%, rgba(184, 147, 94, 0.35) 100%)'
                : 'linear-gradient(135deg, rgba(196, 169, 98, 0.25) 0%, rgba(230, 200, 120, 0.3) 100%)';
              e.currentTarget.style.borderColor = isCompleted ? 'rgba(230, 200, 120, 0.5)' : 'rgba(196, 169, 98, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = isCompleted 
              ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.2) 0%, rgba(184, 147, 94, 0.25) 100%)'
              : 'linear-gradient(135deg, rgba(196, 169, 98, 0.15) 0%, rgba(230, 200, 120, 0.2) 100%)';
            e.currentTarget.style.borderColor = isCompleted ? 'rgba(230, 200, 120, 0.3)' : 'rgba(196, 169, 98, 0.2)';
          }}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
          {isCompleted ? 'Unmark' : 'Mark Done'}
        </button>

        <button
          onClick={() => {
            setModalMode('change');
            setShowAlternatives(true);
          }}
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{
            background: 'linear-gradient(135deg, rgba(100, 100, 110, 0.15) 0%, rgba(120, 120, 130, 0.2) 100%)',
            color: '#C0C0C0',
            border: '1px solid rgba(160, 160, 170, 0.2)',
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 100, 110, 0.25) 0%, rgba(120, 120, 130, 0.3) 100%)';
              e.currentTarget.style.borderColor = 'rgba(160, 160, 170, 0.4)';
              e.currentTarget.style.color = '#FFFFFF';
            }
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 100, 110, 0.15) 0%, rgba(120, 120, 130, 0.2) 100%)';
            e.currentTarget.style.borderColor = 'rgba(160, 160, 170, 0.2)';
            e.currentTarget.style.color = '#C0C0C0';
          }}
        >
          <RefreshCw className="w-4 h-4" />
          Change
        </button>
      </div>

      {error && (
        <div className="flex gap-2 text-sm p-3 rounded-lg relative z-10" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5' }}>
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Premium Exercise Selector Modal */}
      <AlertDialog.Root open={showAlternatives} onOpenChange={setShowAlternatives}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 bg-black/90 backdrop-blur-md z-40" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-4xl rounded-2xl shadow-2xl max-h-[80vh] flex flex-col z-50 overflow-hidden" style={{ background: 'linear-gradient(135deg, rgba(38, 38, 38, 0.96) 0%, rgba(28, 28, 40, 0.96) 100%)', backdropFilter: 'blur(26px)', WebkitBackdropFilter: 'blur(26px)', border: '2px solid rgba(230, 200, 120, 0.35)', boxShadow: '0 18px 50px rgba(230, 200, 120, 0.25)' }}>
            {/* Header */}
            <div className="px-6 py-4 border-b relative overflow-hidden" style={{ borderColor: 'rgba(230, 200, 120, 0.35)', background: 'linear-gradient(135deg, rgba(230, 200, 120, 0.12) 0%, rgba(184, 147, 94, 0.08) 100%)' }}>
              <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at top left, rgba(230, 200, 120, 0.2) 0%, transparent 70%)' }}></div>
              <AlertDialog.Title className="text-3xl font-black uppercase tracking-wide relative z-10 mb-2" style={{ background: 'linear-gradient(135deg, #E6C878 0%, #B8935E 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                {modalMode === 'add' ? 'Add an Exercise' : 'Choose an Exercise'}
              </AlertDialog.Title>
              <p className="text-sm relative z-10" style={{ color: '#C0C0C0' }}>
                {modalMode === 'add' ? 'Select an exercise to add below' : 'Select a replacement from any muscle group below'} • {Object.values(groupedExercises).reduce((sum, targets) => sum + Object.values(targets).reduce((s, exs) => s + exs.length, 0), 0)} exercises available
              </p>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4" style={{ background: 'linear-gradient(to bottom, rgba(42, 42, 42, 0.55) 0%, rgba(32, 32, 44, 0.6) 100%)' }}>
              {Object.entries(groupedExercises).map(([muscleGroup, targets]) => (
                <div key={muscleGroup} className="space-y-3">
                  {/* Muscle Group Header */}
                  <button
                    onClick={() => toggleGroup(muscleGroup)}
                    className="w-full flex items-center justify-between px-5 py-3.5 rounded-xl transition-all group shadow-lg"
                    style={{ 
                      background: expandedGroups.has(muscleGroup) 
                        ? 'linear-gradient(135deg, rgba(155, 139, 111, 0.95) 0%, rgba(139, 115, 85, 0.9) 100%)' 
                        : 'linear-gradient(135deg, rgba(245, 242, 236, 0.95) 0%, rgba(230, 226, 218, 0.9) 100%)', 
                      border: expandedGroups.has(muscleGroup) 
                        ? '2px solid rgba(196, 169, 98, 0.85)' 
                        : '1.5px solid rgba(196, 169, 98, 0.45)'
                    }}
                    onMouseEnter={(e) => {
                      if (!expandedGroups.has(muscleGroup)) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255, 252, 246, 0.98) 0%, rgba(240, 236, 228, 0.95) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(196, 169, 98, 0.6)';
                      }
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(230, 200, 120, 0.2)';
                    }}
                    onMouseLeave={(e) => {
                      if (!expandedGroups.has(muscleGroup)) {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(245, 242, 236, 0.95) 0%, rgba(230, 226, 218, 0.9) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(196, 169, 98, 0.45)';
                      } else {
                        e.currentTarget.style.background = 'linear-gradient(135deg, rgba(155, 139, 111, 0.95) 0%, rgba(139, 115, 85, 0.9) 100%)';
                        e.currentTarget.style.borderColor = 'rgba(196, 169, 98, 0.85)';
                      }
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <h3 className="text-base font-black uppercase tracking-wider" style={{ color: expandedGroups.has(muscleGroup) ? '#FFFFFF' : '#3B2F1E', textShadow: expandedGroups.has(muscleGroup) ? '0 1px 2px rgba(0, 0, 0, 0.4)' : '0 1px 2px rgba(255, 255, 255, 0.4)' }}>
                      {capitalizeGroup(muscleGroup)}
                    </h3>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedGroups.has(muscleGroup) ? 'rotate-180' : ''
                      }`}
                      style={{ color: expandedGroups.has(muscleGroup) ? '#E6C878' : '#6B6B6B' }}
                    />
                  </button>

                  {/* Muscle Group Content */}
                  {expandedGroups.has(muscleGroup) && (
                    <div className="space-y-3 ml-2">
                      {Object.entries(targets).map(([targetMuscle, exercises]) => (
                        <div key={targetMuscle} className="space-y-2">
                          {/* Target Muscle Sub-header */}
                          <h4 className="text-sm font-bold px-4 py-3 rounded-lg border-l-3" style={{ color: '#E6C878', background: 'linear-gradient(90deg, rgba(230, 200, 120, 0.22) 0%, rgba(34, 34, 34, 0.45) 100%)', borderColor: 'rgba(230, 200, 120, 0.65)', borderLeftWidth: '3px' }}>
                            {formatTargetMuscle(targetMuscle)}
                          </h4>

                          {/* Exercises Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                            {exercises.map((ex) => (
                              <button
                                key={ex.id}
                                onClick={() => handleSelectAlternative(ex)}
                                disabled={loading || ex.id === exercise.id}
                                className={`p-4 text-left rounded-xl border transition-all ${
                                  ex.id === exercise.id
                                    ? 'cursor-not-allowed opacity-60'
                                    : ''
                                } disabled:opacity-50`}
                                style={{
                                  background: ex.id === exercise.id 
                                    ? 'linear-gradient(135deg, rgba(230, 200, 120, 0.25) 0%, rgba(184, 147, 94, 0.2) 100%)'
                                    : 'linear-gradient(135deg, rgba(40, 40, 40, 0.65) 0%, rgba(30, 30, 42, 0.7) 100%)',
                                  borderColor: ex.id === exercise.id 
                                    ? 'rgba(230, 200, 120, 0.6)'
                                    : 'rgba(100, 100, 110, 0.3)',
                                }}
                                onMouseEnter={(e) => {
                                  if (ex.id !== exercise.id && !loading) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(230, 200, 120, 0.22) 0%, rgba(184, 147, 94, 0.16) 100%)';
                                    e.currentTarget.style.borderColor = 'rgba(230, 200, 120, 0.5)';
                                    e.currentTarget.style.transform = 'translateY(-2px)';
                                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(230, 200, 120, 0.15)';
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (ex.id !== exercise.id) {
                                    e.currentTarget.style.background = 'linear-gradient(135deg, rgba(40, 40, 40, 0.65) 0%, rgba(30, 30, 42, 0.7) 100%)';
                                    e.currentTarget.style.borderColor = 'rgba(100, 100, 110, 0.3)';
                                                                      e.currentTarget.style.transform = 'translateY(0)';
                                                                      e.currentTarget.style.boxShadow = 'none';
                                  }
                                }}
                              >
                                <div className="flex justify-between items-start gap-2 mb-2">
                                  <h5 className="text-sm font-bold flex-1" style={{ color: '#FFFFFF' }}>{ex.name}</h5>
                                  {ex.id === exercise.id && (
                                    <span className="text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-bold uppercase tracking-wider" style={{ background: 'rgba(230, 200, 120, 0.25)', color: '#E6C878', border: '1px solid rgba(230, 200, 120, 0.5)' }}>
                                      Current
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs mb-3" style={{ color: '#888888' }}>
                                  {ex.sets}x{ex.reps} • {Array.isArray(ex.equipment) ? ex.equipment.join(', ') || 'Bodyweight' : 'Bodyweight'}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${getDifficultyColor(ex.difficulty)}`}>
                                    {getDifficultyLabel(ex.difficulty || 1)}
                                  </span>
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 px-6 py-4 border-t backdrop-blur-sm flex justify-center" style={{ background: 'linear-gradient(to top, rgba(38, 38, 38, 0.98) 0%, rgba(28, 28, 40, 0.95) 100%)', borderColor: 'rgba(230, 200, 120, 0.35)' }}>
              <AlertDialog.Cancel asChild>
                <button className="px-8 py-3 rounded-lg font-semibold uppercase tracking-wider transition-all text-xs shadow-lg" style={{ background: 'linear-gradient(135deg, rgba(100, 100, 110, 0.25) 0%, rgba(120, 120, 130, 0.3) 100%)', color: '#FFFFFF', border: '1.5px solid rgba(160, 160, 170, 0.4)' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 100, 110, 0.35) 0%, rgba(120, 120, 130, 0.4) 100%)'; e.currentTarget.style.borderColor = 'rgba(160, 160, 170, 0.6)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'linear-gradient(135deg, rgba(100, 100, 110, 0.25) 0%, rgba(120, 120, 130, 0.3) 100%)'; e.currentTarget.style.borderColor = 'rgba(160, 160, 170, 0.4)'; }}>
                  Close
                </button>
              </AlertDialog.Cancel>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </div>
  );
}
