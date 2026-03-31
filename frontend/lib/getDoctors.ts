import { Doctor } from './types'

export async function getNearbyDoctors(
  lat:    number,
  lng:    number,
  radius: number = 5000
): Promise<Doctor[]> {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/doctors?lat=${lat}&lng=${lng}&radius=${radius}`
  )
  if (!res.ok) throw new Error('Failed to fetch doctors')
  const data = await res.json()
  return data.doctors
}
