import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

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

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: imageFile.type,
                data: base64Image,
              }
            },
            {
              type: "text", 
              text: `Please analyze this menu image and extract all menu items. Return ONLY a valid JSON object with no additional text or explanations. Use exactly this format:
              {
                "menuItems": [
                  {
                    "name": "item name",
                    "price": "price as string",
                    "description": "item description"
                  }
                ]
              }`
            }
          ]
        }
      ]
    })

    const assistantResponse = message.content[0].text
    console.log('Raw AI response:', assistantResponse)

    let parsedResponse
    try {
      const jsonStart = assistantResponse.indexOf('{')
      const jsonEnd = assistantResponse.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in response')
      }
      
      const jsonString = assistantResponse.slice(jsonStart, jsonEnd)
      parsedResponse = JSON.parse(jsonString)
    } catch (error) {
      console.error('Failed to parse AI response:', error)
      return NextResponse.json({ 
        error: 'Failed to parse menu items',
        details: error instanceof Error ? error.message : String(error)
      }, { 
        status: 500 
      })
    }

    const newMenu: Menu = {
      id: crypto.randomUUID(),
      items: parsedResponse.menuItems,
      createdAt: new Date().toISOString()
    }

    let menus: Menu[] = []
    try {
      await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
      
      try {
        const fileContent = await fs.readFile(dataFilePath, 'utf8')
        if (fileContent.trim()) {
          menus = JSON.parse(fileContent)
          if (!Array.isArray(menus)) {
            menus = []
          }
        }
      } catch (error) {
        if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
          throw error
        }
        menus = []
      }
    } catch (error) {
      console.error('Error reading menus file:', error)
      return NextResponse.json({ 
        error: 'Failed to read menus file',
        details: error instanceof Error ? error.message : String(error)
      }, { 
        status: 500 
      })
    }

    menus.push(newMenu)

    try {
      await fs.writeFile(dataFilePath, JSON.stringify(menus, null, 2))
    } catch (error) {
      console.error('Error saving menus file:', error)
      return NextResponse.json({ 
        error: 'Failed to save menus file',
        details: error instanceof Error ? error.message : String(error)
      }, { 
        status: 500 
      })
    }

    return NextResponse.json({
      menuId: newMenu.id,
      menuItems: newMenu.items,
      createdAt: newMenu.createdAt
    })

  } catch (error) {
    console.error('Error processing menu:', error)
    return NextResponse.json({ 
      error: 'Failed to process menu',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
}

export async function GET() {
  try {
    const data = await fs.readFile(dataFilePath, 'utf8')
    const menus = JSON.parse(data)
    
    const latestMenu = menus[menus.length - 1]
    return NextResponse.json({ 
      menuItems: latestMenu?.items || []
    })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return NextResponse.json({ menuItems: [] })
  }
    console.error('Error reading menu data:', error)
    return NextResponse.json(
      { error: 'Failed to read menu data' },
      { status: 500 }
    )
}
}