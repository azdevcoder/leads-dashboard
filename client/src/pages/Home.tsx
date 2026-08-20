import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Briefcase, Check, CheckCircle2, Clock3, Download, ExternalLink, Loader2, MapPin, Phone, Plus, RefreshCw, Search, XCircle } from "lucide-react";

const statusOptions = ["Aguardando", "Em Atendimento", "Atendido", "Recusado"] as const;
type LeadStatus = (typeof statusOptions)[number];

type SearchResult = {
  sourceKey: string;
  placeId: string | null;
  name: string;
  segment: string;
  city: string;
  state: string;
  phone: string | null;
  address: string | null;
  mapsUrl: string | null;
};

type Lead = SearchResult & {
  id: number;
  status: LeadStatus;
  notes: string | null;
};

const statusStyles: Record<LeadStatus, string> = {
  "Aguardando": "border-slate-200 bg-slate-50 text-slate-700",
  "Em Atendimento": "border-amber-200 bg-amber-50 text-amber-800",
  "Atendido": "border-emerald-200 bg-emerald-50 text-emerald-800",
  "Recusado": "border-rose-200 bg-rose-50 text-rose-800",
};

const statusIcons: Record<LeadStatus, typeof Clock3> = {
  "Aguardando": Clock3,
  "Em Atendimento": RefreshCw,
  "Atendido": CheckCircle2,
  "Recusado": XCircle,
};

const segmentStyles: Record<string, string> = {
  Saúde: "bg-blue-100 text-blue-800",
  Jurídico: "bg-purple-100 text-purple-800",
  Construção: "bg-orange-100 text-orange-800",
  Automotivo: "bg-red-100 text-red-800",
  "Pet Shop": "bg-pink-100 text-pink-800",
  Comércio: "bg-yellow-100 text-yellow-800",
  Alimentação: "bg-amber-100 text-amber-800",
};

function csvCell(value: string | null | undefined) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}

