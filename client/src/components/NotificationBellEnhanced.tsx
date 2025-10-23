import { useState, useEffect } from "react";
import { Bell, Check, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function NotificationBellEnhanced() {
  const utils = trpc.useContext();
  const { data: allNotifications, refetch } = trpc.notifications.getMy.useQuery(undefined, {
    refetchInterval: 30000, // تحديث كل 30 ثانية
  });
  
  const markAsRead = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      refetch();
    },
  });

  const deleteNotification = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("تم حذف الإشعار");
      refetch();
    },
  });

  const notifications = allNotifications?.filter((n: any) => !n.isRead) || [];
  const unreadCount = notifications.length;

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead.mutate({ id });
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    deleteNotification.mutate({ id });
  };

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "success":
        return "✅";
      case "info":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getNotificationColor = (type?: string) => {
    switch (type) {
      case "warning":
        return "bg-amber-50 border-amber-200";
      case "success":
        return "bg-green-50 border-green-200";
      case "info":
        return "bg-blue-50 border-blue-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white animate-pulse"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96" dir="rtl">
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-lg">الإشعارات</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="bg-red-100 text-red-700">
              {unreadCount} جديد
            </Badge>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="p-2 space-y-2">
              {notifications.map((notification: any) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border ${getNotificationColor(notification.type)} transition-all hover:shadow-md`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-700 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-green-100"
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 hover:bg-red-100"
                        onClick={(e) => handleDelete(notification.id, e)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium">لا توجد إشعارات جديدة</p>
              <p className="text-sm text-gray-400 mt-1">سنخبرك عند وصول إشعارات جديدة</p>
            </div>
          )}
        </ScrollArea>

        {allNotifications && allNotifications.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                variant="ghost"
                className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                onClick={() => {
                  // يمكن إضافة صفحة لجميع الإشعارات
                  toast.info("قريباً: صفحة جميع الإشعارات");
                }}
              >
                عرض جميع الإشعارات
              </Button>
            </div>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

