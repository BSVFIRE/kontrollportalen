"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Hendelse = {
  id: string;
  tidspunkt: string | null;
  type: string;
  arsak: string | null;
  registrert_av: string | null;
  kommentar: string | null;
  feiltype?: string | null;
  enhet?: string | null;
  utkobling_tid?: number | null;
  utkobling_uendelig?: boolean | null;
  firma?: string | null;
  anleggs_type?: string | null;
};

const HENDELSE_TYPER = [
  { value: 'alle', label: 'Alle typer' },
  { value: 'brannalarm', label: 'Brannalarm' },
  { value: 'forvarsel', label: 'Forvarsel' },
  { value: 'feil', label: 'Feil' },
  { value: 'utkobling', label: 'Utkobling' },
  { value: 'egenkontroll', label: 'Egenkontroll' },
  { value: 'avvik', label: 'Avvik' },
  { value: 'kontroll', label: 'Kontroll' },
  { value: 'utbedringer', label: 'Utbedringer' },
];

export default function LoggClient() {
  const searchParams = useSearchParams();
  const anleggKode = searchParams.get("kode") || "";
  const [hendelser, setHendelser] = useState<Hendelse[]>([]);
  const [filteredHendelser, setFilteredHendelser] = useState<Hendelse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Filter states
  const [selectedYear, setSelectedYear] = useState<string>('alle');
  const [selectedType, setSelectedType] = useState<string>('alle');
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const fetchHendelser = async () => {
      setLoading(true);
      setError("");
      try {
        // Hent anlegg_id basert på kode
        const { data: anlegg, error: anleggError } = await supabase
          .from("anlegg")
          .select("id")
          .eq("unik_kode", anleggKode)
          .single();
        if (anleggError || !anlegg) {
          setError("Fant ikke anlegg for oppgitt kode.");
          setLoading(false);
          return;
        }
        // Hent hendelser for anlegg_id
        const { data, error: hendelserError } = await supabase
          .from("hendelser")
          .select("id, tidspunkt, type, arsak, registrert_av, kommentar, feiltype, enhet, utkobling_tid, utkobling_uendelig, firma, anleggs_type")
          .eq("anlegg_id", anlegg.id)
          .order("tidspunkt", { ascending: false });
        if (hendelserError) throw hendelserError;
        setHendelser(data || []);
      } catch {
        setError("Kunne ikke hente hendelser");
      } finally {
        setLoading(false);
      }
    };
    if (anleggKode) fetchHendelser();
  }, [anleggKode]);

  // Oppdater tilgjengelige år når hendelser endres
  useEffect(() => {
    const years = new Set<string>();
    hendelser.forEach(hendelse => {
      if (hendelse.tidspunkt) {
        const year = new Date(hendelse.tidspunkt).getFullYear().toString();
        years.add(year);
      }
    });
    const sortedYears = Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
    setAvailableYears(sortedYears);
  }, [hendelser]);

  // Filtrer hendelser basert på valgte filtre
  useEffect(() => {
    let filtered = hendelser;

    // Filtrer på år
    if (selectedYear !== 'alle') {
      filtered = filtered.filter(hendelse => {
        if (!hendelse.tidspunkt) return false;
        const year = new Date(hendelse.tidspunkt).getFullYear().toString();
        return year === selectedYear;
      });
    }

    // Filtrer på type
    if (selectedType !== 'alle') {
      filtered = filtered.filter(hendelse => hendelse.type === selectedType);
    }

    setFilteredHendelser(filtered);
  }, [hendelser, selectedYear, selectedType]);

  // PDF-eksport
  const eksportTilPDF = async () => {
    const jsPDFModule = await import('jspdf');
    const jsPDF = jsPDFModule.default;
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    doc.text('Hendelseslogg', 14, 16);
    const columns = [
      { header: 'Tidspunkt', dataKey: 'tidspunkt' },
      { header: 'Type', dataKey: 'type' },
      { header: 'Årsak', dataKey: 'arsak' },
      { header: 'Registrert av', dataKey: 'registrert_av' },
      { header: 'Kommentar', dataKey: 'kommentar' },
      { header: 'Feiltype', dataKey: 'feiltype' },
      { header: 'Enhet', dataKey: 'enhet' },
      { header: 'Utkobling tid', dataKey: 'utkobling_tid' },
      { header: 'Utkobling uendelig', dataKey: 'utkobling_uendelig' },
      { header: 'Firma', dataKey: 'firma' },
    ];
    const rows = filteredHendelser.map(h => ({
      tidspunkt: h.tidspunkt ? new Date(h.tidspunkt).toLocaleString() : '',
      type: h.type,
      arsak: h.arsak || '',
      registrert_av: h.registrert_av || '',
      kommentar: h.kommentar || '',
      feiltype: h.feiltype || '',
      enhet: h.enhet || '',
      utkobling_tid: h.utkobling_tid !== undefined && h.utkobling_tid !== null ? h.utkobling_tid + ' min' : '',
      utkobling_uendelig: h.utkobling_uendelig === true ? 'Ja' : h.utkobling_uendelig === false ? 'Nei' : '',
      firma: h.firma || '',
    }));
    autoTable(doc, { columns, body: rows, startY: 22, styles: { fontSize: 8 } });
    doc.save('hendelseslogg.pdf');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-6xl w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Hendelseslogg</h1>
        {/* PDF-eksport knapp */}
        <div className="flex justify-end mb-4">
          <button
            onClick={eksportTilPDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={filteredHendelser.length === 0}
          >
            Eksporter til PDF
          </button>
        </div>
        
        {/* Filter section */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-1">År</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border rounded px-3 py-2 text-base text-gray-900 bg-white font-medium border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                <option value="alle">Alle år</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-base font-semibold text-gray-900 mb-1">Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="border rounded px-3 py-2 text-base text-gray-900 bg-white font-medium border-gray-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              >
                {HENDELSE_TYPER.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto text-base text-gray-900">
              {filteredHendelser.length} hendelser funnet
            </div>
          </div>
        </div>

        {loading && <div>Laster hendelser...</div>}
        {error && <div className="text-red-500 mb-4">{error}</div>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full border text-sm text-gray-900">
              <thead>
                <tr className="bg-gray-200 text-gray-900 font-semibold">
                  <th className="px-3 py-2 border">Tidspunkt</th>
                  <th className="px-3 py-2 border">Type</th>
                  <th className="px-3 py-2 border">Årsak</th>
                  <th className="px-3 py-2 border">Registrert av</th>
                  <th className="px-3 py-2 border">Kommentar</th>
                  <th className="px-3 py-2 border">Feiltype</th>
                  <th className="px-3 py-2 border">Enhet</th>
                  <th className="px-3 py-2 border">Utkobling tid</th>
                  <th className="px-3 py-2 border">Utkobling uendelig</th>
                  <th className="px-3 py-2 border">Firma</th>
                </tr>
              </thead>
              <tbody>
                {filteredHendelser.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4">Ingen hendelser funnet med valgte filtre.</td>
                  </tr>
                ) : (
                  filteredHendelser.map((h, idx) => (
                    <tr key={h.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-3 py-2">{h.tidspunkt ? new Date(h.tidspunkt).toLocaleString() : ""}</td>
                      <td className="border px-3 py-2">{h.type}</td>
                      <td className="border px-3 py-2">{h.arsak}</td>
                      <td className="border px-3 py-2">{h.registrert_av}</td>
                      <td className="border px-3 py-2">{h.kommentar}</td>
                      <td className="border px-3 py-2">{h.feiltype || ""}</td>
                      <td className="border px-3 py-2">{h.enhet || ""}</td>
                      <td className="border px-3 py-2">{h.utkobling_tid !== undefined && h.utkobling_tid !== null ? h.utkobling_tid + " min" : ""}</td>
                      <td className="border px-3 py-2">{h.utkobling_uendelig === true ? "Ja" : h.utkobling_uendelig === false ? "Nei" : ""}</td>
                      <td className="border px-3 py-2">{h.firma || ""}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
} 