export default function Home() {
  const utils = trpc.useUtils();
  const leadsQuery = trpc.leads.list.useQuery(undefined, { retry: false });
  const updateStatus = trpc.leads.updateStatus.useMutation({
    onSuccess: () => utils.leads.list.invalidate(),
  });
  const searchPlaces = trpc.leads.search.useMutation();
  const importLeads = trpc.leads.importMany.useMutation({
    onSuccess: async () => {
      setSearchResults([]);
      setSelectedResults(new Set());
      setSearchOpen(false);
      await utils.leads.list.invalidate();
    },
  });

  const leads = (leadsQuery.data ?? []) as Lead[];
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [searchOpen, setSearchOpen] = useState(false);
  const [googleQuery, setGoogleQuery] = useState("");
  const [googleCity, setGoogleCity] = useState("Curitiba");
  const [googleState, setGoogleState] = useState("PR");
  const [googleLimit, setGoogleLimit] = useState("10");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());

  const cities = useMemo(() => Array.from(new Set(leads.map(lead => lead.city))).sort(), [leads]);
  const segments = useMemo(() => Array.from(new Set(leads.map(lead => lead.segment))).sort(), [leads]);
  const filteredLeads = useMemo(() => leads.filter(lead => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = !term || [lead.name, lead.phone, lead.city, lead.segment].some(value => value?.toLowerCase().includes(term));
    const matchesCity = selectedCity === "all" || lead.city === selectedCity;
    const matchesSegment = selectedSegment === "all" || lead.segment === selectedSegment;
    const matchesStatus = selectedStatus === "all" || lead.status === selectedStatus;
    return matchesSearch && matchesCity && matchesSegment && matchesStatus;
  }), [leads, searchTerm, selectedCity, selectedSegment, selectedStatus]);

  const statusCounts = useMemo(() => statusOptions.reduce((counts, status) => {
    counts[status] = leads.filter(lead => lead.status === status).length;
    return counts;
  }, {} as Record<LeadStatus, number>), [leads]);

  const handleDownloadCSV = () => {
    const headers = ["Nome da Empresa", "Segmento", "Cidade", "Estado", "Telefone", "Status", "Endereço", "Google Maps", "Notas"];
    const rows = filteredLeads.map(lead => [lead.name, lead.segment, lead.city, lead.state, lead.phone, lead.status, lead.address, lead.mapsUrl, lead.notes]);
    const csv = [headers, ...rows].map(row => row.map(csvCell).join(",")).join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "leads-prospeccao.csv";
    anchor.click();
    window.URL.revokeObjectURL(url);
  };

  const handleGoogleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!googleQuery.trim() || !googleCity.trim() || !googleState.trim()) return;
    const results = await searchPlaces.mutateAsync({
      query: googleQuery,
      city: googleCity,
      state: googleState,
      limit: Number(googleLimit),
    });
    setSearchResults(results);
    setSelectedResults(new Set());
  };

  const toggleSearchResult = (sourceKey: string) => {
    setSelectedResults(current => {
      const next = new Set(current);
      if (next.has(sourceKey)) next.delete(sourceKey);
      else next.add(sourceKey);
      return next;
    });
  };

  const handleImport = () => {
    const selected = searchResults.filter(result => selectedResults.has(result.sourceKey));
    if (selected.length > 0) importLeads.mutate({ leads: selected });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="border-b border-slate-200 bg-white/95 shadow-sm backdrop-blur">
        <div className="container flex flex-col gap-5 py-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shadow-sm">
                <Briefcase className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-950">Leads Dashboard</h1>
                <p className="mt-1 text-sm text-slate-600">Prospecção de PMEs brasileiras sem site</p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => setSearchOpen(true)} className="gap-2 bg-slate-900 hover:bg-slate-800">
              <Plus className="h-4 w-4" />
              Buscar empresas
            </Button>
            <Button onClick={handleDownloadCSV} variant="outline" className="gap-2 bg-white">
              <Download className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        <section className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statusOptions.map(status => {
            const Icon = statusIcons[status];
            return (
              <button key={status} type="button" onClick={() => setSelectedStatus(selectedStatus === status ? "all" : status)} className={`rounded-xl border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${selectedStatus === status ? "ring-2 ring-slate-900 ring-offset-2" : ""}`}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium text-slate-500">{status}</span>
                  <Icon className="h-4 w-4 text-slate-500" />
                </div>
                <p className="mt-2 text-2xl font-semibold text-slate-950">{statusCounts[status]}</p>
              </button>
            );
          })}
        </section>

        <section className="mb-8 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input placeholder="Buscar por nome, telefone, cidade..." value={searchTerm} onChange={event => setSearchTerm(event.target.value)} className="bg-white pl-10" />
            </div>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Todas as cidades" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map(city => <SelectItem key={city} value={city}>{city}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={selectedSegment} onValueChange={setSelectedSegment}>
              <SelectTrigger className="bg-white"><SelectValue placeholder="Todos os segmentos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segments.map(segment => <SelectItem key={segment} value={segment}>{segment}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
            <span>Mostrando <strong className="text-slate-950">{filteredLeads.length}</strong> de <strong className="text-slate-950">{leads.length}</strong> leads</span>
            {selectedStatus !== "all" && <Button variant="ghost" size="sm" onClick={() => setSelectedStatus("all")}>Limpar filtro de status</Button>}
          </div>
        </section>

        {leadsQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-slate-600"><Loader2 className="h-5 w-5 animate-spin" />Carregando leads...</div>
        ) : leadsQuery.error ? (
          <Card className="border-rose-200 bg-rose-50 p-6 text-rose-800">Não foi possível carregar os leads. Verifique a autenticação e tente novamente.</Card>
        ) : filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredLeads.map(lead => (
              <Card key={lead.id} className="overflow-hidden border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                <div className="p-5">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold leading-tight text-slate-950">{lead.name}</h2>
                    <Badge className={`shrink-0 border ${statusStyles[lead.status]}`}>{lead.status}</Badge>
                  </div>
                  <div className="space-y-3 text-sm">
                    <Badge className={segmentStyles[lead.segment] ?? "bg-slate-100 text-slate-800"}>{lead.segment}</Badge>
                    <div className="flex items-start gap-2 text-slate-600"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" /><span>{lead.city}, {lead.state}{lead.address ? ` · ${lead.address}` : ""}</span></div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 shrink-0 text-slate-400" />{lead.phone ? <a href={`tel:${lead.phone.replace(/\D/g, "")}`} className="font-medium text-blue-600 hover:underline">{lead.phone}</a> : <span className="text-slate-500">Telefone não informado</span>}</div>
                  </div>
                  <div className="mt-5 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                    <Button variant="outline" size="sm" disabled={!lead.phone} onClick={() => lead.phone && window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}`, "_blank")}>
                      WhatsApp
                    </Button>
                    <Button size="sm" disabled={!lead.phone} onClick={() => lead.phone && (window.location.href = `tel:${lead.phone.replace(/\D/g, "")}`)}>Ligar</Button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Select value={lead.status} onValueChange={status => updateStatus.mutate({ id: lead.id, status: status as LeadStatus })}>
                      <SelectTrigger className="h-9 flex-1 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>{statusOptions.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent>
                    </Select>
                    {lead.mapsUrl && <Button variant="ghost" size="icon" asChild><a href={lead.mapsUrl} target="_blank" rel="noreferrer" aria-label="Abrir no Google Maps"><ExternalLink className="h-4 w-4" /></a></Button>}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="py-16 text-center text-slate-600"><Briefcase className="mx-auto mb-3 h-12 w-12 text-slate-300" /><p className="font-medium">Nenhum lead encontrado</p><p className="mt-1 text-sm">Ajuste os filtros ou pesquise novas empresas.</p></div>
        )}
      </main>

      <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Buscar novas empresas no Google</DialogTitle>
            <DialogDescription>Use o Google Places para procurar empresas por segmento e localização. Selecione apenas os resultados que deseja importar.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleGoogleSearch} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2"><label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="google-query">Segmento ou termo</label><Input id="google-query" placeholder="Ex.: clínicas odontológicas" value={googleQuery} onChange={event => setGoogleQuery(event.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="google-city">Cidade</label><Input id="google-city" value={googleCity} onChange={event => setGoogleCity(event.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="google-state">Estado</label><Input id="google-state" maxLength={40} value={googleState} onChange={event => setGoogleState(event.target.value)} /></div>
            <div><label className="mb-1.5 block text-sm font-medium text-slate-700" htmlFor="google-limit">Quantidade</label><Select value={googleLimit} onValueChange={setGoogleLimit}><SelectTrigger id="google-limit"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="5">5 resultados</SelectItem><SelectItem value="10">10 resultados</SelectItem><SelectItem value="20">20 resultados</SelectItem></SelectContent></Select></div>
            <div className="flex items-end"><Button type="submit" disabled={searchPlaces.isPending} className="w-full gap-2 bg-slate-900 hover:bg-slate-800">{searchPlaces.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}Pesquisar</Button></div>
          </form>
          {searchPlaces.error && <p className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">{searchPlaces.error.message}</p>}
          {searchResults.length > 0 && <div className="space-y-3 border-t border-slate-200 pt-4"><div className="flex items-center justify-between gap-3"><h3 className="font-semibold text-slate-950">Resultados ({searchResults.length})</h3><Button type="button" size="sm" disabled={selectedResults.size === 0 || importLeads.isPending} onClick={handleImport} className="gap-2">{importLeads.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Importar selecionados ({selectedResults.size})</Button></div>{searchResults.map(result => { const selected = selectedResults.has(result.sourceKey); return <button type="button" key={result.sourceKey} onClick={() => toggleSearchResult(result.sourceKey)} className={`w-full rounded-lg border p-3 text-left transition ${selected ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200 hover:border-slate-400"}`}><div className="flex items-start gap-3"><span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border ${selected ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>{selected && <Check className="h-3.5 w-3.5" />}</span><span className="min-w-0 flex-1"><strong className="block text-sm text-slate-950">{result.name}</strong><span className="mt-1 block text-xs text-slate-600">{result.address ?? `${result.city}, ${result.state}`}</span>{result.phone && <span className="mt-1 block text-xs text-slate-600">{result.phone}</span>}</span>{result.mapsUrl && <ExternalLink className="h-4 w-4 shrink-0 text-slate-400" />}</div></button>; })}</div>}
          {searchResults.length === 0 && !searchPlaces.isPending && <p className="py-6 text-center text-sm text-slate-500">Pesquise um segmento e uma cidade para ver resultados.</p>}
          <DialogFooter><Button type="button" variant="outline" onClick={() => setSearchOpen(false)}>Fechar</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
