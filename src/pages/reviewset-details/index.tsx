import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AppHeader from '@/components/AppHeader'
import Toast from '@/components/Toast'
import DocumentControlPanel, {
  type ReviewDocument,
  type ReviewStatus,
} from '@/components/reviewset-details/DocumentControlPanel'
import DocumentDetailsPanel from '@/components/reviewset-details/DocumentDetailsPanel'
import DocumentViewerPanel from '@/components/reviewset-details/DocumentViewerPanel'
import { getCaseById } from '@/data/cases'
import { getReviewSetById } from '@/data/reviewSets'
import ReviewsetDetailLayout from '@/layouts/ReviewsetDetailLayout'

const DOC_NAMES = [
  '01_Case_Overview_Memo.pdf',
  '02_Initial_Discovery_Request.pdf',
  '03_Product_Requirements_Document.pdf',
  '04_System_Architecture_and_Security_Specification.pdf',
  '05_Product_Screenshot.jpg',
  '06_Witness_Interview_Notes.pdf',
  '07_Email_Thread_Export.pdf',
  '08_Contract_Amendment_A.pdf',
  '09_Financial_Summary_Q3.pdf',
  '10_Privilege_Log_Draft.pdf',
  '11_Custodian_Interview_Transcript.pdf',
  '12_Board_Meeting_Minutes.pdf',
  '13_Vendor_SOW_Redline.pdf',
  '14_HR_Policy_Handbook.pdf',
  '15_Network_Diagram.png',
  '16_Litigation_Hold_Notice.pdf',
  '17_Deposition_Outline.pdf',
  '18_Expert_Report_Draft.pdf',
  '19_Settlement_Proposal.pdf',
  '20_Exhibit_Index.pdf',
  '21_Motion_to_Compel.pdf',
  '22_Privilege_Log_Supplement.pdf',
  '23_Custodian_Questionnaire.pdf',
  '24_Data_Map_Overview.pdf',
  '25_Server_Screenshot.png',
  '26_Chain_of_Custody_Form.pdf',
  '27_ESI_Protocol_Draft.pdf',
  '28_Keyword_Hit_Report.pdf',
  '29_Redaction_Log.pdf',
  '30_Production_Cover_Letter.pdf',
  '31_Meet_and_Confer_Notes.pdf',
  '32_Clawback_Notice.pdf',
  '33_Imaging_Worksheet.pdf',
  '34_Search_Term_Report.pdf',
  '35_Timeline_Graphic.png',
  '36_Witness_Prep_Memo.pdf',
  '37_Exhibit_Sticker_Sheet.pdf',
  '38_Cost_Estimate_Summary.pdf',
  '39_Preservation_Notice.pdf',
  '40_Review_Protocol_Checklist.pdf',
] as const

const AUTO_REVIEW_MS = 5000

type BulkStorage = {
  bulkMode: boolean
  checkedIds: string[]
}

function bulkStorageKey(caseId: string, reviewSetId: string) {
  return `reviewset-bulk:${caseId}:${reviewSetId}`
}

function autoReviewStorageKey(caseId: string, reviewSetId: string) {
  return `reviewset-autoreview:${caseId}:${reviewSetId}`
}

function overrideStorageKey(caseId: string, reviewSetId: string) {
  return `reviewset-manual-unreviewed:${caseId}:${reviewSetId}`
}

function loadBulkState(caseId: string, reviewSetId: string): BulkStorage {
  try {
    const raw = sessionStorage.getItem(bulkStorageKey(caseId, reviewSetId))
    if (!raw) return { bulkMode: false, checkedIds: [] }
    const parsed = JSON.parse(raw) as BulkStorage
    return {
      bulkMode: Boolean(parsed.bulkMode),
      checkedIds: Array.isArray(parsed.checkedIds) ? parsed.checkedIds : [],
    }
  } catch {
    return { bulkMode: false, checkedIds: [] }
  }
}

function saveBulkState(caseId: string, reviewSetId: string, state: BulkStorage) {
  sessionStorage.setItem(bulkStorageKey(caseId, reviewSetId), JSON.stringify(state))
}

function loadAutoReview(caseId: string, reviewSetId: string): boolean {
  try {
    return localStorage.getItem(autoReviewStorageKey(caseId, reviewSetId)) === '1'
  } catch {
    return false
  }
}

function saveAutoReview(caseId: string, reviewSetId: string, enabled: boolean) {
  try {
    localStorage.setItem(autoReviewStorageKey(caseId, reviewSetId), enabled ? '1' : '0')
  } catch {
    /* ignore quota / private mode */
  }
}

function loadOverrides(caseId: string, reviewSetId: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(overrideStorageKey(caseId, reviewSetId))
    if (!raw) return new Set()
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? new Set(parsed.filter((id) => typeof id === 'string')) : new Set()
  } catch {
    return new Set()
  }
}

