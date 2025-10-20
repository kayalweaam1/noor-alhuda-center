import { useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-8 p-8">


        {/* Title */}
        <div className="space-y-3">
          <h1 className="text-5xl font-bold text-emerald-900">
            مركز نور الهدى
          </h1>
          <p className="text-xl text-emerald-700">
            لتحفيظ القرآن الكريم
          </p>
        </div>

        {/* Login Button */}
        <div className="pt-8">
          <Button
            onClick={() => setLocation("/login")}
            size="lg"
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-12 py-6 text-xl rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            <LogIn className="w-6 h-6 ml-3" />
            تسجيل الدخول
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-12">
          <p className="text-sm text-gray-500">
            © 2025 مركز نور الهدى - جميع الحقوق محفوظة
          </p>
        </div>
      </div>
    </div>
  );
}

