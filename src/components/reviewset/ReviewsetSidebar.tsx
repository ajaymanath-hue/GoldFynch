import { Link } from 'react-router-dom'
import GoogleDuotoneIcon from '@/components/GoogleDuotoneIcon'
import type { CaseSectionId } from '@/data/caseSections'
import { CASE_SIDEBAR_GROUPS, getCaseSectionsByGroup } from '@/data/caseSections'

/** Per-option tile colors matching the GoldFynch review-sets sidebar. */
const SIDEBAR_ICON_BG: Record<string, string> = {
  files: '#2E7D32',
  upload: '#8D6E63',
  search: '#00695C',
  'advanced-search': '#7CB342',
  'advanced-search-md': '#9E9D24',
  'de-dupe': '#C62828',
  'review-sets': '#6A1B9A',
  issues: '#43A047',
  tags: '#00838F',
  'productions-imports': '#6D4C41',
  products: '#1565C0',
  'reports-document-kits': '#283593',
  sharing: '#AD1457',
  settings: '#455A64',
}

type ReviewsetSidebarProps = {
  caseId: string
  activeSectionId?: CaseSectionId
}

export default function ReviewsetSidebar({
  caseId,
  activeSectionId = 'review-sets',
}: ReviewsetSidebarProps) {
  return (
    <aside className="relative z-30 flex w-16 shrink-0 flex-col overflow-visible border-r border-brandcolor-strokeweak bg-brandcolor-white py-1 pl-2 pr-2">
      <nav className="flex flex-col gap-1 overflow-visible" aria-label="Case tools">
        {CASE_SIDEBAR_GROUPS.map((group) => (
          <div key={group} className="flex flex-col gap-1 overflow-visible">
            <ul className="flex w-full flex-col gap-1 overflow-visible">
              {getCaseSectionsByGroup(group).map((item) => {
                const isActive = item.id === activeSectionId
                const tileBg = SIDEBAR_ICON_BG[item.id] ?? '#546E7A'
                const to =
                  item.id === 'review-sets'
                    ? `/reviewset-old/${caseId}`
                    : `/case-detail/${caseId}/${item.id}`

                return (
                  <li key={item.id} className="group relative h-12 w-12 overflow-visible">
                    <Link
                      to={to}
                      aria-label={item.label}
                      aria-current={isActive ? 'page' : undefined}
                      className="absolute left-0 top-0 z-10 flex h-12 w-12 items-center justify-center text-brandcolor-white shadow-none transition-[width,height,box-shadow] duration-150 ease-out group-hover:z-50 group-hover:h-[3.25rem] group-hover:w-[4.25rem] group-hover:shadow-lg"
                      style={{ backgroundColor: tileBg }}
                    >
                      <GoogleDuotoneIcon
                        name={item.icon}
                        className="text-[22px] !text-brandcolor-white"
                      />
                    </Link>

                    <span
                      role="tooltip"
                      className="pointer-events-none absolute left-[4.5rem] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-brandcolor-textstrong px-2.5 py-1.5 text-xs font-semibold text-brandcolor-white opacity-0 shadow-md transition-opacity duration-150 group-hover:opacity-100"
                    >
                      {item.label}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
