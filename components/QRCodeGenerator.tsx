// components/QRCodeGenerator.tsx
'use client'

import { useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Button } from "@/components/ui/button"
import { Share } from 'lucide-react'

interface QRCodeGeneratorProps {
  menuId?: string
}

export default function QRCodeGenerator({ menuId }: QRCodeGeneratorProps) {
  const [qrVisible, setQrVisible] = useState(false)
  const [menuUrl, setMenuUrl] = useState('')

  const handleGenerateQR = () => {
    if (!menuId) {
      alert('Please upload a menu first')
      return
    }
    const url = `${window.location.origin}/menu/${menuId}`
    setMenuUrl(url)
    setQrVisible(true)
  }

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Digital Menu',
          text: 'Check out our menu!',
          url: menuUrl,
        })
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(menuUrl)
        alert('Menu link copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleDownloadQR = () => {
    const svg = document.querySelector('#qr-code svg')
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)
        const pngFile = canvas.toDataURL('image/png')
        const downloadLink = document.createElement('a')
        downloadLink.download = 'menu-qr.png'
        downloadLink.href = pngFile
        downloadLink.click()
      }
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
  }

  return (
    <div className="flex flex-col items-center space-y-6">
      <Button
        onClick={handleGenerateQR}
        className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto"
        disabled={!menuId}
      >
        {!menuId ? 'Upload a menu first' : 'Generate QR Code'}
      </Button>
      
      {qrVisible && menuUrl && (
        <div className="w-full max-w-md space-y-6">
          <div id="qr-code" className="bg-white p-6 rounded-xl shadow-lg flex justify-center">
            <QRCodeSVG 
              value={menuUrl} 
              size={256}
              level="H"
              includeMargin={true}
            />
          </div>
          
          <div className="space-y-4">
            <p className="text-center text-gray-600">
              Scan this QR code to view the menu
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={handleDownloadQR}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                Download QR Code
              </Button>
              
              <Button
                variant="outline"
                onClick={handleShare}
                className="border-indigo-600 text-indigo-600 hover:bg-indigo-50"
              >
                <Share className="w-4 h-4 mr-2" />
                Share Menu Link
              </Button>
            </div>

            <div className="text-center">
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:text-indigo-800 underline break-all"
              >
                {menuUrl}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}