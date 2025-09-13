'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PaymentType, PAYMENT_TYPES } from '@/types'
import { Edit, Save, X } from 'lucide-react'

export default function PaymentTypesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [paymentTypes, setPaymentTypes] = useState<Record<PaymentType, any>>(PAYMENT_TYPES)
  const [editingType, setEditingType] = useState<PaymentType | null>(null)
  const [editAmount, setEditAmount] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  const handleEdit = (type: PaymentType) => {
    setEditingType(type)
    setEditAmount(paymentTypes[type].amount.toString())
  }

  const handleSave = () => {
    if (editingType && editAmount) {
      const newAmount = parseFloat(editAmount)
      if (!isNaN(newAmount) && newAmount > 0) {
        setPaymentTypes(prev => ({
          ...prev,
          [editingType]: {
            ...prev[editingType],
            amount: newAmount
          }
        }))
        setEditingType(null)
        setEditAmount('')
      }
    }
  }

  const handleCancel = () => {
    setEditingType(null)
    setEditAmount('')
  }

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إدارة أنواع الدفع</h1>
          <p className="text-gray-600 mt-2">تعديل مبالغ أنواع الدفع المختلفة</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(paymentTypes).map(([key, type]) => (
            <Card key={key} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{type.name}</CardTitle>
                    <CardDescription>نوع العداد: {key}</CardDescription>
                  </div>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: type.color }}
                  ></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor={`amount-${key}`}>المبلغ المطلوب (جنيه سوداني)</Label>
                    {editingType === key ? (
                      <div className="flex items-center space-x-2 mt-2">
                        <Input
                          id={`amount-${key}`}
                          type="number"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="flex-1"
                          min="0"
                          step="100"
                        />
                        <Button
                          size="sm"
                          onClick={handleSave}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleCancel}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-2xl font-bold text-gray-900">
                          {type.amount.toLocaleString()} جنيه
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(key as PaymentType)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="text-sm text-gray-600">
                      <p>اللون: <span className="font-medium" style={{ color: type.color }}>{type.color}</span></p>
                      <p>معرف النوع: <span className="font-medium">{key}</span></p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>ملاحظات مهمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• يمكن تعديل مبالغ أنواع الدفع المختلفة حسب الحاجة</p>
                <p>• التغييرات ستؤثر على المنازل الجديدة فقط</p>
                <p>• المنازل الموجودة ستحتفظ بالمبالغ المحفوظة مسبقاً</p>
                <p>• تأكد من صحة المبالغ قبل الحفظ</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
