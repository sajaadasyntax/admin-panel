'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Users,
  Home,
  MapPin,
  Square,
  Settings,
  DollarSign,
  BarChart3,
  LogOut,
  CreditCard
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

const navigation = [
  { name: 'لوحة التحكم', href: '/', icon: BarChart3 },
  { name: 'المستخدمين', href: '/users', icon: Users },
  { name: 'الأحياء', href: '/neighborhoods', icon: MapPin },
  { name: 'المربعات', href: '/squares', icon: Square },
  { name: 'المنازل', href: '/houses', icon: Home },
  { name: 'أنواع الدفع', href: '/payment-types', icon: DollarSign },
  { name: 'الفواتير الشهرية', href: '/billing', icon: CreditCard },
  { name: 'الإعدادات', href: '/settings', icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  return (
    <div className="flex h-full w-64 flex-col bg-gray-900">
      <div className="flex h-16 items-center px-6">
        <h1 className="text-xl font-bold text-white">لوحة الإدارة</h1>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                isActive
                  ? 'bg-gray-800 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                )}
              />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="border-t border-gray-700 p-4">
        <button
          onClick={logout}
          className="flex w-full items-center px-3 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
        >
          <LogOut className="mr-3 h-5 w-5" />
          تسجيل الخروج
        </button>
      </div>
    </div>
  )
}
