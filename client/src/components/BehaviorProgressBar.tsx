import { Progress } from "@/components/ui/progress";

interface BehaviorProgressBarProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function BehaviorProgressBar({ score, size = "md", showLabel = true }: BehaviorProgressBarProps) {
  const getColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-yellow-500";
    if (score >= 20) return "bg-orange-500";
    return "bg-red-500";
  };

  const getLabel = (score: number) => {
    if (score >= 80) return "ممتاز";
    if (score >= 60) return "جيد جداً";
    if (score >= 40) return "جيد";
    if (score >= 20) return "يحتاج تحسين";
    return "ضعيف";
  };

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-3",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 relative">
        <div className={`w-full ${heights[size]} bg-gray-200 rounded-full overflow-hidden`}>
          <div
            className={`${heights[size]} ${getColor(score)} transition-all duration-300 rounded-full`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      {showLabel && (
        <span className={`${textSizes[size]} font-semibold ${getColor(score).replace('bg-', 'text-')} min-w-[60px]`}>
          {getLabel(score)}
        </span>
      )}
    </div>
  );
}

