'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'

interface ImageUploadProps {
  onMenuProcessed: (menuId: string) => void;
}

export default function ImageUpload({ onMenuProcessed }: ImageUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [menuId, setMenuId] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!file) {
      setError('Please select an image file')
      return
    }

    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file')
      return
    }

    setIsUploading(true)
    setError(null)
    
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await fetch('/api/process-menu', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to process menu image')
      }

      const data = await response.json()
      console.log('Processed menu:', data)

      if (data.menuId) {
        onMenuProcessed(data.menuId)
      }

        window.dispatchEvent(new CustomEvent('menuUpdated'))
      
      setFile(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setError('Failed to process menu image. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large. Please upload an image smaller than 5MB.')
        return
      }
      
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please upload a valid image file')
        return
      }

      setFile(selectedFile)
      setError(null)
    }
  }

  return (
    <div className="space-y-8">
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid w-full max-w-sm items-center gap-1.5">
        <Label htmlFor="menu-image">Menu Image</Label>
        <Input
          id="menu-image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        {file && (
          <p className="text-sm text-gray-500">
            Selected file: {file.name} ({(file.size / 1024).toFixed(1)}KB)
          </p>
        )}
      </div>
        <Button 
          type="submit" 
        disabled={!file || isUploading}
        className="w-full sm:w-auto"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          'Upload and Process Menu Image'
        )}
      </Button>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </form>
      {menuId && <div className="hidden">{menuId}</div>}
    </div>
  )
} 