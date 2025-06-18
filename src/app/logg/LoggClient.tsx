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
};

export default function LoggClient() {
  const searchParams = useSearchParams();
  const anleggKode = searchParams.get("kode") || "";
  const [hendelser, setHendelser] = useState<Hendelse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
          .select("*")
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

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Hendelseslogg</h1>
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
                </tr>
              </thead>
              <tbody>
                {hendelser.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">Ingen hendelser funnet.</td>
                  </tr>
                ) : (
                  hendelser.map((h, idx) => (
                    <tr key={h.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border px-3 py-2">{h.tidspunkt ? new Date(h.tidspunkt).toLocaleString() : ""}</td>
                      <td className="border px-3 py-2">{h.type}</td>
                      <td className="border px-3 py-2">{h.arsak}</td>
                      <td className="border px-3 py-2">{h.registrert_av}</td>
                      <td className="border px-3 py-2">{h.kommentar}</td>
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