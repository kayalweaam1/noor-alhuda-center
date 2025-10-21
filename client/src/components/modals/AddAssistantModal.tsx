import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AddAssistantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export default function AddAssistantModal({
  open,
  onOpenChange,
  onSuccess,
}: AddAssistantModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+972");
  const [halaqaName, setHalaqaName] = useState("");

  const createAssistant = trpc.assistants.createWithUser.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة المساعد بنجاح");
      resetForm();
      onOpenChange(false);
      onSuccess?.();
    },
    onError: (error: any) => {
      toast.error("فشل في إضافة المساعد: " + error.message);
    },
  });

  const resetForm = () => {
    setName("");
    setPhone("+972");
    setHalaqaName("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !phone || !halaqaName) {
      toast.error("يرجى ملء جميع الحقول المطلوبة");
      return;
    }

    createAssistant.mutate({
      name,
      phone,
      halaqaName,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>إضافة مساعد جديد</DialogTitle>
          <DialogDescription>
            أدخل بيانات المساعد وحدد الحلقة التابع لها
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">اسم المساعد *</Label>
            <Input
              id="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="أدخل اسم المساعد"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">رقم الهاتف *</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="+972501234567"
              dir="ltr"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="halaqa">اسم الحلقة *</Label>
            <Input
              id="halaqa"
              value={halaqaName}
              onChange={e => setHalaqaName(e.target.value)}
              placeholder="مثال: حلقة الصف الثالث"
              required
            />
            <p className="text-xs text-gray-500">
              سيتمكن المربي في نفس الحلقة من إرسال ملاحظات وتقييمات للمساعد
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
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={createAssistant.isPending}
            >
              {createAssistant.isPending ? "جاري الإضافة..." : "إضافة المساعد"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
