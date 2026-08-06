import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  HelpCircle,
  SkipForward,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { estruturarCurriculoFn } from "@/server/functions/assistente";

export const Route = createFileRoute("/_authenticated/assistente-ia")({
  head: () => ({
    meta: [
      { title: "Criar CV com Assistente IA — Moz Carreira" },
      {
        name: "description",
        content: "Responda a perguntas rápidas e a nossa IA gerará o seu currículo profissional estruturado.",
      },
    ],
  }),
  component: AssistenteIa,
});

interface ChatMessage {
  id: string;
  sender: "assistant" | "user";
  text: string;
}

const QUESTOES = [
  { key: "nome", label: "Nome completo", question: "Para começarmos, qual é o seu **nome completo**?", placeholder: "ex: Ana Macuácua", type: "text" },
  { key: "cargo", label: "Cargo / Especialidade", question: "Muito prazer! Qual é o **cargo ou profissão** que pretende procurar ou sua especialidade?", placeholder: "ex: Gestora de Projectos", type: "text" },
  { key: "email", label: "Contacto - E-mail", question: "Excelente! Qual é o seu **endereço de e-mail** principal?", placeholder: "ex: ana.macuacua@email.co.mz", type: "email" },
  { key: "telefone", label: "Contacto - Telefone", question: "E qual é o seu número de **telefone** de contacto?", placeholder: "ex: +258 84 000 0000", type: "text" },
  { key: "local", label: "Localização", question: "Onde reside atualmente? (Cidade, Província ou País)", placeholder: "ex: Maputo, Moçambique", type: "text" },
  { key: "experiencia", label: "Último Trabalho", question: "Fale-me sobre a sua **última ou atual experiência de trabalho**. Em que empresa trabalhou, qual era o seu cargo e, de forma resumida, o que fazia?", placeholder: "ex: Trabalhei na Empresa Lda como assistente administrativa fazendo atendimento e relatórios...", type: "textarea" },
  { key: "outraExperiencia", label: "Outros Trabalhos (Opcional)", question: "Teve **outras experiências profissionais** relevantes no passado? Se sim, pode indicar as empresas e funções resumidamente. (Ou clique em 'Pular' para avançar).", placeholder: "ex: Fui recepcionista no Hotel X por 2 anos...", type: "textarea", opcional: true },
  { key: "formacao", label: "Formação Académica", question: "Fale-me da sua **formação académica** mais relevante. Indique o curso/grau, o nome da escola ou universidade e o ano de conclusão.", placeholder: "ex: Licenciatura em Gestão de Empresas pela UEM concluída em 2020", type: "textarea" },
  { key: "competenciasIdiomas", label: "Competências e Idiomas", question: "Para terminarmos: quais são as suas principais **habilidades/competências** e quais os **idiomas** que fala?", placeholder: "ex: Organização, Excel avançado, Inglês fluente, Português nativo...", type: "textarea" }
];

