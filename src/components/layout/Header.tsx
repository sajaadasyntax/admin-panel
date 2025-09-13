'use client'

import { useAuth } from '@/contexts/AuthContext'

export function Header() {
  const { user } = useAuth()

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">إدارة نظام المياه</h2>
            <p className="text-sm text-gray-600">نظام إدارة فواتير المياه</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                مرحباً، {user?.username}
              </p>
              <p className="text-xs text-gray-500">مدير النظام</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
