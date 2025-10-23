	import { APP_TITLE } from "@/const";
import { trpc } from "@/lib/trpc";
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  TrendingUp,
  LogOut,
  Menu,
  X,
  Bell,
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "../ui/button";

interface StudentLayoutProps {
  children: React.ReactNode;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [location] = useLocation();
  const { data: user } = trpc.auth.me.useQuery();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    window.location.href = '/';
  };

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: LayoutDashboard,
      path: "/student/dashboard",
    },
    {
      title: "الحضور والغياب",
      icon: Calendar,
      path: "/student/attendance",
    },
    {
      title: "الدروس",
      icon: BookOpen,
      path: "/student/lessons",
    },
    {
      title: "التقييمات",
      icon: TrendingUp,
      path: "/student/evaluations",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full bg-white border-l border-blue-200 shadow-xl transition-all duration-300 z-50 ${
          sidebarOpen ? "w-64" : "w-0"
        } overflow-hidden`}
      >
        <div className="p-6 border-b border-blue-200">
          <div className="flex flex-col items-center gap-3">
	            <img src="/logo_transparent.png" alt={APP_TITLE} className="w-24 h-24 object-contain" />
            <div className="text-center">
              <h2 className="font-bold text-lg text-blue-900">{APP_TITLE}</h2>
              <p className="text-xs text-blue-600">لوحة الطالب</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <a
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg"
                      : "text-gray-700 hover:bg-blue-50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.title}</span>
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 right-0 left-0 p-4 border-t border-blue-200 bg-white">
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <span className="text-white font-bold">
                {user?.name?.charAt(0) || 'ط'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">
                {user?.name || 'الطالب'}
              </p>
              <p className="text-xs text-gray-600">طالب</p>
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
        {/* Top Header */}
        <header className="bg-white border-b border-blue-200 shadow-sm sticky top-0 z-40">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {sidebarOpen ? (
                  <X className="w-6 h-6 text-blue-700" />
                ) : (
                  <Menu className="w-6 h-6 text-blue-700" />
                )}
              </button>
              <h1 className="text-xl font-bold text-blue-900">
                {menuItems.find((item) => item.path === location)?.title || "لوحة التحكم"}
              </h1>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 rounded-lg hover:bg-blue-50 transition-colors">
                <Bell className="w-6 h-6 text-blue-700" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
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

