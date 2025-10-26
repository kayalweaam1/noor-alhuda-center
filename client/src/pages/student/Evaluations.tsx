import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Star, TrendingUp, CheckCircle, Calendar } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Badge } from "@/components/ui/badge";

export default function StudentEvaluations() {
  const { user } = useAuth();
  const { data: student } = trpc.students.getMyProfile.useQuery(
    undefined,
    { enabled: !!user?.id && user?.role === 'student' }
  );

  const studentIdForQuery = student?.id ?? 'placeholder';
  const { data: evaluations = [] } = trpc.evaluations.getByStudent.useQuery(
    { studentId: studentIdForQuery },
    { enabled: !!student?.id }
  );

  // Calculate statistics
  const averageScore = evaluations.length > 0
    ? Math.round(
        evaluations.reduce((sum: number, e: any) => sum + (e.score || 0), 0) / evaluations.length
      )
    : 0;

  const excellentCount = evaluations.filter((e: any) => (e.score || 0) >= 90).length;
  const goodCount = evaluations.filter((e: any) => (e.score || 0) >= 75 && (e.score || 0) < 90).length;

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-200";
    if (score >= 75) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 60) return "text-amber-600 bg-amber-50 border-amber-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "ممتاز";
    if (score >= 75) return "جيد جداً";
    if (score >= 60) return "جيد";
    return "يحتاج تحسين";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50" dir="rtl">
      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-2 px-6 text-center">
        <p className="text-sm font-medium">
          مرحباً بك في مركز نور الهدى للقرآن الكريم - نتمنى لك يوماً مباركاً وموفقاً
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
              <Award className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-amber-900">التقييمات</h1>
              <p className="text-amber-700 mt-1">متابعة تقييماتك وأدائك</p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-amber-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">المعدل العام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-amber-900 mb-2">{averageScore}%</div>
              <CardDescription className="text-gray-600">{getScoreLabel(averageScore)}</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">إجمالي التقييمات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-blue-900 mb-2">{evaluations.length}</div>
              <CardDescription className="text-gray-600">تقييم</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">تقييمات ممتازة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-emerald-900 mb-2">{excellentCount}</div>
              <CardDescription className="text-gray-600">90% فأكثر</CardDescription>
            </CardContent>
          </Card>

          <Card className="border-cyan-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-gray-700">تقييمات جيدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-cyan-900 mb-2">{goodCount}</div>
              <CardDescription className="text-gray-600">75% - 89%</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Performance Chart */}
        {averageScore > 0 && (
          <Card className="border-blue-200">
            <CardHeader>
              <CardTitle className="text-blue-900">مستوى الأداء</CardTitle>
              <CardDescription>تقييم شامل لأدائك</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">المعدل العام</span>
                    <span className="text-2xl font-bold text-gray-900">{averageScore}%</span>
                  </div>
                  <div className="h-8 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 flex items-center justify-end px-4 ${
                        averageScore >= 90
                          ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                          : averageScore >= 75
                          ? 'bg-gradient-to-r from-blue-500 to-cyan-600'
                          : averageScore >= 60
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-600'
                          : 'bg-gradient-to-r from-red-500 to-orange-600'
                      }`}
                      style={{ width: `${averageScore}%` }}
                    >
                      <span className="text-white font-bold text-sm">
                        {getScoreLabel(averageScore)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Evaluations List */}
        <Card className="border-amber-200">
          <CardHeader>
            <CardTitle className="text-amber-900">سجل التقييمات</CardTitle>
            <CardDescription>جميع التقييمات والملاحظات من المربي</CardDescription>
          </CardHeader>
          <CardContent>
            {evaluations.length === 0 ? (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">لا توجد تقييمات بعد</p>
              </div>
            ) : (
              <div className="space-y-3">
                {evaluations.map((evaluation: any) => (
                  <div
                    key={evaluation.id}
                    className={`p-4 rounded-lg border-2 ${getScoreColor(evaluation.score || 0)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            (evaluation.score || 0) >= 90 ? 'bg-emerald-500' :
                            (evaluation.score || 0) >= 75 ? 'bg-blue-500' :
                            (evaluation.score || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}>
                            <Star className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">
                              {evaluation.evaluationType || 'تقييم'}
                            </h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(evaluation.date).toLocaleDateString('ar-SA', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                })}
                              </span>
                            </div>
                          </div>
                        </div>

                        {evaluation.feedback && (
                          <div className="mt-3 p-3 bg-white rounded-lg">
                            <p className="text-gray-700">{evaluation.feedback}</p>
                          </div>
                        )}
                      </div>

                      <div className="mr-4 text-center">
                        <div className="text-3xl font-bold mb-1" style={{
                          color: (evaluation.score || 0) >= 90 ? '#059669' :
                                 (evaluation.score || 0) >= 75 ? '#2563eb' :
                                 (evaluation.score || 0) >= 60 ? '#d97706' : '#dc2626'
                        }}>
                          {evaluation.score || 0}%
                        </div>
                        <Badge className={
                          (evaluation.score || 0) >= 90 ? 'bg-emerald-500' :
                          (evaluation.score || 0) >= 75 ? 'bg-blue-500' :
                          (evaluation.score || 0) >= 60 ? 'bg-amber-500' : 'bg-red-500'
                        }>
                          {getScoreLabel(evaluation.score || 0)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

