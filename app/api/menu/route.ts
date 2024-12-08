// app/api/process-menu/route.ts
import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const dataFilePath = path.join(process.cwd(), 'data', 'menu.json')

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File

    if (!imageFile) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert the uploaded image to base64
    const arrayBuffer = await imageFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const base64Image = buffer.toString('base64')

    // Make the API call to Claude
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

    // Get the text response from Claude
    const assistantResponse = message.content[0].text
    console.log('Raw AI response:', assistantResponse)

    // Extract and parse the JSON response
    let parsedResponse
    try {
      // Find the first occurrence of '{' and last occurrence of '}'
      const jsonStart = assistantResponse.indexOf('{')
      const jsonEnd = assistantResponse.lastIndexOf('}') + 1
      
      if (jsonStart === -1 || jsonEnd === 0) {
        throw new Error('No JSON object found in response')
      }
      
      const jsonString = assistantResponse.slice(jsonStart, jsonEnd)
      console.log('Extracted JSON string:', jsonString)
      
      parsedResponse = JSON.parse(jsonString)

      if (!parsedResponse.menuItems || !Array.isArray(parsedResponse.menuItems)) {
        throw new Error('Invalid response structure: missing menuItems array')
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      return NextResponse.json({ 
        error: 'Failed to parse menu items',
        details: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawResponse: assistantResponse
      }, { 
        status: 500 
      })
    }

    // Create a new menu object
    const newMenu = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      items: parsedResponse.menuItems
    }

    // Read existing menus or initialize empty array
    let menus = []
    try {
      await fs.access(dataFilePath)
      const data = await fs.readFile(dataFilePath, 'utf8')
      menus = JSON.parse(data)
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        throw error
      }
    }

    // Add new menu
    menus.push(newMenu)

    // Save updated menus
    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    await fs.writeFile(dataFilePath, JSON.stringify(menus, null, 2))

    return NextResponse.json({
      menuId: newMenu.id,
      menuItems: newMenu.items,
      createdAt: newMenu.createdAt
    })

  } catch (error) {
    console.error('Error processing menu:', error)
    return NextResponse.json({ 
      error: 'Failed to create menu',
      details: error instanceof Error ? error.message : String(error)
    }, { 
      status: 500 
    })
  }
}

export const runtime = 'nodejs'