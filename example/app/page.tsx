export default function HomePage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1>Next.js Maintenance Mode Example</h1>
      <p>Welcome! This is a demo app showing how nextjs-maintenance-mode works.</p>

      <section style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h2>How to Test</h2>
        <ol>
          <li>
            Edit <code>public/maintenance.json</code> to enable maintenance mode:
            <pre style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#fff', borderRadius: '4px', overflow: 'auto' }}>
{`{
  "enabled": true,
  "message": "We are performing scheduled maintenance."
}`}
            </pre>
          </li>
          <li>Refresh the page - you'll be redirected to <code>/maintenance</code></li>
          <li>The maintenance page will show a countdown if you set an <code>endTime</code></li>
          <li>When maintenance ends or you set <code>enabled: false</code>, you'll be auto-redirected back</li>
        </ol>
      </section>

      <section style={{ marginTop: '2rem' }}>
        <h2>Features Demonstrated</h2>
        <ul>
          <li>Runtime configuration (no rebuild needed)</li>
          <li>Time-based scheduling with auto-start/stop</li>
          <li>Live countdown display</li>
          <li>Automatic redirect when maintenance ends</li>
        </ul>
      </section>

      <footer style={{ marginTop: '3rem', padding: '1rem', borderTop: '1px solid #ddd' }}>
        <p>
          Learn more at{' '}
          <a
            href="https://github.com/yourusername/nextjs-maintenance-mode"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#0070f3' }}
          >
            github.com/yourusername/nextjs-maintenance-mode
          </a>
        </p>
      </footer>
    </main>
  )
}
