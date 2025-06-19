'use client';

import Link from 'next/link'
import Image from 'next/image'

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-indigo-600">Kontrollportal</h1>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <Link
                href="/anlegg"
                className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Logg inn
              </Link>
              <Link
                href="/admin"
                className="bg-indigo-600 text-white hover:bg-indigo-700 px-5 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block xl:inline">Digital loggbok av</span>{' '}
                  <span className="block text-indigo-600 xl:inline">brannalarmanlegg</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Enkel og effektiv registrering av hendelser med QR-kode tilgang. Hold oversikt over alle kontroller og hendelser på ett sted.
                </p>
                <div className="mt-8 sm:mt-10 sm:flex sm:justify-center lg:justify-start">
                  <div className="rounded-md shadow">
                    <a
                      href="https://bsvfire.no/kontakt-oss/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Kom i gang
                    </a>
                  </div>
                  <div className="mt-3 sm:mt-0 sm:ml-3">
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-gray-50 border-indigo-100 md:py-4 md:text-lg md:px-10 transition-colors"
                    >
                      Administrer anlegg
                    </Link>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <div className="relative h-64 w-full sm:h-72 md:h-96 lg:h-full lg:max-h-[500px] p-8 lg:p-12">
            <Image
              src="/settings-illustration.svg"
              alt="Kontrollportal illustrasjon"
              fill
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Funksjoner</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Alt du trenger for digital kontroll
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Effektiv og sikker løsning for registrering og oppfølging av hendelser i brannalarmanlegg.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 sm:gap-x-8 sm:gap-y-16">
              {/* QR-kode tilgang */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-2 0h-2m-4 0H8m-4 0h2m6 0v1m-6-1v1m6-1v1M4 12h16M4 12c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3zm12 0c0-1.657 1.343-3 3-3s3 1.343 3 3-1.343 3-3 3-3-1.343-3-3z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">QR-kode tilgang</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Enkel tilgang til registrering av hendelser via QR-kode scanning.
                </dd>
              </div>

              {/* Digital loggføring */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">Digital loggføring</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Enkel registrering og loggføring av hendelser med komplett historikk.
                </dd>
              </div>

              {/* Sikker tilgang */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">Sikker tilgang</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Unike QR-koder og sikker tilgangskontroll for hvert anlegg.
                </dd>
              </div>

              {/* Rapportering */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">Rapportering</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Oversiktlig rapportering og historikk for alle anlegg.
                </dd>
              </div>

              {/* Superbruker tilgang */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">Superbruker tilgang</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Superbruker kan enkelt hente rapporter fra årskontroller og servicerapport utført av kontroll foretak.
                </dd>
              </div>

              {/* Flere loggbøker */}
              <div className="relative flex flex-col items-center text-center group">
                <dt className="flex flex-col items-center">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white mb-4 transform transition group-hover:scale-110 mx-auto">
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  </div>
                  <p className="text-lg leading-6 font-medium text-gray-900">Flere loggbøker</p>
                </dt>
                <dd className="mt-2 text-base text-gray-500">
                  Mulighet for å samle flere loggbøker i samme portal - sprinkleranlegg, ventilasjon, rømningsveier, slukkeutstyr og mer.
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="space-y-3">
            <p className="text-center text-gray-500 text-sm">
              Designet og utviklet av Brannteknisk Service og Vedlikehold AS
            </p>
            <p className="text-center text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Kontrollportal. Alle rettigheter reservert.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
