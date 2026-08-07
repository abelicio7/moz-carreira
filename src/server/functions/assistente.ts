import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const estruturarCurriculoFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      respostas: {
        nome: string;
        cargo: string;
        email: string;
        telefone: string;
        local: string;
        experiencia: string;
        outraExperiencia: string;
        formacao: string;
        competenciasIdiomas: string;
      };
      authToken: string;
    }) => d
  )
  .handler(async ({ data }) => {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const supabaseAnonKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Configuração do Supabase em falta no servidor.");
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${data.authToken}`,
        },
      },
    });

    const { data: auth, error: authErr } = await supabase.auth.getUser();
    if (authErr || !auth.user) {
      throw new Error("Sessão expirada. Faça login novamente.");
    }

    const prompt = `Você é um especialista em estruturação de currículos e atua em Moçambique.
Você receberá respostas brutas e informais coletadas de uma entrevista com um candidato.
O seu objetivo é:
1. Corrigir gramática, organizar e expandir as respostas de forma extremamente profissional.
2. Gerar descrições detalhadas e orientadas a conquistas para cada experiência profissional (ex: expandir de "trabalhei no caixa da loja" para "Responsável pela gestão de caixa diária, conciliação de pagamentos e atendimento ao cliente...").
3. Retornar os dados estruturados no formato JSON abaixo. Não escreva comentários, introduções ou explicações. Responda apenas com o JSON bruto.

Estrutura do JSON esperada:
{
  "titulo": "Currículo de [Nome] - [Cargo]",
  "dados_pessoais": {
    "nome": "[Nome completo]",
    "cargo": "[Cargo pretendido]",
    "email": "[Email do candidato]",
    "telefone": "[Telefone do candidato]",
    "local": "[Localização do candidato]"
  },
  "experiencias": [
    {
      "empresa": "[Nome da empresa]",
      "cargo": "[Cargo ocupado]",
      "descricao": "[Descrição detalhada e profissional das responsabilidades e conquistas, em tópicos claros]",
      "local": "[Cidade/Província]",
      "data_inicio": "[Ano de início ou Mês/Ano]",
      "data_fim": "[Ano de fim ou Mês/Ano]",
      "atual": [true se trabalha lá atualmente, false caso contrário]
    }
  ],
  "formacoes": [
    {
      "instituicao": "[Nome da instituição escolar]",
      "curso": "[Curso/Grau obtido]",
      "nivel": "[Nível académico, ex: Licenciatura, Técnico Médio, etc.]",
      "descricao": "[Destaques, notas ou detalhes opcionais]",
      "data_inicio": "[Ano de início]",
      "data_fim": "[Ano de fim]",
      "atual": [true se estuda lá atualmente, false caso contrário]
    }
  ],
  "competencias": [
    {
      "nome": "[Nome da competência/habilidade técnica ou interpessoal]",
      "nivel": [Nível avaliado de 1 a 5, como número de 1 a 5]
    }
  ],
  "idiomas": [
    {
      "idioma": "[Nome do idioma]",
      "nivel": "[Nível, ex: Básico, Intermédio, Fluente, Nativo]"
    }
  ]
}

Respostas brutas da entrevista do candidato:
Nome: ${data.respostas.nome}
Cargo pretendido: ${data.respostas.cargo}
Email: ${data.respostas.email}
Telefone: ${data.respostas.telefone}
Localização: ${data.respostas.local}
Experiência de trabalho: ${data.respostas.experiencia}
Outra experiência: ${data.respostas.outraExperiencia}
Formação académica: ${data.respostas.formacao}
Competências e Idiomas: ${data.respostas.competenciasIdiomas}`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;
    let rawText = "";

    if (geminiKey) {
      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: prompt,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`Gemini erro: ${errText}`);
        }

        const resData = await response.json();
        rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (e) {
        throw new Error(`Falha Gemini: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else if (openaiKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            temperature: 0.3,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`OpenAI erro: ${errText}`);
        }

        const resData = await response.json();
        rawText = resData.choices?.[0]?.message?.content || "";
      } catch (e) {
        throw new Error(`Falha OpenAI: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      throw new Error(
        "Configuração de Inteligência Artificial pendente: Por favor, adicione a variável de ambiente GEMINI_API_KEY ou OPENAI_API_KEY no painel do Vercel ou no arquivo .env local."
      );
    }

    if (!rawText) {
      throw new Error("A IA não retornou nenhuma resposta.");
    }

    // Parse JSON safely
    let parsedJson: any;
    try {
      let jsonString = rawText.trim();
      if (jsonString.includes("```")) {
        const match = jsonString.match(/```(?:json)?([\s\S]*?)```/);
        if (match && match[1]) {
          jsonString = match[1].trim();
        }
      }
      parsedJson = JSON.parse(jsonString);
    } catch (e) {
      console.error("Erro ao analisar resposta da IA como JSON. Resposta bruta:", rawText);
      throw new Error("A resposta da IA não pôde ser analisada como dados estruturados. Tente refinar suas respostas.");
    }

    // 6. Save structured CV to Supabase
    const { data: newCv, error: cvErr } = await supabase
      .from("curriculos")
      .insert({
        user_id: auth.user.id,
        titulo: parsedJson.titulo || `Currículo de ${parsedJson.dados_pessoais?.nome || "Candidato"}`,
        dados_pessoais: parsedJson.dados_pessoais || {},
        modelo: "minimalista",
        ordem_seccoes: ["dados_pessoais", "resumo", "experiencias", "formacoes", "competencias", "idiomas"],
        seccoes_visiveis: {
          dados_pessoais: true,
          resumo: true,
          experiencias: true,
          formacoes: true,
          competencias: true,
          idiomas: true,
          certificados: false,
          projetos: false,
          referencias: false,
        },
      })
      .select("id")
      .single();

    if (cvErr || !newCv) {
      throw new Error(`Erro ao criar currículo no banco de dados: ${cvErr?.message}`);
    }

    // Experiences
    if (parsedJson.experiencias && Array.isArray(parsedJson.experiencias) && parsedJson.experiencias.length > 0) {
      const exps = parsedJson.experiencias.map((e: any, idx: number) => ({
        curriculo_id: newCv.id,
        user_id: auth.user.id,
        empresa: e.empresa || "",
        cargo: e.cargo || "",
        descricao: e.descricao || "",
        local: e.local || "",
        data_inicio: String(e.data_inicio || ""),
        data_fim: String(e.data_fim || ""),
        atual: !!e.atual,
        ordem: idx,
      }));
      await supabase.from("experiencias").insert(exps);
    }

    // Formations
    if (parsedJson.formacoes && Array.isArray(parsedJson.formacoes) && parsedJson.formacoes.length > 0) {
      const forms = parsedJson.formacoes.map((f: any, idx: number) => ({
        curriculo_id: newCv.id,
        user_id: auth.user.id,
        instituicao: f.instituicao || "",
        curso: f.curso || "",
        nivel: f.nivel || "",
        descricao: f.descricao || "",
        data_inicio: String(f.data_inicio || ""),
        data_fim: String(f.data_fim || ""),
        atual: !!f.atual,
        ordem: idx,
      }));
      await supabase.from("formacoes").insert(forms);
    }

    // Competencies
    if (parsedJson.competencias && Array.isArray(parsedJson.competencias) && parsedJson.competencias.length > 0) {
      const comps = parsedJson.competencias.map((c: any, idx: number) => ({
        curriculo_id: newCv.id,
        user_id: auth.user.id,
        nome: c.nome || "",
        nivel: typeof c.nivel === "number" ? Math.max(1, Math.min(5, c.nivel)) : 3,
        ordem: idx,
      }));
      await supabase.from("competencias").insert(comps);
    }

    // Languages
    if (parsedJson.idiomas && Array.isArray(parsedJson.idiomas) && parsedJson.idiomas.length > 0) {
      const idis = parsedJson.idiomas.map((i: any, idx: number) => ({
        curriculo_id: newCv.id,
        user_id: auth.user.id,
        idioma: i.idioma || "",
        nivel: i.nivel || "Intermédio",
        ordem: idx,
      }));
      await supabase.from("idiomas").insert(idis);
    }

    return { curriculoId: newCv.id };
  });
