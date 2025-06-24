"use client"

import React, { useEffect, useState } from "react"
import { Button } from "./button"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "OK",
  cancelText = "Cancel",
  variant = "default"
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      // Small delay to trigger animation after render
      const timeout = setTimeout(() => {
        setIsAnimating(true)
      }, 10)
      return () => clearTimeout(timeout)
    } else {
      setIsAnimating(false)
      // Wait for exit animation to complete before unmounting
      const timeout = setTimeout(() => {
        setIsVisible(false)
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [isOpen])

  // Handle ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when dialog is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  const handleBackdropClick = () => {
    onClose()
  }

  // Don't render anything if dialog should not be visible
  if (!isVisible) return null

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-200 ease-out ${
        isAnimating ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ease-out ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Dialog */}
      <div 
        className={`relative z-10 w-full max-w-md mx-4 transition-all duration-200 ease-out ${
          isAnimating 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        <div className="bg-white rounded-lg shadow-xl border-0 ring-1 ring-black/5">
          {/* Header */}
          <div className="flex items-center gap-3 p-6 pb-4">
            {variant === "destructive" && (
              <div className="flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {title}
              </h3>
            </div>
          </div>
          
          {/* Content */}
          <div className="px-6 pb-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              {message}
            </p>
          </div>
          
          {/* Actions */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50/50 rounded-b-lg">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-all duration-150"
            >
              {cancelText}
            </Button>
            <Button
              onClick={handleConfirm}
              className={`transition-all duration-150 transform hover:scale-105 active:scale-95 ${
                variant === "destructive" 
                  ? "bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-red-200" 
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-blue-200"
              }`}
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
