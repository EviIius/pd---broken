"use client"

import { useState } from "react"
import { ThumbsUp, ThumbsDown, X } from "lucide-react"
import type { AIFeedback } from "@/types"

interface FeedbackButtonProps {
  messageId: string
  onFeedback: (feedback: AIFeedback) => void
}

export default function FeedbackButton({ messageId, onFeedback }: FeedbackButtonProps) {
  const [showForm, setShowForm] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [category, setCategory] = useState<string>("")
  const [comment, setComment] = useState("")

  const handleQuickFeedback = (rating: 'helpful' | 'not_helpful') => {
    if (rating === 'helpful') {
      onFeedback({
        messageId,
        rating,
        timestamp: new Date()
      })
      setSubmitted(true)
    } else {
      setShowForm(true)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFeedback({
      messageId,
      rating: 'not_helpful',
      category,
      comment: comment.trim() || undefined,
      timestamp: new Date()
    })
    setSubmitted(true)
    setShowForm(false)
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-2 mt-2 text-sm text-gray-500 font-medium">
        <span>Thank you for your feedback!</span>
      </div>
    )
  }

  return (
    <div className="mt-2">
      {!showForm ? (
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500 font-medium">Was this helpful?</span>
          <div className="flex gap-2">
            <button
              onClick={() => handleQuickFeedback('helpful')}
              className="p-2 rounded-full hover:bg-red-50 transition-all duration-200 group"
              aria-label="Helpful"
            >
              <ThumbsUp className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            </button>
            <button
              onClick={() => handleQuickFeedback('not_helpful')}
              className="p-2 rounded-full hover:bg-red-50 transition-all duration-200 group"
              aria-label="Not helpful"
            >
              <ThumbsDown className="h-5 w-5 text-gray-400 group-hover:text-red-600" />
            </button>
          </div>
        </div>
      ) : (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-[425px] max-w-[90vw]">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Help us improve</h3>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  What was the issue?
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 
                           focus:ring-2 focus:ring-red-500 focus:border-red-500 
                           bg-white shadow-sm transition-all text-sm"
                  required
                >
                  <option value="">Select a reason</option>
                  <option value="inaccurate">Inaccurate information</option>
                  <option value="unclear">Unclear or confusing</option>
                  <option value="incomplete">Incomplete answer</option>
                  <option value="irrelevant">Not relevant to my question</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Additional comments (optional)
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about why this wasn't helpful..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 
                           focus:ring-2 focus:ring-red-500 focus:border-red-500 
                           min-h-[100px] resize-none bg-white shadow-sm transition-all text-sm"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-gray-600 hover:bg-gray-100 
                           transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!category}
                  className="px-4 py-2 rounded-lg bg-red-600 text-white 
                           hover:bg-red-700 transition-colors font-medium text-sm
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Feedback
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
} 