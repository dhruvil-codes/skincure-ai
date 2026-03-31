import { useState, useCallback, useRef } from 'react'
import { AppError } from '@/lib/types'

const ALLOWED_TYPES  = ['image/jpeg', 'image/png', 'image/webp']
const MIN_SIZE_BYTES = 50 * 1024         // 50KB — rejects tiny icons/thumbnails
const MAX_SIZE_BYTES = 10 * 1024 * 1024  // 10MB
const MIN_DIMENSION  = 200               // 200px minimum width or height

export async function validateImageFile(file: File): Promise<string | null> {
  // 1. File type check
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Please upload a JPG, PNG, or WEBP image.'
  }

  // 2. Too small — likely a thumbnail, screenshot icon, or corrupted file
  if (file.size < MIN_SIZE_BYTES) {
    return 'This image is too small. Please upload a higher resolution photo.'
  }

  // 3. Too large
  if (file.size > MAX_SIZE_BYTES) {
    return 'Image is too large. Maximum file size is 10MB.'
  }

  // 4. Pixel dimensions check (async)
  const dims = await getImageDimensions(file)
  if (dims.width < MIN_DIMENSION || dims.height < MIN_DIMENSION) {
    return `Image resolution is too low (${dims.width}×${dims.height}px). Please upload at least a 200×200px photo.`
  }

  return null
}

function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload  = () => { resolve({ width: img.naturalWidth, height: img.naturalHeight }); URL.revokeObjectURL(url) }
    img.onerror = () => { resolve({ width: 999, height: 999 }); URL.revokeObjectURL(url) }
    img.src = url
  })
}

export function useImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewURL, setPreviewURL]     = useState<string | null>(null)
  const [error, setError]               = useState<AppError | null>(null)
  const fileInputRef                    = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback(async (file: File) => {
    const validationError = await validateImageFile(file)
    if (validationError) {
      setError(new AppError('validation', validationError, ''))
      return
    }
    setError(null)
    setSelectedFile(file)
    setPreviewURL(URL.createObjectURL(file))
  }, [])

  const reset = useCallback(() => {
    setSelectedFile(null)
    setPreviewURL(null)
    setError(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }, [])

  return {
    selectedFile,
    previewURL,
    error,
    setError,
    fileInputRef,
    handleFileSelect,
    reset,
  }
}
