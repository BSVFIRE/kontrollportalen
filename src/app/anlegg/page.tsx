import { Suspense } from 'react'
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