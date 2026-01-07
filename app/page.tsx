"use client";
import { useState, useRef, useEffect } from "react";
import { SimpleTreeView, TreeItem } from "@mui/x-tree-view";

interface EscopoNode {
  id: string;
  label: string;
  children?: EscopoNode[];
}


// função auxiliar
// Mapeia id -> label (incluindo filhos)
function flattenEscopo(nodes: EscopoNode[]): Record<string, string> {
  let result: Record<string, string> = {};

  nodes.forEach((node) => {
    result[node.id] = node.label;

    if (node.children) {
      Object.assign(result, flattenEscopo(node.children));
    }
  });

  return result;
}

// dados da arvore
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


function renderTree(
  node: EscopoNode,
  onRemove?: (id: string) => void
) {
  return (
    <TreeItem
      key={node.id}
      itemId={node.id}
      label={
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            gap: "8px",
          }}
        >
          <span>{node.label}</span>

          {onRemove && node.id.startsWith("custom-") && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(node.id);
              }}
              style={{
                background: "transparent",
                border: "none",
                color: "#c00",
                cursor: "pointer",
                fontSize: "14px",
              }}
              title="Remover escopo desejável"
            >
              ❌
            </button>
          )}
        </div>
      }
    >
      {node.children?.map((child) => renderTree(child, onRemove))}
    </TreeItem>
  );
}


