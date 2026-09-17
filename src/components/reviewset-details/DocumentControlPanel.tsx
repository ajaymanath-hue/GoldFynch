import { useEffect, useMemo, useRef, useState } from 'react'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'
import HoverTip, { TIP_TRIGGER } from '@/components/reviewset-details/HoverTip'

export type ReviewStatus = 'reviewed' | 'in-review' | 'pending'

export type ReviewDocument = {
  id: string
  name: string
  kind: 'pdf' | 'image'
  reviewStatus: ReviewStatus
}

type DocumentControlPanelProps = {
  reviewSetName: string
  documents: ReviewDocument[]
  selectedId: string
  onSelect: (id: string) => void
  onMarkReviewed: (ids: string[]) => void
  onUnmarkReviewed: (ids: string[]) => void
  bulkMode: boolean
  onBulkModeChange: (next: boolean) => void
  checkedIds: Set<string>
  onCheckedIdsChange: (next: Set<string>) => void
  autoReview: boolean
  onAutoReviewChange: (next: boolean) => void
  manualUnreviewedIds: Set<string>
}

const AUTO_REVIEW_HELP =
  'When enabled, viewing a document for 5 seconds (or navigating away) marks it reviewed. Turning Reviewed off for a document blocks auto-review until you mark it reviewed again. Setting is saved for this review set.'

const AUTO_REVIEW_TIP =
  'Auto-marks documents as reviewed after 5 seconds or when you navigate away'

const TICK_TIP = 'Mark selected documents as reviewed'
const REFRESH_TIP = 'Reset selected documents to unreviewed'

const STATUS_DOT: Record<
  Exclude<ReviewStatus, 'pending'>,
  { className: string; label: string }
> = {
  reviewed: { className: 'bg-brandcolor-secondary', label: 'Reviewed by you' },
  'in-review': { className: 'bg-emerald-500', label: 'Team reviewing' },
}

function formatProgress(done: number, total: number) {
  const percent = total > 0 ? (done / total) * 100 : 0
  return {
    percent,
    label: `${done}/${total} (${percent.toFixed(1)}%)`,
  }
}

function nameClassForDoc(
  doc: ReviewDocument,
  isOpen: boolean,
  isCheckedPendingInBulk: boolean,
) {
  if (doc.reviewStatus === 'reviewed' || doc.reviewStatus === 'in-review') {
    return 'font-semibold text-brandcolor-secondary'
  }
  if (isCheckedPendingInBulk) {
    return 'font-medium text-brandcolor-textstrong'
  }
  if (isOpen) {
    return 'font-semibold text-brandcolor-textstrong'
  }
  return 'font-normal text-brandcolor-textstrong'
}

