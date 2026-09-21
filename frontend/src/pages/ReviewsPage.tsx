import { useState, useRef } from 'react'
import api from '../services/api'
import type { Review } from '../types'
import { UploadCloud, CheckCircle, AlertCircle, Search, Star, MessageSquare } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'

export default function ReviewsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const pageSize = 15

  const queryClient = useQueryClient()

  // Query reviews
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery<{ items: Review[]; total?: number }>({
    queryKey: ['reviews_list', selectedSentiment, page],
    queryFn: async () => {
      const params: Record<string, string | number> = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      }
      if (selectedSentiment !== 'all') {
        params.sentiment = selectedSentiment
      }
      const res = await api.get('/reviews', { params })
      return res.data
    },
  })

  const reviews = reviewsData?.items ?? []
  const totalReviews = reviewsData?.total ?? reviews.length

  const filteredReviews = reviews.filter((r) => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    return (
      (r.review_title && r.review_title.toLowerCase().includes(q)) ||
      (r.review_text && r.review_text.toLowerCase().includes(q))
    )
  })

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Please upload a valid .csv file.' })
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    setIsUploading(true)
    setUploadStatus(null)

    const invalidateAll = () => {
      queryClient.invalidateQueries({ queryKey: ['reviews_list'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_sentiment'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard_recent_reviews'] })
      queryClient.invalidateQueries({ queryKey: ['analytics_overview'] })
      queryClient.invalidateQueries({ queryKey: ['analytics_sentiment'] })
      queryClient.invalidateQueries({ queryKey: ['analytics_trends'] })
      queryClient.invalidateQueries({ queryKey: ['complaints'] })
    }

    try {
      const response = await api.post('/uploads/reviews', formData)
      const uploadId = response.data.upload_id

      if (!uploadId) {
        setUploadStatus({ type: 'success', message: response.data.message || 'File uploaded successfully!' })
        invalidateAll()
        setIsUploading(false)
        return
      }

      setUploadStatus({ type: 'success', message: 'Processing your reviews with ML... Please wait.' })

      let isComplete = false
      let attempts = 0
      while (!isComplete && attempts < 60) {
        await new Promise((resolve) => setTimeout(resolve, 2000))
        attempts++

        try {
          const statusRes = await api.get(`/uploads/${uploadId}`)
          const status = statusRes.data.status

          if (status === 'completed') {
            isComplete = true
            setUploadStatus({ type: 'success', message: `Successfully processed ${statusRes.data.valid_rows} reviews!` })
            invalidateAll()
          } else if (status === 'failed') {
            isComplete = true
            setUploadStatus({ type: 'error', message: 'Failed to process the reviews.' })
          }
        } catch {
          // Ignore network errors during polling
        }
      }

      if (!isComplete) {
        setUploadStatus({ type: 'error', message: 'Processing is taking a long time. It will finish in the background.' })
        invalidateAll()
      }
    } catch (err: any) {
      setUploadStatus({
        type: 'error',
        message: err.response?.data?.detail || 'Failed to upload the file.',
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Customer Reviews</h1>
        <p className="mt-1 text-sm sm:text-base text-slate-500">
          Upload review data and view real-time AI sentiment analysis.
        </p>
      </div>

      {/* Upload Box */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-soft">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
              <UploadCloud className="h-7 w-7" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Import Reviews via CSV</h2>
              <p className="text-sm text-slate-500">
                Upload customer reviews to automatically extract sentiment, ratings, and issue categories.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />
            <button
              onClick={handleUploadClick}
              disabled={isUploading}
              className="w-full sm:w-auto rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
            >
              {isUploading ? 'Processing...' : 'Select CSV File'}
            </button>
          </div>
        </div>

        {uploadStatus && (
          <div
            className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium ${
              uploadStatus.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {uploadStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {uploadStatus.message}
          </div>
        )}
      </div>

      {/* Reviews Table Header Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Sentiment Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'Positive', 'Neutral', 'Negative'].map((sentiment) => (
            <button
              key={sentiment}
              onClick={() => {
                setSelectedSentiment(sentiment)
                setPage(1)
              }}
              className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
                selectedSentiment === sentiment
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {sentiment === 'all' ? `All (${totalReviews})` : sentiment}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search review content..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
      </div>

      {/* Reviews List */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-soft overflow-hidden">
        {isLoadingReviews ? (
          <div className="p-8 text-center text-slate-400 animate-pulse">Loading reviews...</div>
        ) : filteredReviews.length === 0 ? (
          <div className="p-12 text-center">
            <MessageSquare className="mx-auto h-12 w-12 text-slate-300 mb-3" />
            <p className="text-base font-medium text-slate-700">No reviews found</p>
            <p className="text-sm text-slate-400 mt-1">Upload a CSV or change your search filter.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100">
              {filteredReviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="p-5 sm:p-6 hover:bg-slate-50/80 transition-colors"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-3">
                      {/* Star Rating */}
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < (review.rating || 5) ? 'fill-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                      </div>
                      <span className="font-semibold text-slate-900 text-sm">
                        {review.review_title || 'Customer Review'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Sentiment Badge */}
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          review.sentiment === 'Positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : review.sentiment === 'Negative'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {review.sentiment || 'Neutral'}
                      </span>

                      {review.review_date && (
                        <span className="text-xs text-slate-400">
                          {new Date(review.review_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 line-clamp-3 mt-1 leading-relaxed">
                    {review.review_text}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3">
              <span className="text-xs text-slate-500">
                Page {page} {totalReviews > 0 ? `· ${totalReviews} total reviews` : ''}
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  disabled={filteredReviews.length < pageSize}
                  onClick={() => setPage((p) => p + 1)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
