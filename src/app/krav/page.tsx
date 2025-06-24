import React from 'react';

export default function KravPage() {
  return (
    <main className="min-h-screen bg-white py-10 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 leading-tight">Krav og forskrifter</h1>
        
        <h2 className="text-3xl font-extrabold text-center mb-6 text-gray-900">Tabell 2 — Minsteomfang av dokumentasjon</h2>
        <p className="text-[18px] text-gray-900 leading-relaxed mb-8">Det skal foreligge dokumentasjon inklusive tegninger. Dokumentasjon skal minst inneholde det som er vist i Tabell 2.</p>
        
        <div className="overflow-x-auto mb-12 shadow-lg rounded-lg">
          <table className="min-w-full border-collapse text-[17px]">
            <thead className="bg-blue-700">
              <tr>
                <th className="p-5 border border-blue-600 font-bold text-white text-left text-[18px]">Innhold</th>
                <th className="p-5 border border-blue-600 font-bold text-white text-left text-[18px]">Beskrivelse</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Alarmorganisering</td><td className="p-5 border border-gray-300 text-gray-900">Detaljert plan for alarmorganisering som beskriver oppbygging, funksjonalitet for det komplette brannalarmanlegg</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Godkjenninger</td><td className="p-5 border border-gray-300 text-gray-900">Datablader som viser produktenes godkjenninger. Jfr. punkt 5.3</td></tr>
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Idriftsettelsesrapport</td><td className="p-5 border border-gray-300 text-gray-900">Kontrollskjema, eventuelle målerapporter</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Opplæring</td><td className="p-5 border border-gray-300 text-gray-900">Brukermanual</td></tr>
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Produsent</td><td className="p-5 border border-gray-300 text-gray-900">Navn på leverandør, produsent og importør av produktene.</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Programmeringsdata</td><td className="p-5 border border-gray-300 text-gray-900">Utskrift / tabell eller digitalt</td></tr>
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Prosjektering</td><td className="p-5 border border-gray-300 text-gray-900">Valgte løsninger dokumenteres</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Styringsmatrise</td><td className="p-5 border border-gray-300 text-gray-900">Styringsmatrise som beskriver alle styringer på anlegg der det er hensiktsmessig eller er beskrevet av kravstiller.</td></tr>
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Tegninger som bygget</td><td className="p-5 border border-gray-300 text-gray-900">Stigeskjema, kursoversikt, deteksjonssoner, detektoroversikt med adresse, utstyrsoversikt med adresse, systemskisse der det er hensiktsmessig eller er beskrevet av kravstiller.</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Tekniske spesifikasjoner</td><td className="p-5 border border-gray-300 text-gray-900">Produktdatablader</td></tr>
              <tr><td className="p-5 border border-gray-300 font-medium text-gray-900">Uavhengig kontroll</td><td className="p-5 border border-gray-300 text-gray-900">Tredjeparts godkjenning der dette er relevant</td></tr>
              <tr className="bg-gray-50"><td className="p-5 border border-gray-300 font-medium text-gray-900">Vedlikehold</td><td className="p-5 border border-gray-300 text-gray-900">Som spesifisert av produsent</td></tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-10">
          <h2 className="text-2xl font-extrabold mb-4 text-gray-900">8.5 Anleggsdokumentasjon</h2>
          <p className="text-[18px] text-gray-900 leading-relaxed mb-10">Det skal foreligge dokumentasjon inklusive tegninger. Dokumentasjon skal minst inneholde det som er vist i Tabell 2.</p>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-extrabold mb-2 text-gray-900">Valg av løsninger som fraviker bestemmelser i standarden</h2>
          <p className="mb-4 text-[18px] text-gray-900 leading-relaxed"><span className="font-bold">Valg av løsninger som fraviker bestemmelser i standarden skal behandles slik at tilfredsstillende funksjon og kvalitet av anlegget dokumenteres.</span></p>
          <div className="mb-4">
            <span className="font-bold text-gray-900">MERKNAD</span>
            <span className="ml-2 text-[18px] text-gray-900">Teknisk forskrift krever at ansvarlig prosjekterende og ansvarlig utførende skal, innenfor sitt ansvarsområde, framlegge for ansvarlig søker nødvendig dokumentasjon som grunnlag for hvordan igangsetting, forvaltning, drift og vedlikehold av tekniske installasjoner og anlegg skal utføres på en tilfredsstillende måte.</span>
          </div>
          <p className="mb-4 text-[18px] text-gray-900 leading-relaxed"><span className="font-bold">FDV-dokumentasjonen</span> skal inneholde opplysninger om forutsetninger, betingelser og eventuelt begrensninger som ligger til grunn for prosjekteringen av tiltaket. Denne dokumentasjon er av betydning for å sikre at byggverket brukes i samsvar med tillatelser og ferdigattest, og vil ha betydning for senere endringer i bruksforutsetninger eller fysisk utførelse, dvs. utvikling av byggverket.</p>
          <p className="mb-4 text-[18px] text-gray-900 leading-relaxed"><span className="font-bold">FDV-dokumentasjonen</span> skal være på norsk eller et annet skandinavisk språk.</p>
          <p className="mb-12 text-[18px] text-gray-900 leading-relaxed"><span className="font-bold">Ansvarlig søker</span> skal påse at denne dokumentasjonen er samordnet og overlevert eier mot kvittering.</p>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Merknad</h2>
          <p className="text-[18px] text-gray-900 leading-relaxed">Teknisk forskrift krever at ansvarlig prosjekterende og ansvarlig utførende skal, innenfor sitt ansvarsområde, framlegge for ansvarlig søker nødvendig dokumentasjon som grunnlag for hvordan igangsetting, forvaltning, drift og vedlikehold av tekniske installasjoner og anlegg skal utføres på en tilfredsstillende måte.</p>
        </div>
      </div>
    </main>
  );
} 