import type { SeccaoId } from "./personalizacao";

export interface DadosCV {
  nome: string;
  cargo: string;
  email: string;
  telefone: string;
  local: string;
  linkedin?: string;
  resumo: string;
  experiencias: { cargo: string; empresa: string; local?: string; periodo: string; descricao?: string }[];
  formacoes: { curso: string; instituicao: string; periodo: string; descricao?: string }[];
  competencias: { nome: string; nivel: number }[];
  idiomas: { idioma: string; nivel: string }[];
  certificados: { nome: string; instituicao?: string; data?: string }[];
  projetos: { nome: string; descricao?: string; url?: string }[];
  referencias: { nome: string; cargo?: string; empresa?: string; telefone?: string }[];
}

export const DADOS_EXEMPLO: DadosCV = {
  nome: "Ana Cristina Macuácua",
  cargo: "Gestora de Projectos",
  email: "ana.macuacua@email.co.mz",
  telefone: "+258 84 123 4567",
  local: "Maputo, Moçambique",
  linkedin: "linkedin.com/in/anamacuacua",
  resumo:
    "Gestora de projectos com 7 anos de experiência em programas de desenvolvimento e sector privado em Moçambique. Especialista em planeamento, gestão de equipas multiculturais e relatórios para doadores internacionais.",
  experiencias: [
    {
      cargo: "Gestora de Projectos Sénior",
      empresa: "Fundação Horizonte MZ",
      local: "Maputo",
      periodo: "Mar 2021 — Presente",
      descricao:
        "Coordenação de 6 projectos comunitários com orçamento anual de 1,2M USD. Aumento de 35% na execução orçamental.",
    },
    {
      cargo: "Coordenadora de Operações",
      empresa: "Delta Logística, Lda",
      local: "Beira",
      periodo: "Jan 2018 — Fev 2021",
      descricao: "Gestão de equipa de 18 colaboradores e redução de 22% nos custos operacionais.",
    },
  ],
  formacoes: [
    {
      curso: "Licenciatura em Gestão",
      instituicao: "Universidade Eduardo Mondlane",
      periodo: "2013 — 2017",
      descricao: "Média final de 16 valores.",
    },
    { curso: "Pós-graduação em Gestão de Projectos", instituicao: "ISCTEM", periodo: "2019" },
  ],
  competencias: [
    { nome: "Gestão de projectos", nivel: 5 },
    { nome: "Orçamentação", nivel: 4 },
    { nome: "Microsoft Excel", nivel: 5 },
    { nome: "Liderança de equipas", nivel: 4 },
    { nome: "Relatórios para doadores", nivel: 4 },
  ],
  idiomas: [
    { idioma: "Português", nivel: "Nativo" },
    { idioma: "Inglês", nivel: "Avançado" },
    { idioma: "Changana", nivel: "Fluente" },
  ],
  certificados: [
    { nome: "PMP — Project Management Professional", instituicao: "PMI", data: "2022" },
    { nome: "Gestão Financeira para ONGs", instituicao: "Coursera", data: "2020" },
  ],
  projetos: [
    { nome: "Programa Água para Todos", descricao: "12 furos de água em Gaza, 8.000 beneficiários." },
    { nome: "Plataforma de Monitoria", descricao: "Sistema interno de indicadores em tempo real." },
  ],
  referencias: [
    { nome: "Dr. Paulo Nhantumbo", cargo: "Director Executivo", empresa: "Fundação Horizonte MZ", telefone: "+258 82 000 0000" },
  ],
};

export const temConteudo = (dados: DadosCV, seccao: SeccaoId) => {
  if (seccao === "resumo") return Boolean(dados.resumo);
  const valor = dados[seccao];
  return Array.isArray(valor) && valor.length > 0;
};
