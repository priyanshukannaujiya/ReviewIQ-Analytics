import { useEffect, useState } from 'react'
import { BarChart3, CircleDollarSign, FileText, MessageSquareWarning, ShieldAlert } from 'lucide-react'
import api from '../services/api'
import type { DashboardOverview } from '../types'

const cards = [
  { key: 'total_reviews', label: 'Total Reviews', icon: FileText },
  { key: 'positive_reviews', label: 'Positive Reviews', icon: BarChart3 },
  { key: 'negative_reviews', label: 'Negative Reviews', icon: ShieldAlert },
  { key: 'open_complaints', label: 'Open Complaints', icon: MessageSquareWarning },
  { key: 'high_priority_complaints', label: 'High Priority Complaints', icon: CircleDollarSign },
] as const

export default function DashboardPage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [sentiment, setSentiment] = useState<{name: string, value: number, fill: string}[]>([])
  const [recentReviews, setRecentReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/analytics/overview'),
      api.get('/analytics/sentiment'),
      api.get('/reviews')
    ])
      .then(([overviewRes, sentimentRes, reviewsRes]) => {
        setOverview(overviewRes.data)
        setSentiment(sentimentRes.data)
        setRecentReviews(reviewsRes.data.items.slice(0, 5)) // show top 5
      })
      .catch(() => {
        setOverview({ total_reviews: 0, positive_reviews: 0, negative_reviews: 0, open_complaints: 0, high_priority_complaints: 0 })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-8 text-slate-500">Loading dashboard...</div>
  }

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-slate-500">Executive overview of customer feedback and complaints.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map(({ key, label, icon: Icon }, index) => (
          <div 
            key={key} 
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-soft animate-slide-up opacity-0 hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 font-medium">{label}</div>
              <div className="p-2 bg-brand-50 rounded-xl text-brand-600">
                <Icon size={20} />
              </div>
            </div>
            <div className="mt-4 text-3xl font-bold text-slate-900">{overview?.[key] ?? 0}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div 
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft animate-slide-up opacity-0"
          style={{ animationDelay: '500ms' }}
        >
          <h2 className="text-lg font-semibold text-slate-900">Sentiment distribution</h2>
          <div className="mt-5 flex h-44 items-end gap-3">
            {sentiment.map((item, index) => {
              const total = sentiment.reduce((acc, curr) => acc + curr.value, 0) || 1;
              const percentage = Math.max((item.value / total) * 100, 5); // Ensure at least 5% height to be visible
              return (
                <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                  <div className="absolute bottom-full mb-2 hidden w-full text-center text-xs font-medium text-slate-600 group-hover:block">
                    {item.name} ({item.value})
                  </div>
                  <div 
                    className="w-full rounded-t-xl transition-all duration-300 hover:opacity-80" 
                    style={{ height: `${percentage}%`, backgroundColor: item.fill }} 
                  />
                </div>
              );
            })}
          </div>
        </div>
        <div 
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft animate-slide-up opacity-0"
          style={{ animationDelay: '600ms' }}
        >
          <h2 className="text-lg font-semibold text-slate-900">Recent reviews</h2>
          <div className="mt-5 space-y-4">
            {recentReviews.length > 0 ? recentReviews.map((item) => (
              <div 
                key={item.id} 
                className="rounded-xl border border-slate-200 p-4 text-sm text-slate-600 hover:border-brand-200 hover:bg-brand-50 transition-colors duration-200"
              >
                <span className="font-semibold block mb-1 text-slate-900">{item.review_title || 'Review'}</span>
                <span className="line-clamp-2">{item.review_text}</span>
              </div>
            )) : (
              <div className="text-sm text-slate-500">No recent reviews.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
