import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp, DollarSign, Users, Download } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ar } from "date-fns/locale";

export default function MonthlyReportPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  
  const [selectedYear, setSelectedYear] = useState(currentYear.toString());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth.toString());
  
  const { data: students } = trpc.students.getAll.useQuery();
  
  // Generate years (current year and 2 previous years)
  const years = useMemo(() => {
    return Array.from({ length: 3 }, (_, i) => currentYear - i);
  }, [currentYear]);
  
  // Arabic month names
  const months = [
    { value: "1", label: "يناير" },
    { value: "2", label: "فبراير" },
    { value: "3", label: "مارس" },
    { value: "4", label: "أبريل" },
    { value: "5", label: "مايو" },
    { value: "6", label: "يونيو" },
    { value: "7", label: "يوليو" },
    { value: "8", label: "أغسطس" },
    { value: "9", label: "سبتمبر" },
    { value: "10", label: "أكتوبر" },
    { value: "11", label: "نوفمبر" },
    { value: "12", label: "ديسمبر" },
  ];
  
  // Calculate monthly statistics
  const monthlyStats = useMemo(() => {
    if (!students) return null;
    
    // For now, we'll calculate based on current payment status
    // In a real app, you'd have payment history with dates
    const totalStudents = students.length;
    const paidStudents = students.filter(s => s.hasPaid).length;
    const unpaidStudents = totalStudents - paidStudents;
    
    const totalExpected = students.reduce((sum, s) => sum + (s.paymentAmount || 0), 0);
    const totalCollected = students
      .filter(s => s.hasPaid)
      .reduce((sum, s) => sum + (s.paymentAmount || 0), 0);
    const totalPending = totalExpected - totalCollected;
    
    const collectionRate = totalExpected > 0 
      ? Math.round((totalCollected / totalExpected) * 100) 
      : 0;
    
    return {
      totalStudents,
      paidStudents,
      unpaidStudents,
      totalExpected,
      totalCollected,
      totalPending,
      collectionRate,
    };
  }, [students]);
  
  const exportMonthlyReport = () => {
    if (!students || !monthlyStats) return;
    
    const monthName = months.find(m => m.value === selectedMonth)?.label || "";
    const reportDate = `${monthName} ${selectedYear}`;
    
    const csvData = [
      ["التقرير الشهري للمبالغ المحصلة"],
      ["التاريخ", reportDate],
      [""],
      ["الإحصائيات العامة"],
      ["إجمالي الطلاب", monthlyStats.totalStudents],
      ["عدد الطلاب الذين دفعوا", monthlyStats.paidStudents],
      ["عدد الطلاب الذين لم يدفعوا", monthlyStats.unpaidStudents],
      ["المبلغ المتوقع", `${monthlyStats.totalExpected} ₪`],
      ["المبلغ المحصل", `${monthlyStats.totalCollected} ₪`],
      ["المبلغ المتبقي", `${monthlyStats.totalPending} ₪`],
      ["نسبة التحصيل", `${monthlyStats.collectionRate}%`],
      [""],
      ["تفاصيل الطلاب"],
      ["الاسم", "المربي", "الحلقة", "المبلغ", "الحالة"],
      ...students.map(s => [
        s.userName || "غير محدد",
        s.teacherName || "غير محدد",
        s.grade || "غير محدد",
        `${s.paymentAmount || 0} ₪`,
        s.hasPaid ? "مدفوع" : "غير مدفوع"
      ])
    ];
    
    const csvContent = csvData.map(row => row.join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `monthly_report_${selectedYear}_${selectedMonth}.csv`;
    link.click();
  };
  
  if (!monthlyStats) {
    return <div className="p-6 text-center">جاري تحميل البيانات...</div>;
  }
  
  const selectedMonthName = months.find(m => m.value === selectedMonth)?.label || "";
  
  return (
    <div className="p-6 space-y-6" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-emerald-900">التقرير الشهري</h1>
          <p className="text-gray-600 mt-1">تقرير المبالغ المحصلة شهرياً</p>
        </div>
        <Button
          onClick={exportMonthlyReport}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          <Download className="w-4 h-4 ml-2" />
          تصدير التقرير
        </Button>
      </div>
      
      {/* Date Selection */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            اختيار الفترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">السنة</label>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(year => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium mb-2 block">الشهر</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              المبلغ المحصل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {monthlyStats.totalCollected.toLocaleString()} ₪
            </div>
            <p className="text-sm text-gray-600 mt-1">
              من {monthlyStats.paidStudents} طالب
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-red-600" />
              المبلغ المتبقي
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {monthlyStats.totalPending.toLocaleString()} ₪
            </div>
            <p className="text-sm text-gray-600 mt-1">
              من {monthlyStats.unpaidStudents} طالب
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-emerald-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              نسبة التحصيل
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-600">
              {monthlyStats.collectionRate}%
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {monthlyStats.totalCollected.toLocaleString()} من {monthlyStats.totalExpected.toLocaleString()} ₪
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Summary Card */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle>ملخص {selectedMonthName} {selectedYear}</CardTitle>
          <CardDescription>نظرة عامة على المبالغ المحصلة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-lg">
              <span className="font-semibold">إجمالي الطلاب</span>
              <Badge variant="outline" className="text-lg">
                {monthlyStats.totalStudents}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">دفعوا</div>
                <div className="text-2xl font-bold text-green-600">
                  {monthlyStats.paidStudents}
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">لم يدفعوا</div>
                <div className="text-2xl font-bold text-red-600">
                  {monthlyStats.unpaidStudents}
                </div>
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">المبلغ المتوقع</span>
                <span className="font-bold">{monthlyStats.totalExpected.toLocaleString()} ₪</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">المبلغ المحصل</span>
                <span className="font-bold text-green-600">{monthlyStats.totalCollected.toLocaleString()} ₪</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">المبلغ المتبقي</span>
                <span className="font-bold text-red-600">{monthlyStats.totalPending.toLocaleString()} ₪</span>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>نسبة التحصيل</span>
                <span className="font-bold">{monthlyStats.collectionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-green-500 to-emerald-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${monthlyStats.collectionRate}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

