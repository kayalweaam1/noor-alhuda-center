	import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  BarChart3,
  Shield,
  Key,
  CircleDollarSign,
  Calendar,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";
import NotificationBellEnhanced from "../NotificationBellEnhanced";
import LogosHeader from "../LogosHeader";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const { isSuperAdmin } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: LayoutDashboard,
      path: "/admin/dashboard",
    },
    {
      title: "المستخدمين",
      icon: Users,
      path: "/admin/users",
    },
    {
      title: "المربين",
      icon: GraduationCap,
      path: "/admin/teachers",
    },
    {
      title: "الطلاب",
      icon: Users,
      path: "/admin/students",
    },
    {
      title: "الدروس",
      icon: BookOpen,
      path: "/admin/lessons",
    },
    {
      title: "التقارير",
      icon: FileText,
      path: "/admin/reports",
    },
    {
      title: "الإحصائيات",
      icon: BarChart3,
      path: "/admin/analytics",
    },
    {
      title: "التقرير المالي",
      icon: CircleDollarSign,
      path: "/admin/payments-summary",
    },
    {
      title: "التقرير الشهري",
      icon: Calendar,
      path: "/admin/monthly-report",
    },
    {
      title: "إشعارات الدفع",
      icon: Bell,
      path: "/admin/payment-notifications",
    },
    ...(isSuperAdmin ? [{
      title: "إدارة المدراء",
      icon: Shield,
      path: "/admin/admins",
    }] : []),
    {
      title: "حسابات المستخدمين",
      icon: Key,
      path: "/admin/user-accounts",
    },
    {
      title: "الإعدادات",
      icon: Settings,
      path: "/admin/settings",
    },
  ];

  return (
    <div className="min-h-screen bg-white" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white border-l border-emerald-200 shadow-xl transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-6 border-b border-emerald-200">
          <LogosHeader size="small" showText={false} />
          <div className="text-center mt-3">
            <h2 className="font-bold text-base text-emerald-900">{APP_TITLE}</h2>
            <p className="text-xs text-emerald-600">لوحة الإدارة</p>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
                    isActive
                      ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-emerald-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-emerald-200 bg-white">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0) || 'م'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user?.name || 'المدير'}
              </p>
              <p className="text-xs text-gray-600">مدير النظام</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full border-red-200 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-4 h-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "mr-64" : "mr-0"
        }`}
      >
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-6 text-center">
          <p className="text-sm font-medium">
            مرحباً بكم في مركز نور الهدى للتربية والتحفيظ
          </p>
        </div>
        
        {/* Top Header */}
        <header className="bg-white border-b border-emerald-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-emerald-50 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-emerald-700" />
                ) : (
                  <Menu className="w-6 h-6 text-emerald-700" />
                )}
              </button>
              <h1 className="text-xl font-bold text-emerald-900">
                {menuItems.find((item) => item.path === location)?.title || "لوحة التحكم"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <NotificationBellEnhanced />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main>{children}</main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}

