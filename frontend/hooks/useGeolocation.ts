import { useState, useCallback } from 'react'

export type GeolocationStatus =
  | 'idle'
  | 'requesting'
  | 'granted'
  | 'denied'
  | 'unavailable'

export interface LocationResult {
  lat: number
  lng: number
}

export function useGeolocation() {
  const [status, setStatus]     = useState<GeolocationStatus>('idle')
  const [location, setLocation] = useState<LocationResult | null>(null)
  const [error, setError]       = useState<string | null>(null)

  const requestLocation = useCallback((): Promise<LocationResult> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setStatus('unavailable')
        setError('Your browser does not support location access.')
        reject(new Error('unavailable'))
        return
      }

      setStatus('requesting')
      setError(null)

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(loc)
          setStatus('granted')
          resolve(loc)
        },
        (err) => {
          setStatus('denied')
          if (err.code === err.PERMISSION_DENIED) {
            setError(
              'Location access was denied. Please enable it in your browser settings to find nearby doctors.'
            )
          } else if (err.code === err.TIMEOUT) {
            setError('Location request timed out. Please try again.')
          } else {
            setError('Could not get your location. Please try again.')
          }
          reject(err)
        },
        {
          enableHighAccuracy: true,
          timeout:            10000,   // 10 seconds
          maximumAge:         300000,  // cache for 5 mins — no re-prompt
        }
      )
    })
  }, [])

  return { status, location, error, requestLocation }
}
