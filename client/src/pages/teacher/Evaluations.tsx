import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Star, Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";

export default function TeacherEvaluations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<number | null>(null);
  const [evaluationType, setEvaluationType] = useState<"recitation" | "behavior" | "memorization">("recitation");
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { data: user } = trpc.auth.me.useQuery();
  const { data: students, refetch: refetchStudents } = trpc.students.list.useQuery();
  const { data: evaluations, refetch: refetchEvaluations } = trpc.evaluations.list.useQuery();

  const createEvaluation = trpc.evaluations.create.useMutation({
    onSuccess: () => {
      toast.success("تم إضافة التقييم بنجاح");
      refetchEvaluations();
      setOpenDialog(false);
      setSelectedStudent(null);
      setNotes("");
      setRating(5);
    },
    onError: (error: any) => {
      toast.error("فشل في إضافة التقييم: " + error.message);
    },
  });

  const handleSubmitEvaluation = () => {
    if (!selectedStudent) {
      toast.error("يرجى اختيار طالب");
      return;
    }

    createEvaluation.mutate({
      studentId: selectedStudent,
      type: evaluationType,
      rating,
      notes,
    });
  };

  const filteredStudents = students?.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEvaluationTypeLabel = (type: string) => {
    switch (type) {
      case "recitation":
        return "تلاوة";
      case "behavior":
        return "سلوك";
      case "memorization":
        return "حفظ";
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">التقييمات</h1>
          <p className="text-gray-600 mt-2">إدارة تقييمات الطلاب</p>
        </div>

        <Dialog open={openDialog} onOpenChange={setOpenDialog}>
          <DialogTrigger asChild>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="ml-2 h-4 w-4" />
              إضافة تقييم
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>إضافة تقييم جديد</DialogTitle>
              <DialogDescription>قم بتقييم أداء الطالب</DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>الطالب *</Label>
                <Select
                  value={selectedStudent?.toString()}
                  onValueChange={(value) => setSelectedStudent(parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الطالب" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredStudents?.map((student) => (
                      <SelectItem key={student.id} value={student.id.toString()}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>نوع التقييم *</Label>
                <Select
                  value={evaluationType}
                  onValueChange={(value: any) => setEvaluationType(value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recitation">تلاوة</SelectItem>
                    <SelectItem value="memorization">حفظ</SelectItem>
                    <SelectItem value="behavior">سلوك</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>التقييم (من 10) *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value))}
                  />
                  <div className="flex gap-1">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${
                          i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>ملاحظات</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أضف ملاحظات حول التقييم..."
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOpenDialog(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleSubmitEvaluation}
                  className="bg-emerald-600 hover:bg-emerald-700"
                  disabled={createEvaluation.isPending}
                >
                  {createEvaluation.isPending ? "جاري الإضافة..." : "إضافة التقييم"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* البحث والفلترة */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* جدول التقييمات */}
      <Card>
        <CardHeader>
          <CardTitle>سجل التقييمات</CardTitle>
          <CardDescription>
            جميع التقييمات المسجلة ({evaluations?.length || 0})
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الطالب</TableHead>
                <TableHead className="text-right">نوع التقييم</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">الملاحظات</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {evaluations && evaluations.length > 0 ? (
                evaluations.map((evaluation: any) => (
                  <TableRow key={evaluation.id}>
                    <TableCell className="font-medium">
                      {students?.find((s) => s.id === evaluation.studentId)?.name || "غير معروف"}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getEvaluationTypeLabel(evaluation.type)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{evaluation.rating}/10</span>
                        <div className="flex gap-0.5">
                          {[...Array(10)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${
                                i < evaluation.rating
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {evaluation.notes || "-"}
                    </TableCell>
                    <TableCell>
                      {new Date(evaluation.createdAt).toLocaleDateString("ar-EG")}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    لا توجد تقييمات حتى الآن
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

