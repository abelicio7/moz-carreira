import type { ModeloCV } from "@/lib/cv/modelos";
import {
  getEscala,
  getFamilia,
  normalizarOrdem,
  normalizarVisiveis,
  type SeccaoId,
} from "@/lib/cv/personalizacao";
import { temConteudo, type DadosCV } from "@/lib/cv/dados";

export interface OpcoesCV {
  cor: string;
  tipografia: string;
  espacamento: string;
  tamanhoFonte: number;
  ordem: SeccaoId[];
  visiveis: Record<SeccaoId, boolean>;
}

interface Props {
  modelo: ModeloCV;
  opcoes: OpcoesCV;
  dados: DadosCV;
}

const TITULOS: Record<SeccaoId, string> = {
  resumo: "Resumo profissional",
  experiencias: "Experiência profissional",
  formacoes: "Formação académica",
  competencias: "Competências",
  idiomas: "Idiomas",
  certificados: "Certificados",
  projetos: "Projectos",
  referencias: "Referências",
};

const SECCOES_BARRA: SeccaoId[] = ["competencias", "idiomas", "certificados"];

export function CVPreview({ modelo, opcoes, dados }: Props) {
  const escala = getEscala(opcoes.espacamento);
  const base = opcoes.tamanhoFonte;
  const gap = 14 * escala;
  const cor = opcoes.cor;
  const ordem = normalizarOrdem(opcoes.ordem);
  const visiveis = normalizarVisiveis(opcoes.visiveis);

  const activas = ordem.filter((id) => visiveis[id] && temConteudo(dados, id));
  const temBarra = modelo.barra !== "none";
  const naBarra = temBarra ? activas.filter((s) => SECCOES_BARRA.includes(s)) : [];
  const principais = activas.filter((s) => !naBarra.includes(s));

  const Titulo = ({ children }: { children: string }) => (
    <div style={{ marginBottom: gap * 0.45 }}>
      <h3
        style={{
          fontSize: base * 1.08,
          fontWeight: 700,
          color: cor,
          textTransform: modelo.maiusculas ? "uppercase" : "none",
          letterSpacing: modelo.maiusculas ? "0.08em" : "0.01em",
          margin: 0,
        }}
      >
        {children}
      </h3>
      {modelo.divisor === "linha" && (
        <div style={{ height: 1, background: `${cor}44`, marginTop: 4 }} />
      )}
      {modelo.divisor === "barra" && (
        <div style={{ height: 3, width: 44, background: cor, marginTop: 4, borderRadius: 2 }} />
      )}
      {modelo.divisor === "ponto" && (
        <div style={{ display: "flex", gap: 3, marginTop: 5 }}>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{ width: 5, height: 5, borderRadius: 99, background: cor, opacity: 1 - i * 0.3 }}
            />
          ))}
        </div>
      )}
    </div>
  );

  const contactos = [dados.email, dados.telefone, dados.local, dados.linkedin].filter(Boolean);

  const renderSeccao = (id: SeccaoId, compacta = false) => {
    const conteudo = () => {
      switch (id) {
        case "resumo":
          return <p style={{ margin: 0, lineHeight: 1.55 }}>{dados.resumo}</p>;
        case "experiencias":
          return (
            <div style={{ display: "grid", gap: gap * 0.7 }}>
              {dados.experiencias.map((e, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: base * 1.02 }}>{e.cargo}</strong>
                    <span style={{ fontSize: base * 0.9, opacity: 0.7, whiteSpace: "nowrap" }}>
                      {e.periodo}
                    </span>
                  </div>
                  <div style={{ color: cor, fontSize: base * 0.95 }}>
                    {e.empresa}
                    {e.local ? ` · ${e.local}` : ""}
                  </div>
                  {e.descricao && (
                    <p style={{ margin: "3px 0 0", lineHeight: 1.5, opacity: 0.85 }}>{e.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "formacoes":
          return (
            <div style={{ display: "grid", gap: gap * 0.6 }}>
              {dados.formacoes.map((f, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <strong style={{ fontSize: base * 1.02 }}>{f.curso}</strong>
                    <span style={{ fontSize: base * 0.9, opacity: 0.7, whiteSpace: "nowrap" }}>
                      {f.periodo}
                    </span>
                  </div>
                  <div style={{ color: cor, fontSize: base * 0.95 }}>{f.instituicao}</div>
                  {f.descricao && (
                    <p style={{ margin: "3px 0 0", lineHeight: 1.5, opacity: 0.85 }}>{f.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "competencias":
          return (
            <div style={{ display: "grid", gap: gap * 0.35 }}>
              {dados.competencias.map((c, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{c.nome}</span>
                  </div>
                  <div
                    style={{
                      height: 4,
                      borderRadius: 99,
                      background: compacta ? "rgba(255,255,255,0.25)" : `${cor}22`,
                      marginTop: 3,
                    }}
                  >
                    <div
                      style={{
                        width: `${(c.nivel / 5) * 100}%`,
                        height: "100%",
                        borderRadius: 99,
                        background: compacta ? "#fff" : cor,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          );
        case "idiomas":
          return (
            <div style={{ display: "grid", gap: gap * 0.3 }}>
              {dados.idiomas.map((l, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                  <span>{l.idioma}</span>
                  <span style={{ opacity: 0.75 }}>{l.nivel}</span>
                </div>
              ))}
            </div>
          );
        case "certificados":
          return (
            <div style={{ display: "grid", gap: gap * 0.3 }}>
              {dados.certificados.map((c, i) => (
                <div key={i}>
                  <div>{c.nome}</div>
                  <div style={{ fontSize: base * 0.9, opacity: 0.75 }}>
                    {[c.instituicao, c.data].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          );
        case "projetos":
          return (
            <div style={{ display: "grid", gap: gap * 0.45 }}>
              {dados.projetos.map((p, i) => (
                <div key={i}>
                  <strong>{p.nome}</strong>
                  {p.descricao && (
                    <p style={{ margin: "2px 0 0", lineHeight: 1.5, opacity: 0.85 }}>{p.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "referencias":
          return (
            <div style={{ display: "grid", gap: gap * 0.45 }}>
              {dados.referencias.map((r, i) => (
                <div key={i}>
                  <strong>{r.nome}</strong>
                  <div style={{ fontSize: base * 0.92, opacity: 0.8 }}>
                    {[r.cargo, r.empresa, r.telefone].filter(Boolean).join(" · ")}
                  </div>
                </div>
              ))}
            </div>
          );
      }
    };

    if (compacta) {
      return (
        <section key={id} style={{ marginBottom: gap }}>
          <h3
            style={{
              fontSize: base * 1.02,
              fontWeight: 700,
              margin: `0 0 ${gap * 0.35}px`,
              textTransform: modelo.maiusculas ? "uppercase" : "none",
              letterSpacing: "0.06em",
            }}
          >
            {TITULOS[id]}
          </h3>
          {conteudo()}
        </section>
      );
    }

    return (
      <section key={id} style={{ marginBottom: gap * 1.3 }}>
        <Titulo>{TITULOS[id]}</Titulo>
        {conteudo()}
      </section>
    );
  };

  const cabecalhoEscuro = modelo.cabecalho === "faixa" || modelo.cabecalho === "gradiente";

  const cabecalho = (
    <header
      style={{
        background:
          modelo.cabecalho === "faixa"
            ? cor
            : modelo.cabecalho === "gradiente"
              ? `linear-gradient(120deg, ${cor} 0%, ${cor}bb 60%, ${cor}77 100%)`
              : "transparent",
        color: cabecalhoEscuro ? "#fff" : "inherit",
        padding: cabecalhoEscuro ? `${gap * 1.3}px ${gap * 1.6}px` : `0 0 ${gap}px`,
        textAlign: modelo.cabecalho === "centrado" ? "center" : "left",
        borderBottom: modelo.cabecalho === "centrado" ? `2px solid ${cor}` : undefined,
        marginBottom: gap * 1.2,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: base * 2.1,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: cabecalhoEscuro ? "#fff" : cor,
        }}
      >
        {dados.nome}
      </h1>
      <p style={{ margin: "2px 0 0", fontSize: base * 1.1, opacity: 0.85 }}>{dados.cargo}</p>
      <p
        style={{
          margin: `${gap * 0.5}px 0 0`,
          fontSize: base * 0.9,
          opacity: 0.85,
          display: "flex",
          flexWrap: "wrap",
          gap: "4px 10px",
          justifyContent: modelo.cabecalho === "centrado" ? "center" : "flex-start",
        }}
      >
        {contactos.map((c) => (
          <span key={c}>{c}</span>
        ))}
      </p>
    </header>
  );

  const barra = temBarra && (
    <aside
      style={{
        background: cor,
        color: "#fff",
        padding: `${gap * 1.3}px ${gap * 1.1}px`,
        width: "34%",
        flexShrink: 0,
      }}
    >
      <section style={{ marginBottom: gap }}>
        <h3
          style={{
            fontSize: base * 1.02,
            fontWeight: 700,
            margin: `0 0 ${gap * 0.35}px`,
            textTransform: modelo.maiusculas ? "uppercase" : "none",
            letterSpacing: "0.06em",
          }}
        >
          Contactos
        </h3>
        <div style={{ display: "grid", gap: 3, wordBreak: "break-word" }}>
          {contactos.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </section>
      {naBarra.map((id) => renderSeccao(id, true))}
    </aside>
  );

  return (
    <div
      style={{
        fontFamily: getFamilia(opcoes.tipografia),
        fontSize: base,
        color: "#1a1a1a",
        background: "#fff",
        display: "flex",
        flexDirection: modelo.barra === "right" ? "row-reverse" : "row",
        minHeight: "100%",
      }}
    >
      {barra}
      <div style={{ flex: 1, padding: cabecalhoEscuro && !temBarra ? 0 : `${gap * 1.4}px ${gap * 1.6}px`, minWidth: 0 }}>
        {cabecalhoEscuro && !temBarra ? (
          <>
            {cabecalho}
            <div style={{ padding: `0 ${gap * 1.6}px ${gap * 1.4}px` }}>
              {principais.map((id) => renderSeccao(id))}
            </div>
          </>
        ) : (
          <>
            {temBarra ? (
              <header style={{ marginBottom: gap * 1.2 }}>
                <h1 style={{ margin: 0, fontSize: base * 2, fontWeight: 700, color: cor }}>
                  {dados.nome}
                </h1>
                <p style={{ margin: "2px 0 0", fontSize: base * 1.1, opacity: 0.8 }}>{dados.cargo}</p>
              </header>
            ) : (
              cabecalho
            )}
            {principais.map((id) => renderSeccao(id))}
          </>
        )}
      </div>
    </div>
  );
}
