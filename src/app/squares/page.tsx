'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Square, Neighborhood } from '@/types'
import { Plus, Edit, Trash2, Search, Square as SquareIcon, Download } from 'lucide-react'
import api from '@/lib/api'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'

export default function SquaresPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [squares, setSquares] = useState<Square[]>([])
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loadingSquares, setLoadingSquares] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingSquare, setEditingSquare] = useState<Square | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    neighborhoodId: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchSquares()
      fetchNeighborhoods()
    }
  }, [user])

  const fetchSquares = async () => {
    try {
      setLoadingSquares(true)
      const response = await api.get('/api/squares')
      setSquares(response.data)
    } catch (error) {
      console.error('Error fetching squares:', error)
    } finally {
      setLoadingSquares(false)
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

  const handleAddSquare = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/squares', formData)
      setFormData({ name: '', neighborhoodId: '' })
      setShowAddForm(false)
      fetchSquares()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في إضافة المربع')
    }
  }

  const handleEditSquare = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSquare) return
    
    try {
      await api.put(`/api/squares/${editingSquare.id}`, formData)
      setEditingSquare(null)
      setFormData({ name: '', neighborhoodId: '' })
      fetchSquares()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في تحديث المربع')
    }
  }

  const handleDeleteSquare = async (squareId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المربع؟ سيتم حذف جميع المنازل المرتبطة به.')) return
    
    try {
      await api.delete(`/api/squares/${squareId}`)
      fetchSquares()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في حذف المربع')
    }
  }

  const exportToExcel = async () => {
    try {
      // Fetch detailed squares data with houses
      const response = await api.get('/api/squares/export')
      const squaresData = response.data

      // Prepare data for Excel
      const excelData = squaresData.map((square: any) => ({
        'اسم المربع': square.name,
        'الحي': square.neighborhood?.name || 'غير محدد',
        'عدد المنازل': square.houses?.length || 0,
        'المنازل المدفوعة': square.houses?.filter((h: any) => h.hasPaid).length || 0,
        'المنازل غير المدفوعة': square.houses?.filter((h: any) => !h.hasPaid).length || 0,
        'إجمالي الإيرادات': square.houses?.filter((h: any) => h.hasPaid).reduce((sum: number, h: any) => sum + (h.requiredAmount || 0), 0) || 0,
        'تاريخ الإنشاء': new Date(square.createdAt).toLocaleDateString('ar-SD'),
      }))

      // Create workbook and worksheet
      const ws = XLSX.utils.json_to_sheet(excelData)
      const wb = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(wb, ws, 'بيانات المربعات')

      // Generate Excel file
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
      const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
      
      // Save file
      saveAs(data, `squares-data-${new Date().toISOString().split('T')[0]}.xlsx`)
    } catch (error) {
      console.error('Error exporting to Excel:', error)
      alert('حدث خطأ في تصدير البيانات')
    }
  }

  const filteredSquares = squares.filter(square =>
    square.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    square.neighborhood?.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">إدارة المربعات</h1>
              <p className="text-gray-600 mt-2">إضافة وتعديل وحذف المربعات</p>
            </div>
            <div className="flex space-x-2">
              <Button onClick={exportToExcel} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                تصدير إلى Excel
              </Button>
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                إضافة مربع
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث عن المربعات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingSquare) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingSquare ? 'تعديل المربع' : 'إضافة مربع جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingSquare ? handleEditSquare : handleAddSquare} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم المربع</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="أدخل اسم المربع"
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhoodId">الحي</Label>
                  <select
                    id="neighborhoodId"
                    value={formData.neighborhoodId}
                    onChange={(e) => setFormData({ ...formData, neighborhoodId: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الحي</option>
                    {neighborhoods.map((neighborhood) => (
                      <option key={neighborhood.id} value={neighborhood.id}>
                        {neighborhood.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingSquare ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingSquare(null)
                      setFormData({ name: '', neighborhoodId: '' })
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Squares List */}
        {loadingSquares ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل المربعات...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSquares.map((square) => (
              <Card key={square.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <SquareIcon className="h-5 w-5 text-green-600 mr-2" />
                      <div>
                        <CardTitle className="text-lg">{square.name}</CardTitle>
                        <CardDescription>
                          الحي: {square.neighborhood?.name || 'غير محدد'}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingSquare(square)
                          setFormData({ name: square.name, neighborhoodId: square.neighborhoodId })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSquare(square.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>المعرف: {square.id}</p>
                    <p>تم الإنشاء: {new Date(square.createdAt).toLocaleDateString('ar-SD')}</p>
                    <p>آخر تحديث: {new Date(square.updatedAt).toLocaleDateString('ar-SD')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredSquares.length === 0 && !loadingSquares && (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد مربعات</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
