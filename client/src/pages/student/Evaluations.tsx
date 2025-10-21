import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function StudentEvaluations() {
  return (
    <div className="p-6" dir="rtl">
      <Card className="border-amber-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-amber-900">التقييمات</CardTitle>
              <CardDescription>سيتم عرض تقييماتك قريباً</CardDescription>
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
