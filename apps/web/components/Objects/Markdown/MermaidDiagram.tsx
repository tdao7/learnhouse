'use client'

import React from 'react'

interface MermaidDiagramProps {
  chart: string
}

function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const id = React.useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const [svg, setSvg] = React.useState<string | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false

    async function renderDiagram() {
      const source = chart.trim()
      if (!source) return

      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'default',
        })
        const result = await mermaid.render(`mermaid-${id}`, source)
        if (!cancelled) {
          setSvg(result.svg)
          setError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setSvg(null)
          setError(err instanceof Error ? err.message : 'Unable to render Mermaid diagram')
        }
      }
    }

    renderDiagram()

    return () => {
      cancelled = true
    }
  }, [chart, id])

  if (error) {
    return (
      <pre className="mermaid-diagram mermaid-diagram-error">
        <code>{chart}</code>
      </pre>
    )
  }

  if (!svg) {
    return <div className="mermaid-diagram mermaid-diagram-loading">Rendering diagram...</div>
  }

  return (
    <div
      className="mermaid-diagram"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}

export default MermaidDiagram
