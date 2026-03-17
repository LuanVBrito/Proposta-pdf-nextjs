"use client";
import { useState, useRef, useEffect } from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

interface EscopoNode {
  id: string;
  label: string;
  children?: EscopoNode[];
}

function flattenEscopo(nodes: EscopoNode[]): Record<string, string> {
  let result: Record<string, string> = {};
  nodes.forEach((node) => {
    result[node.id] = node.label;
    if (node.children) Object.assign(result, flattenEscopo(node.children));
  });
  return result;
}

const escopoFuncional: EscopoNode[] = [
  {
    id: "1",
    label: "Login",
    children: [
      { id: "1.1", label: "Campos de e-mail e senha." },
      { id: "1.2", label: "Validação dos campos" },
      { id: "1.3", label: "Mensagem de erro" },
    ],
  },
  {
    id: "2",
    label: "Esqueci a Senha",
    children: [
      { id: "2.1", label: "Recuperação por e-mail" },
      { id: "2.2", label: "Envio de código" },
      { id: "2.3", label: "Redefinição de senha" },
    ],
  },
];

function renderTree(node: EscopoNode, onRemove?: (id: string) => void) {
  return (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "8px", padding: "2px 0" }}>
          <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: "#2d2d2d" }}>{node.label}</span>
          {onRemove && node.id.startsWith("custom-") && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(node.id); }}
              style={{ background: "transparent", border: "none", color: "#b91c1c", cursor: "pointer", fontSize: "11px", opacity: 0.7, padding: "2px 4px", borderRadius: "4px" }}
              title="Remover escopo desejável"
            >
              ✕
            </button>
          )}
        </div>
      }
    >
      {node.children?.map((child) => renderTree(child, onRemove))}
    </TreeItem>
  );
}

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  .proposta-root {
    min-height: 100vh;
    background: #f7f5f2;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 60px 24px 100px;
  }

  .proposta-header {
    text-align: center;
    margin-bottom: 56px;
  }

  .proposta-eyebrow {
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    font-size: 11px;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: #9c8c7a;
    margin-bottom: 10px;
  }

  .proposta-title {
    font-family: 'Playfair Display', serif;
    font-size: 52px;
    font-weight: 700;
    color: #1a1614;
    line-height: 1.1;
    letter-spacing: -0.02em;
  }

  .proposta-title span {
    color: #c8a96e;
  }

  .proposta-subtitle {
    margin-top: 14px;
    font-size: 14px;
    color: #9c8c7a;
    font-weight: 300;
    letter-spacing: 0.01em;
  }

  .proposta-form {
    width: 100%;
    max-width: 720px;
    display: flex;
    flex-direction: column;
  }

  .form-section {
    background: #ffffff;
    border-radius: 16px;
    padding: 32px 36px;
    margin-bottom: 18px;
    border: 1px solid #ede9e3;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.03);
    transition: box-shadow 0.2s ease;
  }

  .form-section:hover {
    box-shadow: 0 2px 6px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.05);
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-weight: 600;
    color: #1a1614;
    margin-bottom: 22px;
    padding-bottom: 14px;
    border-bottom: 1px solid #f0ebe4;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-icon {
    width: 30px;
    height: 30px;
    background: linear-gradient(135deg, #c8a96e1a, #c8a96e33);
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  .field-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 20px;
  }

  .field-group:last-child { margin-bottom: 0; }

  .field-label {
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: #9c8c7a;
  }

  .field-hint {
    font-size: 11px;
    color: #b8ad9e;
    margin-top: -2px;
  }

  .field-input, .field-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1.5px solid #ede9e3;
    border-radius: 10px;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    color: #2d2d2d;
    background: #fdfcfb;
    transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
    outline: none;
    resize: none;
    line-height: 1.6;
  }

  .field-input:focus, .field-textarea:focus {
    border-color: #c8a96e;
    box-shadow: 0 0 0 3px #c8a96e14;
    background: #fff;
  }

  .field-input::placeholder, .field-textarea::placeholder {
    color: #c5bdb4;
  }

  .two-col {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
  }

  .escopo-input-row {
    display: flex;
    gap: 10px;
    align-items: flex-end;
    margin-top: 6px;
  }

  .escopo-input-row .field-textarea {
    flex: 1;
  }

  .btn-confirmar {
    padding: 12px 18px;
    background: #1a1614;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    display: flex;
    align-items: center;
    gap: 7px;
    transition: background 0.2s, transform 0.1s;
    letter-spacing: 0.02em;
    flex-shrink: 0;
  }

  .btn-confirmar:hover {
    background: #2d2824;
    transform: translateY(-1px);
  }

  .btn-confirmar:active {
    transform: translateY(0);
  }

  .check-icon {
    width: 16px;
    height: 16px;
    background: #c8a96e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    flex-shrink: 0;
  }

  .tree-wrapper {
    border: 1.5px solid #ede9e3;
    border-radius: 10px;
    padding: 10px 12px;
    background: #fdfcfb;
    min-height: 60px;
  }

  .date-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 18px;
    margin-bottom: 20px;
  }

  .orcamento-prefix {
    position: relative;
    display: flex;
    align-items: center;
  }

  .orcamento-prefix-label {
    position: absolute;
    left: 14px;
    font-size: 14px;
    color: #9c8c7a;
    font-weight: 500;
    pointer-events: none;
    z-index: 1;
  }

  .orcamento-prefix .field-input {
    padding-left: 36px;
  }

  .btn-gerar {
    width: 100%;
    padding: 18px 36px;
    background: linear-gradient(135deg, #1a1614 0%, #2d2824 100%);
    color: #fff;
    border: none;
    border-radius: 14px;
    font-family: 'Playfair Display', serif;
    font-size: 19px;
    font-weight: 600;
    cursor: pointer;
    letter-spacing: 0.01em;
    transition: all 0.25s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    box-shadow: 0 4px 20px rgba(26,22,20,0.2), 0 1px 3px rgba(26,22,20,0.1);
    margin-top: 6px;
  }

  .btn-gerar:hover {
    background: linear-gradient(135deg, #2d2824 0%, #3d3530 100%);
    transform: translateY(-2px);
    box-shadow: 0 8px 32px rgba(26,22,20,0.28), 0 2px 8px rgba(26,22,20,0.12);
  }

  .btn-gerar:active {
    transform: translateY(0);
  }

  .btn-gerar-arrow {
    width: 28px;
    height: 28px;
    background: #c8a96e;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 600px) {
    .two-col, .date-row { grid-template-columns: 1fr; }
    .proposta-title { font-size: 38px; }
    .form-section { padding: 24px 20px; }
    .escopo-input-row { flex-direction: column; align-items: stretch; }
  }
`;

export default function PropostaPage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [nomeProjeto, setNomeProjeto] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [escopoDesejavel, setEscopoDesejavel] = useState("");
  const [escopoDesejavelTree, setEscopoDesejavelTree] = useState<EscopoNode | null>(null);
  const [escopoFuncionalState, setEscopoFuncionalState] = useState<EscopoNode[]>(escopoFuncional);
  const [orcamento, setOrcamento] = useState("");
  const [futurav, setFuturav] = useState("");
  const [requisitost, setRequisitost] = useState("");
  const [iproposta, setIproposta] = useState("");
  const [fproposta, setFproposta] = useState("");
  const [escopoSelecionado, setEscopoSelecionado] = useState<string[]>([]);

  const objetivoRef = useRef<HTMLTextAreaElement>(null);
  const futuraRef = useRef<HTMLTextAreaElement>(null);
  const requisitosRef = useRef<HTMLTextAreaElement>(null);

  const autoGrow = (ref: React.RefObject<HTMLTextAreaElement>) => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  };



  function confirmarEscopoDesejavel() {
    if (!escopoDesejavel.trim()) return;
    const linhas = escopoDesejavel.split("\n").map((l) => l.trim()).filter(Boolean);
    if (linhas.length === 0) return;

    const parentId = `custom-parent-${Date.now()}`;
    const parentNode: EscopoNode = {
      id: parentId,
      label: linhas[0],
      children: linhas.slice(1).map((linha, index) => ({
        id: `${parentId}-child-${index}`,
        label: linha,
      })),
    };

    setEscopoFuncionalState((prev) => {
      const existeRoot = prev.find((n) => n.id === "custom-root");
      if (existeRoot) {
        return prev.map((node) =>
          node.id === "custom-root"
            ? { ...node, children: [...(node.children || []), parentNode] }
            : node
        );
      }
      return [...prev, { id: "custom-root", label: "Escopo Desejável", children: [parentNode] }];
    });

    setEscopoSelecionado((prev) => [...prev, parentId, ...parentNode.children!.map((c) => c.id)]);
    setEscopoDesejavel("");
    setEscopoDesejavelTree((prev) => {
      if (!prev) return { id: "custom-root", label: "", children: [parentNode] };
      return { ...prev, children: [...(prev.children || []), parentNode] };
    });
  }

  function removerEscopoDesejavel(id: string) {
    const removerNode = (nodes: EscopoNode[]): EscopoNode[] =>
      nodes.map((node) => node.children ? { ...node, children: removerNode(node.children) } : node).filter((node) => node.id !== id);
    setEscopoFuncionalState((prev) => removerNode(prev));
    setEscopoSelecionado((prev) => prev.filter((item) => item !== id));
  }

  async function gerarPDF() {
    const res = await fetch("/api/proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nomeCliente, nomeProjeto, objetivo, orcamento, escopoSelecionado, escopoDesejavel: escopoDesejavelTree, futurav, requisitost, iproposta, fproposta }),
    });
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }

  return (
    <>
      <style>{styles}</style>
      <div className="proposta-root">

        {/* Header */}
        <div className="proposta-header">
          <p className="proposta-eyebrow">Gerador de Propostas Comerciais</p>
          <h1 className="proposta-title">Proposto<span>metro</span></h1>
          <p className="proposta-subtitle">Preencha os dados abaixo para gerar sua proposta em PDF</p>
        </div>

        <div className="proposta-form">

          {/* Seção: Identificação */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">🏢</div>
              Identificação
            </div>

            <div className="two-col">
              <div className="field-group">
                <label className="field-label">Nome do Cliente</label>
                <input
                  className="field-input"
                  placeholder="Ex: Acme Ltda."
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Nome do Projeto</label>
                <input
                  className="field-input"
                  placeholder="Ex: Portal de Clientes"
                  value={nomeProjeto}
                  onChange={(e) => setNomeProjeto(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Objetivo</label>
              <textarea
                ref={objetivoRef}
                className="field-textarea"
                placeholder="Descreva o objetivo principal do projeto..."
                value={objetivo}
                onChange={(e) => setObjetivo(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          {/* Seção: Escopo */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">📋</div>
              Escopo do Projeto
            </div>

            <div className="field-group">
              <label className="field-label">Adicionar Escopo Desejável</label>
              <p className="field-hint">Primeira linha = título. Demais linhas = subitens.</p>
              <div className="escopo-input-row">
                <textarea
                  className="field-textarea"
                  placeholder={"Gestão de usuários\nCadastro de perfis\nPermissões por nível"}
                  value={escopoDesejavel}
                  onChange={(e) => setEscopoDesejavel(e.target.value)}
                  rows={3}
                />
                <button className="btn-confirmar" onClick={confirmarEscopoDesejavel}>
                  <div className="check-icon">✓</div>
                  Confirmar
                </button>
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Escopo Funcional Mapeado</label>
              <div className="tree-wrapper">
                <SimpleTreeView
                  multiSelect
                  checkboxSelection
                  selectedItems={escopoSelecionado}
                  onSelectedItemsChange={(_, itemIds) => setEscopoSelecionado(itemIds)}
                >
                  {escopoFuncionalState.map((node) => renderTree(node, removerEscopoDesejavel))}
                </SimpleTreeView>
              </div>
            </div>
          </div>

          {/* Seção: Detalhes Técnicos */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">⚙️</div>
              Detalhes Técnicos
            </div>

            <div className="field-group">
              <label className="field-label">Futura Versão</label>
              <p className="field-hint">Digite um item por linha.</p>
              <textarea
                ref={futuraRef}
                className="field-textarea"
                placeholder={"Integração com ERP\nAplicativo mobile"}
                value={futurav}
                onChange={(e) => setFuturav(e.target.value)}
                rows={3}
                style={{ marginTop: "4px" }}
              />
            </div>

            <div className="field-group">
              <label className="field-label">Requisitos Técnicos</label>
              <p className="field-hint">Digite um item por linha.</p>
              <textarea
                ref={requisitosRef}
                className="field-textarea"
                placeholder={"Node.js 18+\nPostgreSQL\nDocker"}
                value={requisitost}
                onChange={(e) => setRequisitost(e.target.value)}
                rows={3}
                style={{ marginTop: "4px" }}
              />
            </div>
          </div>

          {/* Seção: Prazo e Orçamento */}
          <div className="form-section">
            <div className="section-title">
              <div className="section-icon">💰</div>
              Prazo & Orçamento
            </div>

            <div className="date-row">
              <div className="field-group">
                <label className="field-label">Início da Proposta</label>
                <input
                  type="date"
                  className="field-input"
                  value={iproposta}
                  onChange={(e) => setIproposta(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label className="field-label">Fim da Proposta</label>
                <input
                  type="date"
                  className="field-input"
                  value={fproposta}
                  onChange={(e) => setFproposta(e.target.value)}
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Orçamento</label>
              <div className="orcamento-prefix">
                <span className="orcamento-prefix-label">R$</span>
                <input
                  className="field-input"
                  placeholder="0,00"
                  value={orcamento}
                  onChange={(e) => setOrcamento(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Botão Gerar PDF */}
          <button className="btn-gerar" onClick={gerarPDF}>
            <div className="btn-gerar-arrow">↓</div>
            Gerar Proposta em PDF
          </button>

        </div>
      </div>
    </>
  );
}