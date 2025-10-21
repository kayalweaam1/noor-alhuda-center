import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TeacherStudents() {
  const { data: students, isLoading } = trpc.students.getByTeacher.useQuery();

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">طلابي</CardTitle>
          <CardDescription>قائمة الطلاب المرتبطين بحلقتك</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : (students?.length ?? 0) === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students!.map((s) => (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-emerald-200 bg-white">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center overflow-hidden">
                    { // @ts-ignore - plain img is fine in Vite app
                    s.userProfileImage ? (
                      <img src={s.userProfileImage as any} alt={s.userName ?? "طالب"} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white font-bold">{s.userName?.charAt(0) || "ط"}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-900 truncate">{s.userName || "غير محدد"}</p>
                      <Badge variant="outline" className="border-emerald-300">{(s as any).grade || "غير محدد"}</Badge>
                    </div>
                    <p className="text-xs text-gray-600">{s.userPhone || "-"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
