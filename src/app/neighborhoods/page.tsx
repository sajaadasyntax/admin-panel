'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Neighborhood } from '@/types'
import { Plus, Edit, Trash2, Search, MapPin } from 'lucide-react'
import api from '@/lib/api'

export default function NeighborhoodsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([])
  const [loadingNeighborhoods, setLoadingNeighborhoods] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingNeighborhood, setEditingNeighborhood] = useState<Neighborhood | null>(null)
  const [formData, setFormData] = useState({
    name: '',
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchNeighborhoods()
    }
  }, [user])

  const fetchNeighborhoods = async () => {
    try {
      setLoadingNeighborhoods(true)
      const response = await api.get('/api/neighborhoods')
      setNeighborhoods(response.data)
    } catch (error) {
      console.error('Error fetching neighborhoods:', error)
    } finally {
      setLoadingNeighborhoods(false)
    }
  }

  const handleAddNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/api/neighborhoods', formData)
      setFormData({ name: '' })
      setShowAddForm(false)
      fetchNeighborhoods()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في إضافة الحي')
    }
  }

  const handleEditNeighborhood = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNeighborhood) return
    
    try {
      await api.put(`/api/neighborhoods/${editingNeighborhood.id}`, formData)
      setEditingNeighborhood(null)
      setFormData({ name: '' })
      fetchNeighborhoods()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في تحديث الحي')
    }
  }

  const handleDeleteNeighborhood = async (neighborhoodId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحي؟ سيتم حذف جميع المربعات والمنازل المرتبطة به.')) return
    
    try {
      await api.delete(`/api/neighborhoods/${neighborhoodId}`)
      fetchNeighborhoods()
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ في حذف الحي')
    }
  }

  const filteredNeighborhoods = neighborhoods.filter(neighborhood =>
    neighborhood.name.toLowerCase().includes(searchTerm.toLowerCase())
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
              <h1 className="text-3xl font-bold text-gray-900">إدارة الأحياء</h1>
              <p className="text-gray-600 mt-2">إضافة وتعديل وحذف الأحياء</p>
            </div>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              إضافة حي
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="البحث عن الأحياء..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-10"
            />
          </div>
        </div>

        {/* Add/Edit Form */}
        {(showAddForm || editingNeighborhood) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>
                {editingNeighborhood ? 'تعديل الحي' : 'إضافة حي جديد'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingNeighborhood ? handleEditNeighborhood : handleAddNeighborhood} className="space-y-4">
                <div>
                  <Label htmlFor="name">اسم الحي</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="أدخل اسم الحي"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button type="submit">
                    {editingNeighborhood ? 'تحديث' : 'إضافة'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowAddForm(false)
                      setEditingNeighborhood(null)
                      setFormData({ name: '' })
                    }}
                  >
                    إلغاء
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Neighborhoods List */}
        {loadingNeighborhoods ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">جاري تحميل الأحياء...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNeighborhoods.map((neighborhood) => (
              <Card key={neighborhood.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <MapPin className="h-5 w-5 text-blue-600 mr-2" />
                      <div>
                        <CardTitle className="text-lg">{neighborhood.name}</CardTitle>
                        <CardDescription>
                          تم الإنشاء: {new Date(neighborhood.createdAt).toLocaleDateString('ar-SD')}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNeighborhood(neighborhood)
                          setFormData({ name: neighborhood.name })
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteNeighborhood(neighborhood.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600">
                    <p>المعرف: {neighborhood.id}</p>
                    <p>آخر تحديث: {new Date(neighborhood.updatedAt).toLocaleDateString('ar-SD')}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredNeighborhoods.length === 0 && !loadingNeighborhoods && (
          <div className="text-center py-8">
            <p className="text-gray-500">لا توجد أحياء</p>
          </div>
        )}
      </div>
    </Layout>
  )
}
