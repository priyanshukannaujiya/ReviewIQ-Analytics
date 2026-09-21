import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../services/api'
import type { Complaint } from '../types'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, Check, RotateCcw, Search } from 'lucide-react'

export default function ComplaintsPage() {
  const [filter, setFilter] = useState<'all' | 'high' | 'open' | 'resolved'>('all')
  const [search, setSearch] = useState('')
  const [updatingId, setUpdatingId] = useState<number | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery<{ items: Complaint[] }>({
    queryKey: ['complaints'],
    queryFn: async () => (await api.get('/complaints')).data,
    refetchInterval: 30000,
  })

  const complaints = data?.items ?? []

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      setUpdatingId(id)
      return (await api.put(`/complaints/${id}`, { status })).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] })
      queryClient.invalidateQueries({ queryKey: ['analytics_overview'] })
    },
    onSettled: () => {
      setUpdatingId(null)
    },
  })

  const filteredComplaints = complaints.filter((c) => {
    if (filter === 'high' && c.priority !== 'High') return false
    if (filter === 'open' && c.status !== 'Open') return false
    if (filter === 'resolved' && c.status !== 'Resolved') return false

    if (search) {
      const q = search.toLowerCase()
      const matchCat = c.category.toLowerCase().includes(q)
      const matchId = String(c.id).includes(q)
      const matchAssignee = (c.assigned_to || '').toLowerCase().includes(q)
      if (!matchCat && !matchId && !matchAssignee) return false
    }
    return true
  })

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-40 mb-2"></div>
          <div className="h-4 bg-slate-100 rounded w-72"></div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm animate-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 px-6 py-4 border-b border-slate-100">
              <div className="h-4 bg-slate-200 rounded w-10"></div>
              <div className="h-4 bg-slate-200 rounded w-32"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
              <div className="h-4 bg-slate-200 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
          Failed to load complaints. Please refresh the page.
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Complaints</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">
          Track, prioritize, and resolve customer complaints generated from reviews.
        </p>
      </div>

      {/* Summary pills */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setFilter('high')}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm transition-all ${
            filter === 'high' ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <span className="font-medium">
            {complaints.filter((c) => c.priority === 'High').length} High Priority
          </span>
        </button>

        <button
          onClick={() => setFilter('open')}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm transition-all ${
            filter === 'open' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Clock className="h-4 w-4 text-indigo-500" />
          <span className="font-medium">
            {complaints.filter((c) => c.status === 'Open').length} Open
          </span>
        </button>

        <button
          onClick={() => setFilter('resolved')}
          className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm shadow-sm transition-all ${
            filter === 'resolved' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
          }`}
        >
          <CheckCircle className="h-4 w-4 text-emerald-500" />
          <span className="font-medium">
            {complaints.filter((c) => c.status === 'Resolved').length} Resolved
          </span>
        </button>

        {filter !== 'all' && (
          <button
            onClick={() => setFilter('all')}
            className="rounded-xl border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition-all"
          >
            Clear Filter (Show All {complaints.length})
          </button>
        )}
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search category, ID, assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
          />
        </div>
      </div>

      {complaints.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-soft"
        >
          <CheckCircle className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
          <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
          <p className="mt-2 text-sm text-slate-500">
            No complaints yet. Upload a CSV with reviews to generate complaints automatically.
          </p>
        </motion.div>
      ) : filteredComplaints.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-soft text-slate-500">
          No complaints match the current filter or search.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-200 bg-white shadow-soft overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-500">
              <thead className="bg-slate-50 text-xs font-semibold uppercase text-slate-700 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 sm:px-6 py-4">ID</th>
                  <th scope="col" className="px-4 sm:px-6 py-4">Category</th>
                  <th scope="col" className="px-4 sm:px-6 py-4">Priority</th>
                  <th scope="col" className="px-4 sm:px-6 py-4">Status</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 hidden sm:table-cell">Assigned To</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 hidden md:table-cell">Created</th>
                  <th scope="col" className="px-4 sm:px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredComplaints.map((complaint) => (
                  <tr key={complaint.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-900">#{complaint.id}</td>
                    <td className="px-4 sm:px-6 py-4 font-medium text-slate-700">{complaint.category}</td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          complaint.priority === 'High'
                            ? 'bg-red-100 text-red-700'
                            : complaint.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {complaint.priority}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          complaint.status === 'Open'
                            ? 'bg-indigo-100 text-indigo-700'
                            : complaint.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {complaint.status}
                      </span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden sm:table-cell text-slate-600">
                      {complaint.assigned_to || <span className="italic text-slate-400">Unassigned</span>}
                    </td>
                    <td className="px-4 sm:px-6 py-4 hidden md:table-cell text-slate-500">
                      {new Date(complaint.created_at).toLocaleDateString('en-US', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      {complaint.status === 'Open' ? (
                        <button
                          disabled={updatingId === complaint.id}
                          onClick={() => updateStatusMutation.mutate({ id: complaint.id, status: 'Resolved' })}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Resolve
                        </button>
                      ) : (
                        <button
                          disabled={updatingId === complaint.id}
                          onClick={() => updateStatusMutation.mutate({ id: complaint.id, status: 'Open' })}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reopen
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-slate-100 bg-slate-50 px-6 py-3 text-xs text-slate-500">
            Showing {filteredComplaints.length} of {complaints.length} complaint
            {complaints.length !== 1 ? 's' : ''}
          </div>
        </motion.div>
      )}
    </div>
  )
}
