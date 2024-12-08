// app/page.tsx
'use client'

import { Suspense, useState } from 'react'
import ImageUpload from '../components/ImageUpload'
import MenuDisplay from '../components/MenuDisplay'
import QRCodeGenerator from '../components/QRCodeGenerator'

export default function Home() {
  const [currentMenuId, setCurrentMenuId] = useState<string | null>(null)

  const handleMenuProcessed = (menuId: string) => {
    setCurrentMenuId(menuId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-center text-indigo-800 mb-12">
          Restaurant QR Menu Creator
        </h1>
        
        <div className="bg-white shadow-2xl rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Upload Your Menu
          </h2>
          <ImageUpload onMenuProcessed={handleMenuProcessed} />
        </div>

        <Suspense fallback={
          <div className="text-center text-indigo-600">
            Processing your menu...
          </div>
        }>
          <div className="bg-white shadow-2xl rounded-xl p-8 space-y-6">
            <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
              Your Menu
            </h2>
            <MenuDisplay />
          </div>
        </Suspense>

        <div className="bg-white shadow-2xl rounded-xl p-8 space-y-6">
          <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
            Generate QR Code
          </h2>
          <QRCodeGenerator menuId={currentMenuId} />
        </div>

        <footer className="text-center text-sm text-indigo-600 mt-8">
          <p>© 2024 IntelliQR. All rights reserved.</p>
        </footer>
      </div>
    </div>
  )
}