import { NextResponse } from 'next/server'
import { getMaintenanceStatus } from 'nextjs-maintenance-mode/config'

export async function GET() {
  try {
    // Get maintenance status with reason
    const status = getMaintenanceStatus('public/maintenance.json')

    return NextResponse.json(status)
  } catch (error) {
    console.error('Error fetching maintenance status:', error)

    // Return safe default on error
    return NextResponse.json(
      {
        active: false,
        config: null,
        reason: 'Error reading maintenance configuration',
      },
      { status: 500 }
    )
  }
}
