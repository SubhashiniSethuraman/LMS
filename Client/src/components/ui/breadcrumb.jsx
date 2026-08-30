import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { Link } from "react-router-dom"
import { cn } from "../../lib/utils"

/**
 * Breadcrumb component
 * @param {Array} items - Array of { label, href } objects. Last item is current page (no link).
 */
const Breadcrumb = ({ items = [], className }) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center text-sm text-gray-500", className)}
    >
      <ol className="flex items-center flex-wrap gap-1">
        <li className="flex items-center gap-1">
          <Link
            to="/"
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1
          return (
            <React.Fragment key={index}>
              <li className="flex items-center">
                <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              </li>
              <li>
                {isLast ? (
                  <span className="text-gray-800 font-medium truncate max-w-[200px] block" aria-current="page">
                    {item.label}
                  </span>
                ) : (
                  <Link
                    to={item.href}
                    className="text-emerald-600 hover:text-emerald-800 transition-colors font-medium"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          )
        })}
      </ol>
    </nav>
  )
}

export { Breadcrumb }