function AssistenteIa() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [activeStep, setActiveStep] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [respostas, setRespostas] = useState<Record<string, string>>({
    nome: "",
    cargo: "",
    email: "",
    telefone: "",
    local: "",
    experiencia: "",
    outraExperiencia: "",
    formacao: "",
    competenciasIdiomas: "",
  });

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [gerandoCv, setGerandoCv] = useState(false);
  const [entrevistaConcluida, setEntrevistaConcluida] = useState(false);

  // Initialize chat
  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        sender: "assistant",
        text: "Olá! Sou o assistente virtual da Moz Carreira. 👋\n\nVou ajudar-lhe a criar o seu currículo em poucos minutos através de uma breve entrevista. Não precisa de formatar nada, eu e a IA cuidamos de tudo!",
      },
      {
        id: "q-0",
        sender: "assistant",
        text: QUESTOES[0].question,
      },
    ]);
  }, []);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputValue).trim();
    if (!text && !QUESTOES[activeStep].opcional) return;

    const currentKey = QUESTOES[activeStep].key;

    // Add user response bubble
    const userMsgId = `user-${activeStep}-${Date.now()}`;
    const newMessages = [
      ...messages,
      {
        id: userMsgId,
        sender: "user" as const,
        text: text || "(Sem resposta/Pulado)",
      },
    ];
    setMessages(newMessages);

    // Save answer
    const novasRespostas = { ...respostas, [currentKey]: text };
    setRespostas(novasRespostas);
    setInputValue("");

    const nextStep = activeStep + 1;
    if (nextStep < QUESTOES.length) {
      setActiveStep(nextStep);
      // Simulate typing delay for natural chat feel
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `q-${nextStep}-${Date.now()}`,
            sender: "assistant",
            text: QUESTOES[nextStep].question,
          },
        ]);
      }, 600);
    } else {
      setEntrevistaConcluida(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: `concluido-${Date.now()}`,
            sender: "assistant",
            text: "Excelente! Concluímos a recolha de informações. 🎉\n\nAgora posso polir, organizar e formatar tudo profissionalmente. Clique no botão abaixo para gerar o seu currículo perfeito com IA!",
          },
        ]);
      }, 600);
    }
  };

  const handleSkip = () => {
    if (QUESTOES[activeStep].opcional) {
      handleSend("");
    }
  };

  const handleGerarCv = async () => {
    setGerandoCv(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) {
        throw new Error("Sessão expirada. Faça login novamente.");
      }

      // Call server function
      const res = await estruturarCurriculoFn({
        respostas: respostas as any,
        authToken: token,
      });

      toast.success("Currículo estruturado e gerado com sucesso pela IA!");
      // Redirect to builder page with new CV id
      navigate({ to: "/editar-cv", search: { cv: res.curriculoId } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erro desconhecido ao gerar o currículo.");
    } finally {
      setGerandoCv(false);
    }
  };

  const percentagem = Math.round((activeStep / QUESTOES.length) * 100);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl shrink-0">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
          <Button asChild variant="ghost" size="sm">
            <Link to="/painel">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Painel
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent animate-pulse" />
            <h1 className="text-sm font-semibold">Assistente de CV Inteligente</h1>
          </div>
          <div className="w-16" /> {/* Balance layout */}
        </div>
      </header>

      {/* Progress Bar */}
      {!entrevistaConcluida && (
        <div className="h-1 bg-muted shrink-0">
          <div
            className="h-full bg-accent transition-all duration-300"
            style={{ width: `${percentagem}%` }}
          />
        </div>
      )}

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto px-4 py-8 flex flex-col justify-between max-w-4xl w-full mx-auto">
        <div className="flex-1 flex flex-col gap-4">
          {messages.map((m) => {
            const isAssistant = m.sender === "assistant";
            return (
              <div
                key={m.id}
                className={`flex gap-3 max-w-[85%] ${
                  isAssistant ? "self-start" : "self-end flex-row-reverse"
                } animate-rise`}
              >
                {/* Avatar Icon */}
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs ${
                    isAssistant
                      ? "bg-accent text-accent-foreground"
                      : "bg-primary-soft text-primary"
                  }`}
                >
                  {isAssistant ? <Sparkles className="h-4 w-4" /> : "Eu"}
                </span>

                {/* Message Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line shadow-soft ${
                    isAssistant
                      ? "bg-card border border-border/60 text-foreground"
                      : "bg-primary text-primary-foreground font-medium"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Control Box */}
        <div className="mt-6 shrink-0">
          {entrevistaConcluida ? (
            <Card className="border-border/70 p-6 shadow-lift text-center flex flex-col items-center gap-4 bg-gradient-soft animate-rise">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-accent-soft text-accent">
                <CheckCircle className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-bold text-lg">Entrevista Concluída!</h3>
                <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                  Tudo pronto. O nosso assistente IA vai redigir tópicos profissionais e organizar as secções do seu currículo.
                </p>
              </div>
              <Button onClick={handleGerarCv} disabled={gerandoCv} className="w-full max-w-xs mt-2">
                {gerandoCv ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    A estruturar CV com IA...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Gerar Currículo com IA
                  </>
                )}
              </Button>
            </Card>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                {QUESTOES[activeStep]?.type === "textarea" ? (
                  <Textarea
                    placeholder={QUESTOES[activeStep]?.placeholder}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    rows={3}
                    className="w-full resize-none pr-10 shadow-soft"
                  />
                ) : (
                  <Input
                    placeholder={QUESTOES[activeStep]?.placeholder}
                    value={inputValue}
                    type={QUESTOES[activeStep]?.type}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSend();
                      }
                    }}
                    className="w-full shadow-soft"
                  />
                )}
              </div>

              <div className="flex gap-1.5">
                {QUESTOES[activeStep]?.opcional && (
                  <Button
                    variant="outline"
                    onClick={handleSkip}
                    title="Pular esta pergunta"
                    className="shadow-soft"
                  >
                    <SkipForward className="h-4 w-4 mr-1.5" /> Pular
                  </Button>
                )}
                <Button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() && !QUESTOES[activeStep]?.opcional}
                  title="Enviar resposta"
                  className="shadow-soft"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
