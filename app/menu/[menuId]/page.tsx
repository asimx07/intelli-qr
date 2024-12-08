// app/menu/[menuId]/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface MenuItem {
  name: string
  price: string
  description: string
}

interface MenuData {
  id: string
  items: MenuItem[]
  createdAt: string
}

export default function MenuPage({ params }: { params: { menuId: string } }) {
  const [menuData, setMenuData] = useState<MenuData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        console.log('Fetching menu with ID:', params.menuId)
        
        const response = await fetch(`/api/menu/${params.menuId}`)
        const data = await response.json()
        
        console.log('Response:', response.status, data)

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch menu')
        }

        setMenuData(data)
        setError(null)
      } catch (err) {
        console.error('Error fetching menu:', err)
        setError(err instanceof Error ? err.message : 'Failed to load menu')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [params.menuId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error || !menuData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-red-600 text-center">
              <p>{error || 'Menu not found'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-indigo-700">
              Our Menu
            </CardTitle>
            <p className="text-center text-gray-500">
              Last updated: {new Date(menuData.createdAt).toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {menuData.items.map((item, index) => (
                <div
                  key={index}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {item.description}
                      </p>
                    </div>
                    <div className="text-lg font-medium text-indigo-600">
                      {item.price}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}