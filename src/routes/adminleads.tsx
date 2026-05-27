import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, MessageCircle, RefreshCw, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { type Lead, clearAdminLeads, listAdminLeads } from "@/lib/leads";

export const Route = createFileRoute("/adminleads")({
  component: AdminLeads,
  head: () => ({
    meta: [{ title: "Admin Leads | VOC Comunicações" }],
  }),
});

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (!digits) return "";
  return digits.startsWith("55") ? digits : `55${digits}`;
}

function formatDate(value?: string): string {
  if (!value) return "-";
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

function AdminLeads() {
  const [leads, setLeads] = useState<Lead[]>([]);

  async function loadLeads() {
    setLeads(await listAdminLeads());
  }

  async function handleClear() {
    await clearAdminLeads();
    setLeads([]);
  }

  useEffect(() => {
    void loadLeads();
  }, []);

  return (
    <main className="min-h-screen bg-background px-6 py-10 text-foreground">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Button asChild variant="ghost" className="-ml-3 mb-4">
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para a landing
              </Link>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Leads recebidos</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Contatos enviados pelo formulário. Por enquanto, os dados ficam salvos
              temporariamente neste navegador até reconfigurarmos o banco de dados.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={loadLeads} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </Button>
            <Button onClick={handleClear} variant="outline">
              <Trash2 className="mr-2 h-4 w-4" />
              Limpar lista
            </Button>
          </div>
        </div>

        <div className="mt-8 overflow-x-auto rounded-2xl border border-border bg-card">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border bg-secondary/60 text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">WhatsApp</th>
                <th className="px-4 py-3">Empresa</th>
                <th className="px-4 py-3">Objetivo</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const phone = normalizePhone(lead.whatsapp);
                return (
                  <tr key={lead.id} className="border-b border-border/60 last:border-b-0">
                    <td className="px-4 py-4 text-muted-foreground">
                      {formatDate(lead.created_at)}
                    </td>
                    <td className="px-4 py-4 font-semibold">{lead.nome}</td>
                    <td className="px-4 py-4">{lead.whatsapp}</td>
                    <td className="px-4 py-4">{lead.empresa || "-"}</td>
                    <td className="max-w-md px-4 py-4 text-muted-foreground">
                      {lead.objetivo || "-"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        asChild
                        size="sm"
                        className="bg-green-600 font-bold text-white hover:bg-green-700"
                        disabled={!phone}
                      >
                        <a
                          href={`https://wa.me/${phone}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MessageCircle className="mr-2 h-4 w-4" />
                          WhatsApp
                        </a>
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {leads.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhum lead encontrado ainda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