export default function DocumentControlPanel({
  reviewSetName,
  documents,
  selectedId,
  onSelect,
  onMarkReviewed,
  onUnmarkReviewed,
  bulkMode,
  onBulkModeChange,
  checkedIds,
  onCheckedIdsChange,
  autoReview,
  onAutoReviewChange,
  manualUnreviewedIds,
}: DocumentControlPanelProps) {
  const [query, setQuery] = useState(reviewSetName)
  const [activeBulkAction, setActiveBulkAction] = useState<'review' | null>(null)
  const [moreOpen, setMoreOpen] = useState(false)
  const moreMenuRef = useRef<HTMLDivElement>(null)

  const total = documents.length
  const myDone = documents.filter((d) => d.reviewStatus === 'reviewed').length
  const teamDone = documents.filter(
    (d) => d.reviewStatus === 'reviewed' || d.reviewStatus === 'in-review',
  ).length
  const myProgress = formatProgress(myDone, total)
  const teamProgress = formatProgress(teamDone, total)

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const q = query.trim().toLowerCase()
      if (!q || q === reviewSetName.toLowerCase()) return true
      return doc.name.toLowerCase().includes(q)
    })
  }, [documents, query, reviewSetName])

  const selectedIndex = filtered.findIndex((doc) => doc.id === selectedId)
  const showBulkBar = autoReview && bulkMode && checkedIds.size > 0

  useEffect(() => {
    if (!showBulkBar) setActiveBulkAction(null)
  }, [showBulkBar])

  useEffect(() => {
    if (!moreOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!moreMenuRef.current?.contains(event.target as Node)) {
        setMoreOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMoreOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [moreOpen])

  function goPrev() {
    if (filtered.length === 0) return
    const nextIndex = selectedIndex <= 0 ? filtered.length - 1 : selectedIndex - 1
    onSelect(filtered[nextIndex].id)
  }

  function goNext() {
    if (filtered.length === 0) return
    const nextIndex = selectedIndex < 0 || selectedIndex >= filtered.length - 1 ? 0 : selectedIndex + 1
    onSelect(filtered[nextIndex].id)
  }

  function toggleChecked(id: string) {
    const next = new Set(checkedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    onCheckedIdsChange(next)
  }

  function toggleBulkMode() {
    if (bulkMode) {
      onCheckedIdsChange(new Set())
      onBulkModeChange(false)
    } else {
      onBulkModeChange(true)
    }
  }

  function handleTick() {
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return
    onMarkReviewed(ids)
    setActiveBulkAction('review')
  }

  function handleRefresh() {
    const ids = Array.from(checkedIds)
    if (ids.length > 0) onUnmarkReviewed(ids)
    setActiveBulkAction(null)
    onCheckedIdsChange(new Set())
  }

  function handleSelectAll() {
    if (!bulkMode) onBulkModeChange(true)
    onCheckedIdsChange(new Set(filtered.map((doc) => doc.id)))
    setMoreOpen(false)
  }

  function handleClearSelection() {
    onCheckedIdsChange(new Set())
    setActiveBulkAction(null)
    setMoreOpen(false)
  }

  return (
    <div className="flex h-full min-w-0 flex-col text-sm">
      <div className="min-w-0 border-b border-brandcolor-strokeweak p-3">
        <label className="sr-only" htmlFor="doc-control-search">
          Search documents
        </label>
        <div className="relative min-w-0">
          <input
            id="doc-control-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full min-w-0 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white py-1.5 pl-2 pr-8 text-sm outline-none focus:border-brandcolor-secondary"
          />
          <GoogleDuotoneIcon
            name="search"
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] !text-brandcolor-strokestrong"
          />
        </div>

        <div
          className={`mt-3 min-w-0 overflow-hidden rounded-md border box-border p-2.5 ${
            myProgress.percent >= 100
              ? 'border-transparent bg-[color-mix(in_srgb,#10b981_13%,white)]'
              : 'border-brandcolor-strokeweak bg-brandcolor-fill'
          }`}
        >
          <div className="flex min-w-0 items-center justify-between gap-1">
            <label className={`${TIP_TRIGGER} inline-flex min-w-0 cursor-pointer items-center gap-2`}>
              <button
                type="button"
                role="switch"
                aria-checked={autoReview}
                aria-describedby="auto-review-help"
                onClick={() => onAutoReviewChange(!autoReview)}
                className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                  autoReview ? 'bg-brandcolor-secondary' : 'bg-brandcolor-strokeweak'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-brandcolor-white shadow transition-transform ${
                    autoReview ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
              <span className="truncate text-sm font-medium text-brandcolor-textstrong">
                Auto review
              </span>
              <span id="auto-review-help" className="sr-only">
                {AUTO_REVIEW_HELP}
              </span>
              <HoverTip
                label={AUTO_REVIEW_TIP}
                className="left-0 top-full z-[60] mt-1"
              />
            </label>

            <div className="flex shrink-0 items-center">
              <button
                type="button"
                onClick={toggleBulkMode}
                aria-pressed={bulkMode}
                aria-label="Bulk select"
                className={`inline-flex size-7 items-center justify-center rounded ${
                  bulkMode
                    ? 'border border-brandcolor-strokeweak bg-brandcolor-white text-brandcolor-secondary'
                    : 'text-brandcolor-strokestrong hover:bg-brandcolor-fill'
                }`}
              >
                <GoogleDuotoneIcon
                  name="file_copy"
                  className={`text-[18px] ${
                    bulkMode ? '!text-brandcolor-secondary' : '!text-brandcolor-strokestrong'
                  }`}
                />
              </button>
              <div className="inline-flex -space-x-1.5 items-center" role="group" aria-label="Document navigation">
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous document"
                  className="inline-flex size-7 items-center justify-center rounded text-brandcolor-strokestrong hover:bg-brandcolor-fill"
                >
                  <GoogleDuotoneIcon name="arrow_back" className="text-[20px] !text-brandcolor-strokestrong" />
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next document"
                  className="inline-flex size-7 items-center justify-center rounded text-brandcolor-strokestrong hover:bg-brandcolor-fill"
                >
                  <GoogleDuotoneIcon name="arrow_forward" className="text-[20px] !text-brandcolor-strokestrong" />
                </button>
              </div>
              <div className="relative" ref={moreMenuRef}>
                <button
                  type="button"
                  aria-label="More options"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  onClick={() => setMoreOpen((open) => !open)}
                  className={`inline-flex size-7 items-center justify-center rounded border bg-brandcolor-white ${
                    moreOpen
                      ? 'border-transparent shadow-button-press'
                      : 'border-brandcolor-strokeweak'
                  }`}
                >
                  <GoogleDuotoneIcon name="more_vert" className="text-[18px] !text-brandcolor-strokestrong" />
                </button>
                {moreOpen ? (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-brandcolor-strokeweak bg-brandcolor-white py-1 shadow-md"
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleSelectAll}
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={handleClearSelection}
                      className="block w-full px-3 py-2 text-left text-xs font-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
                    >
                      Clear selection
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div>
              <div className="mb-1 flex min-w-0 items-baseline justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-brandcolor-textstrong">
                  <span className="size-1.5 shrink-0 rounded-full bg-brandcolor-secondary" aria-hidden />
                  <span className="truncate" title="My review progress">
                    My review progress
                  </span>
                </span>
                <span className="shrink-0 text-[13px] text-brandcolor-textstrong">
                  <span className="font-semibold tabular-nums">{myDone}</span>
                  <span className="font-normal">/{total} </span>
                  <span className="font-semibold tabular-nums">({myProgress.percent.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-brandcolor-strokeweak">
                <div
                  className="h-full rounded-full bg-brandcolor-secondary"
                  style={{ width: `${myProgress.percent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-1 flex min-w-0 items-baseline justify-between gap-2">
                <span className="inline-flex min-w-0 items-center gap-1.5 text-[13px] font-semibold text-brandcolor-textstrong">
                  <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                  <span className="truncate" title="Team's review progress">
                    Team&apos;s review progress
                  </span>
                </span>
                <span className="shrink-0 text-[13px] text-brandcolor-textstrong">
                  <span className="font-semibold tabular-nums">{teamDone}</span>
                  <span className="font-normal">/{total} </span>
                  <span className="font-semibold tabular-nums">({teamProgress.percent.toFixed(1)}%)</span>
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-brandcolor-strokeweak">
                <div
                  className="h-full rounded-full bg-emerald-500"
                  style={{ width: `${teamProgress.percent}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {showBulkBar ? (
          <div className="mt-2 space-y-2">
            <div className="flex items-center justify-between gap-2 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-2">
              <span className="inline-flex items-center gap-1.5 text-sm text-brandcolor-textstrong">
                <span className="inline-flex min-w-5 items-center justify-center rounded bg-brandcolor-strokeweak px-1.5 py-0.5 font-medium tabular-nums">
                  {checkedIds.size}
                </span>
                <span className="font-medium text-brandcolor-textweak">selected</span>
              </span>
              <div className="flex items-center gap-0.5">
                <span className={TIP_TRIGGER}>
                  <button
                    type="button"
                    onClick={handleTick}
                    aria-label="Mark selected as reviewed"
                    aria-pressed={activeBulkAction === 'review'}
                    className={`inline-flex size-7 items-center justify-center rounded border bg-brandcolor-white outline-none focus:border-brandcolor-secondary ${
                      activeBulkAction === 'review'
                        ? 'border-brandcolor-secondary'
                        : 'border-brandcolor-strokeweak'
                    }`}
                  >
                    <GoogleDuotoneIcon name="check" className="text-[18px] !text-brandcolor-secondary" />
                  </button>
                  <HoverTip label={TICK_TIP} className="right-0 top-full mt-1" />
                </span>
                <span className={TIP_TRIGGER}>
                  <button
                    type="button"
                    onClick={handleRefresh}
                    aria-label="Reset selected to unreviewed"
                    className="inline-flex size-7 items-center justify-center rounded border border-brandcolor-strokeweak bg-brandcolor-white outline-none focus:border-brandcolor-secondary"
                  >
                    <GoogleDuotoneIcon name="refresh" className="text-[18px] !text-brandcolor-strokestrong" />
                  </button>
                  <HoverTip label={REFRESH_TIP} className="right-0 top-full mt-1" />
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                onCheckedIdsChange(new Set())
                setActiveBulkAction(null)
              }}
              className="w-full rounded-md bg-brandcolor-secondaryfill px-3 py-2 text-center text-sm font-semibold text-brandcolor-secondary outline-none hover:bg-brandcolor-secondaryfill focus-visible:ring-1 focus-visible:ring-brandcolor-secondary"
            >
              Clear Filters
            </button>
          </div>
        ) : null}
      </div>

      <ul className="scrollbar-lean min-h-0 flex-1 overflow-auto py-1" aria-label="Documents">
        {filtered.map((doc) => {
          const isOpen = doc.id === selectedId
          const isChecked = checkedIds.has(doc.id)
          const isManuallyUnreviewed = manualUnreviewedIds.has(doc.id)
          const statusMeta =
            doc.reviewStatus === 'pending' ? null : STATUS_DOT[doc.reviewStatus]
          const nameClass = nameClassForDoc(
            doc,
            isOpen,
            bulkMode && isChecked && doc.reviewStatus === 'pending',
          )

          return (
            <li key={doc.id}>
              <div
                className={`${TIP_TRIGGER} flex w-full items-center gap-1 border-l-[3px] px-3 py-2 transition-colors ${
                  isManuallyUnreviewed ? 'border-l-amber-500' : 'border-l-transparent'
                } ${isOpen ? 'bg-brandcolor-fill' : 'hover:bg-brandcolor-fill'}`}
              >
                {bulkMode ? (
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleChecked(doc.id)}
                    className="size-4 shrink-0 rounded border-brandcolor-strokeweak"
                    aria-label={`Select ${doc.name}`}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : null}
                <button
                  type="button"
                  onClick={() => onSelect(doc.id)}
                  className="flex min-w-0 flex-1 items-center gap-1.5 text-left"
                >
                  <GoogleDuotoneIcon
                    name={doc.kind === 'image' ? 'image' : 'picture_as_pdf'}
                    className="shrink-0 text-[18px] !text-brandcolor-strokestrong"
                  />
                  <span
                    className={`min-w-0 truncate text-sm leading-snug ${nameClass}${
                      isManuallyUnreviewed ? ' italic' : ''
                    }`}
                    title={doc.name}
                  >
                    {doc.name}
                  </span>
                  <span className="ml-auto inline-flex shrink-0 items-center gap-1">
                    {statusMeta ? (
                      <span
                        className={`size-1.5 rounded-full ${statusMeta.className}`}
                        title={statusMeta.label}
                        aria-label={statusMeta.label}
                      />
                    ) : null}
                    {isOpen ? (
                      <GoogleDuotoneIcon
                        name="arrow_back"
                        className="text-[16px] !text-brandcolor-strokestrong"
                      />
                    ) : null}
                  </span>
                </button>
                {isManuallyUnreviewed ? (
                  <HoverTip label="You removed review" className="right-2 top-1/2 -translate-y-1/2" />
                ) : null}
              </div>
            </li>
          )
        })}
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-xs text-brandcolor-textweak">No documents</li>
        ) : null}
      </ul>
    </div>
  )
}
