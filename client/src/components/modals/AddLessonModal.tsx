import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddLessonModalProps {
  open: boolean;
  onClose: () => void;
}

export function AddLessonModal({ open, onClose }: AddLessonModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [teacherId, setTeacherId] = useState("");

  const utils = trpc.useUtils();
  const { data: teachers } = trpc.teachers.getAll.useQuery();

  const createLesson = trpc.lessons.create.useMutation({
    onSuccess: () => {
      utils.lessons.getAll.invalidate();
      onClose();
      resetForm();
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setTeacherId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createLesson.mutate({
      title,
      description,
      date: new Date(date),
      teacherId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>إضافة درس جديد</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">عنوان الدرس</Label>
            <Input
              id="title"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="مثال: تفسير سورة البقرة"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">وصف الدرس</Label>
            <Textarea
              id="description"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="وصف مختصر للدرس..."
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="date">تاريخ الدرس</Label>
            <Input
              id="date"
              type="datetime-local"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="teacher">المربي</Label>
            <Select value={teacherId} onValueChange={setTeacherId} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر المربي" />
              </SelectTrigger>
              <SelectContent>
                {teachers?.map(teacher => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.userName || teacher.userPhone || teacher.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              إلغاء
            </Button>
            <Button type="submit" disabled={createLesson.isPending}>
              {createLesson.isPending ? "جاري الإضافة..." : "إضافة"}
            </Button>
          </div>

          {createLesson.error && (
            <p className="text-sm text-red-600">{createLesson.error.message}</p>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
}
