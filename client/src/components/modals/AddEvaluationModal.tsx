import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AddEvaluationModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddEvaluationModal({ open, onClose }: AddEvaluationModalProps) {
  const [studentId, setStudentId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [score, setScore] = useState('');
  const [feedback, setFeedback] = useState('');
  const [evaluationType, setEvaluationType] = useState('');
  const [behaviorScore, setBehaviorScore] = useState('');

  const utils = trpc.useUtils();
  const { data: students } = trpc.students.getAll.useQuery();
  const { data: lessons } = trpc.lessons.getAll.useQuery();

  const createEvaluation = trpc.evaluations.create.useMutation({
    onSuccess: () => {
      utils.evaluations.getAll.invalidate();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setStudentId('');
    setLessonId('');
    setScore('');
    setFeedback('');
    setEvaluationType('');
    setBehaviorScore('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createEvaluation.mutate({
      id: `eval_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      studentId,
      lessonId: lessonId || undefined,
      score: parseInt(score),
      feedback,
      evaluationType: evaluationType || undefined,
      date: new Date(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة تقييم جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="student">الطالب</Label>
            <Select value={studentId} onValueChange={setStudentId} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الطالب" />
              </SelectTrigger>
              <SelectContent>
                {students?.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.userName || student.userPhone || student.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="lesson">الدرس (اختياري)</Label>
            <Select value={lessonId} onValueChange={setLessonId}>
              <SelectTrigger>
                <SelectValue placeholder="اختر الدرس" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">بدون درس محدد</SelectItem>
                {lessons?.map((lesson) => (
                  <SelectItem key={lesson.id} value={lesson.id}>
                    {lesson.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="score">الدرجة (من 100)</Label>
            <Input
              id="score"
              type="number"
              min="0"
              max="100"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="مثال: 85"
              required
            />
          </div>

          <div>
            <Label htmlFor="evaluationType">نوع التقييم</Label>
            <Select value={evaluationType} onValueChange={setEvaluationType}>
              <SelectTrigger>
                <SelectValue placeholder="اختر نوع التقييم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="تسميع">تسميع</SelectItem>
                <SelectItem value="اختبار">اختبار</SelectItem>
                <SelectItem value="تقييم شفهي">تقييم شفهي</SelectItem>
                <SelectItem value="واجب">واجب</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="feedback">ملاحظات</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="ملاحظات حول أداء الطالب..."
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createEvaluation.isPending}>
              {createEvaluation.isPending ? 'جاري الإضافة...' : 'إضافة'}
            </Button>
          </div>

          {createEvaluation.error && (
            <p className="text-sm text-red-600">
              {createEvaluation.error.message}
            </p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}

