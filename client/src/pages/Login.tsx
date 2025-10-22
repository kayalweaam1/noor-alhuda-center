import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const loginMutation = trpc.auth.login.useMutation();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length < 10) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    if (password.length < 4) {
      toast.error("كلمة المرور يجب أن تكون 4 أحرف على الأقل");
      return;
    }

    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync({ 
        phone: phoneNumber, 
        password: password 
      });
      
      toast.success("مرحباً بك! تم تسجيل الدخول بنجاح");
      
      // Save user to localStorage
      localStorage.setItem('user', JSON.stringify(result.user));
      
      // Redirect based on role (force full navigation to ensure session cookie is used)
      const role = result.user.role;
      const target = role === 'admin'
        ? '/admin/dashboard'
        : role === 'teacher'
        ? '/teacher/dashboard'
        : role === 'assistant'
        ? '/assistant/dashboard'
        : '/student/dashboard';
      window.location.href = target;
    } catch (error: any) {
      console.error("Error logging in:", error);
      toast.error("رقم الهاتف أو كلمة المرور غير صحيحة");
    } finally {
      setLoading(false);
    }
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
            تسجيل الدخول
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <Input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0542632557"
                  className="pr-12 text-lg border-emerald-200 focus:border-emerald-500"
                  required
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pr-12 text-lg border-emerald-200 focus:border-emerald-500"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
            >
              {loading ? (
                "جاري تسجيل الدخول..."
              ) : (
                <>
                  تسجيل الدخول
                  <ArrowRight className="w-5 h-5 mr-2" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

