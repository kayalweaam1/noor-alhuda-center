import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Shield } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function AdminDirectLogin() {
  const [, setLocation] = useLocation();
  const [loading, setLoading] = useState(false);

  const handleDirectLogin = () => {
    setLoading(true);
    toast.success("مرحباً بك يا مدير! تسجيل دخول مباشر");

    // Save to localStorage to simulate logged in state
    localStorage.setItem(
      "user",
      JSON.stringify({
        id: "1",
        phone: "+972542632557",
        name: "المدير العام",
        role: "admin",
      })
    );

    // Direct redirect
    setTimeout(() => {
      setLocation("/admin/dashboard");
      setLoading(false);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 bg-white"
      dir="rtl"
    >
      <Card className="w-full max-w-md relative z-10 border-emerald-200 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-bold text-emerald-900">
            مركز نور الهدى
          </CardTitle>
          <CardDescription className="text-lg">
            دخول مباشر للمدير (للتطوير)
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
            <Shield className="w-12 h-12 mx-auto mb-2 text-amber-600" />
            <p className="text-sm text-amber-800 font-semibold">
              هذه الصفحة للتطوير فقط
            </p>
            <p className="text-xs text-amber-700 mt-1">
              سيتم استبدالها بنظام SMS حقيقي لاحقاً
            </p>
          </div>

          <Button
            onClick={handleDirectLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
          >
            {loading ? "جاري تسجيل الدخول..." : "دخول مباشر كمدير"}
          </Button>

          <div className="text-center">
            <a
              href="/login"
              className="text-sm text-emerald-600 hover:text-emerald-700 underline"
            >
              تسجيل الدخول العادي (مع OTP)
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
