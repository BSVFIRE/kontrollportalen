import React from 'react';

export default function KravPage() {
  return (
    <main className="min-h-screen bg-white py-8 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 leading-tight">Krav og forskrifter</h1>
        
        <h2 className="text-2xl font-semibold mb-6 text-gray-800">NS 3960:2019 – Minsteomfang av dokumentasjon</h2>
        
        <div className="overflow-x-auto mb-10 shadow-lg rounded-lg">
          <table className="min-w-full border-collapse text-base">
            <thead className="bg-blue-700">
              <tr>
                <th className="p-4 border border-blue-600 font-bold text-white text-left">Innhold</th>
                <th className="p-4 border border-blue-600 font-bold text-white text-left">Beskrivelse</th>
              </tr>
            </thead>
            <tbody className="bg-white">
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Alarmorganisering</td>
                <td className="p-4 border border-gray-300 text-gray-800">Detaljert plan for alarmorganisering som beskriver oppbygging, funksjonalitet for det komplette brannalarmanlegg</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Godkjenninger</td>
                <td className="p-4 border border-gray-300 text-gray-800">Datablader som viser produktenes godkjenninger. Jfr. punkt 5.3</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Idriftsettelsesrapport</td>
                <td className="p-4 border border-gray-300 text-gray-800">Kontrollskjema, eventuelle målerapporter</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Opplæring</td>
                <td className="p-4 border border-gray-300 text-gray-800">Brukermanual</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Produsent</td>
                <td className="p-4 border border-gray-300 text-gray-800">Navn på leverandør, produsent og importør av produktene.</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Programmeringsdata</td>
                <td className="p-4 border border-gray-300 text-gray-800">Utskrift / tabell eller digitalt</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Prosjektering</td>
                <td className="p-4 border border-gray-300 text-gray-800">Valgte løsninger dokumenteres</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Styringsmatrise</td>
                <td className="p-4 border border-gray-300 text-gray-800">Styringsmatrise som beskriver alle styringer på anlegg der det er hensiktsmessig eller er beskrevet av kravstiller.</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Tegninger som bygget</td>
                <td className="p-4 border border-gray-300 text-gray-800">Stigeskjema, kursoversikt, deteksjonssoner, detektoroversikt med adresse, utstyrsoversikt med adresse, systemskisse der det er hensiktsmessig eller er beskrevet av kravstiller.</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Tekniske spesifikasjoner</td>
                <td className="p-4 border border-gray-300 text-gray-800">Produktdatablader</td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Uavhengig kontroll</td>
                <td className="p-4 border border-gray-300 text-gray-800">Tredjeparts godkjenning der dette er relevant</td>
              </tr>
              <tr className="bg-gray-50 hover:bg-gray-100">
                <td className="p-4 border border-gray-300 font-medium text-gray-900">Vedlikehold</td>
                <td className="p-4 border border-gray-300 text-gray-800">Som spesifisert av produsent</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">8.5 Anleggsdokumentasjon</h2>
          <p className="text-lg text-gray-800 leading-relaxed">Det skal foreligge dokumentasjon inklusive tegninger. Dokumentasjon skal minst inneholde det som er vist i Tabell 2.</p>
        </div>
        
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">9.3 Kontroll</h2>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-800">9.3.1 Generelt</h3>
          <p className="text-lg text-gray-800 leading-relaxed mb-4">Med kontroll menes å undersøke om brannalarmanlegget samsvarer med prosjekteringsbeskrivelser, plan for alarmorganisering, montasjeanvisninger og tilsvarende, samt risiko og bruk av brannobjektet. Kontrollen skal avklare om sikkerhetsinnretningene:</p>
          <ul className="list-disc ml-8 mb-4 text-lg text-gray-800 leading-relaxed space-y-2">
            <li>oppfyller kravene til brannsikkerhet som gjelder for byggverket;</li>
            <li>fungerer hver for seg og sammen med hverandre.</li>
          </ul>
          <p className="text-lg text-gray-800 leading-relaxed mb-4">Kontroll skal utføres minst en gang per år. Kontrollen skal utføres av kompetent foretak.</p>
          
          <h3 className="text-xl font-semibold mb-3 text-gray-800">9.3.2 Kontrollens hensikt</h3>
          <ul className="list-disc ml-8 mb-4 text-lg text-gray-800 leading-relaxed space-y-2">
            <li>installasjonen oppfyller krav/ytelser etter aktuelt regelverk;</li>
            <li>installasjonen fungerer som prosjektert og beskrevet etter preaksepterte løsninger (standarder og veiledere) eller analyseløsninger (med prosjekteringsforutsetninger og lignende);</li>
            <li>dekningsgrad og kapasitet er tilfredsstillende også sett i forhold til eventuelle bygningsmessige endringer, vesentlig endret drift, endret brannenergi osv.;</li>
            <li>installasjonen med eventuelle teknologiske integrasjoner av forskjellige systemer virker som forutsatt og at grensesnittene er klart definert (for eksempel talevarsling, låssystemer eller lignende styrt av brannalarmanlegg);</li>
            <li>tidligere påtalte feil er rettet;</li>
            <li>organisatoriske tiltak samsvarer med forutsetningene for bruken.</li>
          </ul>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Valg av løsninger som fraviker bestemmelser i standarden</h2>
          <p className="text-lg text-gray-800 leading-relaxed">Valg av løsninger som fraviker bestemmelser i standarden skal behandles slik at tilfredsstillende funksjon og kvalitet av anlegget dokumenteres.</p>
        </div>
        
        <div className="mb-10">
          <h2 className="text-xl font-semibold mb-3 text-gray-800">Merknad</h2>
          <p className="text-lg text-gray-800 leading-relaxed">Teknisk forskrift krever at ansvarlig prosjekterende og ansvarlig utførende skal, innenfor sitt ansvarsområde, framlegge for ansvarlig søker nødvendig dokumentasjon som grunnlag for hvordan igangsetting, forvaltning, drift og vedlikehold av tekniske installasjoner og anlegg skal utføres på en tilfredsstillende måte.</p>
        </div>
      </div>
    </main>
  );
} 