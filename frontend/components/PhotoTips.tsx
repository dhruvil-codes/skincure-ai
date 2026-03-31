import { Camera } from 'lucide-react'

export function PhotoTips() {
  return (
    <div className="bg-brand-teal-light border border-brand-teal/30
                    rounded-xl p-4 mb-5 text-sm">

      <p className="font-semibold text-brand-teal-dark mb-3
                    flex items-center gap-2">
        <Camera className="w-4 h-4" />
        For best results
      </p>

      <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
        <div className="space-y-1.5">
          {[
            'Natural daylight',
            'Hold phone 10–20cm away',
            'Full affected area in frame',
            'Sharp, in-focus photo',
          ].map((tip) => (
            <p key={tip} className="text-teal-700 flex items-center gap-1.5">
              <span className="text-green-500 font-bold text-xs">✓</span>
              {tip}
            </p>
          ))}
        </div>
        <div className="space-y-1.5">
          {[
            'No direct flash',
            'No filters or edits',
            'No full-body photos',
            'No dark or blurry images',
          ].map((tip) => (
            <p key={tip} className="text-teal-700 flex items-center gap-1.5">
              <span className="text-red-400 font-bold text-xs">✗</span>
              {tip}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
