import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AdminAssistants() {
  const { data: assistants, refetch, isLoading } = trpc.assistants.getAll.useQuery();
  const deleteMutation = trpc.assistants.delete.useMutation();

  const handleDelete = async (id: string) => {
    if (!confirm("هل تريد حذف هذا المساعد؟")) return;
    await deleteMutation.mutateAsync({ id });
    refetch();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">المساعدون</CardTitle>
          <CardDescription>إدارة المساعدين</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12 text-gray-500">جاري التحميل...</div>
          ) : !assistants || assistants.length === 0 ? (
            <div className="text-center py-12 text-gray-500">لا توجد بيانات</div>
          ) : (
            <div className="space-y-2">
              {assistants.map((a) => (
                <div key={a.id} className="flex items-center justify-between p-3 rounded-xl border border-emerald-200 bg-white">
                  <div>
                    <div className="font-semibold text-gray-900">{a.userName || "مساعد"}</div>
                    <div className="text-sm text-gray-600">حلقة: {a.halaqaName || "-"}</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleDelete(a.id)}>حذف</Button>
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
