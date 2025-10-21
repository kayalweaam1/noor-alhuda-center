import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Download,
  FileText,
  Users,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function ReportsPage() {
  const [loading, setLoading] = useState(false);
  const { data: students } = trpc.students.getAll.useQuery();
  const { data: teachers } = trpc.teachers.getAll.useQuery();

  const handleExportAll = async () => {
    setLoading(true);
    try {
      // Mock export - will be replaced with real implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("تم تصدير التقرير بنجاح");
    } catch (error) {
      toast.error("فشل تصدير التقرير");
    } finally {
      setLoading(false);
    }
  };

  const reportTypes = [
    {
      title: "تقرير الحضور والغياب",
      description: "تقرير شامل لحضور وغياب جميع الطلاب",
      icon: Calendar,
      color: "from-blue-500 to-cyan-600",
      action: "attendance",
    },
    {
      title: "تقرير الطلاب",
      description: "بيانات جميع الطلاب مع التقييمات",
      icon: Users,
      color: "from-emerald-500 to-teal-600",
      action: "students",
    },
    {
      title: "تقرير المربين",
      description: "بيانات المربين وإحصائياتهم",
      icon: Users,
      color: "from-purple-500 to-pink-600",
      action: "teachers",
    },
    {
      title: "تقرير الأداء",
      description: "تحليل شامل لأداء المركز",
      icon: TrendingUp,
      color: "from-amber-500 to-orange-600",
      action: "performance",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">التقارير</h1>
          <p className="text-gray-600 mt-1">تصدير وعرض التقارير الشاملة</p>
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
              <p className="text-sm text-blue-700 mb-2">إجمالي التقارير</p>
              <p className="text-3xl font-bold text-blue-900">12</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm text-emerald-700 mb-2">الطلاب</p>
              <p className="text-3xl font-bold text-emerald-900">
                {students?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-purple-700 mb-2">المربين</p>
              <p className="text-3xl font-bold text-purple-900">
                {teachers?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <TrendingUp className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="text-sm text-amber-700 mb-2">نسبة الحضور</p>
              <p className="text-3xl font-bold text-amber-900">85%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTypes.map((report, index) => {
          const Icon = report.icon;
          return (
            <Card
              key={index}
              className="border-emerald-200 hover:shadow-xl transition-all duration-300"
            >
              <CardHeader>
                <div className="flex items-center gap-4">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${report.color} flex items-center justify-center`}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-xl text-gray-900">
                      {report.title}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {report.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    onClick={() => toast.info("قريباً: عرض التقرير")}
                  >
                    <FileText className="w-4 h-4 ml-2" />
                    عرض
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                    onClick={() => toast.info("قريباً: تصدير PDF")}
                  >
                    <Download className="w-4 h-4 ml-2" />
                    PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 border-purple-200 text-purple-600 hover:bg-purple-50"
                    onClick={() => toast.info("قريباً: تصدير Excel")}
                  >
                    <Download className="w-4 h-4 ml-2" />
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                نوع التقرير
              </label>
              <select className="w-full p-3 border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                <option>الحضور والغياب</option>
                <option>التقييمات</option>
                <option>السلوك</option>
                <option>الدروس</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الفترة الزمنية
              </label>
              <select className="w-full p-3 border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                <option>آخر 7 أيام</option>
                <option>آخر 30 يوم</option>
                <option>آخر 3 أشهر</option>
                <option>السنة الحالية</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                الحلقة
              </label>
              <select className="w-full p-3 border border-emerald-200 rounded-lg focus:border-emerald-500 focus:outline-none">
                <option>جميع الحلقات</option>
                <option>حلقة الصباح</option>
                <option>حلقة المساء</option>
              </select>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
              <Filter className="w-4 h-4 ml-2" />
              إنشاء التقرير
            </Button>
            <Button variant="outline" className="border-gray-300">
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