// componente
export default function PropostaPage() {
  const [nomeCliente, setNomeCliente] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [escopoDesejavel, setEscopoDesejavel] = useState("");
  const [escopoDesejavelTree, setEscopoDesejavelTree] = useState<EscopoNode | null>(null);
  const [escopoFuncionalState, setEscopoFuncionalState] = useState<EscopoNode[]>(escopoFuncional);
  const [orcamento, setOrcamento] = useState("");
  const [futurav, setFuturav] = useState("");
  const [requisitost, setRequisitost] = useState("");
  const [iproposta, setIproposta] = useState("");
  const [fproposta, setFproposta] = useState("");

  // guarda APENAS os IDs selecionados
  const [escopoSelecionado, setEscopoSelecionado] = useState<string[]>([]);

  // textarea auto grow
  const textRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textRef.current) {
      textRef.current.style.height = "auto";
      textRef.current.style.height = textRef.current.scrollHeight + "px";
    }
  }, [objetivo, futurav, requisitost]);


  function coletarIds(node: EscopoNode): string[] {
  let ids = [node.id];
  node.children?.forEach((child) => {
    ids.push(...coletarIds(child));
  });
  return ids;
}


  //função do botão de confirmar o escoop
  function confirmarEscopoDesejavel() {
  
    if (!escopoDesejavel.trim()) return;

    // quebra por linhas e remove linhas vazias
    const linhas = escopoDesejavel
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (linhas.length === 0) return;

    const parentId = `custom-parent-${Date.now()}`;

    
    // pai = primeira linha
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
          ? {
              ...node,
              children: [...(node.children || []), parentNode],
            }
          : node
      );
    }

    return [
      ...prev,
      {
        id: "custom-root",
        label: "Escopo Desejável",
        children: [parentNode],
      },
    ];
  });

  // seleciona pai + filhos
  setEscopoSelecionado((prev) => [
    ...prev,
    parentId,
    ...parentNode.children!.map((c) => c.id),
  ]);

  setEscopoDesejavel("");

  // confirmar o escopo desejável
  setEscopoDesejavelTree((prev) => {
    // se ainda não existe, cria o root
    if (!prev) {
      return {
        id: "custom-root",
        label: "",
        children: [parentNode],
      };
    }

    // se já existe, só adiciona mais um pai
    return {
      ...prev,
      children: [...(prev.children || []), parentNode],
    };
  });

}

  //função de remover escopo
  function removerEscopoDesejavel(id: string) {
    // remove da árvore
    const removerNode = (nodes: EscopoNode[]): EscopoNode[] =>
      nodes
        .map((node) => {
          if (node.children) {
            return {
              ...node,
              children: removerNode(node.children),
            };
          }
          return node;
        })
        .filter((node) => node.id !== id);

    setEscopoFuncionalState((prev) => removerNode(prev));

    // remove da seleção
    setEscopoSelecionado((prev) => prev.filter((item) => item !== id));
  }

  
  // envio backend
  async function gerarPDF() {
    const res = await fetch("/api/proposta", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nomeCliente,
        objetivo,
        orcamento,
        escopoSelecionado: escopoSelecionado,
        escopoDesejavel: escopoDesejavelTree,
        futurav,
        requisitost,
        iproposta,
        fproposta,
      }),
    });

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank");
  }
  return (
    <div>
      <h1>Gerador Proposta</h1>

      <label>Nome do Cliente</label>
      <div style={{ marginBottom: "12px" }}>
      <input
        placeholder="Nome do cliente"
        value={nomeCliente}
        onChange={(e) => setNomeCliente(e.target.value)}
        style={{
          width: "30%",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius:"6px",
          fontSize: "14px",
          boxSizing:  "border-box"
        }}
      />
      </div>

      <label>Objetivo</label>
      <div style={{ marginBottom: "12px" }}>
        <textarea
          ref={textRef}
          placeholder="Objetivo"
          value={objetivo}
          onChange={(e) => setObjetivo(e.target.value)}
          style={{
            width: "30%",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "20px",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <label>Escopo Desejável</label>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "12px",
        }}
      >
        <textarea
          placeholder="Digite o escopo desejável"
          value={escopoDesejavel}
          onChange={(e) => setEscopoDesejavel(e.target.value)}
          style={{
            width: "24%",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            resize: "none",
          }}
        />

        <button
          onClick={confirmarEscopoDesejavel}
          style={{
            padding: "8px 14px",
            fontSize: "13px",
            borderRadius: "6px",
            border: "1px solid #ccc",
            cursor: "pointer",
            background: "#111",
            color: "#fff",
            whiteSpace: "nowrap",
          }}
        >
          Confirmar ✅
        </button>
      </div>

      <label>Escopo Funcional Mapeado</label>
      <div
        style={{
          width: "30%",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius:"6px",
          marginBottom: "12px",
        }}
      >
      <SimpleTreeView
        multiSelect
        checkboxSelection
        selectedItems={escopoSelecionado}
        onSelectedItemsChange={(_, itemIds) => {
          setEscopoSelecionado(itemIds);
        }}
      >
        {escopoFuncionalState.map((node) =>
          renderTree(node, removerEscopoDesejavel)
        )}
      </SimpleTreeView>


      </div>

      <label>Futura Versão(Digite um por linha)</label>
      <div style={{ marginBottom: "12px" }}>
        <textarea
          ref={textRef}
          placeholder="Futura Versão"
          value={futurav}
          onChange={(e) => setFuturav(e.target.value)}
          style={{
            width: "30%",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "20px",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <label>Requisitos Técnicos(Digite um por linha)</label>
      <div style={{ marginBottom: "12px" }}>
        <textarea
          ref={textRef}
          placeholder="Requisitos Técnicos"
          value={requisitost}
          onChange={(e) => setRequisitost(e.target.value)}
          style={{
            width: "30%",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "6px",
            fontSize: "14px",
            lineHeight: "20px",
            resize: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "40px",
          marginBottom: "20px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label>Início da Proposta</label>
          <input
            type="date"
            placeholder="xx/xx/xxxx"
            value={iproposta}
            onChange={(e) => setIproposta(e.target.value)}
            style={{
              width: "140px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label>Fim da Proposta</label>
          <input
            type="date"
            placeholder="xx/xx/xxxx"
            value={fproposta}
            onChange={(e) => setFproposta(e.target.value)}
            style={{
              width: "140px",
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              fontSize: "14px",
              resize: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      
      <label>Orçamento</label>
      <br /><br />
      <div>
      <input
        placeholder="Orçamento"
        value={orcamento}
        onChange={(e) => setOrcamento(e.target.value)}
        style={{
          width: "30%",
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius:"6px",
          fontSize: "14px",
          boxSizing:  "border-box"
        }}
      />
      </div>
      <br /><br />

      <button onClick={gerarPDF}>Gerar PDF</button>
    </div>
  );
}