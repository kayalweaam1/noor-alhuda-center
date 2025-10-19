import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, Sparkles, Zap, Globe, Heart } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [isHovered, setIsHovered] = useState(false);

  const features = [
    {
      icon: Sparkles,
      title: "تصميم عصري",
      description: "واجهة مستخدم جميلة وحديثة تجذب الانتباه",
    },
    {
      icon: Zap,
      title: "أداء سريع",
      description: "تحميل فوري وتجربة سلسة وسريعة",
    },
    {
      icon: Globe,
      title: "متعدد اللغات",
      description: "دعم كامل للغة العربية والإنجليزية",
    },
    {
      icon: Heart,
      title: "تجربة رائعة",
      description: "مصمم بعناية لراحة المستخدم",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800">
        <nav className="container max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">W</span>
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">مرحباً</span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              الرئيسية
            </Button>
            <Button variant="ghost" size="sm">
              عن الموقع
            </Button>
            <Button size="sm" className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
              ابدأ الآن
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container max-w-6xl mx-auto px-4 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="inline-block px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800">
                <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                  ✨ مرحباً بك في عالم جديد
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white leading-tight">
                موقع استقبالي
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
                  احترافي وعصري
                </span>
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
                اكتشف تجربة ويب فريدة مصممة بعناية لتقديم أفضل خدمة لك. موقع حديث يجمع بين الجمال والأداء.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                استكشف المزيد
                <ArrowRight className={`ml-2 w-5 h-5 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                تعرف على المزيد
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-8">
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">100%</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">مستجيب</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">⚡</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">سريع جداً</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">🎨</p>
                <p className="text-sm text-slate-600 dark:text-slate-400">جميل التصميم</p>
              </div>
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative h-96 md:h-full">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-indigo-600/20 rounded-3xl blur-3xl"></div>
            <div className="relative h-full rounded-3xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 border border-blue-200/50 dark:border-blue-800/50 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="text-6xl">🌟</div>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">مرحباً</p>
                <p className="text-slate-600 dark:text-slate-400">أهلاً وسهلاً بك</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white dark:bg-slate-900 py-20">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
              المميزات الرئيسية
            </h2>
            <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              اكتشف ما يجعل هذا الموقع مميزاً وفريداً من نوعه
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card
                  key={index}
                  className="border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow duration-300 hover:border-blue-300 dark:hover:border-blue-700"
                >
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-slate-900 dark:text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-slate-600 dark:text-slate-400">
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
        <div className="rounded-3xl bg-gradient-to-r from-blue-500 to-indigo-600 p-12 md:p-16 text-center text-white space-y-8">
          <h2 className="text-4xl md:text-5xl font-bold">
            هل أنت مستعد للبدء؟
          </h2>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            انضم إلينا اليوم واستمتع بتجربة ويب لا تُنسى مليئة بالإمكانيات والمميزات
          </p>
          <Button
            size="lg"
            className="bg-white text-blue-600 hover:bg-slate-100 font-semibold"
          >
            ابدأ الآن مجاناً
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 dark:bg-slate-950 text-white border-t border-slate-800 py-12">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <span className="font-bold">مرحباً</span>
              </div>
              <p className="text-slate-400 text-sm">
                موقع استقبالي احترافي وعصري
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الروابط</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">الرئيسية</a></li>
                <li><a href="#" className="hover:text-white transition">عن الموقع</a></li>
                <li><a href="#" className="hover:text-white transition">الخدمات</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">المساعدة</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">الدعم</a></li>
                <li><a href="#" className="hover:text-white transition">الأسئلة الشائعة</a></li>
                <li><a href="#" className="hover:text-white transition">التواصل</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">قانوني</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">الخصوصية</a></li>
                <li><a href="#" className="hover:text-white transition">الشروط</a></li>
                <li><a href="#" className="hover:text-white transition">الملفات</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-slate-400 text-sm">
            <p>&copy; 2025 مرحباً. جميع الحقوق محفوظة.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <a href="#" className="hover:text-white transition">تويتر</a>
              <a href="#" className="hover:text-white transition">فيسبوك</a>
              <a href="#" className="hover:text-white transition">إنستجرام</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

