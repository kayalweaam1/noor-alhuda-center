import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Calendar, Clock, User, FileText, Book, Hash } from "lucide-react";

interface LessonDetailsModalProps {
  open: boolean;
  onClose: () => void;
  lesson: any;
  teacherName?: string;
}

export function LessonDetailsModal({ open, onClose, lesson, teacherName }: LessonDetailsModalProps) {
  if (!lesson) return null;

  const lessonDate = new Date(lesson.date);
  const formattedDate = lessonDate.toLocaleDateString('ar-SA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = lessonDate.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-emerald-900 flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            تفاصيل الدرس
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Title */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-4 rounded-xl border border-emerald-200">
            <div className="flex items-start gap-3">
              <BookOpen className="w-6 h-6 text-emerald-600 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-emerald-700 mb-1">عنوان الدرس</p>
                <h3 className="text-xl font-bold text-emerald-900">{lesson.title}</h3>
              </div>
            </div>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-blue-700 mb-1">التاريخ</p>
                  <p className="text-sm font-bold text-blue-900">{formattedDate}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-purple-700 mb-1">الوقت</p>
                  <p className="text-sm font-bold text-purple-900">{formattedTime}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Teacher */}
          {teacherName && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700 mb-1">المربي</p>
                  <p className="text-sm font-bold text-amber-900">{teacherName}</p>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {lesson.description && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-gray-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-700 mb-2">الوصف</p>
                  <p className="text-gray-900 leading-relaxed whitespace-pre-wrap">{lesson.description}</p>
                </div>
              </div>
            </div>
          )}

          {/* Surah and Verses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {lesson.surah && (
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center">
                    <Book className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-indigo-700 mb-1">السورة</p>
                    <p className="text-sm font-bold text-indigo-900">{lesson.surah}</p>
                  </div>
                </div>
              </div>
            )}

            {(lesson.verseFrom || lesson.verseTo) && (
              <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-rose-500 flex items-center justify-center">
                    <Hash className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-rose-700 mb-1">الآيات</p>
                    <p className="text-sm font-bold text-rose-900">
                      {lesson.verseFrom && lesson.verseTo 
                        ? `من ${lesson.verseFrom} إلى ${lesson.verseTo}`
                        : lesson.verseFrom 
                        ? `الآية ${lesson.verseFrom}`
                        : lesson.verseTo 
                        ? `حتى الآية ${lesson.verseTo}`
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">حالة الدرس</span>
            <Badge className={`${
              lesson.completed 
                ? 'bg-emerald-500' 
                : new Date(lesson.date) > new Date() 
                ? 'bg-blue-500' 
                : 'bg-amber-500'
            }`}>
              {lesson.completed 
                ? 'مكتمل' 
                : new Date(lesson.date) > new Date() 
                ? 'قادم' 
                : 'قيد التنفيذ'}
            </Badge>
          </div>

          {/* Additional Notes */}
          {lesson.notes && (
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-yellow-700 mb-2">ملاحظات إضافية</p>
                  <p className="text-yellow-900 leading-relaxed whitespace-pre-wrap">{lesson.notes}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

