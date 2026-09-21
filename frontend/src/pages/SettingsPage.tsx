import { useAuth } from '../context/AuthContext'

export default function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-slate-500">Manage your workspace and user preferences.</p>
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-soft max-w-2xl">
        <h3 className="text-lg font-medium text-slate-900 mb-6">Profile Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Name</label>
            <input
              type="text"
              disabled
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50"
              value={user?.name || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              disabled
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50"
              value={user?.email || ''}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Company</label>
            <input
              type="text"
              disabled
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm sm:text-sm p-2 border bg-slate-50"
              value={user?.company_name || ''}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
