import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Save, MessageSquare } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";

export default function AppSettingsPage() {
  const [welcomeMessage, setWelcomeMessage] = useState("");
  
  // Fetch current settings
  const { data: settings, refetch } = trpc.appSettings.get.useQuery();
  const updateSettings = trpc.appSettings.update.useMutation({
    onSuccess: () => {
      toast.success("تم حفظ الإعدادات بنجاح");
      refetch();
    },
    onError: (error) => {
      toast.error("فشل في حفظ الإعدادات: " + error.message);
    },
  });

  // Load settings when data is available
  useEffect(() => {
    if (settings) {
      setWelcomeMessage(settings.welcomeMessage || "");
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings.mutate({
      welcomeMessage,
    });
  };

  const handleReset = () => {
    setWelcomeMessage("");
    toast.success("تم إعادة تعيين الإعدادات");
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-emerald-100 p-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 flex items-center justify-center">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">إعدادات التطبيق</h1>
            <p className="text-gray-600 mt-1">تخصيص رسائل وإعدادات التطبيق</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Welcome Message Settings */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              رسالة ترحيبية
            </CardTitle>
            <CardDescription>
              رسالة أو آية قرآنية تظهر في جميع صفحات المربين والطلاب
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="welcomeMessage">نص الرسالة</Label>
              <Textarea
                id="welcomeMessage"
                value={welcomeMessage}
                onChange={(e) => setWelcomeMessage(e.target.value)}
                placeholder="مثال: بسم الله الرحمن الرحيم - ﴿إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ﴾"
                className="mt-2 min-h-[120px] text-lg leading-relaxed"
                dir="rtl"
              />
              <p className="text-sm text-gray-500 mt-2">
                يمكنك كتابة آية قرآنية، حديث شريف، أو أي رسالة تحفيزية
              </p>
            </div>
            
            {/* Preview */}
            {welcomeMessage && (
              <div className="mt-6">
                <Label>معاينة الرسالة</Label>
                <div className="mt-2 p-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border-2 border-emerald-200 shadow-sm">
                  <div className="text-center">
                    <div className="inline-block">
                      <div className="relative">
                        {/* Decorative elements */}
                        <div className="absolute -top-4 -right-4 text-emerald-300 text-4xl opacity-50">❝</div>
                        <div className="absolute -bottom-4 -left-4 text-emerald-300 text-4xl opacity-50">❞</div>
                        
                        {/* Message text */}
                        <p className="text-xl md:text-2xl font-semibold text-emerald-900 leading-relaxed px-8 py-4">
                          {welcomeMessage}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative border */}
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="h-px w-16 bg-gradient-to-r from-transparent to-emerald-300"></div>
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    <div className="h-px w-16 bg-gradient-to-l from-transparent to-emerald-300"></div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Presets */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">رسائل جاهزة</CardTitle>
            <CardDescription>اختر من الرسائل الجاهزة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start text-right h-auto py-3"
              onClick={() => setWelcomeMessage("﴿إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ﴾")}
            >
              <span className="text-base">﴿إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ﴾</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-right h-auto py-3"
              onClick={() => setWelcomeMessage("﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ﴾")}
            >
              <span className="text-base">﴿وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ﴾</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-right h-auto py-3"
              onClick={() => setWelcomeMessage("خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ")}
            >
              <span className="text-base">خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ</span>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start text-right h-auto py-3"
              onClick={() => setWelcomeMessage("مرحباً بكم في مركز نور الهدى لتحفيظ القرآن الكريم")}
            >
              <span className="text-base">مرحباً بكم في مركز نور الهدى لتحفيظ القرآن الكريم</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <Card className="border-emerald-200">
        <CardContent className="pt-6">
          <div className="flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              className="border-gray-300"
            >
              إعادة تعيين
            </Button>
            <Button
              onClick={handleSave}
              disabled={updateSettings.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Save className="w-4 h-4 ml-2" />
              {updateSettings.isPending ? "جاري الحفظ..." : "حفظ الإعدادات"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

