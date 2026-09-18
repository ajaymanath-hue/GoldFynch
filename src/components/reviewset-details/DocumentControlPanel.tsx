import { useEffect, useMemo, useRef, useState } from 'react'
import FontAwesomeIcon from '@/components/FontAwesomeIcon'
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
  onMarkReviewed: (ids: string[], displayCount?: number) => void
  onUnmarkReviewed: (ids: string[], displayCount?: number) => void
  onTagSelected: (ids: string[], displayCount?: number) => void
  onUntagSelected: (ids: string[], displayCount?: number) => void
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

const TICK_TIP = 'Mark as reviewed'
const REFRESH_TIP = 'Mark as unreviewed'
const TAG_TIP = 'Add tag'
const UNTAG_TIP = 'Remove tag'

const DISPLAY_TOTAL = 10_000

const ROW_HEIGHT = 41
const ROW_OVERSCAN = 8

/** Full bulk bar row width needed for four labeled buttons */
const BULK_LABELS_MIN = 400
/** Full bulk bar row width needed for four icon buttons */
const BULK_ICONS_MIN = 260

const LABEL_BTN =
  'inline-flex h-7 shrink-0 items-center gap-1.5 rounded border border-brandcolor-strokeweak bg-brandcolor-white px-2 text-xs font-medium text-brandcolor-textstrong outline-none hover:bg-brandcolor-fill focus:border-brandcolor-secondary'

const BORDERED_ICON_BTN =
  'inline-flex size-7 items-center justify-center rounded border border-brandcolor-strokeweak outline-none hover:bg-brandcolor-fill'

const ICON_BTN =
  'inline-flex size-7 items-center justify-center rounded border border-brandcolor-strokeweak bg-brandcolor-white outline-none focus:border-brandcolor-secondary'

const NAV_ARROW_BTN =
  'inline-flex size-7 items-center justify-center text-brandcolor-strokestrong outline-none active:bg-brandcolor-white'

type BulkOverflow = 'labels' | 'icons' | 'compact'

const STATUS_DOT: Record<'in-review', { className: string; label: string }> = {
  'in-review': { className: 'bg-emerald-500', label: 'Team reviewing' },
}

function formatCount(n: number) {
  return n.toLocaleString('en-US')
}

