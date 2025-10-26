import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { X, Trash2, Save } from "lucide-react";

interface LessonEditModalProps {
  lesson: any;
  onClose: () => void;
  onSuccess: () => void;
}

export default function LessonEditModal({ lesson, onClose, onSuccess }: LessonEditModalProps) {
  const [title, setTitle] = useState(lesson.title || "");
  const [description, setDescription] = useState(lesson.description || "");
  const [date, setDate] = useState(lesson.date?.split('T')[0] || "");

  const utils = trpc.useContext();

  const updateMutation = trpc.lessons.update.useMutation({
    onSuccess: () => {
      utils.lessons.invalidate();
      onSuccess();
      onClose();
    },
  });

  const deleteMutation = trpc.lessons.delete.useMutation({
    onSuccess: () => {
      utils.lessons.invalidate();
      onSuccess();
      onClose();
    },
  });

  const handleUpdate = () => {
    if (!title || !date) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }

    updateMutation.mutate({
      id: lesson.id,
      title,
      description,
      date: new Date(date).toISOString(),
    });
  };

  const handleDelete = () => {
    if (confirm("هل أنت متأكد من حذف هذا الدرس؟")) {
      deleteMutation.mutate({ id: lesson.id });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">تعديل الدرس</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="title">عنوان الدرس *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: درس التجويد"
            />
          </div>

          <div>
            <Label htmlFor="description">الوصف</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف الدرس..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date">التاريخ *</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isLoading}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            حذف
          </Button>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={updateMutation.isLoading}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              حفظ التعديلات
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

