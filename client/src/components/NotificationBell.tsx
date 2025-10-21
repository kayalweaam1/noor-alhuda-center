import { useState } from "react";
import { Bell } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";

export default function NotificationBell() {
  const { data: allNotifications } = trpc.notifications.getMy.useQuery();
  const notifications = allNotifications?.filter((n: any) => !n.isRead);
  const markAsRead = trpc.notifications.markAsRead.useMutation();

  const unreadCount = notifications?.length || 0;

  const handleNotificationClick = (id: string) => {
    markAsRead.mutate({ id });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="p-2 border-b">
          <h3 className="font-semibold">الإشعارات</h3>
        </div>
        {notifications && notifications.length > 0 ? (
          notifications.map((notification: any) => (
            <DropdownMenuItem
              key={notification.id}
              className="flex flex-col items-start p-3 cursor-pointer"
              onClick={() => handleNotificationClick(notification.id)}
            >
              <p className="font-medium">{notification.title}</p>
              <p className="text-sm text-gray-600">{notification.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(notification.createdAt).toLocaleString("ar")}
              </p>
            </DropdownMenuItem>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">
            لا توجد إشعارات جديدة
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
