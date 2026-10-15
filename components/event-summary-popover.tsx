// 'use client'

// import React, { useRef, useEffect } from 'react'
// import dayjs from 'dayjs'
// import { Button } from "@/components/ui/button"
// import { IoCloseSharp } from "react-icons/io5"
// import { CalendarEventType } from '@/lib/store'

// interface EventSummaryPopoverProps {
//   isOpen: boolean
//   onClose: () => void
//   event: CalendarEventType
// }

// export function EventSummaryPopover({ isOpen, onClose, event }: EventSummaryPopoverProps) {

    
    
//   const popoverRef = useRef<HTMLDivElement>(null)

//   useEffect(() => {
//     const handleClickOutside = (e: MouseEvent) => {
//       if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
//         onClose()
//       }
//     }

//     if (isOpen) {
//       document.addEventListener('mousedown', handleClickOutside)
//     }

//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside)
//     }
//   }, [isOpen, onClose])

//   if (!isOpen) return null

//   return (
//     <div
//       className="fixed inset-0 z-40 flex items-center justify-center bg-black bg-opacity-50"
//       onClick={onClose}
//     >
//       <div
//         ref={popoverRef}
//         className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <div className="mb-4 flex items-center justify-between">
//           <h2 className="text-xl font-semibold">Event Summary</h2>
//           <Button variant="ghost" size="icon" onClick={onClose}>
//             <IoCloseSharp className="h-4 w-4" />
//           </Button>
//         </div>
//         <div className="space-y-2">
//           <p><strong>Title:</strong> {event.title}</p>
//           {/* Format the date before displaying it */}
//           <p><strong>Date:</strong> {dayjs(event.date).format("dddd, MMMM D, YYYY h:mm A")}</p>
//           {/* Add more event details here */}
//         </div>
//       </div>
//     </div>
//   )
// }
'use client'

import React, { useRef, useEffect } from 'react'
import dayjs from 'dayjs'
import { Button } from "@/components/ui/button"
import { IoCloseSharp } from "react-icons/io5"
import { CalendarEventType, useEventStore } from '@/lib/store'

interface EventSummaryPopoverProps {
  isOpen: boolean
  onClose: () => void
  event: CalendarEventType
}

export default function EventSummaryPopover({ isOpen, onClose, event }: EventSummaryPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null)
  const { deleteEvent, openEventForm } = useEventStore() // assuming you have these in your Zustand store

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleDelete = () => {
    deleteEvent(event.id)
    onClose()
  }

  const handleEdit = () => {
    openEventForm(event) // open event form pre-filled
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/30 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        ref={popoverRef}
        className="relative w-[380px] rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b pb-2">
          <h2 className="text-lg font-semibold text-gray-800">Event Summary</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <IoCloseSharp className="h-5 w-5 text-gray-600" />
          </Button>
        </div>

        {/* Details */}
        <div className="space-y-2 text-sm text-gray-700">
          <p><strong>Title:</strong> {event.title}</p>
          <p>
            <strong>Date:</strong>{" "}
            {dayjs(event.date).format("dddd, MMMM D, YYYY h:mm A")}
          </p>
          {event.location && <p><strong>Location:</strong> {event.location}</p>}
          {event.description && <p><strong>Details:</strong> {event.description}</p>}
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-end gap-2 border-t pt-3">
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>
    </div>
  )
}

