import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface SendAssistantNoteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  assistantId: string;
  assistantName: string;
  onSuccess?: () => void;
}

export default function SendAssistantNoteModal({ 
  open, 
  onOpenChange, 
  assistantId, 
  assistantName,
  onSuccess 
}: SendAssistantNoteModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(0);

  const createNote = trpc.assistantNotes.create.useMutation({
    onSuccess: () => {
      toast.success("تم إرسال الملاحظة بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("فشل في إرسال الملاحظة: " + error.message);
    },
  });

  const resetForm = () => {
    setTitle("");
    setContent("");
    setRating(0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createNote.mutate({
      assistantId,
      title,
      content,
      rating: rating > 0 ? rating : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إرسال ملاحظة وتقييم</DialogTitle>
          <DialogDescription>
            إلى المساعد: {assistantName}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">عنوان الملاحظة *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="مثال: ملاحظات حول الأداء اليوم"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">المحتوى *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب ملاحظاتك وتقييمك للمساعد..."
              rows={6}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>التقييم (اختياري)</Label>
            <div className="flex items-center gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i + 1)}
                  className="focus:outline-none transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      i < rating 
                        ? 'text-amber-500 fill-amber-500' 
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-gray-600 mr-2">
                  ({rating}/5)
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500">
              اضغط على النجوم لتحديد التقييم
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-white hover:bg-white"
              disabled={createNote.isPending}
            >
              {createNote.isPending ? "جاري الإرسال..." : "إرسال الملاحظة"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

