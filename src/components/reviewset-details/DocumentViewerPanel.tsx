import { useState } from 'react'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'
import HoverTip, { TIP_TRIGGER } from '@/components/reviewset-details/HoverTip'

const VIEW_TABS = ['RENDERED', 'NATIVE', 'PRODUCED'] as const

const REVIEWED_TIP = 'Mark this document as reviewed or unreviewed'

type DocumentViewerPanelProps = {
  fileName: string
  reviewed: boolean
  onReviewedChange: (next: boolean) => void
}

export default function DocumentViewerPanel({
  fileName,
  reviewed,
  onReviewedChange,
}: DocumentViewerPanelProps) {
  const [activeTab, setActiveTab] = useState<(typeof VIEW_TABS)[number]>('RENDERED')

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-brandcolor-strokeweak px-3 py-2">
        <p className="min-w-0 truncate text-sm font-medium text-brandcolor-textstrong" title={fileName}>
          {fileName}
        </p>
        <div className="flex items-center gap-1" role="tablist" aria-label="View mode">
          {VIEW_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded px-2 py-1 text-xs font-semibold tracking-wide ${
                activeTab === tab
                  ? 'bg-brandcolor-secondaryfill text-brandcolor-secondary'
                  : 'text-brandcolor-textweak hover:bg-brandcolor-fill'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 border-b border-brandcolor-strokeweak px-3 py-1.5 text-xs text-brandcolor-textweak">
        <span className="inline-flex items-center gap-1">
          <button type="button" className="rounded p-0.5 hover:bg-brandcolor-fill" aria-label="Previous page">
            <GoogleDuotoneIcon name="chevron_left" className="text-[18px]" />
          </button>
          <span>1 of 7</span>
          <button type="button" className="rounded p-0.5 hover:bg-brandcolor-fill" aria-label="Next page">
            <GoogleDuotoneIcon name="chevron_right" className="text-[18px]" />
          </button>
        </span>
        <span className="inline-flex items-center gap-1">
          <GoogleDuotoneIcon name="zoom_in" className="text-[16px]" />
          Automatic Zoom
        </span>
        <span className="ml-auto inline-flex items-center gap-2">
          <label className={`${TIP_TRIGGER} inline-flex cursor-pointer items-center gap-2`}>
            <button
              type="button"
              role="switch"
              aria-checked={reviewed}
              onClick={() => onReviewedChange(!reviewed)}
              className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                reviewed ? 'bg-emerald-500' : 'bg-brandcolor-strokeweak'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 size-4 rounded-full bg-brandcolor-white shadow transition-transform ${
                  reviewed ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
            <span className="whitespace-nowrap text-sm font-medium text-brandcolor-textstrong">
              Reviewed
            </span>
            <HoverTip label={REVIEWED_TIP} className="right-0 top-full mt-1" />
          </label>
          <button type="button" className="rounded p-1 hover:bg-brandcolor-fill" aria-label="Print">
            <GoogleDuotoneIcon name="print" className="text-[18px]" />
          </button>
          <button type="button" className="rounded p-1 hover:bg-brandcolor-fill" aria-label="Download">
            <GoogleDuotoneIcon name="download" className="text-[18px]" />
          </button>
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-brandcolor-fill p-4">
        <article className="mx-auto min-h-[480px] max-w-3xl bg-brandcolor-white p-8 shadow-sm">
          <h1 className="font-catamaran text-xl font-semibold text-brandcolor-textstrong">
            AXIOM eDISCOVERY PLATFORM
          </h1>
          <p className="mt-1 text-sm text-brandcolor-textweak">Product Requirements Document</p>
          <table className="mt-6 w-full border-collapse text-left text-sm">
            <tbody>
              {[
                ['Document Reference', 'AX-PRD-001'],
                ['Version', '1.0'],
                ['Status', 'Draft'],
                ['Effective Date', 'Sep 17, 2026'],
              ].map(([label, value]) => (
                <tr key={label} className="border-t border-brandcolor-strokeweak">
                  <th className="py-2 pr-4 font-medium text-brandcolor-textweak">{label}</th>
                  <td className="py-2 text-brandcolor-textstrong">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-6 text-sm leading-relaxed text-brandcolor-textweak">
            Viewing mode: <span className="font-semibold text-brandcolor-textstrong">{activeTab}</span>.
            This is a static preview placeholder — not a live PDF renderer.
          </p>
        </article>
      </div>
    </div>
  )
}
