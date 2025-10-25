import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Camera, Save, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import BackButton from "@/components/BackButton";

export default function Profile() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const utils = trpc.useUtils();
  
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState(user?.profileImage || "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);

  const updateProfileMutation = trpc.auth.updateProfile.useMutation({
    onSuccess: () => {
      toast.success("تم تحديث الملف الشخصي بنجاح");
      utils.auth.me.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "فشل تحديث الملف الشخصي");
    },
  });

  const changePasswordMutation = trpc.auth.changePassword.useMutation({
    onSuccess: () => {
      toast.success("تم تغيير كلمة المرور بنجاح");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.message || "فشل تغيير كلمة المرور");
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let finalImageUrl = profileImage;
    
    // If there's a new image, convert to base64
    if (imageFile) {
      finalImageUrl = imagePreview || "";
    }

    updateProfileMutation.mutate({
      name,
      email: email || undefined,
      phone: phone || undefined,
      profileImage: finalImageUrl || undefined,
    });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentPassword || !newPassword) {
      toast.error("يرجى ملء جميع الحقول");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error("كلمة المرور الجديدة غير متطابقة");
      return;
    }
    
    if (newPassword.length < 6) {
      toast.error("كلمة المرور يجب أن تكون 6 أحرف على الأقل");
      return;
    }

    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  const getDashboardPath = () => {
    switch (user?.role) {
      case "admin":
        return "/admin/dashboard";
      case "teacher":
        return "/teacher/dashboard";
      case "student":
        return "/student/dashboard";
      default:
        return "/";
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <BackButton to={getDashboardPath()} />
      
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">الملف الشخصي</h1>
        <p className="text-gray-600 mt-2">إدارة معلوماتك الشخصية</p>
      </div>

      <div className="grid gap-6">
        {/* Profile Picture */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              الصورة الشخصية
            </CardTitle>
            <CardDescription>قم بتحميل صورة شخصية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6">
              <div className="relative">
                {imagePreview ? (
                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-emerald-200"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center border-4 border-emerald-200">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
                <label
                  htmlFor="profile-image"
                  className="absolute bottom-0 right-0 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full p-2 cursor-pointer transition-colors"
                >
                  <Camera className="w-4 h-4" />
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  اختر صورة بصيغة JPG أو PNG
                </p>
                <p className="text-xs text-gray-500">
                  الحجم الأقصى: 5 ميجابايت
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              المعلومات الشخصية
            </CardTitle>
            <CardDescription>قم بتحديث معلوماتك الأساسية</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="name">الاسم الكامل *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    dir="ltr"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <User className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">الدور</p>
                  <p className="text-xs text-blue-700">
                    {user?.role === "admin" && "مدير"}
                    {user?.role === "teacher" && "مربي"}
                    {user?.role === "student" && "طالب"}
                  </p>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700"
                disabled={updateProfileMutation.isLoading}
              >
                <Save className="w-4 h-4 ml-2" />
                {updateProfileMutation.isLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
            <CardDescription>قم بتحديث كلمة المرور الخاصة بك</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <Label htmlFor="current-password">كلمة المرور الحالية *</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="new-password">كلمة المرور الجديدة *</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>
              
              <div>
                <Label htmlFor="confirm-password">تأكيد كلمة المرور الجديدة *</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                variant="outline"
                disabled={changePasswordMutation.isLoading}
              >
                {changePasswordMutation.isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

