import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle, XCircle, CircleDollarSign, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { format } from "date-fns";

export default function PaymentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: students, refetch } = trpc.students.getAll.useQuery();
  
  // Mock payment status - in real app, this would come from database
  const [paymentStatus, setPaymentStatus] = useState<Record<string, boolean>>({});

  const filteredStudents = students?.filter((student) =>
    student.userName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const togglePaymentStatus = (studentId: string) => {
    setPaymentStatus(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
    toast.success("تم تحديث حالة الدفع");
  };

  const paidCount = useMemo(() => {
    return Object.values(paymentStatus).filter(Boolean).length;
  }, [paymentStatus]);

  const unpaidCount = useMemo(() => {
    return (students?.length || 0) - paidCount;
  }, [students, paidCount]);

  const totalAmount = useMemo(() => {
    return paidCount * 100; // Assuming 100 per student
  }, [paidCount]);

  const exportPaymentReport = () => {
    if (!students || students.length === 0) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }

    const data = students.map(student => ({
      name: student.userName || "غير محدد",
      phone: student.userPhone || "-",
      grade: student.grade || "غير محدد",
      paid: paymentStatus[student.id] ? "مدفوع" : "غير مدفوع",
      amount: paymentStatus[student.id] ? "100" : "0"
    }));

    const headers = ["الاسم", "الهاتف", "الحلقة", "الحالة", "المبلغ"];
    const csvContent = [
      headers.join(","),
      ...data.map(row => [
        row.name,
        row.phone,
        row.grade,
        row.paid,
        row.amount
      ].join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `payment_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    toast.success("تم تصدير تقرير الدفع");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <CircleDollarSign className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 mb-2">إجمالي الطلاب</p>
              <p className="text-3xl font-bold text-emerald-900">{students?.length || 0}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-green-700 mb-2">دفعوا</p>
              <p className="text-3xl font-bold text-green-900">{paidCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <XCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-red-700 mb-2">لم يدفعوا</p>
              <p className="text-3xl font-bold text-red-900">{unpaidCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <CircleDollarSign className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-2">المبلغ الإجمالي</p>
              <p className="text-3xl font-bold text-blue-900">{totalAmount} ₪</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl text-emerald-900">إدارة الدفع</CardTitle>
              <CardDescription>تتبع حالة دفع الطلاب</CardDescription>
            </div>
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={exportPaymentReport}
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير التقرير
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="البحث عن طالب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-emerald-200 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Payments Table */}
          <div className="rounded-lg border border-emerald-200 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-emerald-50">
                  <TableHead className="text-right font-bold text-emerald-900">الطالب</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">المربي</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الحلقة</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">رقم الهاتف</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">المبلغ</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الحالة</TableHead>
                  <TableHead className="text-right font-bold text-emerald-900">الإجراء</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => {
                  const isPaid = paymentStatus[student.id] || false;
                  return (
                    <TableRow key={student.id} className="hover:bg-emerald-50/50">
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                              {student.userName?.charAt(0) || 'ط'}
                            </span>
                          </div>
                          <div>
                            <p className="font-semibold">{student.userName || 'غير محدد'}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-emerald-600" />
                          <span className="text-sm">{student.teacherName || 'غير محدد'}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-emerald-300">
                          {student.grade || 'غير محدد'}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.userPhone || '-'}</TableCell>
                      <TableCell className="font-bold">100 ₪</TableCell>
                      <TableCell>
                        {isPaid ? (
                          <Badge className="bg-green-500">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            مدفوع
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500">
                            <XCircle className="w-3 h-3 ml-1" />
                            غير مدفوع
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={isPaid ? "outline" : "default"}
                          className={isPaid 
                            ? "border-red-200 text-red-600 hover:bg-red-50" 
                            : "bg-green-600 hover:bg-green-700 text-white"
                          }
                          onClick={() => togglePaymentStatus(student.id)}
                        >
                          {isPaid ? "إلغاء الدفع" : "تأكيد الدفع"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {filteredStudents?.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">لا توجد بيانات</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

