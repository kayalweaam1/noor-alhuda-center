import { Link, useLocation } from "wouter";
import { LogOut, Bell, User, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";

interface AssistantLayoutProps {
  children: React.ReactNode;
}

export default function AssistantLayout({ children }: AssistantLayoutProps) {
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { data: notifications } = trpc.notifications.getMy.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const navItems = [
    { path: "/assistant/dashboard", label: "الرئيسية", icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-emerald-200 shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">ن</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-emerald-900">نور الهدى</h1>
                <p className="text-xs text-emerald-600">لوحة المساعد</p>
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{user?.name || "المساعد"}</p>
                  <p className="text-xs text-emerald-600">مساعد</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex gap-1 -mb-px">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path;
              return (
                <Link key={item.path} href={item.path}>
                  <Button
                    variant="ghost"
                    className={`rounded-t-lg rounded-b-none h-12 gap-2 ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border-b-2 border-emerald-600"
                        : "text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-emerald-200 mt-12">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2025 نور الهدى - جميع الحقوق محفوظة
          </p>
        </div>
      </footer>
    </div>
  );
}

