import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { BookOpen, Users, Award, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to their dashboard
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'admin') {
        setLocation('/admin/dashboard');
      } else if (user.role === 'teacher') {
        setLocation('/teacher/dashboard');
      } else if (user.role === 'student') {
        setLocation('/student/dashboard');
      }
    }
  }, [loading, isAuthenticated, user, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
          <p className="mt-4 text-emerald-700">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: BookOpen,
      title: "إدارة الدروس",
      description: "تنظيم الدروس والحلقات القرآنية بكل سهولة",
    },
    {
      icon: Users,
      title: "متابعة الطلاب",
      description: "تتبع تقدم الطلاب وحضورهم وغيابهم",
    },
    {
      icon: Award,
      title: "التقييمات",
      description: "نظام تقييم شامل لقياس مستوى الطلاب",
    },
    {
      icon: BarChart3,
      title: "التقارير",
      description: "تقارير مفصلة لمتابعة أداء المركز",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100" dir="rtl">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-emerald-200">
        <nav className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10 rounded-lg" />
            <span className="font-bold text-xl text-emerald-900">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
              تسجيل الدخول
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="text-center space-y-8">
          <div className="space-y-4">
            <div className="inline-block px-6 py-2 rounded-full bg-emerald-100 border border-emerald-300">
              <span className="text-sm font-semibold text-emerald-800">
                ✨ منظومة متكاملة لإدارة المراكز القرآنية
              </span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-emerald-900 leading-tight">
              {APP_TITLE}
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mt-2">
                نور يضيء طريق العلم
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-emerald-700 leading-relaxed max-w-3xl mx-auto">
              نظام شامل لإدارة المراكز القرآنية يساعد المربين والطلاب والإدارة على متابعة التقدم وتحقيق الأهداف
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={() => window.location.href = getLoginUrl()}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-lg"
            >
              ابدأ الآن
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-lg"
            >
              تعرف على المزيد
            </Button>
          </div>

          {/* Decorative Element */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative bg-white/50 backdrop-blur-sm rounded-3xl border-2 border-emerald-200 p-12">
              <div className="text-center space-y-4">
                <div className="text-7xl">📖</div>
                <p className="text-2xl font-bold text-emerald-900">القرآن الكريم</p>
                <p className="text-emerald-700">منهج حياة ونور هداية</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-emerald-900">
              المميزات الرئيسية
            </h2>
            <p className="text-xl text-emerald-700 max-w-2xl mx-auto">
              نظام متكامل يوفر كل ما تحتاجه لإدارة مركزك القرآني بكفاءة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-emerald-200 hover:shadow-xl transition-all duration-300 hover:border-emerald-400 hover:-translate-y-1"
                >
                  <CardHeader>
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4">
                      <Icon className="w-7 h-7 text-emerald-600" />
                    </div>
                    <CardTitle className="text-emerald-900 text-xl">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-emerald-700 text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20">
        <div className="rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 p-12 md:p-16 text-center text-white space-y-8 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold">
            هل أنت مستعد للانضمام؟
          </h2>
          <p className="text-xl opacity-95 max-w-2xl mx-auto">
            انضم إلى نور الهدى اليوم وابدأ رحلتك في تعليم وتعلم القرآن الكريم بطريقة منظمة وفعالة
          </p>
          <Button
            size="lg"
            onClick={() => window.location.href = getLoginUrl()}
            className="bg-white text-emerald-700 hover:bg-emerald-50 font-semibold text-lg"
          >
            سجل الدخول الآن
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white border-t border-emerald-800 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={APP_LOGO} alt={APP_TITLE} className="w-10 h-10 rounded-lg" />
                <span className="font-bold text-lg">{APP_TITLE}</span>
              </div>
              <p className="text-emerald-200 text-sm">
                منظومة متكاملة لإدارة المراكز القرآنية
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-emerald-200 text-sm">
                <li><a href="#" className="hover:text-white transition">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition">عن المنظومة</a></li>
                <li><a href="#" className="hover:text-white transition">المميزات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-emerald-200 text-sm">
                <li><a href="#" className="hover:text-white transition">الدعم الفني</a></li>
                <li><a href="#" className="hover:text-white transition">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition">اتصل بنا</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-emerald-800 pt-8 text-center text-emerald-300 text-sm">
            <p>&copy; 2025 {APP_TITLE}. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

