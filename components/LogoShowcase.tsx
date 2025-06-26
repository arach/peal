'use client'

import DynamicPealLogo from './DynamicPealLogo'
import { logoPresets } from '@/lib/waveGenerator'

export default function LogoShowcase() {
  return (
    <div className="space-y-8 p-8 bg-surface dark:bg-gray-900 rounded-lg">
      <h3 className="text-lg font-semibold text-text-primary dark:text-gray-100">Logo Variations</h3>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Default</p>
          <DynamicPealLogo preset="default" width={160} height={60} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Compact (Header)</p>
          <DynamicPealLogo preset="compact" width={120} height={40} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Layered (Wave in Wave)</p>
          <DynamicPealLogo preset="layered" width={160} height={60} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Ocean</p>
          <DynamicPealLogo preset="ocean" width={160} height={60} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Nested (Strong Container)</p>
          <DynamicPealLogo preset="nested" width={160} height={60} />
        </div>
        
        <div className="space-y-2">
          <p className="text-sm text-text-secondary dark:text-gray-400">Animated Nested</p>
          <DynamicPealLogo preset="nested" width={160} height={60} animated={true} />
        </div>
      </div>
    </div>
  )
}