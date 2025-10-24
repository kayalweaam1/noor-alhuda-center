import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText, Users, Calendar, TrendingUp, Filter, Printer, FileSpreadsheet } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { exportAttendance, exportStudents, exportTeachers } from "@/lib/export";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, subDays, subMonths, startOfYear } from "date-fns";
import { ar } from "date-fns/locale";
import LogosHeader from "@/components/LogosHeader";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string>("attendance");
  const [selectedPeriod, setSelectedPeriod] = useState<string>("7days");
  const [selectedHalaqa, setSelectedHalaqa] = useState<string>("all");

  const { data: students } = trpc.students.getAll.useQuery();
  const { data: teachers } = trpc.teachers.getAll.useQuery();
  const { data: attendance } = trpc.attendance.getAll.useQuery({});
  const { data: evaluations } = trpc.evaluations.getAll.useQuery();
  const { data: lessons } = trpc.lessons.getAll.useQuery();
  const { data: statistics } = trpc.statistics.getOverview.useQuery();

  // Calculate date range based on selected period
  const getDateRange = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case "7days":
        return { start: subDays(now, 7), end: now };
      case "30days":
        return { start: subDays(now, 30), end: now };
      case "3months":
        return { start: subMonths(now, 3), end: now };
      case "year":
        return { start: startOfYear(now), end: now };
      default:
        return { start: subDays(now, 7), end: now };
    }
  };

  // Filter data based on selected criteria
  const filteredData = useMemo(() => {
    const dateRange = getDateRange();
    
    let filteredAttendance = attendance || [];
    let filteredStudents = students || [];
    let filteredTeachers = teachers || [];
    let filteredEvaluations = evaluations || [];

    // Filter by date
    filteredAttendance = filteredAttendance.filter((record: any) => {
      const recordDate = new Date(record.date);
      return recordDate >= dateRange.start && recordDate <= dateRange.end;
    });

    // Filter by halaqa if selected
    if (selectedHalaqa !== "all") {
      filteredStudents = filteredStudents.filter((s: any) => s.grade === selectedHalaqa);
      filteredTeachers = filteredTeachers.filter((t: any) => t.halaqaName === selectedHalaqa);
    }

    return {
      attendance: filteredAttendance,
      students: filteredStudents,
      teachers: filteredTeachers,
      evaluations: filteredEvaluations,
    };
  }, [attendance, students, teachers, evaluations, selectedPeriod, selectedHalaqa]);

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    const total = filteredData.attendance.length;
    const present = filteredData.attendance.filter((a: any) => a.status === "present").length;
    const absent = filteredData.attendance.filter((a: any) => a.status === "absent").length;
    const late = filteredData.attendance.filter((a: any) => a.status === "late").length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;

    return { total, present, absent, late, rate };
  }, [filteredData.attendance]);

  // Calculate performance statistics
  const performanceStats = useMemo(() => {
    if (!evaluations || evaluations.length === 0) {
      return { average: 0, excellent: 0, good: 0, needsImprovement: 0 };
    }

    const scores = evaluations.map((e: any) => e.score);
    const average = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
    const excellent = evaluations.filter((e: any) => e.score >= 90).length;
    const good = evaluations.filter((e: any) => e.score >= 75 && e.score < 90).length;
    const needsImprovement = evaluations.filter((e: any) => e.score < 75).length;

    return { average: Math.round(average), excellent, good, needsImprovement };
  }, [evaluations]);

  const handleExportAll = async () => {
    setLoading(true);
    try {
      exportStudents(filteredData.students);
      exportTeachers(filteredData.teachers);
      exportAttendance(filteredData.attendance);
      toast.success("تم تصدير جميع التقارير بنجاح");
    } catch (error) {
      toast.error("فشل تصدير التقارير");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSpecific = (type: string) => {
    try {
      switch (type) {
        case "students":
          exportStudents(filteredData.students);
          toast.success("تم تصدير تقرير الطلاب");
          break;
        case "teachers":
          exportTeachers(filteredData.teachers);
          toast.success("تم تصدير تقرير المربين");
          break;
        case "attendance":
          exportAttendance(filteredData.attendance);
          toast.success("تم تصدير تقرير الحضور");
          break;
        case "performance":
          // Create custom performance report
          const performanceData = filteredData.evaluations.map((e: any) => ({
            studentId: e.studentId,
            score: e.score,
            feedback: e.feedback,
            date: format(new Date(e.date), "yyyy-MM-dd"),
          }));
          const csv = [
            ["معرف الطالب", "الدرجة", "الملاحظات", "التاريخ"],
            ...performanceData.map((row: any) => [row.studentId, row.score, row.feedback || "", row.date]),
          ]
            .map((row) => row.join(","))
            .join("\n");
          
          const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.download = `performance_report_${format(new Date(), "yyyy-MM-dd")}.csv`;
          link.click();
          toast.success("تم تصدير تقرير الأداء");
          break;
        default:
          toast.info("نوع التقرير غير معروف");
      }
    } catch (error) {
      toast.error("فشل تصدير التقرير");
    }
  };

  const handlePrintReport = (type: string) => {
    // Generate printable report
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      toast.error("فشل فتح نافذة الطباعة");
      return;
    }

    let reportContent = "";
    const dateRange = getDateRange();
    const headerInfo = `
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="display: flex; justify-content: center; align-items: center; gap: 40px; margin-bottom: 20px;">
          <div style="text-align: center;">
            <img src="/logos/mosque-logo.jpeg" alt="مسجد النور الجديدة" style="height: 80px; object-fit: contain;" />
            <p style="font-size: 12px; margin-top: 8px;">مسجد النور الجديدة</p>
          </div>
          <div style="text-align: center;">
            <img src="/logos/noor-alhuda-logo.jpeg" alt="مركز نور الهدى" style="height: 80px; object-fit: contain;" />
            <p style="font-size: 12px; margin-top: 8px;">مركز نور الهدى للقرآن الكريم</p>
          </div>
        </div>
        <h2 style="color: #059669; margin: 20px 0;">تقرير ${type === "attendance" ? "الحضور والغياب" : type === "students" ? "الطلاب" : type === "teachers" ? "المربين" : "الأداء"}</h2>
        <p>من ${format(dateRange.start, "dd/MM/yyyy", { locale: ar })} إلى ${format(dateRange.end, "dd/MM/yyyy", { locale: ar })}</p>
      </div>
    `;

    switch (type) {
      case "attendance":
        reportContent = `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #059669; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px;">الطالب</th>
                <th style="border: 1px solid #ddd; padding: 12px;">التاريخ</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الحالة</th>
                <th style="border: 1px solid #ddd; padding: 12px;">المربي</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.attendance
                .map(
                  (record: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${record.studentId}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(record.date), "dd/MM/yyyy")}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${record.status === "present" ? "حاضر" : record.status === "absent" ? "غائب" : "متأخر"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${record.teacherId}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 30px;">
            <h3>الإحصائيات:</h3>
            <p>إجمالي السجلات: ${attendanceStats.total}</p>
            <p>الحضور: ${attendanceStats.present}</p>
            <p>الغياب: ${attendanceStats.absent}</p>
            <p>المتأخرين: ${attendanceStats.late}</p>
            <p>نسبة الحضور: ${attendanceStats.rate}%</p>
          </div>
        `;
        break;
      case "students":
        reportContent = `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #059669; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px;">الاسم</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الهاتف</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الحلقة</th>
                <th style="border: 1px solid #ddd; padding: 12px;">المربي</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.students
                .map(
                  (student: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.userName || "غير محدد"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.userPhone || "-"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.grade || "غير محدد"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${student.teacherId || "غير محدد"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 30px;">
            <p>إجمالي الطلاب: ${filteredData.students.length}</p>
          </div>
        `;
        break;
      case "teachers":
        reportContent = `
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #059669; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px;">الاسم</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الهاتف</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الحلقة</th>
                <th style="border: 1px solid #ddd; padding: 12px;">التخصص</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.teachers
                .map(
                  (teacher: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${teacher.userName || "غير محدد"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${teacher.userPhone || "-"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${teacher.halaqaName || "غير محدد"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${teacher.specialization || "غير محدد"}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          <div style="margin-top: 30px;">
            <p>إجمالي المربين: ${filteredData.teachers.length}</p>
          </div>
        `;
        break;
      case "performance":
        reportContent = `
          <div style="margin-bottom: 30px;">
            <h3>إحصائيات الأداء:</h3>
            <p>المتوسط العام: ${performanceStats.average}%</p>
            <p>الطلاب الممتازون (90%+): ${performanceStats.excellent}</p>
            <p>الطلاب الجيدون (75-89%): ${performanceStats.good}</p>
            <p>يحتاجون متابعة (&lt;75%): ${performanceStats.needsImprovement}</p>
          </div>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #059669; color: white;">
                <th style="border: 1px solid #ddd; padding: 12px;">الطالب</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الدرجة</th>
                <th style="border: 1px solid #ddd; padding: 12px;">الملاحظات</th>
                <th style="border: 1px solid #ddd; padding: 12px;">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              ${filteredData.evaluations
                .map(
                  (evaluation: any) => `
                <tr>
                  <td style="border: 1px solid #ddd; padding: 8px;">${evaluation.studentId}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${evaluation.score}%</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${evaluation.feedback || "-"}</td>
                  <td style="border: 1px solid #ddd; padding: 8px;">${format(new Date(evaluation.date), "dd/MM/yyyy")}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
        `;
        break;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <title>تقرير - مركز نور الهدى</title>
        <style>
          body { font-family: 'Arial', sans-serif; padding: 20px; }
          table { margin-top: 20px; }
          @media print {
            button { display: none; }
          }
        </style>
      </head>
      <body>
        ${headerInfo}
        ${reportContent}
        <div style="margin-top: 40px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background-color: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">طباعة</button>
          <button onclick="window.close()" style="padding: 10px 20px; background-color: #6b7280; color: white; border: none; border-radius: 5px; cursor: pointer; margin-right: 10px;">إغلاق</button>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleGenerateCustomReport = () => {
    if (!selectedReportType) {
      toast.error("يرجى اختيار نوع التقرير");
      return;
    }

    handlePrintReport(selectedReportType);
  };

  const reportTypes = [
    {
      title: "تقرير الحضور والغياب",
      description: "تقرير شامل لحضور وغياب جميع الطلاب",
      icon: Calendar,
      color: "from-blue-500 to-cyan-600",
      action: "attendance",
      count: filteredData.attendance.length,
    },
    {
      title: "تقرير الطلاب",
      description: "بيانات جميع الطلاب مع التقييمات",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      action: "students",
      count: filteredData.students.length,
    },
    {
      title: "تقرير المربين",
      description: "بيانات المربين وإحصائياتهم",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      action: "teachers",
      count: filteredData.teachers.length,
    },
    {
      title: "تقرير الأداء",
      description: "تحليل شامل لأداء المركز",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      action: "performance",
      count: filteredData.evaluations.length,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Logos */}
      <LogosHeader size="medium" showText={true} />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">التقارير المتقدمة</h1>
          <p className="text-gray-600 mt-1">تصدير وعرض التقارير الشاملة مع التصفية المتقدمة</p>
        </div>
        <Button
          onClick={handleExportAll}
          disabled={loading}
          className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
        >
          <Download className="w-4 h-4 ml-2" />
          {loading ? "جاري التصدير..." : "تصدير الكل"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <FileText className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-sm text-blue-700 mb-2">سجلات الحضور</p>
              <p className="text-3xl font-bold text-blue-900">{attendanceStats.total}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 mb-2">الطلاب</p>
              <p className="text-3xl font-bold text-emerald-900">{filteredData.students.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-2">المربين</p>
              <p className="text-3xl font-bold text-purple-900">{filteredData.teachers.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-700 mb-2">نسبة الحضور</p>
              <p className="text-3xl font-bold text-amber-900">{attendanceStats.rate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card key={index} className="border-emerald-200 hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">{report.title}</CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                    <p className="text-sm text-gray-500 mt-1">عدد السجلات: {report.count}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => handlePrintReport(report.action)}
                  >
                    <Printer className="w-4 h-4 ml-2" />
                    طباعة
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => handleExportSpecific(report.action)}
                  >
                    <FileSpreadsheet className="w-4 h-4 ml-2" />
                    Excel
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Custom Report Builder */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-emerald-900">إنشاء تقرير مخصص</CardTitle>
          <CardDescription>اختر المعايير لإنشاء تقرير مخصص</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">نوع التقرير</label>
              <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر نوع التقرير" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="attendance">الحضور والغياب</SelectItem>
                  <SelectItem value="students">الطلاب</SelectItem>
                  <SelectItem value="teachers">المربين</SelectItem>
                  <SelectItem value="performance">الأداء</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الفترة الزمنية</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الفترة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">آخر 7 أيام</SelectItem>
                  <SelectItem value="30days">آخر 30 يوم</SelectItem>
                  <SelectItem value="3months">آخر 3 أشهر</SelectItem>
                  <SelectItem value="year">السنة الحالية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">الحلقة</label>
              <Select value={selectedHalaqa} onValueChange={setSelectedHalaqa}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="اختر الحلقة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحلقات</SelectItem>
                  <SelectItem value="حلقة الصباح">حلقة الصباح</SelectItem>
                  <SelectItem value="حلقة المساء">حلقة المساء</SelectItem>
                  <SelectItem value="حلقة الأطفال">حلقة الأطفال</SelectItem>
                  <SelectItem value="حلقة النساء">حلقة النساء</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button 
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
              onClick={handleGenerateCustomReport}
            >
              <Filter className="w-4 h-4 ml-2" />
              إنشاء التقرير
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300"
              onClick={() => {
                setSelectedReportType("attendance");
                setSelectedPeriod("7days");
                setSelectedHalaqa("all");
                toast.success("تم إعادة تعيين الفلاتر");
              }}
            >
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

