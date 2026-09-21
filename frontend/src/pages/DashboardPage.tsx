import { useQuery } from '@tanstack/react-query'
import { BarChart3, CircleDollarSign, FileText, MessageSquareWarning, ShieldAlert } from 'lucide-react'
import { motion, type Variants } from 'framer-motion'
import api from '../services/api'
import type { DashboardOverview } from '../types'

const cards = [
  { key: 'total_reviews', label: 'Total Reviews', icon: FileText },
  { key: 'positive_reviews', label: 'Positive Reviews', icon: BarChart3 },
  { key: 'negative_reviews', label: 'Negative Reviews', icon: ShieldAlert },
  { key: 'open_complaints', label: 'Open Complaints', icon: MessageSquareWarning },
  { key: 'high_priority_complaints', label: 'High Priority', icon: CircleDollarSign },
] as const

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
}

const itemVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
}

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview } = useQuery<DashboardOverview>({
    queryKey: ['dashboard_overview'],
    queryFn: async () => (await api.get('/analytics/overview')).data,
  })

  const { data: sentiment = [] } = useQuery<{name: string, value: number, fill: string}[]>({
    queryKey: ['dashboard_sentiment'],
    queryFn: async () => (await api.get('/analytics/sentiment')).data,
  })

  const { data: reviewsData } = useQuery({
    queryKey: ['dashboard_recent_reviews'],
    queryFn: async () => (await api.get('/reviews')).data,
  })

  const recentReviews = reviewsData?.items?.slice(0, 5) || []

  if (loadingOverview && !overview?.total_reviews) {
    return <div className="p-6 md:p-8 text-slate-500 animate-pulse">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6 md:space-y-8 p-4 sm:p-6 lg:p-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm md:text-base text-slate-500">Executive overview of customer feedback and complaints.</p>
      </div>

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      >
        {cards.map(({ key, label, icon: Icon }) => (
          <motion.div 
            key={key} 
            variants={itemVariant}
            className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5 shadow-soft hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm text-slate-500 font-medium truncate pr-2">{label}</div>
              <div className="p-2 bg-brand-50 rounded-xl text-brand-600 flex-shrink-0">
                <Icon size={20} />
              </div>
            </div>
            <div className="mt-3 md:mt-4 text-2xl md:text-3xl font-bold text-slate-900">{overview?.[key] ?? 0}</div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid gap-6 grid-cols-1 lg:grid-cols-2"
      >
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-soft hover:shadow-md transition-shadow">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">Sentiment distribution</h2>
          <div className="mt-5 flex h-40 md:h-44 items-end gap-2 md:gap-3">
            {sentiment.map((item, index) => {
              const total = sentiment.reduce((acc, curr) => acc + curr.value, 0) || 1;
              const percentage = Math.max((item.value / total) * 100, 5);
              return (
                <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                  <div className="absolute bottom-full mb-2 hidden w-full text-center text-xs font-medium text-slate-600 group-hover:block z-10 bg-white/90 rounded px-1">
                    {item.name} ({item.value})
                  </div>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${percentage}%` }}
                    transition={{ type: 'spring', damping: 20, delay: 0.4 + (index * 0.1) }}
                    className="w-full rounded-t-xl hover:opacity-80 cursor-pointer" 
                    style={{ backgroundColor: item.fill }} 
                  />
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-soft hover:shadow-md transition-shadow">
          <h2 className="text-base md:text-lg font-semibold text-slate-900">Recent reviews</h2>
          <div className="mt-4 md:mt-5 space-y-3 md:space-y-4">
            {recentReviews.length > 0 ? recentReviews.map((item: any, i: number) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (i * 0.1) }}
                className="rounded-xl border border-slate-200 p-3 md:p-4 text-xs md:text-sm text-slate-600 hover:border-brand-200 hover:bg-brand-50 transition-colors duration-200"
              >
                <span className="font-semibold block mb-1 text-slate-900">{item.review_title || 'Review'}</span>
                <span className="line-clamp-2">{item.review_text}</span>
              </motion.div>
            )) : (
              <div className="text-sm text-slate-500 py-4 text-center bg-slate-50 rounded-lg">No recent reviews found.</div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
