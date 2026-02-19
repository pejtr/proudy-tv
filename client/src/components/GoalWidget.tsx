import { useEffect, useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, DollarSign, Users } from 'lucide-react';

interface GoalWidgetProps {
  streamerId: number;
  className?: string;
}

export default function GoalWidget({ streamerId, className = '' }: GoalWidgetProps) {
  const { data: goal, refetch } = trpc.goals.getActive.useQuery({ streamerId });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (goal) {
      const percentage = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
      setProgress(percentage);
      
      // Refetch every 10 seconds to update progress
      const interval = setInterval(() => {
        refetch();
      }, 10000);
      
      return () => clearInterval(interval);
    }
  }, [goal, refetch]);

  if (!goal || !goal.showOnStream) return null;

  const isSubGoal = goal.type === 'sub_goal';
  const Icon = isSubGoal ? Users : DollarSign;
  const unit = isSubGoal ? 'subs' : 'coins';

  return (
    <Card 
      className={`p-4 bg-background/95 backdrop-blur-sm border-2 ${className}`}
          style={{ borderColor: goal.widgetColor || '#8b5cf6' }}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div 
          className="p-2 rounded-lg"
          style={{ backgroundColor: `${goal.widgetColor}20` }}
        >
            <Icon className="w-5 h-5" style={{ color: goal.widgetColor || '#8b5cf6' }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-bold text-sm truncate">{goal.title}</h3>
          </div>

          {/* Description */}
          {goal.description && (
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
              {goal.description}
            </p>
          )}

          {/* Progress Bar */}
          <div className="space-y-1">
            <Progress 
              value={progress} 
              className="h-2"
              style={{
                // @ts-ignore
                '--progress-background': goal.widgetColor,
              }}
            />
            
            {/* Progress Text */}
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">
                {goal.currentValue} / {goal.targetValue} {unit}
              </span>
              <span 
                className="font-bold"
                style={{ color: goal.widgetColor || '#8b5cf6' }}
              >
                {progress.toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Celebration Animation (when goal is reached) */}
      {progress >= 100 && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
      )}
    </Card>
  );
}
