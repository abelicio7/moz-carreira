export interface OpcaoTipografia {
  id: string;
  nome: string;
  familia: string;
}

export const TIPOGRAFIAS: OpcaoTipografia[] = [
  { id: "inter", nome: "Inter", familia: '"Inter", system-ui, sans-serif' },
  { id: "poppins", nome: "Poppins", familia: '"Poppins", system-ui, sans-serif' },
  { id: "roboto", nome: "Roboto", familia: '"Roboto", system-ui, sans-serif' },
  { id: "sourcesans", nome: "Source Sans 3", familia: '"Source Sans 3", system-ui, sans-serif' },
  { id: "lora", nome: "Lora", familia: '"Lora", Georgia, serif' },
  { id: "merriweather", nome: "Merriweather", familia: '"Merriweather", Georgia, serif' },
  { id: "times", nome: "Times New Roman", familia: '"Times New Roman", Times, serif' },
];

export const getFamilia = (id: string) =>
  TIPOGRAFIAS.find((t) => t.id === id)?.familia ?? TIPOGRAFIAS[0]!.familia;

export const ESPACAMENTOS = [
  { id: "compacto", nome: "Compacto", escala: 0.72 },
  { id: "normal", nome: "Normal", escala: 1 },
  { id: "amplo", nome: "Amplo", escala: 1.35 },
];

export const getEscala = (id: string) =>
  ESPACAMENTOS.find((e) => e.id === id)?.escala ?? 1;

export const CORES = [
  "#1B4079",
  "#0B3B5C",
  "#0369A1",
  "#0F766E",
  "#166534",
  "#4338CA",
  "#BE185D",
  "#B91C1C",
  "#78350F",
  "#111827",
];

export type SeccaoId =
  | "resumo"
  | "experiencias"
  | "formacoes"
  | "competencias"
  | "idiomas"
  | "certificados"
  | "projetos"
  | "referencias";

export const SECCOES: { id: SeccaoId; nome: string }[] = [
  { id: "resumo", nome: "Resumo profissional" },
  { id: "experiencias", nome: "Experiência profissional" },
  { id: "formacoes", nome: "Formação académica" },
  { id: "competencias", nome: "Competências" },
  { id: "idiomas", nome: "Idiomas" },
  { id: "certificados", nome: "Certificados" },
  { id: "projetos", nome: "Projectos" },
  { id: "referencias", nome: "Referências" },
];

export const ORDEM_PADRAO: SeccaoId[] = SECCOES.map((s) => s.id);

export const normalizarOrdem = (valor: unknown): SeccaoId[] => {
  const lista = Array.isArray(valor) ? (valor as SeccaoId[]) : [];
  const validas = lista.filter((id) => ORDEM_PADRAO.includes(id));
  return [...validas, ...ORDEM_PADRAO.filter((id) => !validas.includes(id))];
};

export const normalizarVisiveis = (valor: unknown): Record<SeccaoId, boolean> => {
  const base = Object.fromEntries(ORDEM_PADRAO.map((id) => [id, true])) as Record<
    SeccaoId,
    boolean
  >;
  if (valor && typeof valor === "object") {
    for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
      if (k in base) base[k as SeccaoId] = Boolean(v);
    }
  }
  return base;
};
