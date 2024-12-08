// components/MenuDisplay.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from 'lucide-react'

interface MenuItem {
  name: string;
  price: string;
  description: string;
}

export default function MenuDisplay() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/process-menu')
      if (!response.ok) {
        throw new Error('Failed to fetch menu items')
      }
      const data = await response.json()
      console.log('Fetched menu data:', data) // Debug log
      
      // Check if the data contains menuItems or items
      const items = data.menuItems || data.items || []
      setMenuItems(items)
      setError(null)
    } catch (err) {
      console.error('Error fetching menu items:', err)
      setError('Failed to load menu items. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenuItems()

    const handleMenuUpdated = () => {
      console.log('Menu updated event received') // Debug log
      fetchMenuItems()
    }

    window.addEventListener('menuUpdated', handleMenuUpdated)

    return () => {
      window.removeEventListener('menuUpdated', handleMenuUpdated)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    )
  }

  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No menu items available. Start by uploading a menu image.
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {menuItems.map((item, index) => (
        <Card key={index} className="bg-white hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {item.description}
                </p>
              </div>
              <div className="text-lg font-medium text-indigo-600 ml-4">
                {item.price}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}