import React from 'react';

export default function KravPage() {
  return (
    <main className="min-h-screen bg-white py-8 px-4 flex justify-center">
      <div className="max-w-3xl w-full">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Krav og forskrifter</h1>
        <h2 className="text-xl font-semibold mb-4">NS 3960:2019 – Minsteomfang av dokumentasjon</h2>
        <div className="overflow-x-auto mb-8">
          <table className="min-w-full border text-sm text-left">
            <thead className="bg-blue-700">
              <tr>
                <th className="p-2 border font-bold text-white">Innhold</th>
                <th className="p-2 border font-bold text-white">Beskrivelse</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Alarmorganisering</td><td className="p-2 border">Detaljert plan for alarmorganisering som beskriver oppbygging, funksjonalitet for det komplette brannalarmanlegg</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Godkjenninger</td><td className="p-2 border">Datablader som viser produktenes godkjenninger. Jfr. punkt 5.3</td></tr>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Idriftsettelsesrapport</td><td className="p-2 border">Kontrollskjema, eventuelle målerapporter</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Opplæring</td><td className="p-2 border">Brukermanual</td></tr>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Produsent</td><td className="p-2 border">Navn på leverandør, produsent og importør av produktene.</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Programmeringsdata</td><td className="p-2 border">Utskrift / tabell eller digitalt</td></tr>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Prosjektering</td><td className="p-2 border">Valgte løsninger dokumenteres</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Styringsmatrise</td><td className="p-2 border">Styringsmatrise som beskriver alle styringer på anlegg der det er hensiktsmessig eller er beskrevet av kravstiller.</td></tr>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Tegninger som bygget</td><td className="p-2 border">Stigeskjema, kursoversikt, deteksjonssoner, detektoroversikt med adresse, utstyrsoversikt med adresse, systemskisse der det er hensiktsmessig eller er beskrevet av kravstiller.</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Tekniske spesifikasjoner</td><td className="p-2 border">Produktdatablader</td></tr>
              <tr className="bg-white text-gray-900"><td className="p-2 border">Uavhengig kontroll</td><td className="p-2 border">Tredjeparts godkjenning der dette er relevant</td></tr>
              <tr className="bg-gray-50 text-gray-900"><td className="p-2 border">Vedlikehold</td><td className="p-2 border">Som spesifisert av produsent</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">8.5 Anleggsdokumentasjon</h2>
          <p className="mb-2">Det skal foreligge dokumentasjon inklusive tegninger. Dokumentasjon skal minst inneholde det som er vist i Tabell 2.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2">9.3 Kontroll</h2>
          <h3 className="text-lg font-semibold mb-1">9.3.1 Generelt</h3>
          <p className="mb-2">Med kontroll menes å undersøke om brannalarmanlegget samsvarer med prosjekteringsbeskrivelser, plan for alarmorganisering, montasjeanvisninger og tilsvarende, samt risiko og bruk av brannobjektet. Kontrollen skal avklare om sikkerhetsinnretningene:</p>
          <ul className="list-disc ml-6 mb-2">
            <li>oppfyller kravene til brannsikkerhet som gjelder for byggverket;</li>
            <li>fungerer hver for seg og sammen med hverandre.</li>
          </ul>
          <p className="mb-2">Kontroll skal utføres minst en gang per år. Kontrollen skal utføres av kompetent foretak.</p>
          <h3 className="text-lg font-semibold mb-1">9.3.2 Kontrollens hensikt</h3>
          <ul className="list-disc ml-6 mb-2">
            <li>installasjonen oppfyller krav/ytelser etter aktuelt regelverk;</li>
            <li>installasjonen fungerer som prosjektert og beskrevet etter preaksepterte løsninger (standarder og veiledere) eller analyseløsninger (med prosjekteringsforutsetninger og lignende);</li>
            <li>dekningsgrad og kapasitet er tilfredsstillende også sett i forhold til eventuelle bygningsmessige endringer, vesentlig endret drift, endret brannenergi osv.;</li>
            <li>installasjonen med eventuelle teknologiske integrasjoner av forskjellige systemer virker som forutsatt og at grensesnittene er klart definert (for eksempel talevarsling, låssystemer eller lignende styrt av brannalarmanlegg);</li>
            <li>tidligere påtalte feil er rettet;</li>
            <li>organisatoriske tiltak samsvarer med forutsetningene for bruken.</li>
          </ul>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1">Valg av løsninger som fraviker bestemmelser i standarden</h2>
          <p className="mb-2">Valg av løsninger som fraviker bestemmelser i standarden skal behandles slik at tilfredsstillende funksjon og kvalitet av anlegget dokumenteres.</p>
        </div>
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-1">Merknad</h2>
          <p className="mb-2">Teknisk forskrift krever at ansvarlig prosjekterende og ansvarlig utførende skal, innenfor sitt ansvarsområde, framlegge for ansvarlig søker nødvendig dokumentasjon som grunnlag for hvordan igangsetting, forvaltning, drift og vedlikehold av tekniske installasjoner og anlegg skal utføres på en tilfredsstillende måte.</p>
        </div>
      </div>
    </main>
  );
} 