function saveOverrides(caseId: string, reviewSetId: string, ids: Set<string>) {
  sessionStorage.setItem(overrideStorageKey(caseId, reviewSetId), JSON.stringify(Array.from(ids)))
}

/** 3 reviewed (me), 13 in-review (team), rest pending. */
function buildMockDocuments(): ReviewDocument[] {
  return DOC_NAMES.map((name, index) => {
    let reviewStatus: ReviewStatus = 'pending'
    if (index < 3) reviewStatus = 'reviewed'
    else if (index < 16) reviewStatus = 'in-review'

    const kind: ReviewDocument['kind'] =
      name.endsWith('.jpg') || name.endsWith('.png') ? 'image' : 'pdf'

    return {
      id: `doc-${index + 1}`,
      name,
      kind,
      reviewStatus,
    }
  })
}

const INITIAL_DOCUMENTS = buildMockDocuments()

export default function ReviewsetDetailsPage() {
  const { caseId, reviewSetId } = useParams()
  const caseRow = caseId ? getCaseById(caseId) : undefined
  const reviewSet = reviewSetId ? getReviewSetById(reviewSetId) : undefined
  const [documents, setDocuments] = useState<ReviewDocument[]>(INITIAL_DOCUMENTS)
  const [selectedId, setSelectedId] = useState(INITIAL_DOCUMENTS[0]?.id ?? '')
  const [toastOpen, setToastOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [autoReview, setAutoReview] = useState(false)
  const [manualUnreviewedIds, setManualUnreviewedIds] = useState<Set<string>>(() => new Set())
  const [autoMarkedIds, setAutoMarkedIds] = useState<Set<string>>(() => new Set())
  const [prefsHydrated, setPrefsHydrated] = useState(false)

  const documentsRef = useRef(documents)
  const autoReviewRef = useRef(autoReview)
  const manualUnreviewedRef = useRef(manualUnreviewedIds)
  const autoMarkedRef = useRef(autoMarkedIds)
  const selectedIdRef = useRef(selectedId)
  documentsRef.current = documents
  autoReviewRef.current = autoReview
  manualUnreviewedRef.current = manualUnreviewedIds
  autoMarkedRef.current = autoMarkedIds
  selectedIdRef.current = selectedId

  const initialBulk = useMemo(() => {
    if (!caseId || !reviewSetId) return { bulkMode: false, checkedIds: [] as string[] }
    return loadBulkState(caseId, reviewSetId)
  }, [caseId, reviewSetId])

  const [bulkMode, setBulkMode] = useState(initialBulk.bulkMode)
  const [checkedIds, setCheckedIds] = useState<Set<string>>(
    () => new Set(initialBulk.checkedIds),
  )
  const [bulkHydrated, setBulkHydrated] = useState(false)

  useEffect(() => {
    if (!caseId || !reviewSetId) return
    const saved = loadBulkState(caseId, reviewSetId)
    setBulkMode(saved.bulkMode)
    setCheckedIds(new Set(saved.checkedIds))
    setBulkHydrated(true)
  }, [caseId, reviewSetId])

  useEffect(() => {
    if (!bulkHydrated || !caseId || !reviewSetId) return
    saveBulkState(caseId, reviewSetId, {
      bulkMode,
      checkedIds: Array.from(checkedIds),
    })
  }, [bulkMode, checkedIds, caseId, reviewSetId, bulkHydrated])

  useEffect(() => {
    if (!caseId || !reviewSetId) return
    setAutoReview(loadAutoReview(caseId, reviewSetId))
    setManualUnreviewedIds(loadOverrides(caseId, reviewSetId))
    setAutoMarkedIds(new Set())
    setPrefsHydrated(true)
  }, [caseId, reviewSetId])

  useEffect(() => {
    if (!prefsHydrated || !caseId || !reviewSetId) return
    saveAutoReview(caseId, reviewSetId, autoReview)
  }, [autoReview, caseId, reviewSetId, prefsHydrated])

  useEffect(() => {
    if (!prefsHydrated || !caseId || !reviewSetId) return
    saveOverrides(caseId, reviewSetId, manualUnreviewedIds)
  }, [manualUnreviewedIds, caseId, reviewSetId, prefsHydrated])

  const selectedDoc = useMemo(
    () => documents.find((doc) => doc.id === selectedId) ?? documents[0],
    [documents, selectedId],
  )

  const closeToast = useCallback(() => setToastOpen(false), [])

  function showToast(message: string) {
    setToastMessage(message)
    setToastOpen(true)
  }

  const clearOverride = useCallback((ids: string[]) => {
    setManualUnreviewedIds((prev) => {
      let changed = false
      const next = new Set(prev)
      for (const id of ids) {
        if (next.delete(id)) changed = true
      }
      return changed ? next : prev
    })
  }, [])

  const addOverridesForAutoMarked = useCallback((ids: string[]) => {
    setManualUnreviewedIds((prev) => {
      const next = new Set(prev)
      let changed = false
      for (const id of ids) {
        if (autoMarkedRef.current.has(id) && !next.has(id)) {
          next.add(id)
          changed = true
        }
      }
      return changed ? next : prev
    })
  }, [])

  const tryAutoMark = useCallback((docId: string) => {
    if (!autoReviewRef.current) return
    if (manualUnreviewedRef.current.has(docId)) return
    const doc = documentsRef.current.find((d) => d.id === docId)
    if (!doc || doc.reviewStatus === 'reviewed') return

    setDocuments((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, reviewStatus: 'reviewed' } : d)),
    )
    setAutoMarkedIds((prev) => {
      if (prev.has(docId)) return prev
      const next = new Set(prev)
      next.add(docId)
      return next
    })
  }, [])

  const handleSelect = useCallback(
    (nextId: string) => {
      const prevId = selectedIdRef.current
      if (prevId && prevId !== nextId) {
        tryAutoMark(prevId)
      }
      setSelectedId(nextId)
    },
    [tryAutoMark],
  )

  useEffect(() => {
    if (!autoReview || !selectedId) return
    if (manualUnreviewedIds.has(selectedId)) return
    const doc = documentsRef.current.find((d) => d.id === selectedId)
    if (!doc || doc.reviewStatus === 'reviewed') return

    const timer = window.setTimeout(() => {
      tryAutoMark(selectedId)
    }, AUTO_REVIEW_MS)

    return () => window.clearTimeout(timer)
  }, [selectedId, autoReview, manualUnreviewedIds, tryAutoMark])

  function handleReviewedChange(next: boolean) {
    if (!selectedDoc) return
    if (next) {
      clearOverride([selectedDoc.id])
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...doc, reviewStatus: 'reviewed' } : doc,
        ),
      )
      showToast('1 document marked as reviewed')
    } else {
      addOverridesForAutoMarked([selectedDoc.id])
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.id === selectedDoc.id ? { ...doc, reviewStatus: 'pending' } : doc,
        ),
      )
    }
  }

  function handleMarkReviewed(ids: string[]) {
    if (ids.length === 0) return
    const idSet = new Set(ids)
    clearOverride(ids)
    setDocuments((prev) =>
      prev.map((doc) => (idSet.has(doc.id) ? { ...doc, reviewStatus: 'reviewed' } : doc)),
    )
    const n = ids.length
    showToast(`${n} document${n === 1 ? '' : 's'} marked as reviewed`)
  }

  function handleUnmarkReviewed(ids: string[]) {
    if (ids.length === 0) return
    const idSet = new Set(ids)
    addOverridesForAutoMarked(ids)
    setDocuments((prev) =>
      prev.map((doc) => (idSet.has(doc.id) ? { ...doc, reviewStatus: 'pending' } : doc)),
    )
    const n = ids.length
    showToast(`${n} document${n === 1 ? '' : 's'} reset to unreviewed`)
  }

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

  if (!reviewSet) {
    return (
      <div className="flex h-dvh flex-col overflow-hidden bg-brandcolor-fill font-lato text-brandcolor-textstrong">
        <AppHeader variant="reviewset" caseName={caseRow.name} />
        <div className="mx-auto max-w-lg px-6 py-16 text-center">
          <h1 className="font-catamaran text-2xl font-semibold">Review set not found</h1>
          <p className="mt-2 text-sm text-brandcolor-textweak">
            This review set does not exist or may have been removed.
          </p>
          <Link
            to={`/reviewset-old/${caseRow.id}`}
            className="mt-6 inline-flex rounded-md bg-brandcolor-secondary px-4 py-2 text-sm font-semibold text-brandcolor-white hover:bg-brandcolor-secondaryhover"
          >
            Back to review sets
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-brandcolor-white font-lato text-brandcolor-textstrong">
      <AppHeader variant="reviewset" caseName={caseRow.name} />

      <ReviewsetDetailLayout
        caseId={caseRow.id}
        activeSectionId="review-sets"
        documentControl={
          <DocumentControlPanel
            reviewSetName={reviewSet.name}
            documents={documents}
            selectedId={selectedDoc?.id ?? ''}
            onSelect={handleSelect}
            onMarkReviewed={handleMarkReviewed}
            onUnmarkReviewed={handleUnmarkReviewed}
            bulkMode={bulkMode}
            onBulkModeChange={setBulkMode}
            checkedIds={checkedIds}
            onCheckedIdsChange={setCheckedIds}
            autoReview={autoReview}
            onAutoReviewChange={setAutoReview}
            manualUnreviewedIds={manualUnreviewedIds}
          />
        }
        documentViewer={
          <DocumentViewerPanel
            fileName={selectedDoc?.name ?? 'Document'}
            reviewed={selectedDoc?.reviewStatus === 'reviewed'}
            onReviewedChange={handleReviewedChange}
          />
        }
        documentDetails={<DocumentDetailsPanel />}
      />

      <Toast message={toastMessage} open={toastOpen} onClose={closeToast} />
    </div>
  )
}
