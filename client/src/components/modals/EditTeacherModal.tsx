import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface EditTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teacher: any;
  onSuccess?: () => void;
}

export default function EditTeacherModal({ open, onOpenChange, teacher, onSuccess }: EditTeacherModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [halaqaName, setHalaqaName] = useState("");
  const [specialization, setSpecialization] = useState("");

  // Update form when teacher changes
  useEffect(() => {
    if (teacher) {
      setName(teacher.userName || "");
      setPhone(teacher.userPhone || "");
      setHalaqaName(teacher.halaqaName || "");
      setSpecialization(teacher.specialization || "");
    }
  }, [teacher]);

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث بيانات المربي بنجاح");
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("فشل في تحديث المربي: " + error.message);
    },
  });

  const updateTeacher = trpc.teachers.update.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    try {
      // Update user info
      await updateUser.mutateAsync({
        userId: teacher.userId,
        name,
        phone,
        email: teacher.userEmail || "",
        role: "teacher",
      });

      // Update teacher-specific info
      await updateTeacher.mutateAsync({
        id: teacher.id,
        halaqaName: halaqaName || undefined,
        specialization: specialization || undefined,
      });
    } catch (error) {
      // Error handling is done in mutation callbacks
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل بيانات المربي</DialogTitle>
          <DialogDescription>
            تحديث معلومات المربي
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المربي *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم المربي"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+972501234567"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="halaqa">اسم الحلقة</Label>
            <Input
              id="halaqa"
              value={halaqaName}
              onChange={(e) => setHalaqaName(e.target.value)}
              placeholder="مثال: حلقة الصف الثالث"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">التخصص</Label>
            <Textarea
              id="specialization"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="مثال: تحفيظ القرآن، التجويد"
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
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={updateUser.isPending || updateTeacher.isPending}
            >
              {updateUser.isPending || updateTeacher.isPending ? "جاري التحديث..." : "حفظ التغييرات"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

