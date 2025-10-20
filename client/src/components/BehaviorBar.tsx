interface BehaviorBarProps {
  score: number; // 0-100
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export default function BehaviorBar({ score, size = "md", showLabel = true }: BehaviorBarProps) {
  // Clamp score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, score));
  
  // Determine color based on score
  const getColor = (score: number) => {
    if (score >= 80) return { bg: "bg-green-500", text: "text-green-700", label: "ممتاز" };
    if (score >= 60) return { bg: "bg-yellow-500", text: "text-yellow-700", label: "جيد" };
    if (score >= 40) return { bg: "bg-orange-500", text: "text-orange-700", label: "مقبول" };
    return { bg: "bg-red-500", text: "text-red-700", label: "ضعيف" };
  };

  const color = getColor(clampedScore);
  
  // Size classes
  const sizeClasses = {
    sm: "h-2",
    md: "h-4",
    lg: "h-6"
  };

  return (
    <div className="w-full">
      <div className={`w-full ${sizeClasses[size]} bg-gray-200 rounded-full overflow-hidden`}>
        <div
          className={`${color.bg} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clampedScore}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center mt-1">
          <span className={`text-sm font-medium ${color.text}`}>
            {color.label}
          </span>
          <span className="text-sm text-gray-600">
            {clampedScore}/100
          </span>
        </div>
      )}
    </div>
  );
}

