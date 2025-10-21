import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, MessageSquare, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AssistantDashboard() {
  const { data: profile } = trpc.assistants.getMyProfile.useQuery();
  const { data: notes, refetch } = trpc.assistantNotes.getMyNotes.useQuery();
  const markAsRead = trpc.assistantNotes.markAsRead.useMutation();

  const unreadNotes = notes?.filter(n => !n.isRead).length || 0;
  const averageRating =
    notes && notes.length > 0
      ? (
          notes
            .filter(n => n.rating)
            .reduce((sum, n) => sum + (n.rating || 0), 0) /
          notes.filter(n => n.rating).length
        ).toFixed(1)
      : "0";

  const handleMarkAsRead = async (noteId: string) => {
    await markAsRead.mutateAsync({ id: noteId });
    refetch();
  };

  return (
    <div className="p-6 space-y-6" dir="rtl">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">
          مرحباً، {profile?.userName || "المساعد"}
        </h1>
        <p className="text-emerald-50">
          الحلقة: {profile?.halaqaName || "غير محدد"}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <p className="text-sm text-blue-700">الملاحظات الجديدة</p>
              </div>
              <p className="text-4xl font-bold text-blue-900">{unreadNotes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <p className="text-sm text-amber-700">متوسط التقييم</p>
              </div>
              <p className="text-4xl font-bold text-amber-900">
                {averageRating}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <BookOpen className="w-5 h-5 text-emerald-600" />
                <p className="text-sm text-emerald-700">إجمالي الملاحظات</p>
              </div>
              <p className="text-4xl font-bold text-emerald-900">
                {notes?.length || 0}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Notes List */}
      <Card className="border-emerald-200">
        <CardHeader>
          <CardTitle className="text-2xl text-emerald-900">
            الملاحظات والتقييمات
          </CardTitle>
          <CardDescription>ملاحظات من المربين في حلقتك</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {notes && notes.length > 0 ? (
              notes.map(note => (
                <Card
                  key={note.id}
                  className={`${!note.isRead ? "border-blue-300 bg-blue-50/30" : "border-gray-200"}`}
                >
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">
                            {note.title}
                          </h3>
                          {!note.isRead && (
                            <Badge className="bg-blue-500">جديد</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          من:{" "}
                          <span className="font-semibold">
                            {note.teacherName || "غير محدد"}
                          </span>
                        </p>
                        {note.rating && (
                          <div className="flex items-center gap-1 mb-2">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < note.rating!
                                    ? "text-amber-500 fill-amber-500"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                            <span className="text-sm text-gray-600 mr-2">
                              ({note.rating}/5)
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        {note.createdAt
                          ? new Date(note.createdAt).toLocaleDateString("ar-SA")
                          : "-"}
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 whitespace-pre-wrap">
                      {note.content}
                    </p>

                    {!note.isRead && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-blue-300 text-blue-600 hover:bg-blue-50"
                        onClick={() => handleMarkAsRead(note.id)}
                      >
                        تعليم كمقروء
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12">
                <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد ملاحظات حتى الآن</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
