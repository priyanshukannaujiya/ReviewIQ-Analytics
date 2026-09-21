import { useState, useRef } from 'react'
import api from '../services/api'
import { UploadCloud, CheckCircle, AlertCircle } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'

export default function ReviewsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const queryClient = useQueryClient()

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

    try {
      const response = await api.post('/uploads/reviews', formData)
      const uploadId = response.data.upload_id
      
      if (!uploadId) {
        setUploadStatus({ type: 'success', message: response.data.message || 'File uploaded successfully!' })
        queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard_sentiment'] })
        queryClient.invalidateQueries({ queryKey: ['dashboard_recent_reviews'] })
        setIsUploading(false)
        return
      }

      setUploadStatus({ type: 'success', message: 'Processing your reviews with ML... Please wait.' })
      
      let isComplete = false
      let attempts = 0
      while (!isComplete && attempts < 60) {
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++
        
        try {
          const statusRes = await api.get(`/uploads/${uploadId}`)
          const status = statusRes.data.status
          
          if (status === 'completed') {
            isComplete = true
            setUploadStatus({ type: 'success', message: `Successfully processed ${statusRes.data.valid_rows} reviews!` })
            queryClient.invalidateQueries({ queryKey: ['dashboard_overview'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard_sentiment'] })
            queryClient.invalidateQueries({ queryKey: ['dashboard_recent_reviews'] })
          } else if (status === 'failed') {
            isComplete = true
            setUploadStatus({ type: 'error', message: 'Failed to process the reviews.' })
          }
        } catch (e) {
          // Ignore network errors during polling
        }
      }
      
      if (!isComplete) {
        setUploadStatus({ type: 'error', message: 'Processing is taking a long time. It will finish in the background.' })
      }
      
    } catch (err: any) {
      setUploadStatus({ 
        type: 'error', 
        message: err.response?.data?.detail || 'Failed to upload the file.' 
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Reviews</h1>
        <p className="mt-1 text-slate-500">Manage and analyze your customer reviews.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-soft max-w-3xl mx-auto">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-100">
          <UploadCloud className="h-8 w-8 text-brand-600" />
        </div>
        
        <h3 className="mt-4 text-lg font-medium text-slate-900">Upload Review Data</h3>
        <p className="mt-2 text-sm text-slate-500">
          Upload a CSV file to bulk import customer reviews for analysis.
        </p>

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
          className="mt-6 rounded-xl bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-soft hover:bg-brand-500 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed transition-all"
        >
          {isUploading ? 'Uploading...' : 'Select CSV File'}
        </button>

        {uploadStatus && (
          <div className={`mt-6 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${
            uploadStatus.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {uploadStatus.type === 'success' ? <CheckCircle className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
            {uploadStatus.message}
          </div>
        )}
      </div>
    </div>
  )
}
