"use client"

import React, { Component, ErrorInfo, ReactNode } from "react"

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Terjadi Kesalahan</h1>
            <div className="mb-4 p-4 bg-gray-100 rounded overflow-auto max-h-[200px] text-left text-sm">
              <p className="text-red-500 font-medium">{this.state.error?.message}</p>
              <p className="text-gray-700 mt-2">{this.state.error?.stack}</p>
            </div>
            <p className="text-gray-600 mb-4">
              Silakan muat ulang halaman atau kembali ke halaman dashboard
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Muat Ulang
              </button>
              <button
                onClick={() => window.location.href = "/dashboard"}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              >
                Dashboard
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
} 