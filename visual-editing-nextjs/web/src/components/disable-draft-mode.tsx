'use client'
import {useIsPresentationTool} from 'next-sanity/hooks'
export function DisableDraftMode() {
  const isPresentationTool = useIsPresentationTool()
  if (isPresentationTool) return null
  return (
    <a
      href="/api/draft-mode/disable"
      className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded-md text-sm z-50"
    >
      Disable Draft Mode
    </a>
  )
}