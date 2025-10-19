import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Plus, Trash2, Crown } from "lucide-react";
import { toast } from "sonner";

export default function Admins() {
  const { isSuperAdmin } = useAuth();
  const [adminPhones, setAdminPhones] = useState([
    { phone: "+972542632557", name: "المدير العام", isSuperAdmin: true },
    { phone: "+972506381455", name: "مدير", isSuperAdmin: false },
  ]);
  const [newPhone, setNewPhone] = useState("+972");
  const [newName, setNewName] = useState("");

  // Only super admin can access this page
  if (!isSuperAdmin) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center">
                <Shield className="w-16 h-16 mx-auto mb-4 text-red-500" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  غير مصرح
                </h2>
                <p className="text-gray-600">
                  فقط المدير العام يمكنه الوصول إلى هذه الصفحة
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    );
  }

  const handleAddAdmin = () => {
    if (!newPhone || newPhone.length < 10) {
      toast.error("رقم الهاتف غير صحيح");
      return;
    }

    if (!newName) {
      toast.error("يرجى إدخال اسم المدير");
      return;
    }

    if (adminPhones.some(a => a.phone === newPhone)) {
      toast.error("هذا الرقم مسجل بالفعل");
      return;
    }

    setAdminPhones([...adminPhones, { phone: newPhone, name: newName, isSuperAdmin: false }]);
    setNewPhone("+972");
    setNewName("");
    toast.success("تم إضافة المدير بنجاح");
  };

  const handleRemoveAdmin = (phone: string) => {
    // Cannot remove super admin
    if (phone === "+972542632557") {
      toast.error("لا يمكن حذف المدير العام");
      return;
    }

    if (confirm("هل أنت متأكد من حذف هذا المدير؟")) {
      setAdminPhones(adminPhones.filter(a => a.phone !== phone));
      toast.success("تم حذف المدير بنجاح");
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">إدارة المدراء</h1>
        <p className="text-gray-600 mt-2">
          إضافة وحذف المدراء (متاح فقط للمدير العام)
        </p>
      </div>

      {/* Add Admin Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة مدير جديد
          </CardTitle>
          <CardDescription>
            أدخل رقم الهاتف واسم المدير الجديد
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              type="text"
              placeholder="اسم المدير"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="+972501234567"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              dir="ltr"
            />
            <Button onClick={handleAddAdmin} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Admins List */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة المدراء</CardTitle>
          <CardDescription>
            جميع المدراء المسجلين في النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adminPhones.map((admin) => (
              <div
                key={admin.phone}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {admin.isSuperAdmin ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                      <Crown className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-white" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {admin.name}
                      {admin.isSuperAdmin && (
                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          مدير عام
                        </span>
                      )}
                    </h3>
                    <p className="text-sm text-gray-600" dir="ltr">
                      {admin.phone}
                    </p>
                  </div>
                </div>

                {!admin.isSuperAdmin && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin.phone)}
                  >
                    <Trash2 className="w-4 h-4 ml-2" />
                    حذف
                  </Button>
                )}
              </div>
            ))}
          </div>

          {adminPhones.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              لا يوجد مدراء مسجلين
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-1">ملاحظة مهمة</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• المدير العام (+972542632557) لا يمكن حذفه</li>
                <li>• فقط المدير العام يمكنه إضافة وحذف المدراء الآخرين</li>
                <li>• جميع المدراء لهم نفس الصلاحيات في النظام</li>
                <li>• عند إضافة مدير جديد، يمكنه تسجيل الدخول فوراً برقم هاتفه</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

