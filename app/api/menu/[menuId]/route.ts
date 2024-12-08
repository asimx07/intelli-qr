// app/api/menu/[menuId]/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const dataFilePath = path.join(process.cwd(), 'data', 'menu.json')

interface MenuItem {
  name: string
  price: string
  description: string
}

interface Menu {
  id: string
  items: MenuItem[]
  createdAt: string
}

export async function GET(
  request: Request,
  { params }: { params: { menuId: string } }
) {
  try {
    console.log('Fetching menu with ID:', params.menuId)

    // Read the menu data file
    let menus: Menu[] = []
    try {
      const fileContent = await fs.readFile(dataFilePath, 'utf8')
      if (fileContent.trim()) {
        menus = JSON.parse(fileContent)
        if (!Array.isArray(menus)) {
          console.log('Invalid menu data format')
          return NextResponse.json({ error: 'Invalid menu data format' }, { status: 500 })
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        console.log('Menu file not found')
        return NextResponse.json({ error: 'Menu not found' }, { status: 404 })
      }
      throw error
    }

    console.log('Found menus:', menus.length)

    // Find the specific menu
    const menu = menus.find(m => m.id === params.menuId)
    console.log('Found menu:', menu ? 'yes' : 'no')

    if (!menu) {
      return NextResponse.json({ 
        error: 'Menu not found',
        requestedId: params.menuId
      }, { 
        status: 404 
      })
    }

    return NextResponse.json(menu)
  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch menu',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
}