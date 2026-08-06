export type LayoutBarra = "none" | "left" | "right";
export type EstiloCabecalho = "simples" | "faixa" | "centrado" | "gradiente";
export type EstiloDivisor = "linha" | "barra" | "ponto";

export interface ModeloCV {
  id: string;
  nome: string;
  descricao: string;
  categoria: "Clássico" | "Moderno" | "Criativo" | "Executivo" | "ATS";
  premium: boolean;
  barra: LayoutBarra;
  cabecalho: EstiloCabecalho;
  divisor: EstiloDivisor;
  maiusculas: boolean;
  corPadrao: string;
  tipografiaPadrao: string;
}

export const MODELOS: ModeloCV[] = [
  {
    id: "minimalista",
    nome: "Minimalista",
    descricao: "Linhas limpas, foco total no conteúdo.",
    categoria: "Clássico",
    premium: false,
    barra: "none",
    cabecalho: "simples",
    divisor: "linha",
    maiusculas: true,
    corPadrao: "#1B4079",
    tipografiaPadrao: "inter",
  },
  {
    id: "maputo",
    nome: "Maputo",
    descricao: "Faixa de cor no topo, ideal para candidaturas locais.",
    categoria: "Moderno",
    premium: false,
    barra: "none",
    cabecalho: "faixa",
    divisor: "barra",
    maiusculas: true,
    corPadrao: "#1B4079",
    tipografiaPadrao: "poppins",
  },
  {
    id: "beira",
    nome: "Beira",
    descricao: "Coluna lateral com contactos e competências.",
    categoria: "Moderno",
    premium: false,
    barra: "left",
    cabecalho: "simples",
    divisor: "linha",
    maiusculas: true,
    corPadrao: "#0F766E",
    tipografiaPadrao: "inter",
  },
  {
    id: "nampula",
    nome: "Nampula",
    descricao: "Coluna lateral à direita, leitura equilibrada.",
    categoria: "Moderno",
    premium: false,
    barra: "right",
    cabecalho: "simples",
    divisor: "barra",
    maiusculas: false,
    corPadrao: "#7C2D12",
    tipografiaPadrao: "sourcesans",
  },
  {
    id: "classico-serif",
    nome: "Clássico Serif",
    descricao: "Tipografia serifada, elegante e formal.",
    categoria: "Clássico",
    premium: false,
    barra: "none",
    cabecalho: "centrado",
    divisor: "linha",
    maiusculas: true,
    corPadrao: "#111827",
    tipografiaPadrao: "lora",
  },
  {
    id: "ats-simples",
    nome: "ATS Simples",
    descricao: "Optimizado para sistemas de triagem automática.",
    categoria: "ATS",
    premium: false,
    barra: "none",
    cabecalho: "simples",
    divisor: "linha",
    maiusculas: true,
    corPadrao: "#1F2937",
    tipografiaPadrao: "roboto",
  },
  {
    id: "executivo",
    nome: "Executivo",
    descricao: "Cabeçalho sólido para cargos de gestão.",
    categoria: "Executivo",
    premium: true,
    barra: "none",
    cabecalho: "faixa",
    divisor: "linha",
    maiusculas: true,
    corPadrao: "#0B3B5C",
    tipografiaPadrao: "merriweather",
  },
  {
    id: "gradiente",
    nome: "Gradiente",
    descricao: "Cabeçalho com degradê subtil e moderno.",
    categoria: "Criativo",
    premium: true,
    barra: "none",
    cabecalho: "gradiente",
    divisor: "ponto",
    maiusculas: false,
    corPadrao: "#4338CA",
    tipografiaPadrao: "poppins",
  },
  {
    id: "criativo",
    nome: "Criativo",
    descricao: "Barra lateral colorida para áreas criativas.",
    categoria: "Criativo",
    premium: true,
    barra: "left",
    cabecalho: "gradiente",
    divisor: "ponto",
    maiusculas: false,
    corPadrao: "#BE185D",
    tipografiaPadrao: "poppins",
  },
  {
    id: "compacto",
    nome: "Compacto",
    descricao: "Muita informação numa só página.",
    categoria: "ATS",
    premium: true,
    barra: "none",
    cabecalho: "simples",
    divisor: "barra",
    maiusculas: true,
    corPadrao: "#166534",
    tipografiaPadrao: "sourcesans",
  },
  {
    id: "academico",
    nome: "Académico",
    descricao: "Para bolsas, investigação e docência.",
    categoria: "Clássico",
    premium: true,
    barra: "none",
    cabecalho: "centrado",
    divisor: "linha",
    maiusculas: false,
    corPadrao: "#78350F",
    tipografiaPadrao: "merriweather",
  },
  {
    id: "tecnologia",
    nome: "Tecnologia",
    descricao: "Estrutura técnica com destaque para competências.",
    categoria: "Moderno",
    premium: true,
    barra: "right",
    cabecalho: "faixa",
    divisor: "ponto",
    maiusculas: true,
    corPadrao: "#0369A1",
    tipografiaPadrao: "roboto",
  },
];
export const getModelo = (id: string): ModeloCV =>
  MODELOS.find((m) => m.id === id) ?? (MODELOS[0] as ModeloCV);

