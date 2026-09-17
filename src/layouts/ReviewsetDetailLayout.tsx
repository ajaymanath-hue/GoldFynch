import type { PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import ReviewsetSidebar from '@/components/reviewset/ReviewsetSidebar'
import type { CaseSectionId } from '@/data/caseSections'
import { useHorizontalResize } from '@/hooks/useHorizontalResize'

type ReviewsetDetailLayoutProps = {
  caseId: string
  activeSectionId?: CaseSectionId
  documentControl: ReactNode
  documentViewer: ReactNode
  documentDetails: ReactNode
}

function ResizeHandle({
  onPointerDown,
  showAffordance = false,
}: {
  onPointerDown: (event: ReactPointerEvent) => void
  showAffordance?: boolean
}) {
  return (
    <div
      role="separator"
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      className="group relative z-10 w-1 shrink-0 cursor-col-resize bg-brandcolor-strokeweak hover:bg-brandcolor-secondary"
    >
      {showAffordance ? (
        <span className="pointer-events-none absolute left-1/2 top-1/2 flex size-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white shadow opacity-80 group-hover:opacity-100">
          +
        </span>
      ) : null}
    </div>
  )
}

export default function ReviewsetDetailLayout({
  caseId,
  activeSectionId = 'review-sets',
  documentControl,
  documentViewer,
  documentDetails,
}: ReviewsetDetailLayoutProps) {
  const control = useHorizontalResize({
    initialWidth: 280,
    minWidth: 280,
    maxWidth: 480,
  })
  const details = useHorizontalResize({
    initialWidth: 300,
    minWidth: 220,
    maxWidth: 420,
    invert: true,
  })

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden">
      <ReviewsetSidebar caseId={caseId} activeSectionId={activeSectionId} />

      <div className="flex min-w-0 flex-1 overflow-hidden bg-brandcolor-white">
        <section
          className="relative min-h-0 shrink-0 overflow-auto border-r border-brandcolor-strokeweak"
          style={{ width: control.width }}
          aria-label="Documents control"
        >
          {documentControl}
        </section>

        <ResizeHandle onPointerDown={control.startResize} />

        <section className="relative min-h-0 min-w-0 flex-1 overflow-auto" aria-label="Documents view">
          {documentViewer}
        </section>

        <ResizeHandle onPointerDown={details.startResize} showAffordance />

        <section
          className="relative min-h-0 shrink-0 overflow-auto border-l border-brandcolor-strokeweak"
          style={{ width: details.width }}
          aria-label="Document details"
        >
          {documentDetails}
        </section>
      </div>
    </div>
  )
}
