import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Phone, Mail, Calendar, GraduationCap, CircleDollarSign, CheckCircle, XCircle, Upload } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

// Placeholder for file upload utility
const uploadFile = async (file: File, studentId: string) => {
  // Mock upload for now, implementation depends on backend storage
  console.log(`Uploading file for student ${studentId}: ${file.name}`);
  // In a real app, this would call an API endpoint to upload the file
  return `/uploads/students/${studentId}/profile.jpg`; 
};

export default function StudentProfile() {
  const [match, params] = useRoute("/admin/students/:studentId");
  const studentId = params?.studentId;
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const { data: student, isLoading, error, refetch } = trpc.students.getById.useQuery(
    { id: studentId! },
    { enabled: !!studentId }
  );

  const updatePaymentMutation = trpc.students.updatePaymentStatus.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث حالة الدفع بنجاح");
      refetch();
    },
    onError: (error: any) => {
      toast.error("فشل تحديث حالة الدفع: " + error.message);
    }
  });

  const updatePaymentAmountMutation = trpc.students.updatePaymentAmount.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث المبلغ بنجاح");
      refetch();
    },
    onError: (error: any) => {
      toast.error("فشل تحديث المبلغ: " + error.message);
    }
  });

  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  if (isLoading) return <div className="p-6 text-center">جاري تحميل بيانات الطالب...</div>;
  if (error) return <div className="p-6 text-center text-red-600">حدث خطأ: {error.message}</div>;
  if (!student) return <div className="p-6 text-center">لم يتم العثور على الطالب</div>;

  const handlePaymentToggle = () => {
    updatePaymentMutation.mutate({
      studentId: student.id,
      hasPaid: !student.hasPaid,
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Assuming a backend API exists to handle the file upload and update the student's profile picture URL
      // For now, we'll just mock the URL update
      const mockUrl = await uploadFile(file, student.id);
      setProfileImageUrl(mockUrl); // Update local state for immediate display
      // In a real app, you would call a mutation here to update the DB
      toast.success("تم رفع صورة الملف الشخصي بنجاح");
    } catch (e) {
      toast.error("فشل في رفع الصورة");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      <Link href="/admin/students">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة إلى قائمة الطلاب
        </Button>
      </Link>

      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl text-blue-900">{student.userName}</CardTitle>
              <CardDescription>الملف الشخصي للطالب</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-blue-500">طالب</Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-600">
                الجيل: {student.grade || 'غير محدد'}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Profile Picture and Upload */}
            <div className="col-span-1 flex flex-col items-center gap-4 border-l border-gray-100 pl-6">
              <div className="relative">
                <img
                  src={profileImageUrl || student.profilePictureUrl || "https://ui-avatars.com/api/?name=" + student.userName + "&background=007bff&color=fff&size=128&font-size=0.5&bold=true"}
                  alt={student.userName || "الطالب"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                />
                <label htmlFor="profile-upload" className="absolute bottom-0 left-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-5 h-5 text-white" />
                    <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                    />
                </label>
              </div>
              <p className="text-lg font-semibold text-gray-700">تاريخ الانضمام: {student.createdAt ? new Date(student.createdAt).toLocaleDateString('ar-SA') : '-'}</p>
            </div>

            {/* General Info */}
            <div className="col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">معلومات الاتصال</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-blue-600" />
                  <p className="text-gray-700">{student.userPhone || 'لا يوجد رقم'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-600" />
                  <p className="text-gray-700">{student.userEmail || 'لا يوجد بريد إلكتروني'}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4">معلومات المربي</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-700 font-semibold">
                    {student.teacherName || 'لم يتم تعيين مربي'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-700">جيل المربي: {student.teacherGrade || 'غير محدد'}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4">حالة الدفع</h3>
              
              {/* Payment Amount */}
              <div className="p-4 bg-gray-50 rounded-lg border mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <CircleDollarSign className="w-6 h-6 text-emerald-600" />
                  <p className="text-lg font-semibold text-gray-800">المبلغ المستحق:</p>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="أدخل المبلغ"
                    defaultValue={student.paymentAmount || 0}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  />
                  <span className="text-lg font-semibold text-gray-700">₪</span>
                  <Button
                    onClick={() => updatePaymentAmountMutation.mutate({
                      studentId: student.id,
                      paymentAmount: paymentAmount || Number((document.querySelector('input[type="number"]') as HTMLInputElement)?.value || 0)
                    })}
                    disabled={updatePaymentAmountMutation.isPending}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    حفظ المبلغ
                  </Button>
                </div>
              </div>

              {/* Payment Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                <div className="flex items-center gap-3">
                  <CircleDollarSign className="w-6 h-6 text-blue-600" />
                  <p className="text-lg font-semibold text-gray-800">حالة الرسوم:</p>
                </div>
                <Button
                  variant="outline"
                  className={`w-32 justify-center ${
                    student.hasPaid
                      ? 'bg-emerald-100 border-emerald-500 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-red-100 border-red-500 text-red-700 hover:bg-red-200'
                  }`}
                  onClick={handlePaymentToggle}
                  disabled={updatePaymentMutation.isPending}
                >
                  {student.hasPaid ? (
                    <>
                      <CheckCircle className="w-4 h-4 ml-1" />
                      تم الدفع
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 ml-1" />
                      لم يدفع
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Add more sections for lessons, attendance, evaluations */}
      <Card className="border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">سجل الحضور والغياب</CardTitle>
          <CardDescription>ملخص الحضور والغياب للطالب</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">سيتم عرض سجل الحضور هنا...</p>
        </CardContent>
      </Card>
    </div>
  );
}

