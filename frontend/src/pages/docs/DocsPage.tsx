import { useState, useEffect } from 'react'
import DocsHeader from './DocsHeader'
import DocsSidebar from './DocsSidebar'
import { DEFAULT_DOC_ID, findDoc } from './docsNav'
import DocContent from './DocContent'

function getDocId(): string {
  const parts = window.location.pathname.split('/')
  const id = parts[2] || ''
  return id || DEFAULT_DOC_ID
}

export default function DocsPage() {
  const [activeId, setActiveId] = useState(getDocId)

  useEffect(() => {
    const handler = () => { setActiveId(getDocId()); window.scrollTo(0, 0) }
    window.addEventListener('popstate', handler)
    return () => window.removeEventListener('popstate', handler)
  }, [])

  const found = findDoc(activeId)
  const resolvedId = found ? activeId : DEFAULT_DOC_ID

  return (
    <div style={{ background: '#080c18', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <DocsHeader activeId={resolvedId} />

      {/* Body: sidebar + content */}
      <div style={{ display: 'flex', flex: 1, paddingTop: 64, minHeight: '100vh' }}>

        {/* Sidebar — desktop only, sticky */}
        <div className="hidden md:block" style={{
          position: 'sticky',
          top: 64,
          height: 'calc(100vh - 64px)',
          flexShrink: 0,
          overflowY: 'auto',
        }}>
          <DocsSidebar activeId={resolvedId} />
        </div>

        {/* Main content */}
        <main className="docs-main" style={{ flex: 1, minWidth: 0, overflowX: 'hidden' }}>
          <div style={{
            maxWidth: 760,
            margin: '0 auto',
            padding: '3.5rem 2.5rem 6rem',
          }}>
            <DocContent docId={resolvedId} />
          </div>
        </main>
      </div>
    </div>
  )
}
