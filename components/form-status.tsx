"use client"

import { useEffect, useState } from "react"
import { CheckCircle, AlertCircle, Loader2, XCircle, MessageSquare } from "lucide-react"

type FormStatusProps = {
  status: "idle" | "loading" | "success" | "error"
  message: string
  onReset?: () => void
}

export function FormStatus({ status, message, onReset }: FormStatusProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (status === "idle") {
      setVisible(false)
      return
    }

    setVisible(true)

    if (status === "success" || status === "error") {
      const timer = setTimeout(() => {
        setVisible(false)
        if (onReset) {
          onReset()
        }
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [status, onReset])

  if (!visible) return null

  const hasWhatsAppLink = message && message.includes('WhatsApp');

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm transition-all duration-300 ${
        visible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`w-[80%] max-w-md rounded-lg shadow-lg transition-all duration-300 transform ${
          visible ? "opacity-95 scale-100" : "opacity-0 scale-95"
        } ${
          status === "success"
            ? "bg-green-50/90 border border-green-200"
            : status === "error"
            ? "bg-red-50/90 border border-red-200"
            : "bg-blue-50/90 border border-blue-200"
        }`}
      >
        <div className="px-4 py-3 flex items-center">
          <div className="flex-shrink-0">
            {status === "loading" && <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />}
            {status === "success" && <CheckCircle className="h-5 w-5 text-green-600" />}
            {status === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
          </div>
          <div className="ml-3 flex-1">
            <p
              className={`text-sm font-medium ${
                status === "success"
                  ? "text-green-800"
                  : status === "error"
                  ? "text-red-800"
                  : "text-blue-800"
              }`}
              dangerouslySetInnerHTML={{ __html: message || "" }}
            />
            
            {hasWhatsAppLink && status === "success" && (
              <div className="mt-2 flex justify-center">
                <button 
                  onClick={() => {
                    const whatsappLink = document.querySelector('.text-green-600');
                    if (whatsappLink && whatsappLink instanceof HTMLAnchorElement) {
                      whatsappLink.click();
                    }
                  }}
                  className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                  Buka WhatsApp
                </button>
              </div>
            )}
          </div>
          <div className="ml-2 flex-shrink-0 flex">
            <button
              type="button"
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
              onClick={() => {
                setVisible(false)
                if (onReset) {
                  onReset()
                }
              }}
            >
              <span className="sr-only">Tutup</span>
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
