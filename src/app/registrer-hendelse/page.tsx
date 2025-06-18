import { Suspense } from 'react'
import RegistrerHendelseForm from './RegistrerHendelseForm'

export default function Page() {
  return (
    <Suspense fallback={<div>Laster...</div>}>
      <RegistrerHendelseForm />
    </Suspense>
  )
} 