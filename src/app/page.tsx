'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, MapPin, Square, Home, DollarSign } from 'lucide-react'
import api from '@/lib/api'

interface DashboardStats {
  totalUsers: number
  totalNeighborhoods: number
  totalSquares: number
  totalHouses: number
  paidHouses: number
  unpaidHouses: number
  totalRevenue: number
}

export default function Dashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [usersRes, neighborhoodsRes, squaresRes, housesRes] = await Promise.all([
          api.get('/api/users'),
          api.get('/api/neighborhoods'),
          api.get('/api/squares'),
          api.get('/api/houses'),
        ])

        const houses = housesRes.data
        const paidHouses = houses.filter((house: any) => house.hasPaid).length
        const unpaidHouses = houses.length - paidHouses

        setStats({
          totalUsers: usersRes.data.length,
          totalNeighborhoods: neighborhoodsRes.data.length,
          totalSquares: squaresRes.data.length,
          totalHouses: houses.length,
          paidHouses,
          unpaidHouses,
          totalRevenue: paidHouses * 5000, // Assuming average payment
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoadingStats(false)
      }
    }

    if (user) {
      fetchStats()
    }
  }, [user])

  if (loading || !user) {
    return null
  }

  if (loadingStats) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    )
  }

  const statCards = [
    {
      title: 'إجمالي المستخدمين',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'إجمالي الأحياء',
      value: stats?.totalNeighborhoods || 0,
      icon: MapPin,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'إجمالي المربعات',
      value: stats?.totalSquares || 0,
      icon: Square,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'إجمالي المنازل',
      value: stats?.totalHouses || 0,
      icon: Home,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
    },
  ]

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة التحكم</h1>
          <p className="text-gray-600 mt-2">نظرة عامة على نظام إدارة المياه</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>حالة الدفع</CardTitle>
              <CardDescription>إحصائيات دفع الفواتير</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">المنازل المدفوعة</span>
                  <span className="text-lg font-bold text-green-600">{stats?.paidHouses || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">المنازل غير المدفوعة</span>
                  <span className="text-lg font-bold text-red-600">{stats?.unpaidHouses || 0}</span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">إجمالي الإيرادات</span>
                    <span className="text-lg font-bold text-blue-600">
                      {stats?.totalRevenue?.toLocaleString()} جنيه
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>معلومات النظام</CardTitle>
              <CardDescription>تفاصيل النظام الحالي</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">نسبة الدفع</span>
                  <span className="text-lg font-bold text-blue-600">
                    {stats?.totalHouses ? Math.round((stats.paidHouses / stats.totalHouses) * 100) : 0}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">متوسط الدفع</span>
                  <span className="text-lg font-bold text-green-600">
                    {stats?.paidHouses ? Math.round(stats.totalRevenue / stats.paidHouses) : 0} جنيه
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-600">آخر تحديث</span>
                    <span className="text-sm text-gray-500">
                      {new Date().toLocaleDateString('ar-SD')}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}