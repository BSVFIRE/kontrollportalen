'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AnleggForm from './AnleggForm'

export default function AnleggPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<div>Laster inn...</div>}>
        <AnleggForm />
      </Suspense>
    </main>
  )
} 