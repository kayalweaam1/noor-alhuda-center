import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Settings, Type, Image as ImageIcon, Palette, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";

export default function AppSettingsPage() {
  // Load settings from localStorage
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('app-font-size') || 'medium';
  });
  
  const [logoSize, setLogoSize] = useState(() => {
    return parseInt(localStorage.getItem('app-logo-size') || '40');
  });
  
  const [backgroundColor, setBackgroundColor] = useState(() => {
    return localStorage.getItem('app-bg-color') || '#ffffff';
  });
  
  const [applyToPages, setApplyToPages] = useState(() => {
    return localStorage.getItem('app-bg-pages') || 'all';
  });

  const [logoUrl, setLogoUrl] = useState(() => {
    return localStorage.getItem('app-logo-url') || 'https://placehold.co/40x40/3b82f6/ffffff?text=T';
  });

  // Apply settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply font size
    switch(fontSize) {
      case 'small':
        root.style.fontSize = '14px';
        break;
      case 'medium':
        root.style.fontSize = '16px';
        break;
      case 'large':
        root.style.fontSize = '18px';
        break;
      case 'xlarge':
        root.style.fontSize = '20px';
        break;
    }

    // Apply background color
    if (applyToPages === 'all') {
      document.body.style.backgroundColor = backgroundColor;
    } else if (applyToPages === 'dashboard') {
      // Apply only to dashboard - would need more complex logic
      document.body.style.backgroundColor = backgroundColor;
    }
  }, [fontSize, backgroundColor, applyToPages]);

  const handleSave = () => {
    // Save to localStorage
    localStorage.setItem('app-font-size', fontSize);
    localStorage.setItem('app-logo-size', logoSize.toString());
    localStorage.setItem('app-bg-color', backgroundColor);
    localStorage.setItem('app-bg-pages', applyToPages);
    localStorage.setItem('app-logo-url', logoUrl);
    
    toast.success("تم حفظ الإعدادات بنجاح");
    
    // Reload to apply changes
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleReset = () => {
    setFontSize('medium');
    setLogoSize(40);
    setBackgroundColor('#ffffff');
    setApplyToPages('all');
    setLogoUrl('https://placehold.co/40x40/3b82f6/ffffff?text=T');
    
    localStorage.removeItem('app-font-size');
    localStorage.removeItem('app-logo-size');
    localStorage.removeItem('app-bg-color');
    localStorage.removeItem('app-bg-pages');
    localStorage.removeItem('app-logo-url');
    
    toast.success("تم إعادة تعيين الإعدادات");
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
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
            <p className="text-gray-600 mt-1">تخصيص مظهر وإعدادات التطبيق</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Font Size Settings */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <Type className="w-5 h-5" />
              حجم الخط
            </CardTitle>
            <CardDescription>تكبير أو تصغير الخط في كل التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>اختر حجم الخط</Label>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">صغير (14px)</SelectItem>
                  <SelectItem value="medium">متوسط (16px)</SelectItem>
                  <SelectItem value="large">كبير (18px)</SelectItem>
                  <SelectItem value="xlarge">كبير جداً (20px)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-700" style={{ fontSize: fontSize === 'small' ? '14px' : fontSize === 'medium' ? '16px' : fontSize === 'large' ? '18px' : '20px' }}>
                مثال على النص: مركز نور الهدى لتحفيظ القرآن الكريم
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Logo Settings */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              إعدادات اللوجو
            </CardTitle>
            <CardDescription>تغيير اللوجو والتحكم في حجمه</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>رابط اللوجو</Label>
              <Input
                type="url"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                placeholder="https://example.com/logo.png"
                className="mt-2"
              />
            </div>
            
            <div>
              <Label>حجم اللوجو: {logoSize}px</Label>
              <Slider
                value={[logoSize]}
                onValueChange={(value) => setLogoSize(value[0])}
                min={20}
                max={100}
                step={5}
                className="mt-2"
              />
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
              <img 
                src={logoUrl} 
                alt="Logo Preview" 
                style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                className="rounded-lg"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/40x40/3b82f6/ffffff?text=T';
                }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Background Color Settings */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              لون الخلفية
            </CardTitle>
            <CardDescription>تغيير لون خلفية التطبيق</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>اختر اللون</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  className="flex-1"
                />
              </div>
            </div>
            
            <div>
              <Label>تطبيق على</Label>
              <Select value={applyToPages} onValueChange={setApplyToPages}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفحات</SelectItem>
                  <SelectItem value="dashboard">لوحة التحكم فقط</SelectItem>
                  <SelectItem value="reports">صفحات التقارير فقط</SelectItem>
                  <SelectItem value="none">لا شيء</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div 
              className="p-4 rounded-lg border border-gray-200 h-24"
              style={{ backgroundColor: backgroundColor }}
            >
              <p className="text-gray-700 font-semibold">معاينة الخلفية</p>
            </div>
          </CardContent>
        </Card>

        {/* Quick Presets */}
        <Card className="border-emerald-200">
          <CardHeader>
            <CardTitle className="text-emerald-900">الإعدادات السريعة</CardTitle>
            <CardDescription>قوالب جاهزة للإعدادات</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setFontSize('medium');
                setBackgroundColor('#ffffff');
                setLogoSize(40);
              }}
            >
              <div className="w-4 h-4 rounded bg-white border border-gray-300 ml-2" />
              الوضع الافتراضي (أبيض)
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setFontSize('large');
                setBackgroundColor('#f0fdf4');
                setLogoSize(50);
              }}
            >
              <div className="w-4 h-4 rounded bg-emerald-50 border border-emerald-300 ml-2" />
              الوضع الأخضر الفاتح
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setFontSize('xlarge');
                setBackgroundColor('#f9fafb');
                setLogoSize(60);
              }}
            >
              <div className="w-4 h-4 rounded bg-gray-50 border border-gray-300 ml-2" />
              وضع القراءة (خط كبير)
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                setFontSize('medium');
                setBackgroundColor('#eff6ff');
                setLogoSize(40);
              }}
            >
              <div className="w-4 h-4 rounded bg-blue-50 border border-blue-300 ml-2" />
              الوضع الأزرق الهادئ
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
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700"
            >
              <Save className="w-4 h-4 ml-2" />
              حفظ الإعدادات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

