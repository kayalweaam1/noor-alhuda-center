import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Phone, Mail, Calendar, GraduationCap, Users, Upload } from "lucide-react";
import { Link, useRoute } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

// Placeholder for file upload utility
const uploadFile = async (file: File, teacherId: string) => {
  // Mock upload for now, implementation depends on backend storage
  console.log(`Uploading file for teacher ${teacherId}: ${file.name}`);
  // In a real app, this would call an API endpoint to upload the file
  return `/uploads/teachers/${teacherId}/profile.jpg`; 
};

export default function TeacherProfile() {
  const [match, params] = useRoute("/admin/teachers/:teacherId");
  const teacherId = params?.teacherId;
  const [isUploading, setIsUploading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  const { data: teacher, isLoading, error, refetch } = trpc.teachers.getById.useQuery(
    { id: teacherId! },
    { enabled: !!teacherId }
  );
  
  // Fetch students associated with this teacher
  const { data: students = [] } = trpc.students.getByTeacherId.useQuery(
    { teacherId: teacherId! },
    { enabled: !!teacherId }
  );

  if (isLoading) return <div className="p-6 text-center">جاري تحميل بيانات المربي...</div>;
  if (error) return <div className="p-6 text-center text-red-600">حدث خطأ: {error.message}</div>;
  if (!teacher) return <div className="p-6 text-center">لم يتم العثور على المربي</div>;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const mockUrl = await uploadFile(file, teacher.id);
      setProfileImageUrl(mockUrl); 
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
      <Link href="/admin/teachers">
        <Button variant="outline" className="mb-4">
          <ArrowLeft className="w-4 h-4 ml-2" />
          العودة إلى قائمة المربين
        </Button>
      </Link>

      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-3xl text-emerald-900">{teacher.userName}</CardTitle>
              <CardDescription>الملف الشخصي للمربي</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500">مربي</Badge>
              <Badge variant="outline" className="border-emerald-500 text-emerald-600">
                التخصص: {teacher.specialization || 'عام'}
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
                  src={profileImageUrl || teacher.profilePictureUrl || "https://ui-avatars.com/api/?name=" + teacher.userName + "&background=10b981&color=fff&size=128&font-size=0.5&bold=true"}
                  alt={teacher.userName || "المربي"}
                  className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200 shadow-lg"
                />
                <label htmlFor="profile-upload" className="absolute bottom-0 left-0 p-2 bg-emerald-600 rounded-full cursor-pointer hover:bg-emerald-700 transition-colors">
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
              <p className="text-lg font-semibold text-gray-700">تاريخ التعيين: {teacher.createdAt ? new Date(teacher.createdAt).toLocaleDateString('ar-SA') : '-'}</p>
            </div>

            {/* General Info */}
            <div className="col-span-2 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 border-b pb-2">معلومات الاتصال</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-700">{teacher.userPhone || 'لا يوجد رقم'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-emerald-600" />
                  <p className="text-gray-700">{teacher.userEmail || 'لا يوجد بريد إلكتروني'}</p>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 border-b pb-2 pt-4">إحصائيات الحلقة</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <p className="text-gray-700 font-semibold">عدد الطلاب: {students.length}</p>
                </div>
                <div className="flex items-center gap-3">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <p className="text-gray-700">جيل الحلقة: {teacher.halaqaName || 'غير محدد'}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Students List */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-900">قائمة الطلاب ({students.length})</CardTitle>
          <CardDescription>الطلاب المسجلون في حلقة المربي</CardDescription>
        </CardHeader>
        <CardContent>
          {students.length > 0 ? (
            // Simple list of students. Can be replaced with a full table if needed.
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {students.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{student.userName?.charAt(0) || 'ط'}</span>
                    </div>
                    <p className="font-semibold text-gray-800">{student.userName}</p>
                  </div>
                  <Badge variant="outline" className="border-blue-300">
                    الجيل: {student.grade}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">لا يوجد طلاب مسجلون في حلقة هذا المربي حاليًا.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

