import { DoctorsResult } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getDoctors(
  lat: number,
  lng: number,
  radius = 5000
): Promise<DoctorsResult> {
  const url = new URL(`${API_BASE}/doctors`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(lng));
  url.searchParams.set('radius', String(radius));

  const response = await fetch(url.toString());

  if (!response.ok) {
    throw new Error('Failed to fetch doctors');
  }

  return response.json();
}
