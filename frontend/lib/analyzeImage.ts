import { PredictResponse, AppError } from './types'

export async function analyzeImage(file: File): Promise<PredictResponse> {
  const formData = new FormData()
  formData.append('file', file)

  const controller = new AbortController()
  const timeout    = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/predict`,
      { method: 'POST', body: formData, signal: controller.signal }
    )

    if (!response.ok) {
      const errorData = await response.json()
      const detail    = errorData.detail

      if (detail?.error === 'no_skin_detected') {
        throw new AppError(
          'no_skin_detected',
          'No skin detected in your photo.',
          'Please upload a clear, close-up photo of the affected area. Make sure skin fills most of the frame.'
        )
      }

      if (detail?.error === 'low_confidence') {
        throw new AppError(
          'low_confidence',
          'Photo quality is too low for a reliable analysis.',
          'Try uploading a clearer photo in better lighting, closer to the affected area.'
        )
      }

      if (response.status === 400) {
        throw new AppError(
          'invalid_file',
          detail?.detail || 'Invalid image file.',
          'Please upload a valid JPG, PNG, or WEBP image.'
        )
      }

      if (response.status === 503) {
        throw new AppError(
          'model_unavailable',
          'The AI model is currently unavailable.',
          'Please try again in a few minutes.'
        )
      }

      throw new AppError(
        'unknown',
        'Something went wrong.',
        'Please try again.'
      )
    }

    return response.json()

  } catch (err) {
    if (err instanceof AppError) throw err
    if ((err as Error).name === 'AbortError') {
      throw new AppError(
        'timeout',
        'Analysis timed out.',
        'Please check your internet connection and try again.'
      )
    }
    throw new AppError(
      'network',
      'Could not reach the server.',
      'Please check your internet connection.'
    )
  } finally {
    clearTimeout(timeout)
  }
}
