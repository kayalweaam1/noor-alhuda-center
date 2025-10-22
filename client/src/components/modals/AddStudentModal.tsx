import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddStudentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddStudentModal({ open, onOpenChange, onSuccess }: AddStudentModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+972");
  const [teacherId, setTeacherId] = useState("");
  const [halaqaClass, setHalaqaClass] = useState("");
  const [password, setPassword] = useState("");

  const { data: teachers } = trpc.teachers.getAll.useQuery();
  const createStudent = trpc.students.createWithUser.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة الطالب بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("فشل في إضافة الطالب: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setPhone("+972");
    setTeacherId("");
    setHalaqaClass("");
    setPassword("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !teacherId) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createStudent.mutate({
      name,
      phone,
      password: password || undefined,
      teacherId,
      grade: halaqaClass || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة طالب جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات الطالب الجديد
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم الطالب *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="أدخل اسم الطالب"
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
            <Label htmlFor="teacher">المربي المسؤول *</Label>
            <Select value={teacherId} onValueChange={setTeacherId} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر المربي" />
              </SelectTrigger>
              <SelectContent>
                {teachers?.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.userName || teacher.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">كلمة المرور (اختياري)</Label>
            <Input
              id="password"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="أدخل كلمة المرور"
              dir="ltr"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class">الحلقة/الصف</Label>
            <Input
              id="class"
              value={halaqaClass}
              onChange={(e) => setHalaqaClass(e.target.value)}
              placeholder="مثال: الحلقة الأولى"
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
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createStudent.isPending}
            >
              {createStudent.isPending ? "جاري الإضافة..." : "إضافة الطالب"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

