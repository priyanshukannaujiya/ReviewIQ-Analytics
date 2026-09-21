export type User = {
  id: number
  name: string
  email: string
  company_name?: string
}

export type Review = {
  id: number
  product_name: string
  product_id?: string
  rating: number
  review_title?: string
  review_text: string
  review_date?: string
  sentiment?: string
  sentiment_confidence?: number
  complaint_category?: string
  category_confidence?: number
  priority?: string
  status?: string
}

export type DashboardOverview = {
  total_reviews: number
  positive_reviews: number
  negative_reviews: number
  open_complaints: number
  high_priority_complaints: number
}

export type SentimentData = {
  name: string
  value: number
  fill: string
}

export type TrendData = {
  date: string
  reviews: number
}

export type Complaint = {
  id: number
  category: string
  priority: string
  status: string
  assigned_to: string | null
  created_at: string
  updated_at: string
}
