import React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./button"
import { cn } from "../../lib/utils"

/**
 * Reusable Pagination component
 * @param {number} currentPage - 1-indexed current page
 * @param {number} totalPages - total number of pages
 * @param {function} onPageChange - callback(pageNumber)
 */
const Pagination = ({ currentPage, totalPages, onPageChange, className }) => {
  if (totalPages <= 1) return null

  const pages = []
  const delta = 2

  for (let i = Math.max(1, currentPage - delta); i <= Math.min(totalPages, currentPage + delta); i++) {
    pages.push(i)
  }

  return (
    <nav
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1 mt-8", className)}
    >
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="h-9 w-9"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages[0] > 1 && (
        <>
          <Button
            variant={currentPage === 1 ? "default" : "ghost"}
            size="icon"
            onClick={() => onPageChange(1)}
            className="h-9 w-9"
          >
            1
          </Button>
          {pages[0] > 2 && (
            <span className="px-2 text-gray-400">…</span>
          )}
        </>
      )}

      {pages.map((page) => (
        <Button
          key={page}
          variant={page === currentPage ? "default" : "ghost"}
          size="icon"
          onClick={() => onPageChange(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className="h-9 w-9"
        >
          {page}
        </Button>
      ))}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span className="px-2 text-gray-400">…</span>
          )}
          <Button
            variant={currentPage === totalPages ? "default" : "ghost"}
            size="icon"
            onClick={() => onPageChange(totalPages)}
            className="h-9 w-9"
          >
            {totalPages}
          </Button>
        </>
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="h-9 w-9"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

export { Pagination }
