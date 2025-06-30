'use client'

import { useState } from 'react'
import { Sparkles, Zap, Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import GenerateOptionsModal from './GenerateOptionsModal'

export default function GenerateMorePromoCard() {
  const [showOptionsModal, setShowOptionsModal] = useState(false)

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-2 xl:col-span-2">
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setShowOptionsModal(true)}
        className="relative w-full h-full min-h-[200px] bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl overflow-hidden group"
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 20% 30%, white 2px, transparent 2px),
                              radial-gradient(circle at 80% 70%, white 2px, transparent 2px),
                              radial-gradient(circle at 50% 50%, white 1px, transparent 1px)`,
            backgroundSize: '60px 60px, 80px 80px, 40px 40px'
          }} />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center p-8 text-white">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="w-7 h-7" />
            </div>
            <div className="hidden sm:flex items-center gap-1">
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Zap size={16} />
              </div>
              <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
                <Plus size={16} />
              </div>
            </div>
          </div>
          
          <h3 className="text-2xl font-bold mb-2">Need More Sounds?</h3>
          <p className="text-white/90 text-center max-w-sm mb-6">
            Generate 12 new unique sounds instantly. Each batch is crafted with AI to expand your collection.
          </p>
          
          <div className="flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm rounded-full group-hover:bg-white/30 transition-colors">
            <Sparkles size={18} />
            <span className="font-medium">Generate More</span>
          </div>
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>

      <GenerateOptionsModal 
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
      />
    </div>
  )
}