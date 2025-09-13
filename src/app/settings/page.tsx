'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save, RefreshCw } from 'lucide-react'

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    jwtSecret: 'your-jwt-secret-key',
    adminUsername: 'admin',
    adminPassword: 'admin123',
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleSave = async () => {
    setIsSaving(true)
    // In a real app, you would save these settings to a backend
    setTimeout(() => {
      setIsSaving(false)
      alert('تم حفظ الإعدادات بنجاح')
    }, 1000)
  }

  const handleRefresh = () => {
    window.location.reload()
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">الإعدادات</h1>
          <p className="text-gray-600 mt-2">إدارة إعدادات النظام</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                إعدادات النظام
              </CardTitle>
              <CardDescription>
                إعدادات الاتصال بقاعدة البيانات والخادم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="apiUrl">رابط API</Label>
                <Input
                  id="apiUrl"
                  value={settings.apiUrl}
                  onChange={(e) => setSettings({ ...settings, apiUrl: e.target.value })}
                  placeholder="http://localhost:3001"
                />
              </div>
              <div>
                <Label htmlFor="jwtSecret">مفتاح JWT</Label>
                <Input
                  id="jwtSecret"
                  type="password"
                  value={settings.jwtSecret}
                  onChange={(e) => setSettings({ ...settings, jwtSecret: e.target.value })}
                  placeholder="your-jwt-secret-key"
                />
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </Button>
                <Button variant="outline" onClick={handleRefresh}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  تحديث
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات المدير</CardTitle>
              <CardDescription>
                بيانات تسجيل دخول المدير
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminUsername">اسم المستخدم</Label>
                <Input
                  id="adminUsername"
                  value={settings.adminUsername}
                  onChange={(e) => setSettings({ ...settings, adminUsername: e.target.value })}
                  placeholder="admin"
                />
              </div>
              <div>
                <Label htmlFor="adminPassword">كلمة المرور</Label>
                <Input
                  id="adminPassword"
                  type="password"
                  value={settings.adminPassword}
                  onChange={(e) => setSettings({ ...settings, adminPassword: e.target.value })}
                  placeholder="admin123"
                />
              </div>
              <div className="text-sm text-gray-600">
                <p>ملاحظة: هذه الإعدادات للعرض فقط</p>
                <p>لتغيير بيانات المدير، يرجى الاتصال بمطور النظام</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>معلومات النظام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-700">إصدار النظام:</p>
                  <p className="text-gray-600">1.0.0</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">تاريخ الإنشاء:</p>
                  <p className="text-gray-600">2024</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">المطور:</p>
                  <p className="text-gray-600">فريق تطوير نظام المياه</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">قاعدة البيانات:</p>
                  <p className="text-gray-600">PostgreSQL</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