function formatProgress(done: number, total: number) {
  const percent = total > 0 ? (done / total) * 100 : 0
  return {
    percent,
    label: `${formatCount(done)}/${formatCount(total)} (${percent.toFixed(1)}%)`,
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
  onTagSelected,
  onUntagSelected,
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
  const [bulkMoreOpen, setBulkMoreOpen] = useState(false)
  const [bulkOverflow, setBulkOverflow] = useState<BulkOverflow>('labels')
  const [selectAllActive, setSelectAllActive] = useState(false)
  const [allReviewedDisplay, setAllReviewedDisplay] = useState(false)
  const [navActive, setNavActive] = useState<'prev' | 'next' | null>(null)
  const [scrollTop, setScrollTop] = useState(0)
  const [viewportHeight, setViewportHeight] = useState(400)

  const moreMenuRef = useRef<HTMLDivElement>(null)
  const bulkMoreMenuRef = useRef<HTMLDivElement>(null)
  const bulkBarRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const myDone = documents.filter((d) => d.reviewStatus === 'reviewed').length
  const teamDone = documents.filter(
    (d) => d.reviewStatus === 'reviewed' || d.reviewStatus === 'in-review',
  ).length
  const myDoneDisplay = allReviewedDisplay ? DISPLAY_TOTAL : myDone
  const teamDoneDisplay = allReviewedDisplay ? DISPLAY_TOTAL : teamDone
  const myProgress = formatProgress(myDoneDisplay, DISPLAY_TOTAL)
  const teamProgress = formatProgress(teamDoneDisplay, DISPLAY_TOTAL)

  const filtered = useMemo(() => {
    return documents.filter((doc) => {
      const q = query.trim().toLowerCase()
      if (!q || q === reviewSetName.toLowerCase()) return true
      return doc.name.toLowerCase().includes(q)
    })
  }, [documents, query, reviewSetName])

  const selectedIndex = filtered.findIndex((doc) => doc.id === selectedId)
  const showBulkBar = bulkMode && checkedIds.size > 0
  const selectionDisplayCount = selectAllActive ? DISPLAY_TOTAL : checkedIds.size

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - ROW_OVERSCAN)
  const endIndex = Math.min(
    filtered.length,
    Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + ROW_OVERSCAN,
  )
  const visibleDocs = filtered.slice(startIndex, endIndex)
  const topSpacer = startIndex * ROW_HEIGHT
  const bottomSpacer = Math.max(0, (filtered.length - endIndex) * ROW_HEIGHT)

  useEffect(() => {
    if (!showBulkBar) {
      setActiveBulkAction(null)
      setBulkMoreOpen(false)
      setSelectAllActive(false)
    }
  }, [showBulkBar])

  useEffect(() => {
    if (checkedIds.size === 0) setSelectAllActive(false)
  }, [checkedIds.size])

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

  useEffect(() => {
    if (!bulkMoreOpen) return

    function handlePointerDown(event: MouseEvent) {
      if (!bulkMoreMenuRef.current?.contains(event.target as Node)) {
        setBulkMoreOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setBulkMoreOpen(false)
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [bulkMoreOpen])

  useEffect(() => {
    if (!showBulkBar) return
    const el = bulkBarRef.current
    if (!el) return

    function measure(width: number) {
      if (width >= BULK_LABELS_MIN) setBulkOverflow('labels')
      else if (width >= BULK_ICONS_MIN) setBulkOverflow('icons')
      else setBulkOverflow('compact')
    }

    measure(el.clientWidth)
    const ro = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) measure(entry.contentRect.width)
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [showBulkBar])

  useEffect(() => {
    const el = listRef.current
    if (!el) return

    function syncHeight() {
      if (listRef.current) setViewportHeight(listRef.current.clientHeight)
    }

    syncHeight()
    const ro = new ResizeObserver(syncHeight)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    setScrollTop(0)
    if (listRef.current) listRef.current.scrollTop = 0
  }, [query])

  function goPrev() {
    if (filtered.length === 0) return
    setNavActive('prev')
    const nextIndex = selectedIndex <= 0 ? filtered.length - 1 : selectedIndex - 1
    onSelect(filtered[nextIndex].id)
  }

  function goNext() {
    if (filtered.length === 0) return
    setNavActive('next')
    const nextIndex = selectedIndex < 0 || selectedIndex >= filtered.length - 1 ? 0 : selectedIndex + 1
    onSelect(filtered[nextIndex].id)
  }

  function toggleChecked(id: string) {
    const next = new Set(checkedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectAllActive(false)
    onCheckedIdsChange(next)
  }

  function toggleBulkMode() {
    if (bulkMode) {
      setSelectAllActive(false)
      setAllReviewedDisplay(false)
      onCheckedIdsChange(new Set())
      onBulkModeChange(false)
    } else {
      onBulkModeChange(true)
    }
  }

  function handleTick() {
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return
    onMarkReviewed(ids, selectionDisplayCount)
    if (selectAllActive || selectionDisplayCount >= DISPLAY_TOTAL) {
      setAllReviewedDisplay(true)
    }
    setActiveBulkAction('review')
    setBulkMoreOpen(false)
  }

  function handleRefresh() {
    const ids = Array.from(checkedIds)
    if (ids.length > 0) onUnmarkReviewed(ids, selectionDisplayCount)
    setActiveBulkAction(null)
    setSelectAllActive(false)
    setAllReviewedDisplay(false)
    onCheckedIdsChange(new Set())
    setBulkMoreOpen(false)
  }

  function handleTag() {
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return
    onTagSelected(ids, selectionDisplayCount)
    setBulkMoreOpen(false)
  }

  function handleUntag() {
    const ids = Array.from(checkedIds)
    if (ids.length === 0) return
    onUntagSelected(ids, selectionDisplayCount)
    setBulkMoreOpen(false)
  }

  function handleSelectAll() {
    if (!bulkMode) onBulkModeChange(true)
    onCheckedIdsChange(new Set(filtered.map((doc) => doc.id)))
    setSelectAllActive(true)
    setMoreOpen(false)
  }

  function handleClearSelection() {
    onCheckedIdsChange(new Set())
    setActiveBulkAction(null)
    setSelectAllActive(false)
    setMoreOpen(false)
  }

  const showLabeledActions = bulkOverflow === 'labels'
  const showIconActions = bulkOverflow === 'icons'
  const showCompactPrimary = bulkOverflow === 'compact'
  const showBulkMore = bulkOverflow === 'compact'

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
                  autoReview ? 'bg-emerald-500' : 'bg-brandcolor-strokeweak'
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
                className={`${BORDERED_ICON_BTN} ${
                  bulkMode ? 'bg-brandcolor-white' : 'bg-transparent'
                }`}
              >
                <FontAwesomeIcon
                  name="list-check"
                  className="text-[13px] !text-brandcolor-strokestrong"
                />
              </button>
              <div
                className="ml-0.5 inline-flex overflow-hidden rounded border border-brandcolor-strokeweak"
                role="group"
                aria-label="Document navigation"
              >
                <button
                  type="button"
                  onClick={goPrev}
                  aria-label="Previous document"
                  className={`${NAV_ARROW_BTN} ${
                    navActive === 'prev' ? 'bg-brandcolor-white' : 'hover:bg-brandcolor-fill'
                  }`}
                >
                  <FontAwesomeIcon name="arrow-left" className="text-[13px] !text-brandcolor-strokestrong" />
                </button>
                <span className="w-px self-stretch bg-brandcolor-strokeweak" aria-hidden />
                <button
                  type="button"
                  onClick={goNext}
                  aria-label="Next document"
                  className={`${NAV_ARROW_BTN} ${
                    navActive === 'next' ? 'bg-brandcolor-white' : 'hover:bg-brandcolor-fill'
                  }`}
                >
                  <FontAwesomeIcon name="arrow-right" className="text-[13px] !text-brandcolor-strokestrong" />
                </button>
              </div>
              <div className="relative ml-0.5" ref={moreMenuRef}>
                <button
                  type="button"
                  aria-label="More options"
                  aria-expanded={moreOpen}
                  aria-haspopup="menu"
                  onClick={() => setMoreOpen((open) => !open)}
                  className={`${BORDERED_ICON_BTN} ${
                    moreOpen ? 'bg-brandcolor-white' : 'bg-transparent'
                  }`}
                >
                  <FontAwesomeIcon name="ellipsis-v" className="text-[13px] !text-brandcolor-strokestrong" />
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
                <span className="min-w-0 truncate text-[13px] font-semibold text-brandcolor-textstrong" title="My review progress">
                  My review progress
                </span>
                <span className="shrink-0 text-[13px] text-brandcolor-textstrong">
                  <span className="font-semibold tabular-nums">{formatCount(myDoneDisplay)}</span>
                  <span className="font-normal">/{formatCount(DISPLAY_TOTAL)} </span>
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
                  <span className="font-semibold tabular-nums">{formatCount(teamDoneDisplay)}</span>
                  <span className="font-normal">/{formatCount(DISPLAY_TOTAL)} </span>
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
            <div
              ref={bulkBarRef}
              className="flex flex-nowrap items-center gap-2 rounded-md border border-brandcolor-strokeweak bg-brandcolor-white px-2.5 py-2"
            >
              <span className="inline-flex shrink-0 items-center gap-1.5 text-sm text-brandcolor-textstrong">
                <span className="inline-flex items-center justify-center rounded bg-brandcolor-strokeweak px-1.5 py-0.5 font-medium tabular-nums">
                  {formatCount(selectionDisplayCount)}
                </span>
                <span className="font-medium text-brandcolor-textweak">selected</span>
              </span>
              <div className="flex min-w-0 flex-1 flex-nowrap items-center justify-end gap-0.5">
                {showLabeledActions ? (
                  <>
                    <button
                      type="button"
                      onClick={handleTick}
                      aria-label="Mark selected as reviewed"
                      aria-pressed={activeBulkAction === 'review'}
                      className={`${LABEL_BTN} ${
                        activeBulkAction === 'review' ? 'border-brandcolor-secondary' : ''
                      }`}
                    >
                      <GoogleDuotoneIcon
                        name="check"
                        className={`text-[13px] ${
                          activeBulkAction === 'review'
                            ? '!text-brandcolor-secondary'
                            : '!text-brandcolor-strokestrong'
                        }`}
                      />
                      Mark as reviewed
                    </button>
                    <button
                      type="button"
                      onClick={handleRefresh}
                      aria-label="Reset selected to unreviewed"
                      className={LABEL_BTN}
                    >
                      <GoogleDuotoneIcon name="refresh" className="text-[13px] !text-brandcolor-strokestrong" />
                      Mark as unreviewed
                    </button>
                    <span
                      className="mx-0.5 h-5 w-px shrink-0 bg-brandcolor-strokeweak"
                      aria-hidden
                    />
                    <button
                      type="button"
                      onClick={handleTag}
                      aria-label="Add tag"
                      className={LABEL_BTN}
                    >
                      <FontAwesomeIcon name="tag" className="text-[13px] !text-brandcolor-strokestrong" />
                      Add tag
                    </button>
                    <button
                      type="button"
                      onClick={handleUntag}
                      aria-label="Remove tag"
                      className={LABEL_BTN}
                    >
                      <GoogleDuotoneIcon name="label_off" className="text-[13px] !text-brandcolor-strokestrong" />
                      Remove tag
                    </button>
                  </>
                ) : null}

                {showIconActions ? (
                  <>
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleTick}
                        aria-label="Mark selected as reviewed"
                        aria-pressed={activeBulkAction === 'review'}
                        className={`${ICON_BTN} ${
                          activeBulkAction === 'review' ? 'border-brandcolor-secondary' : ''
                        }`}
                      >
                        <GoogleDuotoneIcon
                          name="check"
                          className={`text-[18px] ${
                            activeBulkAction === 'review'
                              ? '!text-brandcolor-secondary'
                              : '!text-brandcolor-strokestrong'
                          }`}
                        />
                      </button>
                      <HoverTip label={TICK_TIP} className="right-0 top-full mt-1" />
                    </span>
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleRefresh}
                        aria-label="Reset selected to unreviewed"
                        className={ICON_BTN}
                      >
                        <GoogleDuotoneIcon name="refresh" className="text-[18px] !text-brandcolor-strokestrong" />
                      </button>
                      <HoverTip label={REFRESH_TIP} className="right-0 top-full mt-1" />
                    </span>
                    <span
                      className="mx-0.5 h-5 w-px shrink-0 bg-brandcolor-strokeweak"
                      aria-hidden
                    />
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleTag}
                        aria-label="Add tag"
                        className={ICON_BTN}
                      >
                        <FontAwesomeIcon name="tag" className="text-[13px] !text-brandcolor-strokestrong" />
                      </button>
                      <HoverTip label={TAG_TIP} className="right-0 top-full mt-1" />
                    </span>
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleUntag}
                        aria-label="Remove tag"
                        className={ICON_BTN}
                      >
                        <GoogleDuotoneIcon name="label_off" className="text-[13px] !text-brandcolor-strokestrong" />
                      </button>
                      <HoverTip label={UNTAG_TIP} className="right-0 top-full mt-1" />
                    </span>
                  </>
                ) : null}

                {showCompactPrimary ? (
                  <>
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleTick}
                        aria-label="Mark selected as reviewed"
                        aria-pressed={activeBulkAction === 'review'}
                        className={`${ICON_BTN} ${
                          activeBulkAction === 'review' ? 'border-brandcolor-secondary' : ''
                        }`}
                      >
                        <GoogleDuotoneIcon
                          name="check"
                          className={`text-[18px] ${
                            activeBulkAction === 'review'
                              ? '!text-brandcolor-secondary'
                              : '!text-brandcolor-strokestrong'
                          }`}
                        />
                      </button>
                      <HoverTip label={TICK_TIP} className="right-0 top-full mt-1" />
                    </span>
                    <span className={`${TIP_TRIGGER} shrink-0`}>
                      <button
                        type="button"
                        onClick={handleRefresh}
                        aria-label="Reset selected to unreviewed"
                        className={ICON_BTN}
                      >
                        <GoogleDuotoneIcon name="refresh" className="text-[18px] !text-brandcolor-strokestrong" />
                      </button>
                      <HoverTip label={REFRESH_TIP} className="right-0 top-full mt-1" />
                    </span>
                  </>
                ) : null}

                {showBulkMore ? (
                  <div className="relative shrink-0" ref={bulkMoreMenuRef}>
                    <button
                      type="button"
                      aria-label="More bulk actions"
                      aria-expanded={bulkMoreOpen}
                      aria-haspopup="menu"
                      onClick={() => setBulkMoreOpen((open) => !open)}
                      className={`${BORDERED_ICON_BTN} ${
                        bulkMoreOpen ? 'bg-brandcolor-white' : 'bg-transparent'
                      }`}
                    >
                      <FontAwesomeIcon name="ellipsis-v" className="text-[13px] !text-brandcolor-strokestrong" />
                    </button>
                    {bulkMoreOpen ? (
                      <div
                        role="menu"
                        className="absolute right-0 top-full z-50 mt-1 min-w-[180px] rounded-md border border-brandcolor-strokeweak bg-brandcolor-white py-1 shadow-md"
                      >
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleTag}
                          className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
                        >
                          <FontAwesomeIcon name="tag" className="text-[13px] !text-brandcolor-strokestrong" />
                          Add tag
                        </button>
                        <button
                          type="button"
                          role="menuitem"
                          onClick={handleUntag}
                          className="inline-flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-brandcolor-textstrong hover:bg-brandcolor-fill"
                        >
                          <GoogleDuotoneIcon name="label_off" className="text-[13px] !text-brandcolor-strokestrong" />
                          Remove tag
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClearSelection}
              className="w-full rounded-md bg-brandcolor-secondaryfill px-3 py-2 text-center text-sm font-semibold text-brandcolor-secondary outline-none hover:bg-brandcolor-secondaryfill focus-visible:ring-1 focus-visible:ring-brandcolor-secondary"
            >
              Clear selection
            </button>
          </div>
        ) : null}
      </div>

      <div
        ref={listRef}
        className="scrollbar-lean min-h-0 flex-1 overflow-auto py-1"
        aria-label="Documents"
        role="list"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        {filtered.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-brandcolor-textweak">No documents</div>
        ) : (
          <>
            <div style={{ height: topSpacer }} aria-hidden />
            {visibleDocs.map((doc) => {
              const isOpen = doc.id === selectedId
              const isChecked = checkedIds.has(doc.id)
              const isManuallyUnreviewed = manualUnreviewedIds.has(doc.id)
              const statusMeta =
                doc.reviewStatus === 'in-review' ? STATUS_DOT['in-review'] : null
              const nameClass = nameClassForDoc(
                doc,
                isOpen,
                bulkMode && isChecked && doc.reviewStatus === 'pending',
              )

              return (
                <div key={doc.id} role="listitem" style={{ height: ROW_HEIGHT }}>
                  <div
                    className={`${TIP_TRIGGER} flex h-full w-full items-center gap-1 border-b border-brandcolor-strokeweak border-l-[3px] px-3 transition-colors ${
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
                      <FontAwesomeIcon
                        name={doc.kind === 'image' ? 'file-image-o' : 'file-pdf-o'}
                        className="shrink-0 text-[13px] !text-brandcolor-strokestrong"
                      />
                      <span
                        className={`min-w-0 truncate text-sm leading-snug ${nameClass}`}
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
                          <FontAwesomeIcon
                            name="arrow-left"
                            className="text-[13px] !text-brandcolor-strokestrong"
                          />
                        ) : null}
                      </span>
                    </button>
                    {isManuallyUnreviewed ? (
                      <HoverTip label="You removed review" className="right-2 top-1/2 -translate-y-1/2" />
                    ) : null}
                  </div>
                </div>
              )
            })}
            <div style={{ height: bottomSpacer }} aria-hidden />
          </>
        )}
      </div>
    </div>
  )
}
