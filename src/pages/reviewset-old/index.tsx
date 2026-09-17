import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'
import { getCaseById } from '@/data/cases'
import {
  REVIEW_SETS,
  formatReviewedPercent,
  type ReviewSetRow,
} from '@/data/reviewSets'
import ReviewsetLayout from '@/layouts/ReviewsetLayout'

function ReviewSetTable({
  rows,
  caseId,
}: {
  rows: ReviewSetRow[]
  caseId: string
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-brandcolor-strokeweak">
      <table className="w-full min-w-[720px] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-brandcolor-table-header text-brandcolor-secondary">
            <th className="px-3 py-2.5 font-semibold">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  className="size-4 rounded border-brandcolor-strokeweak"
                  aria-label="Select all review sets"
                  disabled
                />
                Name
                <GoogleDuotoneIcon name="arrow_upward" className="text-[14px] !text-brandcolor-textweak" />
              </span>
            </th>
            <th className="px-3 py-2.5 font-semibold">Created</th>
            <th className="px-3 py-2.5 font-semibold">Reviewed</th>
            <th className="px-3 py-2.5 font-semibold">Total Reviewers</th>
            <th className="px-3 py-2.5 text-right font-semibold">
              <span className="inline-flex items-center gap-3 text-brandcolor-textweak">
                <span className="font-normal">0 selected</span>
                <button
                  type="button"
                  disabled
                  className="rounded px-2 py-0.5 text-sm font-medium text-brandcolor-destructive/50"
                >
                  Delete
                </button>
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const percent = formatReviewedPercent(row.reviewedDone, row.reviewedTotal)
            const progress =
              row.reviewedTotal > 0 ? (row.reviewedDone / row.reviewedTotal) * 100 : 0

            return (
              <tr
                key={row.id}
                className="border-t border-brandcolor-strokeweak text-brandcolor-textstrong"
              >
                <td className="px-3 py-3">
                  <span className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      className="size-4 rounded border-brandcolor-strokeweak"
                      aria-label={`Select ${row.name}`}
                    />
                    <Link
                      to={`/reviewset-details/${caseId}/${row.id}`}
                      className="font-medium text-brandcolor-secondary hover:underline"
                    >
                      {row.name}
                    </Link>
                    {row.badge ? (
                      <span className="rounded bg-brandcolor-fill px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brandcolor-textweak">
                        {row.badge}
                      </span>
                    ) : null}
                  </span>
                </td>
                <td className="whitespace-nowrap px-3 py-3 text-brandcolor-textweak">{row.created}</td>
                <td className="px-3 py-3">
                  <div className="flex min-w-[140px] flex-col gap-1">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-brandcolor-strokeweak">
                      <div
                        className="h-full rounded-full bg-brandcolor-secondary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-brandcolor-textweak">
                      {percent} ({row.reviewedDone}/{row.reviewedTotal})
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">{row.totalReviewers}</td>
                <td className="px-3 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded text-brandcolor-secondary hover:bg-brandcolor-secondaryfill"
                      aria-label={`Edit ${row.name}`}
                    >
                      <GoogleDuotoneIcon name="edit" className="text-[18px] !text-brandcolor-secondary" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded text-brandcolor-secondary hover:bg-brandcolor-secondaryfill"
                      aria-label={`Search ${row.name}`}
                    >
                      <GoogleDuotoneIcon name="search" className="text-[18px] !text-brandcolor-secondary" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded text-brandcolor-secondary hover:bg-brandcolor-secondaryfill"
                      aria-label={`Open folder for ${row.name}`}
                    >
                      <GoogleDuotoneIcon name="folder" className="text-[18px] !text-brandcolor-secondary" />
                    </button>
                    <button
                      type="button"
                      className="inline-flex size-8 items-center justify-center rounded text-brandcolor-destructive hover:bg-red-50"
                      aria-label={`Delete ${row.name}`}
                    >
                      <GoogleDuotoneIcon
                        name="delete"
                        className="text-[18px] !text-brandcolor-destructive"
                      />
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-3 py-10 text-center text-brandcolor-textweak">
                No review sets match your filter.
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>
    </div>
  )
}

export default function ReviewsetOldPage() {
  const { caseId } = useParams()
  const caseRow = caseId ? getCaseById(caseId) : undefined
  const [filter, setFilter] = useState('')

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return REVIEW_SETS
    return REVIEW_SETS.filter(
      (row) =>
        row.name.toLowerCase().includes(q) ||
        row.badge?.toLowerCase().includes(q) ||
        row.created.toLowerCase().includes(q),
    )
  }, [filter])

  if (!caseRow) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-brandcolor-fill font-lato text-brandcolor-textstrong">
        <AppHeader variant="reviewset" caseName="Case" />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="font-catamaran text-2xl font-semibold">Case not found</h1>
          <p className="mt-2 text-sm text-brandcolor-textweak">
            The case you are looking for does not exist or may have been removed.
          </p>
          <Link
            to="/case"
            className="mt-6 inline-flex rounded-md bg-brandcolor-secondary px-4 py-2 text-sm font-semibold text-brandcolor-white hover:bg-brandcolor-secondaryhover"
          >
            Back to cases
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-brandcolor-white font-lato text-brandcolor-textstrong">
      <AppHeader variant="reviewset" caseName={caseRow.name} />

      <ReviewsetLayout caseId={caseRow.id} activeSectionId="review-sets">
        <div className="relative flex h-full flex-col p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-brandcolor-strokeweak pb-4">
            <label className="sr-only" htmlFor="reviewset-filter">
              Type to filter
            </label>
            <input
              id="reviewset-filter"
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Type to filter"
              className="min-w-[180px] flex-1 border-0 bg-transparent py-1 text-sm text-brandcolor-textstrong placeholder:text-brandcolor-textweak outline-none sm:max-w-xs"
            />
            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-1 rounded-md bg-brandcolor-secondary px-3 py-2 text-sm font-semibold text-brandcolor-white hover:bg-brandcolor-secondaryhover"
            >
              <GoogleDuotoneIcon name="add" className="text-[18px] !text-brandcolor-white" />
              Create new review set
            </button>
          </div>

          <ReviewSetTable rows={filteredRows} caseId={caseRow.id} />

          <button
            type="button"
            className="absolute bottom-6 right-6 flex size-12 items-center justify-center rounded-full bg-emerald-500 text-white shadow-lg hover:bg-emerald-600"
            aria-label="Quick action"
          >
            <GoogleDuotoneIcon name="chat" className="text-[24px] !text-white" />
          </button>
        </div>
      </ReviewsetLayout>
    </div>
  )
}
