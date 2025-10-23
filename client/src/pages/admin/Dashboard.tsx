import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, GraduationCap, BookOpen, TrendingUp, AlertCircle, Trash2, Archive, Download, Settings } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const { data: stats } = trpc.statistics.getOverview.useQuery();
  const { data: students } = trpc.students.getAll.useQuery();
  const { data: teachers } = trpc.teachers.getAll.useQuery();
  const { data: attendance } = trpc.attendance.getAll.useQuery({});
  
  const hardReset = trpc.setup.hardReset.useMutation();
  const deleteStudent = trpc.students.delete.useMutation();
  const deleteTeacher = trpc.teachers.delete.useMutation();
  const deleteAttendance = trpc.attendance.delete.useMutation();
  
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteType, setDeleteType] = useState<"students" | "teachers" | "both">("students");
  const [academicYear, setAcademicYear] = useState(format(new Date(), "yyyy"));

  // Redirect if not admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      setLocation('/');
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">غير مصرح</h2>
          <p className="text-gray-600">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
        </div>
      </div>
    );
  }

  // Function to export data as CSV before deletion
  const exportDataToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.info("لا توجد بيانات للتصدير");
      return;
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(","),
      ...data.map(row => headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas
        return typeof value === 'string' && value.includes(',') 
          ? `"${value}"` 
          : value;
      }).join(","))
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${academicYear}.csv`;
    link.click();
  };

  // Function to clear attendance and behavior data
  const handleClearAttendanceData = async () => {
    try {
      setIsSubmitting(true);
      
      // Export data before deletion
      if (attendance && attendance.length > 0) {
        exportDataToCSV(attendance, `attendance_archive`);
        toast.success("تم تنزيل أرشيف الحضور والغياب");
      }

      // Delete all attendance records
      for (const record of attendance || []) {
        await deleteAttendance.mutateAsync({ id: record.id });
      }

      toast.success("تم مسح جميع بيانات الحضور والغياب والسلوك بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("فشل مسح البيانات");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to clear users (students/teachers/both)
  const handleClearUsers = async () => {
    try {
      setIsSubmitting(true);
      
      // Export data before deletion
      if (deleteType === "students" || deleteType === "both") {
        if (students && students.length > 0) {
          exportDataToCSV(students, `students_archive`);
          toast.success("تم تنزيل أرشيف الطلاب");
        }
      }
      
      if (deleteType === "teachers" || deleteType === "both") {
        if (teachers && teachers.length > 0) {
          exportDataToCSV(teachers, `teachers_archive`);
          toast.success("تم تنزيل أرشيف المربين");
        }
      }

      // Delete students
      if (deleteType === "students" || deleteType === "both") {
        for (const student of students || []) {
          await deleteStudent.mutateAsync({ id: student.id });
        }
      }

      // Delete teachers
      if (deleteType === "teachers" || deleteType === "both") {
        for (const teacher of teachers || []) {
          await deleteTeacher.mutateAsync({ id: teacher.id });
        }
      }

      toast.success("تم مسح المستخدمين المحددين بنجاح");
      window.location.reload();
    } catch (error) {
      toast.error("فشل مسح المستخدمين");
    } finally {
      setIsSubmitting(false);
    }
  };

  const statsCards = [
    {
      title: "إجمالي الطلاب",
      value: stats?.totalStudents || 0,
      icon: Users,
      color: "bg-blue-500",
      description: "عدد الطلاب المسجلين",
    },
    {
      title: "المربين",
      value: stats?.totalTeachers || 0,
      icon: GraduationCap,
      color: "bg-emerald-500",
      description: "عدد المربين النشطين",
    },
    {
      title: "الدروس",
      value: stats?.totalLessons || 0,
      icon: BookOpen,
      color: "bg-amber-500",
      description: "إجمالي الدروس المسجلة",
    },
    {
      title: "المستخدمين",
      value: stats?.totalUsers || 0,
      icon: TrendingUp,
      color: "bg-purple-500",
      description: "إجمالي المستخدمين",
    },
  ];

  return (
    <div className="min-h-screen" dir="rtl">
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-2xl text-white font-bold">
                {user.name?.charAt(0) || 'م'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-emerald-900">
                مرحباً، {user.name || 'المدير'}
              </h1>
              <p className="text-emerald-700 mt-1">
                لوحة التحكم الرئيسية - مركز نور الهدى
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="border-emerald-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-gray-700">
                      {stat.title}
                    </CardTitle>
                    <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold text-gray-900 mb-2">
                    {stat.value}
                  </div>
                  <CardDescription className="text-gray-600">
                    {stat.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Admin Control Panel - Archive and Delete */}
        {user.phone === '+972542632557' && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-900 flex items-center gap-2">
                <Archive className="w-6 h-6" />
                لوحة التحكم - الأرشفة والمسح
              </CardTitle>
              <CardDescription>إدارة البيانات والمستخدمين (مدير عام فقط)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Clear Attendance Data Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 border-2 border-orange-300 hover:bg-orange-50 flex flex-col items-center gap-2"
                    >
                      <Trash2 className="w-8 h-8 text-orange-600" />
                      <div className="text-center">
                        <p className="font-bold text-orange-900">مسح بيانات الحضور والسلوك</p>
                        <p className="text-xs text-orange-700">سيتم تنزيل أرشيف قبل المسح</p>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد مسح بيانات الحضور والسلوك</AlertDialogTitle>
                      <AlertDialogDescription>
                        سيتم مسح جميع بيانات الحضور والغياب والسلوك والملاحظات. سيتم تنزيل أرشيف بالبيانات باسم السنة الدراسية {academicYear} قبل المسح.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="py-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-2">السنة الدراسية</label>
                      <Input
                        type="text"
                        placeholder="مثال: 2024"
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                      />
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          variant="destructive"
                          disabled={isSubmitting}
                          onClick={handleClearAttendanceData}
                        >
                          {isSubmitting ? "جاري المسح..." : "تأكيد المسح"}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {/* Clear Users Button */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-auto p-4 border-2 border-red-300 hover:bg-red-50 flex flex-col items-center gap-2"
                    >
                      <Users className="w-8 h-8 text-red-600" />
                      <div className="text-center">
                        <p className="font-bold text-red-900">مسح المستخدمين</p>
                        <p className="text-xs text-red-700">طلاب / مربين / الاثنين معاً</p>
                      </div>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent dir="rtl">
                    <AlertDialogHeader>
                      <AlertDialogTitle>تأكيد مسح المستخدمين</AlertDialogTitle>
                      <AlertDialogDescription>
                        اختر نوع المستخدمين المراد مسحهم. سيتم تنزيل أرشيف بالبيانات باسم السنة الدراسية {academicYear} قبل المسح.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-4 py-2">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">السنة الدراسية</label>
                        <Input
                          type="text"
                          placeholder="مثال: 2024"
                          value={academicYear}
                          onChange={(e) => setAcademicYear(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">نوع المستخدمين</label>
                        <Select value={deleteType} onValueChange={(value: any) => setDeleteType(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="students">الطلاب فقط</SelectItem>
                            <SelectItem value="teachers">المربين فقط</SelectItem>
                            <SelectItem value="both">الطلاب والمربين معاً</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <AlertDialogFooter>
                      <AlertDialogCancel>إلغاء</AlertDialogCancel>
                      <AlertDialogAction asChild>
                        <Button
                          variant="destructive"
                          disabled={isSubmitting}
                          onClick={handleClearUsers}
                        >
                          {isSubmitting ? "جاري المسح..." : "تأكيد المسح"}
                        </Button>
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts and Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Chart Placeholder */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">نسبة الحضور</CardTitle>
              <CardDescription>إحصائيات الحضور الشهرية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  <p className="text-emerald-700 font-semibold">رسم بياني للحضور</p>
                  <p className="text-sm text-emerald-600 mt-2">
                    {attendance && attendance.length > 0 
                      ? `${attendance.length} سجل حضور` 
                      : "لا توجد بيانات حضور"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card className="border-emerald-200">
            <CardHeader>
              <CardTitle className="text-emerald-900">التنبيهات الأخيرة</CardTitle>
              <CardDescription>آخر الإشعارات والتحديثات</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">غياب متكرر</p>
                    <p className="text-sm text-amber-700">
                      {attendance ? 
                        `${attendance.filter((a: any) => a.status === 'absent').length} حالة غياب مسجلة` 
                        : "لا توجد بيانات"}
                    </p>
                    <p className="text-xs text-amber-600 mt-1">اليوم</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <BookOpen className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-blue-900">الدروس</p>
                    <p className="text-sm text-blue-700">إجمالي {stats?.totalLessons || 0} درس</p>
                    <p className="text-xs text-blue-600 mt-1">محدث</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <Users className="w-5 h-5 text-emerald-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-emerald-900">المستخدمين</p>
                    <p className="text-sm text-emerald-700">
                      {stats?.totalStudents || 0} طالب، {stats?.totalTeachers || 0} مربي
                    </p>
                    <p className="text-xs text-emerald-600 mt-1">محدث</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">إجراءات سريعة</CardTitle>
            <CardDescription>الوظائف الأكثر استخداماً</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setLocation('/admin/users')}
                className="p-4 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">إدارة المستخدمين</p>
              </button>

              <button
                onClick={() => setLocation('/admin/teachers')}
                className="p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <GraduationCap className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">إدارة المربين</p>
              </button>

              <button
                onClick={() => setLocation('/admin/students')}
                className="p-4 bg-gradient-to-br from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Users className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">إدارة الطلاب</p>
              </button>

              <button
                onClick={() => setLocation('/admin/reports')}
                className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <BookOpen className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">التقارير</p>
              </button>

              <button
                onClick={() => setLocation('/admin/payments')}
                className="p-4 bg-gradient-to-br from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Download className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">الدفع</p>
              </button>

              <button
                onClick={() => setLocation('/admin/app-settings')}
                className="p-4 bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                <Settings className="w-8 h-8 mx-auto mb-2" />
                <p className="font-semibold">إعدادات التطبيق</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

