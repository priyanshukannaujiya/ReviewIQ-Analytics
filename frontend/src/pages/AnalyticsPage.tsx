import { useQuery } from '@tanstack/react-query'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts'
import api from '../services/api'
import type { DashboardOverview, SentimentData, TrendData } from '../types'
import { Activity, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

export default function AnalyticsPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery<DashboardOverview>({
    queryKey: ['analytics_overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  })

  const { data: sentiment = [], isLoading: loadingSentiment } = useQuery<SentimentData[]>({
    queryKey: ['analytics_sentiment'],
    queryFn: async () => (await api.get('/analytics/sentiment')).data,
  })

  const { data: trends = [], isLoading: loadingTrends } = useQuery<TrendData[]>({
    queryKey: ['analytics_trends'],
    queryFn: async () => (await api.get('/analytics/trends')).data,
  })

  const isLoading = loadingOverview || loadingSentiment || loadingTrends

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-slate-100 rounded w-72"></div>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm animate-pulse">
              <div className="h-10 bg-slate-100 rounded-lg w-10 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-24 mb-2"></div>
              <div className="h-8 bg-slate-300 rounded w-16"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!overview) return <div className="p-6 text-slate-500">Failed to load analytics.</div>

  const totalReviews = overview.total_reviews || 1
  const positiveRate = Math.round((overview.positive_reviews / totalReviews) * 100)

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics Overview</h1>
        <p className="mt-1 text-sm text-slate-500">Deep dive into sentiment trends and insights powered by ML.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {[
          { label: 'Total Reviews', value: overview.total_reviews, icon: Activity, color: 'indigo' },
          { label: 'Positive Sentiment', value: `${positiveRate}%`, icon: CheckCircle, color: 'emerald' },
          { label: 'Negative Reviews', value: overview.negative_reviews, icon: AlertTriangle, color: 'red' },
          { label: 'High Priority', value: overview.high_priority_complaints, icon: TrendingUp, color: 'amber' },
        ].map(({ label, value, icon: Icon, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:-translate-y-1 hover:shadow-md transition-all duration-200"
          >
            <div className="flex items-center gap-4">
              <div className={`rounded-lg bg-${color}-100 p-3 flex-shrink-0`}>
                <Icon className={`h-6 w-6 text-${color}-600`} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <p className="text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      >
        {/* Pie Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-1">
          <h2 className="text-base font-semibold text-slate-900">Sentiment Distribution</h2>
          {sentiment.every(s => s.value === 0) ? (
            <div className="mt-6 h-64 flex items-center justify-center text-sm text-slate-400">
              No review data yet. Upload a CSV to see sentiment.
            </div>
          ) : (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentiment}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {sentiment.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any, name: any) => [`${value} reviews`, name]} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Area Chart */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Review Volume (Past 7 Days)</h2>
          {trends.every(t => t.reviews === 0) ? (
            <div className="mt-6 h-64 flex items-center justify-center text-sm text-slate-400">
              No reviews in the last 7 days. Upload a CSV to populate this chart.
            </div>
          ) : (
            <div className="mt-6 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorReviews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: any) => [`${value} reviews`, 'Volume']}
                  />
                  <Area type="monotone" dataKey="reviews" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorReviews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </motion.div>

      {/* Review Count Summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-base font-semibold text-slate-900 mb-4">Review Breakdown</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Positive', count: overview.positive_reviews, color: 'bg-emerald-500', pct: Math.round((overview.positive_reviews / (totalReviews || 1)) * 100) },
            { label: 'Neutral', count: totalReviews - overview.positive_reviews - overview.negative_reviews, color: 'bg-amber-400', pct: Math.round(((totalReviews - overview.positive_reviews - overview.negative_reviews) / (totalReviews || 1)) * 100) },
            { label: 'Negative', count: overview.negative_reviews, color: 'bg-red-500', pct: Math.round((overview.negative_reviews / (totalReviews || 1)) * 100) },
          ].map(({ label, count, color, pct }) => (
            <div key={label} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-slate-700">{label}</span>
                <span className="text-slate-500">{count} ({pct}%)</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.8, delay: 0.5 }}
                  className={`h-full ${color} rounded-full`}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
