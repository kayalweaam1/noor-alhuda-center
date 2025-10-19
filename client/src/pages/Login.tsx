import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Shield, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const [, setLocation] = useLocation();
  const [phoneNumber, setPhoneNumber] = useState("+972");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);

  const { user: firebaseUser, role } = useAuth();

  // Setup reCAPTCHA
  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          // reCAPTCHA solved
        },
      });
    }
  };

  // Send OTP
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (phoneNumber.length < 10) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(confirmation);
      setStep("otp");
      toast.success("تم إرسال رمز التحقق إلى هاتفك");
    } catch (error: any) {
      console.error("Error sending OTP:", error);
      toast.error("فشل إرسال رمز التحقق: " + (error.message || "خطأ غير معروف"));
      
      // Reset reCAPTCHA on error
      if ((window as any).recaptchaVerifier) {
        (window as any).recaptchaVerifier.clear();
        (window as any).recaptchaVerifier = null;
      }
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!confirmationResult) {
      toast.error("يرجى إرسال رمز التحقق أولاً");
      return;
    }

    if (otp.length !== 6) {
      toast.error("الرمز يجب أن يكون 6 أرقام");
      return;
    }

    setLoading(true);
    try {
      await confirmationResult.confirm(otp);
      toast.success("تم تسجيل الدخول بنجاح!");
      
      // Redirect based on role
      const adminPhones = ["+972542632557", "+972506381455"];
      
      if (adminPhones.includes(phoneNumber)) {
        setLocation("/admin/dashboard");
      } else {
        // Check user role from database
        // This will be implemented with proper role checking
        setLocation("/student/dashboard");
      }
    } catch (error: any) {
      console.error("Error verifying OTP:", error);
      toast.error("رمز التحقق غير صحيح");
    } finally {
      setLoading(false);
    }
  };

  // If already logged in, redirect
  useEffect(() => {
    if (firebaseUser && role) {
      if (role === 'admin') {
        setLocation("/admin/dashboard");
      } else if (role === 'teacher') {
        setLocation("/teacher/dashboard");
      } else {
        setLocation("/student/dashboard");
      }
    }
  }, [firebaseUser, role, setLocation]);

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundImage: 'url(/logo-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/90 via-teal-900/90 to-cyan-900/90"></div>
      
      <Card className="w-full max-w-md relative z-10 border-emerald-200 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-32 h-32 mx-auto mb-4">
            <img 
              src="/logo.jpeg" 
              alt="مركز نور الهدى" 
              className="w-full h-full object-contain rounded-full border-4 border-emerald-500 shadow-lg"
            />
          </div>
          <CardTitle className="text-3xl font-bold text-emerald-900">
            مركز نور الهدى
          </CardTitle>
          <CardDescription className="text-lg">
            {step === "phone" ? "تسجيل الدخول برقم الهاتف" : "أدخل رمز التحقق"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          {step === "phone" ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
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
                    placeholder="+972542632557"
                    className="pr-12 text-lg border-emerald-200 focus:border-emerald-500"
                    required
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  أدخل رقم الهاتف بالصيغة الدولية (مثال: +972542632557)
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
              >
                {loading ? (
                  "جاري الإرسال..."
                ) : (
                  <>
                    إرسال رمز التحقق
                    <ArrowRight className="w-5 h-5 mr-2" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  رمز التحقق
                </label>
                <div className="relative">
                  <Shield className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-600" />
                  <Input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="pr-12 text-lg text-center tracking-widest border-emerald-200 focus:border-emerald-500"
                    required
                    maxLength={6}
                    dir="ltr"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  أدخل الرمز المكون من 6 أرقام المرسل إلى {phoneNumber}
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-lg py-6"
                >
                  {loading ? "جاري التحقق..." : "تسجيل الدخول"}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setConfirmationResult(null);
                  }}
                  className="w-full border-emerald-200"
                >
                  تغيير رقم الهاتف
                </Button>
              </div>
            </form>
          )}

          {/* reCAPTCHA container */}
          <div id="recaptcha-container"></div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              مسجد النور - الجديدة
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

