import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export const gerarCartaFn = createServerFn({ method: "POST" })
  .validator(
    (d: {
      curriculoId: string;
      tipo: "apresentacao" | "motivacao";
      tituloVaga: string;
      empresa: string;
      descricaoVaga: string;
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

    const { data: cv, error: cvErr } = await supabase
      .from("curriculos")
      .select("*")
      .eq("id", data.curriculoId)
      .single();

    if (cvErr || !cv) {
      throw new Error(`Currículo não encontrado ou sem permissão de acesso: ${cvErr?.message}`);
    }

    const dadosPessoais = (cv.dados_pessoais as Record<string, any>) || {};

    const { data: experiencias } = await supabase
      .from("experiencias")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const { data: formacoes } = await supabase
      .from("formacoes")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const { data: competencias } = await supabase
      .from("competencias")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const { data: idiomas } = await supabase
      .from("idiomas")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const { data: certificados } = await supabase
      .from("certificados")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const { data: projetos } = await supabase
      .from("projetos")
      .select("*")
      .eq("curriculo_id", data.curriculoId)
      .order("ordem");

    const prompt = `Você é um especialista em recrutamento e redação profissional em Moçambique.
Escreva uma ${data.tipo === "apresentacao" ? "carta de apresentação" : "carta de motivação"} formal e cativante em português de Moçambique (pt-MZ).
A carta deve ser personalizada para a seguinte vaga:
Título da Vaga: ${data.tituloVaga}
Empresa: ${data.empresa}
Descrição da Vaga/Requisitos: ${data.descricaoVaga}

Use as seguintes informações do candidato extraídas do seu currículo:
Nome: ${dadosPessoais.nome || "Candidato"}
Profissão: ${dadosPessoais.cargo || ""}
Contacto: ${dadosPessoais.email || ""} · ${dadosPessoais.telefone || ""}
Localização: ${dadosPessoais.local || "Moçambique"}

Resumo Profissional:
${dadosPessoais.resumo || ""}

Experiências Profissionais:
${(experiencias || []).map(e => `- ${e.cargo} na ${e.empresa} (${e.data_inicio} a ${e.atual ? "Presente" : e.data_fim}): ${e.descricao || ""}`).join("\n")}

Formações Académicas:
${(formacoes || []).map(f => `- ${f.curso} na ${f.instituicao} (${f.data_inicio} a ${f.atual ? "Presente" : f.data_fim})`).join("\n")}

Competências:
${(competencias || []).map(c => `- ${c.nome} (Nível ${c.nivel}/5)`).join("\n")}

Idiomas:
${(idiomas || []).map(i => `- ${i.idioma} (${i.nivel})`).join("\n")}

Certificados:
${(certificados || []).map(c => `- ${c.nome} pela ${c.instituicao || ""}`).join("\n")}

Projectos:
${(projetos || []).map(p => `- ${p.nome}: ${p.descricao || ""}`).join("\n")}

Instruções importantes:
- Adicione os dados de contacto do candidato no topo da carta.
- Coloque a data formatada (ex: Maputo, [Data Atual] ou deixar espaço para preenchimento).
- Faça uma ligação forte entre o percurso do candidato e os requisitos da vaga.
- O tom deve ser profissional, cortês, confiante e extremamente motivado.
- Limite o texto a cerca de 300-400 palavras.
- Não adicione introduções como "Aqui está a carta" ou comentários externos, responda apenas e estritamente com o texto da carta de apresentação ou motivação.`;

    const geminiKey = process.env.GEMINI_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

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
          throw new Error(`API Gemini respondeu com erro: ${errText}`);
        }

        const resData = await response.json();
        const generatedText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!generatedText) {
          throw new Error("API Gemini não retornou nenhum texto de resposta.");
        }

        return { texto: generatedText };
      } catch (e) {
        throw new Error(`Falha ao gerar com Gemini: ${e instanceof Error ? e.message : String(e)}`);
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
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errText = await response.text();
          throw new Error(`API OpenAI respondeu com erro: ${errText}`);
        }

        const resData = await response.json();
        const generatedText = resData.choices?.[0]?.message?.content;
        if (!generatedText) {
          throw new Error("API OpenAI não retornou nenhum texto de resposta.");
        }

        return { texto: generatedText };
      } catch (e) {
        throw new Error(`Falha ao gerar com OpenAI: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      throw new Error(
        "Configuração de Inteligência Artificial pendente: Por favor, adicione a variável de ambiente GEMINI_API_KEY ou OPENAI_API_KEY no painel do Vercel ou no arquivo .env local."
      );
    }
  });
