import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

export default function StudentLessons() {
  return (
    <div className="p-6" dir="rtl">
      <Card className="border-emerald-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-emerald-900">دروسي</CardTitle>
              <CardDescription>سيتم عرض دروسك قريباً</CardDescription>
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
