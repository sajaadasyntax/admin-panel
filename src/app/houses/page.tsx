'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { House, Square, Neighborhood, PaymentType, PAYMENT_TYPES } from '@/types'
import { Plus, Edit, Trash2, Search, Home, CheckCircle, XCircle } from 'lucide-react'
import api from '@/lib/api'

export default function HousesPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [houses, setHouses] = useState<House[]>([])
  const [squares, setSquares] = useState<Square[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loadingHouses, setLoadingHouses] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingHouse, setEditingHouse] = useState<House | null>(null)
  const [formData, setFormData] = useState({
    houseNumber: '',
    ownerName: '',
    ownerPhone: '',
    isOccupied: true,
    hasPaid: false,
    paymentType: PaymentType.SMALL_METER,
    requiredAmount: 0,
    squareId: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchHouses()
      fetchSquares()
      fetchNeighborhoods()
    }
  }, [user])

  const fetchHouses = async () => {
    try {
      setLoadingHouses(true)
      const response = await api.get('/api/houses')
      setHouses(response.data)
    } catch (error) {
      console.error('Error fetching houses:', error)
    } finally {
      setLoadingHouses(false)
    }
  }

  const fetchSquares = async () => {
    try {
      const response = await api.get('/api/squares')
      setSquares(response.data)
    } catch (error) {
      console.error('Error fetching squares:', error)
    }
  }

  const fetchNeighborhoods = async () => {
    try {
      const response = await api.get('/api/neighborhoods')
      setNeighborhoods(response.data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    }
  }

  const handleAddHouse = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/houses', formData)
      setFormData({
        houseNumber: '',
        ownerName: '',
        ownerPhone: '',
        isOccupied: true,
        hasPaid: false,
        paymentType: PaymentType.SMALL_METER,
        requiredAmount: 0,
        squareId: '',
      })
      setShowAddForm(false)
      fetchHouses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في إضافة المنزل')
    }
  }

  const handleEditHouse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingHouse) return
    
    try {
      await api.put(`/api/houses/${editingHouse.id}`, formData)
      setEditingHouse(null)
      setFormData({
        houseNumber: '',
        ownerName: '',
        ownerPhone: '',
        isOccupied: true,
        hasPaid: false,
        paymentType: PaymentType.SMALL_METER,
        requiredAmount: 0,
        squareId: '',
      })
      fetchHouses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في تحديث المنزل')
    }
  }

  const handleDeleteHouse = async (houseId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنزل؟')) return
    
    try {
      await api.delete(`/api/houses/${houseId}`)
      fetchHouses()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في حذف المنزل')
    }
  }

  const filteredHouses = houses.filter(house =>
    house.houseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    house.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    house.ownerPhone.includes(searchTerm) ||
    house.square?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    house.square?.neighborhood?.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading || !user) {
    return null
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إدارة المنازل</h1>
              <p className="text-gray-600 mt-2">إضافة وتعديل وحذف المنازل</p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة منزل
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث عن المنازل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingHouse) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingHouse ? 'تعديل المنزل' : 'إضافة منزل جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingHouse ? handleEditHouse : handleAddHouse} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="houseNumber">رقم المنزل</Label>
                    <Input
                      id="houseNumber"
                      value={formData.houseNumber}
                      onChange={(e) => setFormData({ ...formData, houseNumber: e.target.value })}
                      required
                      placeholder="أدخل رقم المنزل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="squareId">المربع</Label>
                    <select
                      id="squareId"
                      value={formData.squareId}
                      onChange={(e) => setFormData({ ...formData, squareId: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">اختر المربع</option>
                      {squares.map((square) => (
                        <option key={square.id} value={square.id}>
                          {square.name} - {square.neighborhood?.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ownerName">اسم المالك</Label>
                    <Input
                      id="ownerName"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      required
                      placeholder="أدخل اسم المالك"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ownerPhone">رقم الهاتف</Label>
                    <Input
                      id="ownerPhone"
                      value={formData.ownerPhone}
                      onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                      required
                      placeholder="أدخل رقم الهاتف"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="paymentType">نوع العداد</Label>
                    <select
                      id="paymentType"
                      value={formData.paymentType}
                      onChange={(e) => setFormData({ ...formData, paymentType: e.target.value as PaymentType })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {Object.values(PAYMENT_TYPES).map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.amount} جنيه
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label htmlFor="requiredAmount">المبلغ المطلوب</Label>
                    <Input
                      id="requiredAmount"
                      type="number"
                      value={formData.requiredAmount}
                      onChange={(e) => setFormData({ ...formData, requiredAmount: parseFloat(e.target.value) || 0 })}
                      placeholder="أدخل المبلغ المطلوب"
                      min="0"
                      step="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isOccupied"
                      checked={formData.isOccupied}
                      onChange={(e) => setFormData({ ...formData, isOccupied: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isOccupied">المنزل مأهول</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="hasPaid"
                      checked={formData.hasPaid}
                      onChange={(e) => setFormData({ ...formData, hasPaid: e.target.checked })}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="hasPaid">تم الدفع</Label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingHouse ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingHouse(null)
                      setFormData({
                        houseNumber: '',
                        ownerName: '',
                        ownerPhone: '',
                        isOccupied: true,
                        hasPaid: false,
                        paymentType: PaymentType.SMALL_METER,
                        requiredAmount: 0,
                        squareId: '',
                      })
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Houses List */}
        {loadingHouses ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل المنازل...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHouses.map((house) => (
              <Card key={house.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <Home className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <CardTitle className="text-lg">منزل رقم {house.houseNumber}</CardTitle>
                        <CardDescription>
                          {house.square?.name} - {house.square?.neighborhood?.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingHouse(house)
                          setFormData({
                            houseNumber: house.houseNumber,
                            ownerName: house.ownerName,
                            ownerPhone: house.ownerPhone,
                            isOccupied: house.isOccupied,
                            hasPaid: house.hasPaid,
                            paymentType: house.paymentType,
                            requiredAmount: house.requiredAmount || 0,
                            squareId: house.squareId,
                          })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteHouse(house.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">المالك:</span>
                      <span className="font-medium">{house.ownerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">الهاتف:</span>
                      <span className="font-medium">{house.ownerPhone}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">نوع العداد:</span>
                      <span className="font-medium">
                        {PAYMENT_TYPES[house.paymentType]?.name || 'غير محدد'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">المبلغ:</span>
                      <span className="font-medium">
                        {house.requiredAmount?.toLocaleString() || 0} جنيه
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الحالة:</span>
                      <div className="flex items-center">
                        {house.hasPaid ? (
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 mr-1" />
                        )}
                        <span className={house.hasPaid ? 'text-green-600' : 'text-red-600'}>
                          {house.hasPaid ? 'مدفوع' : 'غير مدفوع'}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">الإشغال:</span>
                      <span className={house.isOccupied ? 'text-green-600' : 'text-gray-600'}>
                        {house.isOccupied ? 'مأهول' : 'غير مأهول'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredHouses.length === 0 && !loadingHouses && (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد منازل</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
