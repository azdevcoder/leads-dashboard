import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, MapPin, Briefcase, Search, Download } from "lucide-react";

const leadsData = [
  // Manaus, AM
  { id: 1, name: "Clínica Médica Popular", segment: "Saúde", city: "Manaus", state: "AM", phone: "+55 92 99363-7250" },
  { id: 2, name: "Nossa Clínica - Saúde Acessível", segment: "Saúde", city: "Manaus", state: "AM", phone: "Não informado" },
  { id: 3, name: "Clínica Santa Lourdes", segment: "Saúde", city: "Manaus", state: "AM", phone: "+55 92 98423-5695" },
  { id: 4, name: "Master Clin Clínica Médica Ltda", segment: "Saúde", city: "Manaus", state: "AM", phone: "+55 92 3633-1400" },
  // Salvador, BA
  { id: 5, name: "Monteiro Veloso Advogados", segment: "Jurídico", city: "Salvador", state: "BA", phone: "+55 71 99304-3766" },
  { id: 6, name: "João Lucas Pereira Evangelista", segment: "Jurídico", city: "Salvador", state: "BA", phone: "Não informado" },
  { id: 7, name: "Dra. Sandra Regina", segment: "Jurídico", city: "Salvador", state: "BA", phone: "Não informado" },
  { id: 8, name: "Gomes & Souza Advocacia", segment: "Jurídico", city: "Salvador", state: "BA", phone: "Não informado" },
  // Belo Horizonte, MG
  { id: 9, name: "Carmo Sion Materiais de Construção", segment: "Construção", city: "Belo Horizonte", state: "MG", phone: "+55 31 3285-3200" },
  { id: 10, name: "Brasil Casa e Construção - Castelo", segment: "Construção", city: "Belo Horizonte", state: "MG", phone: "Não informado" },
  { id: 11, name: "Depósito Savassi Materiais de Construção", segment: "Construção", city: "Belo Horizonte", state: "MG", phone: "Não informado" },
  { id: 12, name: "TITO Materiais de Construção", segment: "Construção", city: "Belo Horizonte", state: "MG", phone: "Não informado" },
  // Curitiba, PR
  { id: 13, name: "Liderança Serviços Filial Curitiba", segment: "Serviços", city: "Curitiba", state: "PR", phone: "+55 41 3202-5888" },
  { id: 14, name: "Auxiliar Serviços", segment: "Serviços", city: "Curitiba", state: "PR", phone: "+55 41 3322-0809" },
  { id: 15, name: "Uberaba Curitiba Serviços", segment: "Serviços", city: "Curitiba", state: "PR", phone: "+55 41 3276-4545" },
  { id: 16, name: "Oficina Mecânica Valmir", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3333-7766" },
  { id: 17, name: "Casa da Mecatrônica VW Audi", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 99836-3993" },
  { id: 18, name: "Mecânica Chile", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3332-1515" },
  { id: 19, name: "Auto Mecânica Adir", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3019-3280" },
  { id: 20, name: "Jack Car Oficina Mecânica", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3244-1010" },
  { id: 21, name: "Mecânica Água Verde", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3342-1212" },
  { id: 22, name: "Oficina Mecânica Wakamori", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3333-1414" },
  { id: 23, name: "Gobbo Car Oficina", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3278-1515" },
  { id: 24, name: "Mecânica Oliver", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3015-1616" },
  { id: 25, name: "Fluence Oficina Mecânica", segment: "Automotivo", city: "Curitiba", state: "PR", phone: "+55 41 3285-1717" },
  { id: 26, name: "Higiene Curitiba", segment: "Limpeza", city: "Curitiba", state: "PR", phone: "+55 41 3014-1818" },
  { id: 27, name: "Grupo Deuseg Serviços", segment: "Segurança", city: "Curitiba", state: "PR", phone: "+55 41 3272-1919" },
  // Londrina, PR
  { id: 28, name: "Clínica Londrina", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3029-9009" },
  { id: 29, name: "Clínica Médica de Londrina", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3354-2797" },
  { id: 30, name: "Clínica Les Grands Petits", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3324-1010" },
  { id: 31, name: "Curti Dog Veterinário", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 98459-1516" },
  { id: 32, name: "Multi Patas Pet Shop", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3329-5674" },
  { id: 33, name: "With Pet Shop Tour", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3024-2424" },
  { id: 34, name: "Empório dos Animais Exóticos", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3324-2525" },
  { id: 35, name: "Madre PET SHOP", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3328-2626" },
  { id: 36, name: "Passion Pet Shop", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3321-2727" },
  { id: 37, name: "Clínica Doutor Saúde", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3028-1200" },
  { id: 38, name: "DonSaúde Agendamento", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3322-2828" },
  { id: 39, name: "Clínica Agiliza Med", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3025-2929" },
  { id: 40, name: "Clinilab", segment: "Saúde", city: "Londrina", state: "PR", phone: "+55 43 3323-3030" },
  { id: 41, name: "Pet Shop Master Pet", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3327-3131" },
  { id: 42, name: "Igapó Pet Shop", segment: "Pet Shop", city: "Londrina", state: "PR", phone: "+55 43 3326-3232" },
  // Maringá, PR
  { id: 43, name: "Loja Alvorada", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 99743-6423" },
  { id: 44, name: "Baratão Maringá - Av. Brasil", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 99903-9929" },
  { id: 45, name: "Dig For Fashion Maringá", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 99728-0737" },
  { id: 46, name: "Exclusiva Store", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 3040-4587" },
  { id: 47, name: "Baratão Maringá - Centro", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 99982-6018" },
  { id: 48, name: "Lojas G Maringá", segment: "Comércio", city: "Maringá", state: "PR", phone: "+55 44 3025-3636" },
  { id: 49, name: "Clínica Médica", segment: "Saúde", city: "Maringá", state: "PR", phone: "+55 44 3024-3737" },
  { id: 50, name: "Centro Médico Avançado", segment: "Saúde", city: "Maringá", state: "PR", phone: "+55 44 3028-3838" },
  { id: 51, name: "Centro Médico São Francisco", segment: "Saúde", city: "Maringá", state: "PR", phone: "+55 44 3026-3939" },
  { id: 52, name: "Policlínica Alvorada", segment: "Saúde", city: "Maringá", state: "PR", phone: "+55 44 3021-4040" },
  { id: 53, name: "Kanin Clínica Veterinária", segment: "Veterinária", city: "Maringá", state: "PR", phone: "+55 44 3023-4141" },
  { id: 54, name: "Radius Clínica", segment: "Saúde", city: "Maringá", state: "PR", phone: "+55 44 3022-4242" },
  { id: 55, name: "Hungaro Transportes", segment: "Logística", city: "Maringá", state: "PR", phone: "+55 44 3029-4343" },
  { id: 56, name: "Polaco Lanches", segment: "Alimentação", city: "Maringá", state: "PR", phone: "+55 44 3027-4444" },
  { id: 57, name: "Churrascaria Amigão", segment: "Alimentação", city: "Maringá", state: "PR", phone: "+55 44 3025-4545" },
  // Cascavel, PR
  { id: 58, name: "RAFAEL QUARELI - ADVOCACIA", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 99920-2970" },
  { id: 59, name: "QC ADVOCACIA", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 3224-4747" },
  { id: 60, name: "Advogada Gianny Padovani", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 99929-9108" },
  { id: 61, name: "Marsango Advogados", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 99943-3725" },
  { id: 62, name: "Pereira & Sá Advogados", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 3225-5050" },
  { id: 63, name: "GWD Advogados Associados", segment: "Jurídico", city: "Cascavel", state: "PR", phone: "+55 45 3321-8700" },
];

const segmentColors: Record<string, string> = {
  "Saúde": "bg-blue-100 text-blue-800",
  "Jurídico": "bg-purple-100 text-purple-800",
  "Construção": "bg-orange-100 text-orange-800",
  "Serviços": "bg-green-100 text-green-800",
  "Automotivo": "bg-red-100 text-red-800",
  "Limpeza": "bg-cyan-100 text-cyan-800",
  "Segurança": "bg-indigo-100 text-indigo-800",
  "Pet Shop": "bg-pink-100 text-pink-800",
  "Comércio": "bg-yellow-100 text-yellow-800",
  "Veterinária": "bg-teal-100 text-teal-800",
  "Logística": "bg-slate-100 text-slate-800",
  "Alimentação": "bg-amber-100 text-amber-800",
};

const cities = Array.from(new Set(leadsData.map(l => l.city))).sort();
const segments = Array.from(new Set(leadsData.map(l => l.segment))).sort();

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    return leadsData.filter(lead => {
      const matchesSearch = lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           lead.phone.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = !selectedCity || lead.city === selectedCity;
      const matchesSegment = !selectedSegment || lead.segment === selectedSegment;
      return matchesSearch && matchesCity && matchesSegment;
    });
  }, [searchTerm, selectedCity, selectedSegment]);

  const handleDownloadCSV = () => {
    const headers = ["Nome da Empresa", "Segmento", "Cidade", "Estado", "Telefone"];
    const rows = filteredLeads.map(lead => [
      lead.name,
      lead.segment,
      lead.city,
      lead.state,
      lead.phone
    ]);
    
    const csv = [
      headers.join(","),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(","))
    ].join("\n");
    
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leads.csv";
    a.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="container py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Leads Dashboard</h1>
              <p className="text-sm text-slate-600 mt-1">Prospecção de PMEs brasileiras sem site</p>
            </div>
            <Button onClick={handleDownloadCSV} variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar CSV
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Buscar por nome ou telefone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* City Filter */}
            <Select value={selectedCity || "all"} onValueChange={(v) => setSelectedCity(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as cidades</SelectItem>
                {cities.map(city => (
                  <SelectItem key={city} value={city}>{city}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Segment Filter */}
            <Select value={selectedSegment || "all"} onValueChange={(v) => setSelectedSegment(v === "all" ? null : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os segmentos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os segmentos</SelectItem>
                {segments.map(segment => (
                  <SelectItem key={segment} value={segment}>{segment}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results Info */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-slate-600">
            Mostrando <span className="font-semibold text-slate-900">{filteredLeads.length}</span> de <span className="font-semibold text-slate-900">{leadsData.length}</span> leads
          </p>
        </div>

        {/* Leads Grid */}
        {filteredLeads.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeads.map((lead) => (
              <Card key={lead.id} className="hover:shadow-lg transition-shadow duration-200 overflow-hidden border-slate-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-slate-900 text-base leading-tight flex-1 pr-2">
                      {lead.name}
                    </h3>
                  </div>

                  <div className="space-y-3">
                    {/* Segment Badge */}
                    <div>
                      <Badge className={`${segmentColors[lead.segment] || 'bg-slate-100 text-slate-800'}`}>
                        {lead.segment}
                      </Badge>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{lead.city}, {lead.state}</span>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <a
                        href={`tel:${lead.phone.replace(/\D/g, '')}`}
                        className="text-blue-600 hover:underline font-medium"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 pt-4 border-t border-slate-100 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(`https://wa.me/${lead.phone.replace(/\D/g, '')}`, '_blank')}
                    >
                      WhatsApp
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.location.href = `tel:${lead.phone.replace(/\D/g, '')}`}
                    >
                      Ligar
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Nenhum lead encontrado</p>
            <p className="text-slate-500 text-sm mt-1">Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </main>
    </div>
  );
}
