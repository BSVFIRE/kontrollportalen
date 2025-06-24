import React from 'react';

export default function KravPage() {
  return (
    <main className="min-h-screen bg-white py-10 px-4 flex justify-center">
      <div className="max-w-4xl w-full">
        <h1 className="text-4xl font-bold mb-8 text-gray-900 leading-tight">Krav og forskrifter</h1>
        
        <h2 className="text-2xl font-extrabold mb-4 text-gray-900">8.5 Anleggsdokumentasjon</h2>
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

        {/* 9 Drift og vedlikehold */}
        <h2 className="text-3xl font-extrabold mb-6 mt-14 text-gray-900">9 Drift og vedlikehold</h2>
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.1 Eierens plikter</h3>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Alle automatiske brannalarmanlegg skal ha regelmessig ettersyn og jevnlig kontroll.<br/>
        <span className="font-bold">Vedlikeholdsarbeider er nødvendig for at anlegg skal fungere sikkert.</span> Vedlikeholdet omfatter både forebyggende vedlikehold (ettersyn og kontroll) samt utbedrende vedlikehold (utbedringer og service).</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Eieren av et byggverk skal sørge for at brannalarmanlegg, som skal oppdage brann eller begrense konsekvensene av brann, blir kontrollert og vedlikeholdt slik at de fungerer som forutsatt. Med eier menes den som innehar grunnbokshjemmel for byggverket.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Det er eier som har ansvaret for å inngå vedlikeholdsavtale med kompetent foretak. Foretaket som påtar seg en slik vedlikeholdsavtale skal dokumentere nødvendig kompetanse for angjeldende anleggstype for å sikre nødvendig tilgang til dokumentasjon og systemkunnskap.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Alt vedlikehold av brannalarmanlegg skal dokumenteres og inngå som en del av virksomhetens internkontroll. Det må etableres kontrolljournal, se 9.5.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Eieren må sørge for at utkoblinger av anlegget blir av kortest mulig varighet. Når anlegget er utkoblet, må eieren inntil forholdet er normalisert, iverksette særskilte brannverntiltak for å opprettholde sikkerhetsnivået. Dette kan være forsterket vakthold eller andre egnede tiltak.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Det stedlige brannvesen bør informeres, og eieren skal underrettes når hele eller deler av anlegget blir utkoblet. De som er informert om utkoblingen, må også informeres når anlegget er i drift igjen.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Eier skal utpeke en ansvarshavende som skal påse nødvendig vedlikehold av anlegget. Eiers forpliktelser kan ikke fraskrives gjennom avtale.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Eieren må sørge for at ansvarshavende og andre som skal ivareta vedlikeholdet av anlegget:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— har nødvendige kompetanse og kvalifikasjoner;</li>
          <li>— kjenner stedets alarmplan og interne alarmorganisering;</li>
          <li>— er kjent i og har adgang til sikrede arealer;</li>
          <li>— kjenner anleggets virkemåte og systemfunksjoner;</li>
          <li>— kjenner anleggets vedlikeholdsrutiner;</li>
        </ul>
        <p className="mb-12 text-[18px] text-gray-900 leading-relaxed">Eieren plikter å informere eget personell og brukere om at brannalarmanlegg er installert og hvordan det fungerer.</p>

        {/* 9.2 Ettersyn */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.2 Ettersyn</h3>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Med ettersyn menes egenkontroll av brannalarmanlegget utført av eier/forvalter eller en representant for virksomhet/bruker etter avtale med eier. Dette skal sikre at funksjonen ikke svekkes som følge av driftsmessige endringer eller feil oppstått i driftsfasen. Leverandøren bør angi hva et slikt ettersyn skal omfatte.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Ettersyn skal utføres av personell som har fått tilstrekkelig opplæring.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Ettersyn av et brannalarmanlegg omfatter å:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— gjennomføre funksjonstesting av et utvalg alarmorganer;</li>
          <li>— gjennomføre funksjonstesting for visning på paneler og tavler;</li>
          <li>— påse at registrerte feil og mangler utbedres uten unødvendig forsinkelse;</li>
          <li>— vurdere orienteringsplan i forhold til bygningsmessige endringer;</li>
          <li>— føre all prøving og testing som gjøres i kontrolljournalen for senere dokumentasjon.</li>
        </ul>
        <p className="mb-12 text-[18px] text-gray-900 leading-relaxed">Ettersyn utføres månedlig, og vedkommende som foretar ettersyn skal selv utbedre avvikene eller sørge for at tiltak for utbedring iverksettes i henhold til 9.4.</p>

        {/* 9.3 Kontroll */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.3 Kontroll</h3>
        <h4 className="text-xl font-bold mb-2 text-gray-900">9.3.1 Generelt</h4>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Med kontroll menes å undersøke om brannalarmanlegget samsvarer med prosjekteringsbeskrivelser, plan for alarmorganisering, montasjeanvisninger og tilsvarende, samt risiko og bruk av brannobjektet. Kontrollen skal avklare om sikkerhetsinnretningene:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— oppfyller kravene til brannsikkerhet som gjelder for byggverket;</li>
          <li>— fungerer hver for seg og sammen med hverandre.</li>
        </ul>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Kontroll skal utføres minst en gang per år. Kontrollen skal utføres av kompetent foretak.</p>
        <h4 className="text-xl font-bold mb-2 text-gray-900">9.3.2 Kontrollens hensikt</h4>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Det foretaket som utfører kontrollen skal påse at:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— installasjonen oppfyller krav/ytelser etter aktuelt regelverk;</li>
          <li>— installasjonen fungerer som prosjektert og beskrevet etter preaksepterte løsninger (standarder og veiledere) eller analyseløsninger (med prosjekteringsforutsetninger og lignende);</li>
          <li>— dekningsgrad og kapasitet er tilfredsstillende også sett i forhold til eventuelle bygningsmessige endringer, vesentlig endret drift, endret brannenergi osv.;</li>
          <li>— installasjonen med eventuelle teknologiske integrasjoner av forskjellige systemer virker som forutsatt og at grensesnittene er klart definert (for eksempel talevarsling, låssystemer eller lignende styrt av brannalarmanlegg);</li>
          <li>— tidligere påtalte feil er rettet;</li>
          <li>— organisatoriske tiltak samsvarer med forutsetningene for bruken.</li>
        </ul>
        <h4 className="text-xl font-bold mb-2 text-gray-900">9.3.3 Funksjonsprøving</h4>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Funksjonsprøving av anlegget skal utføres av kompetent personell med tilgang til egnet kontrollverktøy som foreskrevet av leverandøren for angjeldende anleggstype.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Prøvingen skal omfatte:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— funksjonsprøving av sentralenheter, alarmpaneler, alarmfunksjoner, signalstyringer og alarmoverføring;</li>
          <li>— dersom flere sentralenheter er knyttet opp i ett nettverk, skal kontroll av nettverkskommunikasjonen gjennomføres;</li>
          <li>— kontroll av adresserbare anlegg gjennomføres fortrinnsvis med tilkoblet PC for systemfunksjon, driftsstatus og analyse av registrerte data. 10% av detektormassen funksjonsprøves manuelt årlig. Kontrollen skal omfatte alle sentralenheter så vel som tilkoblede detektorer for systemer basert på teknologi hvor slik analyse er mulig. Der slik analyse ikke er mulig kan manuell funksjonsprøving av røykdetektorer fordeles slik at hele detektormassen blir kontrollert i løpet av en periode på 4 år; minst 25 % av detektormassen for konvensjonelle anlegg skal funksjonsprøves manuelt årlig. Dette slik at detektormassen blir kontrollert i løpet av en periode på 4 år;</li>
          <li>— det tas stikkprøver for kontroll av alarmtekster (stedsangivelsen) i brannsentral; samtlige manuelle meldere skal testes;</li>
          <li>— visuell kontroll av anleggets funksjon og omfang i forhold til bygnings- eller driftsmessige endringer som er foretatt;</li>
          <li>— drifts- og vedlikeholdsinstrukser gjeldende for anlegget, inkludert kontrolljournal;</li>
          <li>— opplæring av ansvarshavende med bakgrunn i den systematiske løsningen i bruk og betjening av anlegget;</li>
        </ul>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Utarbeidelse av vedlikeholdsrapport, hvor ovennevnte punkter oppsummeres og kommenteres med tanke på eventuelle avvik. Videre vedlegges utskrift av analyse-/kontrollresultatene for systemstatus. Dette gjelder for systemer med teknologi som muliggjør slik analyse.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">For at stedlig tilsyn lett skal kunne verifisere at kontrollen er gjennomført for angjeldende år, plasseres standardisert kontrollmerke lett synlig på sentral eller betjeningspanel etter utført kontroll. Kontrollmerke skal signeres av utførende tekniker.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Avtalefestet kontroll kan utføres av et annet foretak enn det som har installert anlegget. Kontrollen skal dokumenteres med en kontrollrapport som viser hva som er kontrollert, hvordan det er kontrollert, og resultatet av kontrollen med avvik eller anmerkninger. Plan for utbedring av tiltak skal dokumenteres, se avsnitt om utbedringer og service.</p>

        {/* 9.4 Utbedringer og service */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.4 Utbedringer og service</h3>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Med service menes reparasjoner /utskiftninger, utbedring av avvik (feil og mangler) og oppgraderinger av brannalarmanlegget for at installasjonen skal fungere som forutsatt. Dette skal utføres av personell som har nødvendig fagmessig kompetanse/autorisasjon. Utført arbeid skal dokumenteres.</p>

        {/* 9.5 Kontrolljournal */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.5 Kontrolljournal</h3>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Kontrolljournalen skal føres av ansvarshavende, og skal til enhver tid være oppdatert. Ansvarshavendes navn skal framgå i kontrolljournalen.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Følgende punkter skal føres i kontrolljournalen:</p>
        <ul className="list-none ml-8 mb-3 text-[18px] text-gray-900 leading-relaxed">
          <li>— kontroll;</li>
          <li>— ettersyn;</li>
          <li>— vedlikehold, service og reparasjon;</li>
          <li>— feil med angivelse av årsak og tiltak;</li>
          <li>— ut- og innkopling med angivelse av årsak;</li>
          <li>— alarm med spesifisering av type (brannalarm, unødig alarm, brannøvelse med mer) og hvis mulig, årsaken til alarmen.</li>
        </ul>

        {/* 9.6 Uavhengig kontroll */}
        <h3 className="text-2xl font-bold mb-3 text-gray-900">9.6 Uavhengig kontroll</h3>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Med uavhengig kontroll menes kontroll av prosjektering, utførelse og brannkonsept med tilhørende plan for alarmorganisering. Herunder kontroll av at FDV-dokumentasjon er i henhold til som bygget anlegg. Uavhengig kontroll skal kun utføres av kompetent foretak.</p>
        <p className="mb-3 text-[18px] text-gray-900 leading-relaxed">Om anleggseier etablerer et opplegg for uavhengig kontroll av brannalarmanlegget betyr det ikke at de kontrolloppgaver og det vedlikeholdsarbeidet knyttet til anleggets vedlikeholdsavtale erstattes av et slikt opplegg. Dette vil være et tiltak med hensikt å verifisere utførelsen og kvaliteten på anlegget gjennom uavhengig samarbeidspartner.</p>
      </div>
    </main>
  );
} 