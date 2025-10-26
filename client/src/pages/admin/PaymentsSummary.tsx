import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CircleDollarSign, Users, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function PaymentsSummary() {
  const { data: payments, isLoading } = trpc.students.getTotalPayments.useQuery();
  const { data: students } = trpc.students.getAll.useQuery();

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600">جاري تحميل بيانات الدفعات...</p>
      </div>
    );
  }

  const totalAmount = Number(payments?.totalAmount || 0);
  const paidAmount = Number(payments?.paidAmount || 0);
  const unpaidAmount = Number(payments?.unpaidAmount || 0);
  const totalStudents = Number(payments?.totalStudents || 0);
  const paidStudents = Number(payments?.paidStudents || 0);
  const unpaidStudents = Number(payments?.unpaidStudents || 0);

  const paymentPercentage = totalStudents > 0 ? Math.round((paidStudents / totalStudents) * 100) : 0;

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Page Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center">
            <CircleDollarSign className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-emerald-900">ملخص الدفعات</h1>
            <p className="text-emerald-700 mt-1">متابعة المبالغ المحصلة من الطلاب</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-700">المبلغ الإجمالي</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                <CircleDollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-900 mb-2">
              {totalAmount.toLocaleString('ar-SA')} ₪
            </div>
            <CardDescription className="text-gray-600">
              إجمالي المبالغ المستحقة
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-700">المبلغ المحصل</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-900 mb-2">
              {paidAmount.toLocaleString('ar-SA')} ₪
            </div>
            <CardDescription className="text-gray-600">
              من {paidStudents} طالب دفع
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-orange-50">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-gray-700">المبلغ المتبقي</CardTitle>
              <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-white" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-red-900 mb-2">
              {unpaidAmount.toLocaleString('ar-SA')} ₪
            </div>
            <CardDescription className="text-gray-600">
              من {unpaidStudents} طالب لم يدفع
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Payment Progress */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">نسبة التحصيل</CardTitle>
          <CardDescription>نسبة الطلاب الذين دفعوا الرسوم</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">نسبة الدفع</span>
                <span className="text-2xl font-bold text-gray-900">{paymentPercentage}%</span>
              </div>
              <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 flex items-center justify-end px-4 ${
                    paymentPercentage >= 90
                      ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                      : paymentPercentage >= 70
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                      : paymentPercentage >= 50
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                      : 'bg-gradient-to-r from-red-500 to-orange-600'
                  }`}
                  style={{ width: `${paymentPercentage}%` }}
                >
                  <span className="text-white font-bold text-sm">
                    {paidStudents} من {totalStudents}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="text-center p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-600" />
                  <p className="text-sm font-semibold text-emerald-700">دفعوا</p>
                </div>
                <p className="text-3xl font-bold text-emerald-900">{paidStudents}</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <p className="text-sm font-semibold text-red-700">لم يدفعوا</p>
                </div>
                <p className="text-3xl font-bold text-red-900">{unpaidStudents}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Payment Details */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">تفاصيل الدفعات حسب الطالب</CardTitle>
          <CardDescription>قائمة بجميع الطلاب ومبالغهم</CardDescription>
        </CardHeader>
        <CardContent>
          {!students || students.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">لا يوجد طلاب مسجلون</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">الطالب</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">الصف</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">المربي</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">المبلغ</th>
                    <th className="text-right p-3 text-sm font-semibold text-gray-700">الحالة</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student: any) => (
                    <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="p-3">
                        <p className="font-medium text-gray-900">{student.userName}</p>
                        <p className="text-sm text-gray-600">{student.userPhone}</p>
                      </td>
                      <td className="p-3 text-gray-700">{student.grade || '-'}</td>
                      <td className="p-3 text-gray-700">{student.teacherName || '-'}</td>
                      <td className="p-3">
                        <span className="font-bold text-gray-900">
                          {(student.paymentAmount || 0).toLocaleString('ar-SA')} ₪
                        </span>
                      </td>
                      <td className="p-3">
                        {student.hasPaid ? (
                          <Badge className="bg-emerald-500">
                            <CheckCircle className="w-3 h-3 ml-1" />
                            تم الدفع
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500">
                            <XCircle className="w-3 h-3 ml-1" />
                            لم يدفع
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

