import { useState } from 'react'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'

const DETAIL_TABS = ['DETAILS', 'ATTACHMENT CONTEXT'] as const

const TAGS = ['CONFIDENTIAL', 'IMPORTANT', 'HOT DOC', 'RESPONSIVE', 'PRIVILEGE']

const FILE_INFO: Array<[string, string]> = [
  ['ID', 'doc-003'],
  ['Category', 'Product'],
  ['Type', 'PDF'],
  ['Mime', 'application/pdf'],
  ['Author', 'Product Team'],
  ['Title', 'Product Requirements Document'],
  ['Size', '1.2 MB'],
]

export default function DocumentDetailsPanel() {
  const [activeTab, setActiveTab] = useState<(typeof DETAIL_TABS)[number]>('DETAILS')
  const [notes, setNotes] = useState('')

  return (
    <div className="flex h-full flex-col text-sm">
      <div className="flex border-b border-brandcolor-strokeweak" role="tablist" aria-label="Details">
        {DETAIL_TABS.map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 px-2 py-2.5 text-xs font-semibold tracking-wide ${
              activeTab === tab
                ? 'border-b-2 border-brandcolor-secondary text-brandcolor-secondary'
                : 'text-brandcolor-textweak hover:bg-brandcolor-fill'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-0 flex-1 overflow-auto p-3">
        {activeTab === 'DETAILS' ? (
          <div className="space-y-4">
            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
                Tags
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="rounded bg-brandcolor-fill px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brandcolor-textweak hover:bg-brandcolor-secondaryfill"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </section>

            <section>
              <h3 className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
                <GoogleDuotoneIcon name="expand_more" className="text-[16px]" />
                File Information
              </h3>
              <dl className="space-y-1.5">
                {FILE_INFO.map(([label, value]) => (
                  <div key={label} className="grid grid-cols-[88px_1fr] gap-2 text-xs">
                    <dt className="text-brandcolor-textweak">{label}</dt>
                    <dd className="truncate text-brandcolor-textstrong" title={value}>
                      {value}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
                Downloads
              </h3>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded-md bg-brandcolor-secondary px-3 py-1.5 text-xs font-semibold text-brandcolor-white hover:bg-brandcolor-secondaryhover"
              >
                <GoogleDuotoneIcon name="download" className="text-[16px] !text-brandcolor-white" />
                Original
              </button>
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
                Document Notes
              </h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Type notes…"
                rows={4}
                className="w-full resize-y rounded-md border border-brandcolor-strokeweak px-2 py-1.5 text-xs outline-none focus:border-brandcolor-secondary"
              />
            </section>

            <section>
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-brandcolor-textweak">
                Redactions
              </h3>
              <p className="text-xs text-brandcolor-textweak">No redactions yet.</p>
            </section>
          </div>
        ) : (
          <p className="text-xs text-brandcolor-textweak">No attachment context for this document.</p>
        )}
      </div>
    </div>
  )
}
