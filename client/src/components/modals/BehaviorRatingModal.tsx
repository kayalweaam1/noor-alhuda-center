import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, ThumbsUp, ThumbsDown, Meh } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BehaviorRatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  studentName: string;
}

const RATING_OPTIONS = [
  { value: 100, label: "ممتاز جداً", icon: Star, color: "text-green-600", bgColor: "bg-green-100" },
  { value: 80, label: "جيد جداً", icon: ThumbsUp, color: "text-blue-600", bgColor: "bg-blue-100" },
  { value: 60, label: "جيد", icon: Meh, color: "text-yellow-600", bgColor: "bg-yellow-100" },
  { value: 40, label: "يحتاج تحسين", icon: ThumbsDown, color: "text-orange-600", bgColor: "bg-orange-100" },
  { value: 20, label: "ضعيف", icon: ThumbsDown, color: "text-red-600", bgColor: "bg-red-100" },
];

export default function BehaviorRatingModal({ isOpen, onClose, studentId, studentName }: BehaviorRatingModalProps) {
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [feedback, setFeedback] = useState("");

  const utils = trpc.useUtils();
  const createEvaluationMutation = trpc.evaluations.create.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ التقييم بنجاح");
      utils.evaluations.invalidate();
      utils.students.invalidate();
      onClose();
      setSelectedRating(null);
      setFeedback("");
    },
    onError: (error) => {
      toast.error("فشل حفظ التقييم: " + error.message);
    },
  });

  const handleSubmit = () => {
    if (selectedRating === null) {
      toast.error("الرجاء اختيار تقييم");
      return;
    }

    createEvaluationMutation.mutate({
      studentId,
      score: selectedRating,
      feedback: feedback || undefined,
      evaluationType: "تقييم سلوكي",
      date: new Date().toISOString(),
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center">
            تقييم سلوك الطالب: {studentName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-3">
            {RATING_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = selectedRating === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedRating(option.value)}
                  className={`
                    flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                    ${isSelected 
                      ? `${option.bgColor} border-current ${option.color}` 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className={`w-6 h-6 ${isSelected ? option.color : 'text-gray-400'}`} />
                  <span className={`font-semibold ${isSelected ? option.color : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                  <span className={`mr-auto text-sm ${isSelected ? option.color : 'text-gray-500'}`}>
                    {option.value}%
                  </span>
                </button>
              );
            })}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              ملاحظات (اختياري)
            </label>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="أضف ملاحظات حول سلوك الطالب..."
              className="min-h-[100px]"
            />
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={selectedRating === null || createEvaluationMutation.isPending}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              {createEvaluationMutation.isPending ? "جاري الحفظ..." : "حفظ التقييم"}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              إلغاء
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

