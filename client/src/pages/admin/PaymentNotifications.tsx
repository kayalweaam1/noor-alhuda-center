import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Send, Users, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";

export default function PaymentNotificationsPage() {
  const { data: students, refetch } = trpc.students.getAll.useQuery();
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  
  // Filter unpaid students
  const unpaidStudents = students?.filter(s => !s.hasPaid) || [];
  
  const toggleStudent = (studentId: string) => {
    setSelectedStudents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(studentId)) {
        newSet.delete(studentId);
      } else {
        newSet.add(studentId);
      }
      return newSet;
    });
  };
  
  const toggleAll = () => {
    if (selectedStudents.size === unpaidStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(unpaidStudents.map(s => s.id)));
    }
  };
  
  const sendNotifications = async () => {
    if (selectedStudents.size === 0) {
      toast.error("يرجى اختيار طالب واحد على الأقل");
      return;
    }
    
    setSending(true);
    
    // Simulate sending notifications
    // In a real app, this would call an API to send SMS/WhatsApp/Email
    setTimeout(() => {
      toast.success(`تم إرسال ${selectedStudents.size} إشعار بنجاح`);
      setSelectedStudents(new Set());
      setSending(false);
    }, 2000);
  };
  
  const sendToAll = async () => {
    if (unpaidStudents.length === 0) {
      toast.error("لا يوجد طلاب لم يدفعوا");
      return;
    }
    
    setSending(true);
    
    // Simulate sending notifications to all
    setTimeout(() => {
      toast.success(`تم إرسال ${unpaidStudents.length} إشعار لجميع الطلاب`);
      setSelectedStudents(new Set());
      setSending(false);
    }, 2000);
  };
  
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">إشعارات الدفع</h1>
          <p className="text-gray-600 mt-1">إرسال تذكيرات للطلاب الذين لم يدفعوا</p>
        </div>
        <Button
          onClick={sendToAll}
          disabled={sending || unpaidStudents.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Send className="w-4 h-4 ml-2" />
          إرسال للجميع
        </Button>
      </div>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              إجمالي الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {students?.length || 0}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              لم يدفعوا
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {unpaidStudents.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              يحتاجون إلى تذكير
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              محدد للإرسال
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {selectedStudents.size}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              من {unpaidStudents.length} طالب
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Unpaid Students Table */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            الطلاب الذين لم يدفعوا
          </CardTitle>
          <CardDescription>
            اختر الطلاب الذين تريد إرسال تذكير لهم
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unpaidStudents.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-lg font-semibold text-gray-700">رائع! جميع الطلاب دفعوا</p>
              <p className="text-gray-500 mt-2">لا يوجد طلاب يحتاجون إلى تذكير</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedStudents.size === unpaidStudents.length}
                    onCheckedChange={toggleAll}
                  />
                  <span className="text-sm font-medium">تحديد الكل</span>
                </div>
                <Button
                  onClick={sendNotifications}
                  disabled={sending || selectedStudents.size === 0}
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700"
                >
                  <Send className="w-4 h-4 ml-2" />
                  إرسال للمحددين ({selectedStudents.size})
                </Button>
              </div>
              
              <div className="rounded-lg border border-emerald-200 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-emerald-50">
                      <TableHead className="text-right font-bold text-emerald-900 w-12"></TableHead>
                      <TableHead className="text-right font-bold text-emerald-900">الطالب</TableHead>
                      <TableHead className="text-right font-bold text-emerald-900">المربي</TableHead>
                      <TableHead className="text-right font-bold text-emerald-900">رقم الهاتف</TableHead>
                      <TableHead className="text-right font-bold text-emerald-900">المبلغ</TableHead>
                      <TableHead className="text-right font-bold text-emerald-900">الحالة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {unpaidStudents.map((student) => (
                      <TableRow key={student.id} className="hover:bg-emerald-50/50">
                        <TableCell>
                          <Checkbox
                            checked={selectedStudents.has(student.id)}
                            onCheckedChange={() => toggleStudent(student.id)}
                          />
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                              <span className="text-white font-bold text-sm">
                                {student.userName?.charAt(0) || 'ط'}
                              </span>
                            </div>
                            <span>{student.userName || 'غير محدد'}</span>
                          </div>
                        </TableCell>
                        <TableCell>{student.teacherName || 'غير محدد'}</TableCell>
                        <TableCell>
                          {student.userPhone ? (
                            <a 
                              href={`tel:${student.userPhone}`}
                              className="text-emerald-600 hover:underline"
                            >
                              {student.userPhone}
                            </a>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="font-bold text-red-600">
                          {student.paymentAmount || 0} ₪
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-red-500">
                            <AlertCircle className="w-3 h-3 ml-1" />
                            لم يدفع
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Notification Template Info */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-600" />
            نموذج الإشعار
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white p-4 rounded-lg border border-blue-200">
            <p className="text-gray-700 leading-relaxed">
              السلام عليكم ورحمة الله وبركاته،
              <br />
              <br />
              عزيزي ولي أمر الطالب/ة <strong>[اسم الطالب]</strong>،
              <br />
              <br />
              نذكركم بضرورة دفع رسوم الحلقة للشهر الحالي بقيمة <strong>[المبلغ] ₪</strong>.
              <br />
              <br />
              للاستفسار يرجى التواصل مع إدارة المركز.
              <br />
              <br />
              جزاكم الله خيراً
              <br />
              مركز نور الهدى
            </p>
          </div>
          <p className="text-sm text-gray-600 mt-3">
            <strong>ملاحظة:</strong> سيتم إرسال الإشعار عبر الرسائل النصية (SMS) أو واتساب حسب الإعدادات المتاحة.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

