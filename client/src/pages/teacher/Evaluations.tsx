import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";
import { AddEvaluationModal } from "@/components/modals/AddEvaluationModal";

export default function TeacherEvaluations() {
  const [open, setOpen] = useState(false);
  const { data: evaluations } = trpc.evaluations.getAll.useQuery();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Award className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-emerald-900">التقييمات</CardTitle>
                <CardDescription>إدارة التقييمات وإضافة جديد</CardDescription>
              </div>
            </div>
            <Button onClick={() => setOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">إضافة تقييم</Button>
          </div>
        </CardHeader>
        <CardContent>
          {!evaluations || evaluations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد تقييمات بعد</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {evaluations.map((e: any) => (
                <Card key={e.id} className="border-emerald-200">
                  <CardHeader>
                    <CardTitle className="text-base">الطالب: {e.studentId}</CardTitle>
                    <CardDescription>الدرجة: {e.score ?? "-"}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{e.feedback || "بدون ملاحظات"}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AddEvaluationModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
