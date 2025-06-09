import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { language } = await request.json()

    if (!language || !['en', 'fr'].includes(language)) {
      return NextResponse.json(
        { error: 'Invalid language. Must be "en" or "fr"' },
        { status: 400 }
      )
    }

    // Update user language in database
    await db.user.update({
      where: { id: session.user.id },
      data: { language }
    })

    return NextResponse.json({ success: true, language })
  } catch (error) {
    console.error('Error updating user language:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
