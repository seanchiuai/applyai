'use client'

import { useEffect, useRef } from 'react'

interface ClientBodyProps {
  className?: string
  children: React.ReactNode
}

export default function ClientBody({ className, children }: ClientBodyProps) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const addedClassesRef = useRef<string[]>([])

  useEffect(() => {
    // Track which classes we actually add
    const classesToAdd: string[] = []

    // Merge className with existing body classes instead of replacing
    if (className) {
      const newClasses = className.split(' ').filter(Boolean)

      // Add new classes that don't already exist
      newClasses.forEach(cls => {
        if (!document.body.classList.contains(cls)) {
          document.body.classList.add(cls)
          classesToAdd.push(cls)
        }
      })
    }

    // Store the classes we added for cleanup
    addedClassesRef.current = classesToAdd

    // Clean up any browser extension attributes that might cause hydration issues
    const extensionAttributes = ['cz-shortcut-listen']
    extensionAttributes.forEach(attr => {
      if (document.body.hasAttribute(attr)) {
        document.body.removeAttribute(attr)
      }
    })

    // Cleanup: remove only the classes we added
    return () => {
      addedClassesRef.current.forEach(cls => {
        document.body.classList.remove(cls)
      })
    }
  }, [className])

  // Return a div that will contain the app content
  // This avoids hydration issues with the body element
  return <div ref={bodyRef}>{children}</div>
}