export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center" dir="rtl">
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold text-red-600">403 - غير مصرح</h1>
        <p className="text-gray-600">لا تملك صلاحية للوصول إلى هذه الصفحة.</p>
      </div>
    </div>
  );
}
