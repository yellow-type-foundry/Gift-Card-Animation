'use client'

import React from 'react'
import Layout3Box from '@/components/Layout3Box'

const Layout3Canvas = () => {
  return (
    <div 
      className="w-full bg-white flex items-center justify-center" 
      style={{ minHeight: 'calc(100vh - 200px)', padding: '40px 20px' }}
    >
      <Layout3Box />
    </div>
  )
}

export default Layout3Canvas

