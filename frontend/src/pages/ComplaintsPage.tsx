import { useEffect, useState } from 'react'
import api from '../services/api'
import type { Complaint } from '../types'

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api
      .get('/complaints')
      .then((response) => setComplaints(response.data.items))
      .catch((error) => console.error("Failed to fetch complaints", error))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="p-6 text-slate-500">Loading complaints...</div>

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Complaints</h1>
        <p className="mt-1 text-slate-500">Track and resolve customer complaints generated from reviews.</p>
      </div>
      
      {complaints.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-soft">
          <h3 className="text-lg font-medium text-slate-900">All caught up</h3>
          <p className="mt-2 text-sm text-slate-500">
            There are no open complaints that need your attention.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700">
                <tr>
                  <th scope="col" className="px-6 py-4">ID</th>
                  <th scope="col" className="px-6 py-4">Category</th>
                  <th scope="col" className="px-6 py-4">Priority</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4">Assigned To</th>
                  <th scope="col" className="px-6 py-4">Created At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {complaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">#{complaint.id}</td>
                    <td className="px-6 py-4">{complaint.category}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        complaint.priority === 'High' ? 'bg-red-100 text-red-800' : 
                        complaint.priority === 'Medium' ? 'bg-amber-100 text-amber-800' : 
                        'bg-slate-100 text-slate-800'
                      }`}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        complaint.status === 'Open' ? 'bg-indigo-100 text-indigo-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">{complaint.assigned_to || 'Unassigned'}</td>
                    <td className="px-6 py-4">{new Date(complaint.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
