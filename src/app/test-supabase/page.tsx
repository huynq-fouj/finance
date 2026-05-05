import { createClient } from '@/utils/supabase/server'

export default async function SupabaseTestPage() {
  let connectionStatus = 'Checking...'
  let errorMsg = ''

  try {
    const supabase = await createClient()
    // Check connection by getting session (works even without tables)
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      connectionStatus = 'Error'
      errorMsg = error.message
    } else {
      connectionStatus = 'Connected Successfully'
    }
  } catch (e: any) {
    connectionStatus = 'Failed'
    errorMsg = e.message
  }

  return (
    <div className="p-8 font-sans">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      <div className={`p-4 rounded-lg ${connectionStatus === 'Connected Successfully' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <p>Status: <strong>{connectionStatus}</strong></p>
        {errorMsg && <p className="mt-2 text-sm">Error: {errorMsg}</p>}
      </div>
      <div className="mt-6 text-gray-600">
        <p>Configured URL: <code>{process.env.SUPABASE_URL}</code></p>
        <p className="mt-4">You can now use <code>createClient</code> from <code>@/utils/supabase/server</code> in your server-side code.</p>
      </div>
    </div>
  )
}
