# دليل تشغيل ونشر تطبيق مركز نور الهدى

## 📋 معلومات المشروع

**اسم المشروع:** مركز نور الهدى للقرآن الكريم  
**النوع:** نظام إدارة مركز تحفيظ القرآن  
**التقنيات:** React + TypeScript + Node.js + MySQL + tRPC

---

## ✅ الإصلاحات التي تمت

### 1. إصلاح نظام الجلسات (Sessions)
- كان التطبيق يستخدم ملف `server/index.ts` خاطئ بدون sessions
- تم إصلاحه ليستخدم `server/_core/index.ts` الصحيح
- الآن نظام التوثيق والجلسات يعمل بشكل صحيح

### 2. إضافة الوظائف المفقودة
- `markAssistantNoteAsRead` - لتحديث حالة قراءة ملاحظات المساعدين
- `getStatistics` - لجلب الإحصائيات

### 3. إزالة الخلفية الخضراء
- تم إزالة جميع الصور الخضراء
- تم تغيير الخلفية إلى بيضاء في جميع الصفحات

### 4. تفريغ قاعدة البيانات
- تم حذف جميع البيانات التجريبية
- تم إضافة مدير عام واحد فقط

---

## 🔑 بيانات تسجيل الدخول

**المدير العام:**
- الاسم: وئام كيال
- رقم الهاتف: `0542632557`
- كلمة المرور: `admin123`

---

## 🚀 التشغيل المحلي (Local Development)

### المتطلبات
- Node.js 18+ 
- MySQL 8+
- pnpm

### الخطوات

1. **تثبيت التبعيات:**
```bash
pnpm install
```

2. **إعداد قاعدة البيانات:**
```bash
# إنشاء قاعدة البيانات
mysql -u root -p
CREATE DATABASE noor_alhuda;
CREATE USER 'noor_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON noor_alhuda.* TO 'noor_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

3. **إعداد ملف البيئة (.env):**
```env
DATABASE_URL=mysql://noor_user:password@localhost:3306/noor_alhuda
COOKIE_SECRET=your-secret-key-here
NODE_ENV=development
```

4. **تشغيل Migrations:**
```bash
pnpm db:push
```

5. **تشغيل التطبيق:**
```bash
# وضع التطوير
pnpm dev

# أو وضع الإنتاج
pnpm build
pnpm start
```

6. **فتح التطبيق:**
افتح المتصفح على `http://localhost:3000`

---

## 🌐 النشر على الإنترنت (Deployment)

### الخيار 1: Render.com (موصى به)

1. **إنشاء حساب على Render:**
   - اذهب إلى https://render.com
   - سجل حساب جديد

2. **إنشاء قاعدة بيانات MySQL:**
   - اضغط "New +" → "MySQL"
   - اختر اسم: `noor-alhuda-db`
   - اختر الخطة المجانية
   - انسخ `Internal Database URL`

3. **إنشاء Web Service:**
   - اضغط "New +" → "Web Service"
   - اربط حساب GitHub
   - اختر repository: `noor-alhuda-center`
   - الإعدادات:
     - **Name:** `noor-alhuda`
     - **Build Command:** `pnpm install && pnpm build`
     - **Start Command:** `pnpm start`
   
4. **إضافة Environment Variables:**
```
DATABASE_URL=<Internal Database URL من الخطوة 2>
COOKIE_SECRET=<مفتاح عشوائي طويل>
NODE_ENV=production
```

5. **Deploy:**
   - اضغط "Create Web Service"
   - انتظر حتى ينتهي النشر
   - افتح الرابط الذي يظهر

### الخيار 2: Railway.app

1. اذهب إلى https://railway.app
2. سجل حساب جديد
3. اضغط "New Project" → "Deploy from GitHub repo"
4. اختر `noor-alhuda-center`
5. أضف MySQL database
6. أضف Environment Variables
7. Deploy

---

## 📊 بنية قاعدة البيانات

### الجداول الرئيسية:
- `users` - المستخدمون (مدراء، مربون، طلاب، مساعدون)
- `teachers` - معلومات المربين
- `students` - معلومات الطلاب
- `lessons` - الدروس
- `attendance` - الحضور
- `evaluations` - التقييمات
- `notifications` - الإشعارات
- `assistants` - المساعدون
- `assistantNotes` - ملاحظات المساعدين
- `otpCodes` - رموز OTP

---

## 🔧 الأوامر المفيدة

```bash
# تثبيت التبعيات
pnpm install

# تشغيل وضع التطوير
pnpm dev

# بناء المشروع
pnpm build

# تشغيل وضع الإنتاج
pnpm start

# تحديث قاعدة البيانات
pnpm db:push

# إنشاء migration جديد
pnpm db:generate
```

---

## 📝 ملاحظات مهمة

1. **الأمان:**
   - غيّر `COOKIE_SECRET` إلى قيمة عشوائية قوية
   - لا تشارك بيانات قاعدة البيانات مع أحد
   - غيّر كلمة مرور المدير بعد أول تسجيل دخول

2. **قاعدة البيانات:**
   - احتفظ بنسخة احتياطية دورية
   - قاعدة البيانات الحالية فارغة إلا من حساب المدير

3. **الدعم الفني:**
   - إذا واجهت أي مشكلة، راجع ملف `FIXES_REPORT.md`
   - تأكد من تشغيل MySQL قبل تشغيل التطبيق

---

## ✨ الميزات

- ✅ إدارة المستخدمين (إضافة، تعديل، حذف)
- ✅ إدارة المربين والطلاب
- ✅ تسجيل الحضور والغياب
- ✅ إدارة الدروس
- ✅ التقييمات والدرجات
- ✅ نظام الإشعارات
- ✅ التقارير والإحصائيات
- ✅ واجهة عربية كاملة
- ✅ تصميم متجاوب (يعمل على الهاتف)

---

**تم بنجاح! 🎉**

