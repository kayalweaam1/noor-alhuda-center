import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Student {
  id: string;
  userId: string;
  halaqaName: string | null;
  parentPhone: string | null;
  address: string | null;
  notes: string | null;
}

interface EditStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  onSuccess?: () => void;
}

export default function EditStudentModal({ open, onOpenChange, student, onSuccess }: EditStudentModalProps) {
  const [halaqaName, setHalaqaName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (student) {
      setHalaqaName(student.halaqaName || "");
      setParentPhone(student.parentPhone || "");
      setAddress(student.address || "");
      setNotes(student.notes || "");
    }
  }, [student]);

  const updateStudent = trpc.students.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات الطالب بنجاح");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("فشل في تحديث بيانات الطالب: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!student) {
      toast.error("لم يتم تحديد الطالب");
      return;
    }

    updateStudent.mutate({
      id: student.id,
      grade: halaqaName || undefined, // Using grade field for now
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات الطالب</DialogTitle>
          <DialogDescription>
            قم بتحديث معلومات الطالب
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="halaqaName">اسم الحلقة</Label>
            <Input
              id="halaqaName"
              value={halaqaName}
              onChange={(e) => setHalaqaName(e.target.value)}
              placeholder="أدخل اسم الحلقة"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="parentPhone">رقم هاتف ولي الأمر</Label>
            <Input
              id="parentPhone"
              type="tel"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
              placeholder="+972501234567"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">العنوان</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="أدخل العنوان"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">ملاحظات</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أدخل ملاحظات إضافية"
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              إلغاء
            </Button>
            <Button
              type="submit"
              className="bg-white hover:bg-white"
              disabled={updateStudent.isPending}
            >
              {updateStudent.isPending ? "جاري التحديث..." : "تحديث البيانات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

