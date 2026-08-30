import * as React from "react"
import { cn } from "../../lib/utils"

function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
      {...props}
    />
  )
}

// Card skeleton for course cards
function CourseCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <Skeleton className="w-full h-44" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-8" />
          <Skeleton className="h-3 w-20" />
        </div>
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}

// Table row skeleton
function TableRowSkeleton({ cols = 4 }) {
  return (
    <tr className="border-b border-gray-100">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className="h-4 w-full" />
        </td>
      ))}
    </tr>
  )
}

// Stat card skeleton for educator dashboard
function StatCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-5 w-56 space-y-3 bg-white">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-24" />
        </div>
      </div>
    </div>
  )
}

// Page content skeleton (for CourseDetails)
function CourseDetailsSkeleton() {
  return (
    <div className="flex md:flex-row flex-col-reverse gap-10 md:px-36 px-8 md:pt-30 pt-20">
      <div className="flex-1 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="flex gap-2 pt-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="pt-6 space-y-2">
          <Skeleton className="h-6 w-40" />
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="w-full max-w-md space-y-4">
        <Skeleton className="w-full h-52 rounded-xl" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-11 w-full rounded-lg" />
      </div>
    </div>
  )
}

// Enrollment card skeleton
function EnrollmentCardSkeleton() {
  return (
    <div className="border border-gray-200 rounded-xl p-4 bg-white flex gap-4">
      <Skeleton className="w-24 h-16 rounded-lg shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-2 w-full rounded-full" />
        <div className="flex gap-2 justify-between">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export {
  Skeleton,
  CourseCardSkeleton,
  TableRowSkeleton,
  StatCardSkeleton,
  CourseDetailsSkeleton,
  EnrollmentCardSkeleton,
}
