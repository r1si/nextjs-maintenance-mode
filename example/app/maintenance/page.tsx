'use client'

import { useMaintenanceStatus, useCountdown, formatCountdown } from 'nextjs-maintenance-mode/client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function MaintenancePage() {
  const router = useRouter()

  // Auto-polls API every 30 seconds
  const { status, isLoading } = useMaintenanceStatus({
    pollInterval: 30000,
    autoPoll: true,
  })

  // Live countdown to endTime
  const countdown = useCountdown(status?.config?.endTime)

  // Format for display: "2h 30m" or "45m 30s"
  const timeRemaining = formatCountdown(countdown)

  // Auto-redirect when maintenance is no longer active
  useEffect(() => {
    if (status && !status.active) {
      router.push('/')
    }
  }, [status, router])

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.icon}>🛠️</div>
        <h1 style={styles.title}>Under Maintenance</h1>

        <p style={styles.message}>
          {status?.config?.message || 'We are performing scheduled maintenance. We\'ll be back soon!'}
        </p>

        {timeRemaining && (
          <div style={styles.countdown}>
            <p style={styles.countdownLabel}>Estimated completion in:</p>
            <p style={styles.countdownTime}>{timeRemaining}</p>
          </div>
        )}

        {status?.reason && (
          <details style={styles.details}>
            <summary style={styles.summary}>Technical Details</summary>
            <p style={styles.reason}>{status.reason}</p>
          </details>
        )}

        <p style={styles.footer}>
          This page will automatically refresh when maintenance is complete.
        </p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f5f5',
    padding: '1rem',
    fontFamily: 'system-ui, sans-serif',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '3rem 2rem',
    maxWidth: '500px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as const,
  },
  icon: {
    fontSize: '4rem',
    marginBottom: '1rem',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    marginBottom: '1rem',
    color: '#333',
  },
  message: {
    fontSize: '1.1rem',
    color: '#666',
    marginBottom: '2rem',
    lineHeight: '1.6',
  },
  countdown: {
    backgroundColor: '#f0f9ff',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  countdownLabel: {
    fontSize: '0.9rem',
    color: '#666',
    marginBottom: '0.5rem',
  },
  countdownTime: {
    fontSize: '2rem',
    fontWeight: 'bold' as const,
    color: '#0070f3',
    margin: 0,
  },
  details: {
    marginTop: '2rem',
    textAlign: 'left' as const,
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '1rem',
  },
  summary: {
    cursor: 'pointer',
    fontWeight: 'bold' as const,
    color: '#666',
  },
  reason: {
    marginTop: '0.5rem',
    color: '#888',
    fontSize: '0.9rem',
  },
  footer: {
    marginTop: '2rem',
    fontSize: '0.85rem',
    color: '#999',
  },
}
