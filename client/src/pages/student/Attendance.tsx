import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";

export default function StudentAttendance() {
  return (
    <div className="p-6" dir="rtl">
      <Card className="border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-blue-900">الحضور والغياب</CardTitle>
              <CardDescription>سيتم عرض سجل حضورك قريباً</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600">هذه الصفحة قيد التطوير.</p>
        </CardContent>
      </Card>
    </div>
  );
}
