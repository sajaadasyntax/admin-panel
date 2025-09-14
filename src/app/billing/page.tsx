'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface BillingStatus {
  totalHouses: number
  paidHouses: number
  unpaidHouses: number
  paymentRate: string
}

interface BillingTriggerResult {
  success: boolean
  processedCount?: number
  errorCount?: number
  totalHouses?: number
  error?: string
  message?: string
}

export default function BillingPage() {
  const { user } = useAuth()
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const [lastTriggerResult, setLastTriggerResult] = useState<BillingTriggerResult | null>(null)

  const fetchBillingStatus = async () => {
    try {
      const response = await api.get('/api/billing/status')
      setBillingStatus(response.data)
    } catch (error) {
      console.error('Error fetching billing status:', error)
    } finally {
      setLoading(false)
    }
  }

  const triggerMonthlyBilling = async () => {
    setTriggering(true)
    try {
      const response = await api.post('/api/billing/trigger')
      setLastTriggerResult(response.data)
      // Refresh billing status after triggering
      await fetchBillingStatus()
    } catch (error) {
      console.error('Error triggering monthly billing:', error)
      setLastTriggerResult({
        success: false,
        error: 'Failed to trigger monthly billing'
      })
    } finally {
      setTriggering(false)
    }
  }

  useEffect(() => {
    fetchBillingStatus()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل حالة الفواتير...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الفواتير الشهرية</h1>
        <p className="text-gray-600">مراقبة وإدارة نظام الفواتير الشهرية للمنازل</p>
      </div>

      {/* Billing Status Cards */}
      {billingStatus && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {billingStatus.totalHouses}
              </div>
              <div className="text-gray-600">إجمالي المنازل</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {billingStatus.paidHouses}
              </div>
              <div className="text-gray-600">المنازل المدفوعة</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {billingStatus.unpaidHouses}
              </div>
              <div className="text-gray-600">المنازل غير المدفوعة</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {billingStatus.paymentRate}%
              </div>
              <div className="text-gray-600">معدل الدفع</div>
            </div>
          </Card>
        </div>
      )}

      {/* Monthly Billing Actions */}
      <Card className="p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات الفواتير الشهرية</h2>
        
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">نظام الفواتير التلقائي</h3>
            <p className="text-yellow-700 text-sm">
              يتم تشغيل نظام الفواتير الشهرية تلقائياً في اليوم 31 من كل شهر في الساعة 2:00 صباحاً.
              سيتم إعادة تعيين حالة الدفع لجميع المنازل المسكونة وتحديد المبلغ المطلوب حسب نوع العداد.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={triggerMonthlyBilling}
              disabled={triggering}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {triggering ? 'جاري التشغيل...' : 'تشغيل الفواتير الشهرية الآن'}
            </Button>

            <Button
              onClick={fetchBillingStatus}
              variant="outline"
              className="border-gray-300 hover:bg-gray-50"
            >
              تحديث البيانات
            </Button>
          </div>
        </div>
      </Card>

      {/* Last Trigger Result */}
      {lastTriggerResult && (
        <Card className="p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">نتيجة آخر تشغيل</h3>
          
          {lastTriggerResult.success ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
                <span className="font-semibold text-green-800">تم التشغيل بنجاح</span>
              </div>
              
              {lastTriggerResult.message && (
                <p className="text-green-700 text-sm mb-2">{lastTriggerResult.message}</p>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium">المنازل المعالجة:</span>
                  <span className="ml-2 text-green-600">{lastTriggerResult.processedCount || 0}</span>
                </div>
                <div>
                  <span className="font-medium">الأخطاء:</span>
                  <span className="ml-2 text-red-600">{lastTriggerResult.errorCount || 0}</span>
                </div>
                <div>
                  <span className="font-medium">إجمالي المنازل:</span>
                  <span className="ml-2 text-blue-600">{lastTriggerResult.totalHouses || 0}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
                <span className="font-semibold text-red-800">فشل في التشغيل</span>
              </div>
              <p className="text-red-700 text-sm">{lastTriggerResult.error}</p>
            </div>
          )}
        </Card>
      )}

      {/* Payment Types Information */}
      <Card className="p-6 mt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">أنواع الدفع والمبالغ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-green-800 mb-2">عداد صغير</h4>
            <p className="text-green-700">5,000 جنيه سوداني</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-semibold text-orange-800 mb-2">عداد متوسط</h4>
            <p className="text-orange-700">10,000 جنيه سوداني</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">عداد كبير</h4>
            <p className="text-red-700">15,000 جنيه سوداني</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
