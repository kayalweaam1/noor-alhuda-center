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
  const [grade, setGrade] = useState("");
  const [specialization, setSpecialization] = useState<"تربية" | "تحفيظ" | "تربية وتحفيظ" | "">("");
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
    setGrade("");
    setSpecialization("");
    setPassword("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !teacherId || !grade || !specialization) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createStudent.mutate({
      name,
      phone,
      password: password || undefined,
      teacherId,
      grade: grade || undefined,
      specialization: specialization || undefined,
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
            <Label htmlFor="grade">الصف (الجيل) *</Label>
            <Select value={grade} onValueChange={setGrade} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الصف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="الثالث">الثالث</SelectItem>
                <SelectItem value="الرابع">الرابع</SelectItem>
                <SelectItem value="الخامس">الخامس</SelectItem>
                <SelectItem value="السادس">السادس</SelectItem>
                <SelectItem value="السابع">السابع</SelectItem>
                <SelectItem value="الثامن">الثامن</SelectItem>
                <SelectItem value="التاسع">التاسع</SelectItem>
                <SelectItem value="العاشر">العاشر</SelectItem>
                <SelectItem value="الحادي عشر">الحادي عشر</SelectItem>
                <SelectItem value="الثاني عشر">الثاني عشر</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialization">التخصص *</Label>
            <Select value={specialization} onValueChange={(value: any) => setSpecialization(value)} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر التخصص" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="تربية">تربية</SelectItem>
                <SelectItem value="تحفيظ">تحفيظ</SelectItem>
                <SelectItem value="تربية وتحفيظ">تربية وتحفيظ</SelectItem>
              </SelectContent>
            </Select>
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

