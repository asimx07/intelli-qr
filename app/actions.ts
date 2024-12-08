'use server'

import { revalidatePath } from 'next/cache'
import fs from 'fs/promises'
import path from 'path'

// This is a placeholder function to simulate AI processing
// In a real application, you would integrate with an actual AI service
async function processMenuImage(image: File): Promise<string[]> {
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 2000))

  // Return mock menu items
  return [
    "Margherita Pizza - $12",
    "Pepperoni Pizza - $14",
    "Caesar Salad - $8",
    "Garlic Bread - $5",
    "Spaghetti Carbonara - $15"
  ]
}

export async function uploadImage(formData: FormData) {
  const file = formData.get('image') as File
  if (!file) {
    throw new Error('No file uploaded')
  }

  try {
    const menuItems = await processMenuImage(file)
    
    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })

    // Save menu items to a JSON file
    const dataFilePath = path.join(dataDir, 'menu.json')
    await fs.writeFile(dataFilePath, JSON.stringify(menuItems))

    revalidatePath('/')
  } catch (error) {
    console.error('Error processing image:', error)
    throw error
  }
}

