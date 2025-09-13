# دليل إعداد لوحة الإدارة

## خطوات الإعداد

### 1. تثبيت التبعيات
```bash
npm install
```

### 2. إعداد متغيرات البيئة
أنشئ ملف `.env.local` في مجلد `admin-panel` وأضف المحتوى التالي:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/watergb"
DIRECT_URL="postgresql://username:password@localhost:5432/watergb"

# JWT Secret (should match backend)
JWT_SECRET="your-jwt-secret-key"

# Backend API URL
NEXT_PUBLIC_API_URL="http://localhost:3001"

# Admin credentials
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
```

### 3. إعداد قاعدة البيانات
```bash
npx prisma generate
npx prisma db push
```

### 4. تشغيل لوحة الإدارة
```bash
npm run dev
```

### 5. الوصول للوحة الإدارة
افتح المتصفح واذهب إلى: `http://localhost:3000`

## بيانات تسجيل الدخول الافتراضية
- اسم المستخدم: `admin`
- كلمة المرور: `admin123`

## ملاحظات مهمة
- تأكد من تشغيل خادم قاعدة البيانات (PostgreSQL)
- تأكد من تشغيل خادم API الخلفي على المنفذ 3001
- يجب أن تكون متغيرات البيئة متطابقة مع الخادم الخلفي
