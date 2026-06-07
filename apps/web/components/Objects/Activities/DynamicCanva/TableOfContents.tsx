'use client'
import { useEffect, useState } from 'react'
import { Editor } from '@tiptap/react'

interface HeadingItem {
  level: number
  text: string
  id: string
}

interface TableOfContentsProps {
  editor: Editor | null
}

const TableOfContents = ({ editor }: TableOfContentsProps) => {
  const [headings, setHeadings] = useState<HeadingItem[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    if (!editor) return

    const updateHeadings = () => {
      const items: HeadingItem[] = []
      editor.state.doc.descendants((node) => {
        if (node.type.name.startsWith('heading')) {
          const level = node.attrs.level || 1
          const headingText = node.textContent || ''

          // Create slug from heading text (same logic as CustomHeading in DynamicCanva)
          const slug = headingText
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
            .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens

          const id = slug ? `heading-${slug}` : `heading-${Math.random().toString(36).substr(2, 9)}`

          items.push({
            level,
            text: node.textContent,
            id,
          })
        }
      })
      setHeadings(items)
    }

    editor.on('update', updateHeadings)
    updateHeadings()

    return () => {
      editor.off('update', updateHeadings)
    }
  }, [editor])

  // Track active heading based on viewport scroll position
  useEffect(() => {
    if (headings.length === 0) return

    const handleScroll = () => {
      let currentActiveId = headings[0].id
      const scrollPosition = window.scrollY + 140 // Offset for navbar and header spacing

      for (const heading of headings) {
        const el = document.getElementById(heading.id)
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY
          if (scrollPosition >= top) {
            currentActiveId = heading.id
          } else {
            break
          }
        }
      }
      setActiveId(currentActiveId)
    }

    window.addEventListener('scroll', handleScroll)
    // Run once initially
    handleScroll()

    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [headings])

  if (headings.length === 0) return null

  return (
    <div className="sticky top-24 self-start max-h-[calc(100vh-12rem)] overflow-y-auto w-full pr-2 select-none hidden md:block">
      <p className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider mb-3 px-3">
        Mục lục bài viết
      </p>
      <div className="relative border-l border-neutral-200/60 ml-3 py-1">
        <ul className="flex flex-col space-y-1 !list-none !p-0 m-0">
          {headings.map((heading, index) => {
            const isActive = activeId === heading.id
            return (
              <li
                key={index}
                className="relative list-none m-0 p-0"
                style={{ paddingLeft: `${(heading.level - 1) * 0.7}rem` }}
              >
                {/* Left indicator bar for active item */}
                {isActive && (
                  <div className="absolute left-[-1px] top-0 bottom-0 w-[2px] bg-emerald-600 rounded-r z-10" />
                )}
                <a
                  href={`#${heading.id}`}
                  onClick={(e) => {
                    e.preventDefault()
                    const el = document.getElementById(heading.id)
                    if (el) {
                      const yOffset = -100 // offset to avoid header overlap
                      const y = el.getBoundingClientRect().top + window.scrollY + yOffset
                      window.scrollTo({ top: y, behavior: 'smooth' })
                    }
                  }}
                  className={`block py-1.5 px-3 text-[12.5px] leading-normal transition-all duration-150 rounded-md truncate ${
                    isActive
                      ? 'text-emerald-700 font-semibold bg-emerald-50/50'
                      : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50/80 font-medium'
                  }`}
                  title={heading.text}
                >
                  {heading.text}
                </a>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default TableOfContents
