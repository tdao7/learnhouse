'use client'

import React from 'react'

interface MermaidTiptapEnhancerProps {
  containerRef: React.RefObject<HTMLElement | null>
  contentKey?: unknown
}

function MermaidTiptapEnhancer({ containerRef, contentKey }: MermaidTiptapEnhancerProps) {
  React.useEffect(() => {
    let cancelled = false

    async function renderMermaidBlocks() {
      const container = containerRef.current
      if (!container) return

      const blocks = Array.from(
        container.querySelectorAll<HTMLElement>(
          'pre code.language-mermaid, pre code[class*="language-mermaid"]'
        )
      )

      if (!blocks.length) return

      const mermaid = (await import('mermaid')).default
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'default',
      })

      await Promise.all(blocks.map(async (code, index) => {
        if (cancelled) return

        const pre = code.closest('pre')
        const source = code.textContent?.trim() || ''
        if (!pre || !source || pre.getAttribute('data-mermaid-source') === source) return

        try {
          const { svg } = await mermaid.render(`mermaid-tiptap-${Date.now()}-${index}`, source)
          if (cancelled) return

          pre.setAttribute('data-mermaid-source', source)
          pre.classList.add('mermaid-diagram')
          pre.innerHTML = svg
        } catch {
          pre.classList.add('mermaid-diagram-error')
        }
      }))
    }

    renderMermaidBlocks()

    return () => {
      cancelled = true
    }
  }, [containerRef, contentKey])

  return null
}

export default MermaidTiptapEnhancer
