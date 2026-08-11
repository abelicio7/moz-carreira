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

  const paddingMain = temBarra
    ? (modelo.barra === "right" ? "18mm 15mm 18mm 18mm" : "18mm 18mm 18mm 15mm")
    : "18mm";

  const paddingBarra = modelo.barra === "right"
    ? "18mm 18mm 18mm 12mm"
    : "18mm 12mm 18mm 18mm";

  if (modelo.id === "mocambicano") {
    const seccoesMocambicanas = [
      { id: "dados_pessoais", titulo: "IDENTIFICAÇÃO PESSOAL", temConteudo: true },
      { id: "formacoes", titulo: "HABILITAÇÕES LITERÁRIAS", temConteudo: dados.formacoes.length > 0 },
      { id: "certificados", titulo: "FORMAÇÃO PROFISSIONAL", temConteudo: dados.certificados.length > 0 },
      { id: "experiencias", titulo: "EXPERIÊNCIA PROFISSIONAL", temConteudo: dados.experiencias.length > 0 },
      { id: "idiomas", titulo: "LÍNGUAS", temConteudo: dados.idiomas.length > 0 },
      { id: "resumo", titulo: "APTIDÃO", temConteudo: !!dados.resumo || (dados.competencias && dados.competencias.length > 0) },
      { id: "contactos", titulo: "CONTACTOS", temConteudo: !!dados.telefone || !!dados.email || (dados.referencias && dados.referencias.length > 0) },
    ].filter((s) => s.temConteudo);

    const renderConteudoMocambicano = (id: string) => {
      switch (id) {
        case "dados_pessoais":
          const parts = dados.nome.trim().split(" ");
          const apelido = parts.length > 1 ? parts[parts.length - 1] : "";
          const nomes = parts.length > 1 ? parts.slice(0, -1).join(" ") : dados.nome;
          const filiacao = dados.filiacao || "";
          const nacionalidade = dados.nacionalidade || "Moçambicano(a)";
          const dataNascimento = dados.data_nascimento || "";
          const localNascimento = dados.local_nascimento || "";
          const bi = dados.bi || "";
          const estadoCivil = dados.estado_civil || "Solteiro(a)";
          const residencia = dados.local || "";

          return (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "180px 1fr",
                gap: "6px 12px",
                lineHeight: 1.15,
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              <strong>Apelido:</strong>
              <span>{apelido}</span>

              <strong>Nomes:</strong>
              <strong style={{ fontWeight: 700 }}>{nomes}</strong>

              <strong>Nacionalidade:</strong>
              <span>{nacionalidade}</span>

              {filiacao && (
                <>
                  <strong>Filiação:</strong>
                  <span>{filiacao}</span>
                </>
              )}

              {dataNascimento && (
                <>
                  <strong>Data de nascimento:</strong>
                  <span>{dataNascimento}</span>
                </>
              )}

              {localNascimento && (
                <>
                  <strong>Local de nascimento:</strong>
                  <span>{localNascimento}</span>
                </>
              )}

              {bi && (
                <>
                  <strong>B.I. Nº:</strong>
                  <span>{bi}</span>
                </>
              )}

              <strong>Estado civil:</strong>
              <span>{estadoCivil}</span>

              <strong>Residência:</strong>
              <span>{residencia}</span>
            </div>
          );
        case "formacoes":
          return (
            <div style={{ display: "grid", gap: "6px", fontFamily: "'Times New Roman', Times, serif" }}>
              {dados.formacoes.map((f, i) => (
                <div key={i} style={{ lineHeight: 1.15 }}>
                  {f.periodo && <span>{f.periodo} - </span>}
                  <span>{f.curso} na {f.instituicao}</span>
                  {f.descricao && <span style={{ opacity: 0.85 }}> ({f.descricao})</span>}
                </div>
              ))}
            </div>
          );
        case "certificados":
          return (
            <div style={{ display: "grid", gap: "6px", fontFamily: "'Times New Roman', Times, serif" }}>
              {dados.certificados.map((c, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.15 }}>
                  <span style={{ fontWeight: "bold" }}>&gt;</span>
                  <div>
                    <span>{c.nome}</span>
                    {c.instituicao && <span> na {c.instituicao}</span>}
                    {c.data && <span> ({c.data})</span>}
                  </div>
                </div>
              ))}
            </div>
          );
        case "experiencias":
          return (
            <div style={{ display: "grid", gap: "6px", fontFamily: "'Times New Roman', Times, serif" }}>
              {dados.experiencias.map((e, i) => (
                <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.15 }}>
                  <span style={{ fontWeight: "bold" }}>&gt;</span>
                  <div>
                    <span>
                      {e.cargo} {e.empresa ? `nas ${e.empresa}` : ""} {e.local ? `em ${e.local}` : ""}{" "}
                      {e.periodo ? `(${e.periodo})` : ""}
                    </span>
                    {e.descricao && <p style={{ margin: "4px 0 0", lineHeight: 1.15, opacity: 0.9 }}>{e.descricao}</p>}
                  </div>
                </div>
              ))}
            </div>
          );
        case "idiomas":
          return (
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                margin: "10px 0",
                border: "1px solid #000",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              <thead>
                <tr>
                  <th style={{ border: "1px solid #000", padding: "6px 12px", textAlign: "left" }}>Línguas</th>
                  <th style={{ border: "1px solid #000", padding: "6px 12px", textAlign: "left" }}>Escrita</th>
                  <th style={{ border: "1px solid #000", padding: "6px 12px", textAlign: "left" }}>Fala</th>
                  <th style={{ border: "1px solid #000", padding: "6px 12px", textAlign: "left" }}>Percepção</th>
                </tr>
              </thead>
              <tbody>
                {dados.idiomas.map((l, i) => {
                  const nivel = l.nivel || "Fluente";
                  return (
                    <tr key={i}>
                      <td style={{ border: "1px solid #000", padding: "6px 12px" }}>
                        <strong>{l.idioma}</strong>
                      </td>
                      <td style={{ border: "1px solid #000", padding: "6px 12px" }}>{nivel}</td>
                      <td style={{ border: "1px solid #000", padding: "6px 12px" }}>{nivel}</td>
                      <td style={{ border: "1px solid #000", padding: "6px 12px" }}>{nivel}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          );
        case "resumo":
          return (
            <div style={{ display: "grid", gap: "6px", fontFamily: "'Times New Roman', Times, serif" }}>
              {dados.resumo && (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.15 }}>
                  <span style={{ fontWeight: "bold" }}>&gt;</span>
                  <span>{dados.resumo}</span>
                </div>
              )}
              {dados.competencias && dados.competencias.length > 0 && (
                <div style={{ display: "grid", gap: "6px" }}>
                  {dados.competencias.map((c, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", lineHeight: 1.15 }}>
                      <span style={{ fontWeight: "bold" }}>&gt;</span>
                      <span>{c.nome}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        case "contactos":
          return (
            <ul
              style={{
                paddingLeft: "20px",
                margin: 0,
                display: "grid",
                gap: "6px",
                listStyleType: "disc",
                fontFamily: "'Times New Roman', Times, serif",
              }}
            >
              {dados.telefone && (
                <li>
                  <span>{dados.telefone} Pessoal</span>
                </li>
              )}
              {dados.email && (
                <li>
                  <span>{dados.email} Pessoal</span>
                </li>
              )}
              {dados.referencias &&
                dados.referencias.map((r, i) => (
                  <li key={i}>
                    <span>
                      {r.telefone} ({r.nome} - {r.cargo || "Referência"})
                    </span>
                  </li>
                ))}
            </ul>
          );
        default:
          return null;
      }
    };

    const ROMANOS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

    return (
      <div
        style={{
          fontFamily: "'Times New Roman', Times, serif",
          fontSize: base * 1.05,
          color: "#000",
          background: "#fff",
          padding: "18mm",
          minHeight: "100%",
        }}
      >
        <header style={{ textAlign: "center", marginBottom: gap * 1.5 }}>
          <h1
            style={{
              fontSize: base * 1.6,
              fontWeight: 700,
              textDecoration: "underline",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              margin: 0,
            }}
          >
            CURRICULUM VITAE
          </h1>
        </header>

        <div>
          {seccoesMocambicanas.map((s, idx) => (
            <section key={s.id} style={{ marginBottom: gap * 1.5 }}>
              <div
                style={{
                  background: "#D0E1F9",
                  padding: "4px 8px",
                  borderBottom: "1.5px solid #000",
                  marginBottom: gap * 0.7,
                }}
              >
                <h2
                  style={{
                    fontSize: base * 1.1,
                    fontWeight: 700,
                    color: "#000",
                    textTransform: "uppercase",
                    margin: 0,
                  }}
                >
                  {ROMANOS[idx]}. {s.titulo}
                </h2>
              </div>
              <div style={{ padding: "0 8px" }}>{renderConteudoMocambicano(s.id)}</div>
            </section>
          ))}
        </div>
      </div>
    );
  }

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
          fontFamily: "inherit",
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
          return <p style={{ margin: 0, lineHeight: 1.15 }}>{dados.resumo}</p>;
        case "experiencias":
          return (
            <div style={{ display: "grid", gap: "6px" }}>
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
                    <p style={{ margin: "4px 0 0", lineHeight: 1.15, opacity: 0.85 }}>{e.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "formacoes":
          return (
            <div style={{ display: "grid", gap: "6px" }}>
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
                    <p style={{ margin: "4px 0 0", lineHeight: 1.15, opacity: 0.85 }}>{f.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "competencias":
          return (
            <div style={{ display: "grid", gap: "6px" }}>
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
            <div style={{ display: "grid", gap: "6px" }}>
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
            <div style={{ display: "grid", gap: "6px" }}>
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
            <div style={{ display: "grid", gap: "6px" }}>
              {dados.projetos.map((p, i) => (
                <div key={i}>
                  <strong>{p.nome}</strong>
                  {p.descricao && (
                    <p style={{ margin: "4px 0 0", lineHeight: 1.15, opacity: 0.85 }}>{p.descricao}</p>
                  )}
                </div>
              ))}
            </div>
          );
        case "referencias":
          return (
            <div style={{ display: "grid", gap: "6px" }}>
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
              fontFamily: "inherit",
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
        padding: cabecalhoEscuro ? "18mm 18mm 12mm 18mm" : "0 0 10mm",
        textAlign: modelo.cabecalho === "centrado" ? "center" : "left",
        borderBottom: modelo.cabecalho === "centrado" ? `2px solid ${cor}` : undefined,
        marginBottom: "10mm",
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: base * 2.1,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: cabecalhoEscuro ? "#fff" : cor,
          fontFamily: "inherit",
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
        padding: paddingBarra,
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
            fontFamily: "inherit",
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
        color: "#000000",
        background: "#ffffff",
        display: "flex",
        flexDirection: modelo.barra === "right" ? "row-reverse" : "row",
        minHeight: "100%",
        textAlign: "left",
        lineHeight: 1.15,
      }}
    >
      {barra}
      <div style={{ flex: 1, padding: cabecalhoEscuro && !temBarra ? 0 : paddingMain, minWidth: 0 }}>
        {cabecalhoEscuro && !temBarra ? (
          <>
            {cabecalho}
            <div style={{ padding: "0 18mm 18mm 18mm" }}>
              {principais.map((id) => renderSeccao(id))}
            </div>
          </>
        ) : (
          <>
            {temBarra ? (
              <header style={{ marginBottom: "10mm" }}>
                <h1 style={{ margin: 0, fontSize: base * 2, fontWeight: 700, color: cor, fontFamily: "inherit" }}>
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
