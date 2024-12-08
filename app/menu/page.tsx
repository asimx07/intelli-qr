import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import fs from 'fs/promises'
import path from 'path'

async function getMenuItems(): Promise<string[]> {
  const dataFilePath = path.join(process.cwd(), 'data', 'menu.json')
  try {
    await fs.access(dataFilePath)
    const data = await fs.readFile(dataFilePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      // File doesn't exist, return an empty array
      return []
    }
    console.error('Error reading menu data:', error)
    throw new Error('Failed to read menu data')
  }
}

export default function MenuPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-12">Our Menu</h1>
        <Suspense fallback={<div className="text-center text-indigo-600">Loading menu...</div>}>
          <MenuItems />
        </Suspense>
      </div>
    </div>
  )
}

async function MenuItems() {
  try {
    const menuItems = await getMenuItems()

    if (menuItems.length === 0) {
      return (
        <Card className="shadow-2xl">
          <CardContent>
            <p className="text-center text-gray-600 py-8">No menu items available at the moment.</p>
          </CardContent>
        </Card>
      )
    }

    return (
      <Card className="shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-indigo-700">Menu Items</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems.map((item, index) => (
              <li key={index} className="bg-indigo-50 p-4 rounded-md shadow">
                <span className="font-medium text-indigo-800">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    )
  } catch (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Failed to load menu items. Please try again later.</AlertDescription>
      </Alert>
    )
  }
}

