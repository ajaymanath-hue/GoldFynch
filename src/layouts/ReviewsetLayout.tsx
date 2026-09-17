import type { ReactNode } from 'react'
import ReviewsetSidebar from '@/components/reviewset/ReviewsetSidebar'
import type { CaseSectionId } from '@/data/caseSections'

type ReviewsetLayoutProps = {
  caseId: string
  activeSectionId?: CaseSectionId
  children: ReactNode
}

export default function ReviewsetLayout({
  caseId,
  activeSectionId = 'review-sets',
  children,
}: ReviewsetLayoutProps) {
  return (
    <div className="flex min-h-0 flex-1">
      <ReviewsetSidebar caseId={caseId} activeSectionId={activeSectionId} />
      <div className="relative z-0 min-w-0 flex-1 overflow-auto bg-brandcolor-white">{children}</div>
    </div>
  )
}
