export type ReviewSetRow = {
  id: string
  name: string
  badge?: string
  created: string
  reviewedDone: number
  reviewedTotal: number
  totalReviewers: number
}

export const REVIEW_SETS: ReviewSetRow[] = [
  {
    id: '1',
    name: 'layoff',
    badge: 'W/ FAMILIES',
    created: 'Sep 17, 2026 2:35 pm',
    reviewedDone: 0,
    reviewedTotal: 3,
    totalReviewers: 0,
  },
]

export function getReviewSetById(id: string): ReviewSetRow | undefined {
  return REVIEW_SETS.find((row) => row.id === id)
}

export function formatReviewedPercent(done: number, total: number) {
  if (total <= 0) return '0.0%'
  return `${((done / total) * 100).toFixed(1)}%`
}
