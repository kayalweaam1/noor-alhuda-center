import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddTeacherModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddTeacherModal({ open, onOpenChange, onSuccess }: AddTeacherModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+972");
  const [halaqaName, setHalaqaName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const createTeacher = trpc.teachers.createWithUser.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المربي بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("فشل في إضافة المربي: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setPhone("+972");
    setHalaqaName("");
    setSpecialization("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createTeacher.mutate({
      name,
      phone,
      halaqaName: halaqaName || undefined,
      specialization: specialization || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مربي جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات المربي الجديد
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
              disabled={createTeacher.isPending}
            >
              {createTeacher.isPending ? "جاري الإضافة..." : "إضافة المربي"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

