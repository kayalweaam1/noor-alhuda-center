import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TeacherEvaluations() {
  const { data: evaluations, isLoading } = trpc.evaluations.getByTeacher.useQuery();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">تقييماتي</CardTitle>
          <CardDescription>آخر التقييمات المسجلة لطلّابك</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : (evaluations?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات</div>
          ) : (
            <div className="space-y-3">
              {evaluations!.map((e) => (
                <div key={e.id} className="p-4 rounded-xl border border-emerald-200 bg-white">
                  <div className="flex justify-between">
                    <div className="font-semibold text-gray-900">{e.studentName || "طالب"}</div>
                    <div className="text-sm text-gray-600">{new Date(e.date).toLocaleDateString("ar-SA")}</div>
                  </div>
                  <div className="text-sm text-gray-700">الدرجة: {e.score ?? "-"}</div>
                  {e.feedback && <div className="text-sm text-gray-600 mt-1">{e.feedback}</div>}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
