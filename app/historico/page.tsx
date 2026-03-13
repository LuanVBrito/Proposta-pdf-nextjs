"use client";

import { useEffect, useState } from "react";

type Proposta = {
  id: number;
  nome_cliente: string;
  nome_projeto: string;
  orcamento: string;
  iproposta: string;
  fproposta: string;
};

export default function HistoricoPage() {
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    buscarPropostas();
  }, []);

  async function buscarPropostas() {
    try {
      const res = await fetch("/api/propostas");
      const data = await res.json();
      setPropostas(data);
    } catch (err) {
      console.error("Erro ao buscar propostas:", err);
    }
  }

  async function excluirProposta(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir esta proposta?"
    );

    if (!confirmar) return;

    try {
      const res = await fetch(`/api/propostas/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Não foi possível excluir a proposta");
      }

      setPropostas((prev) => prev.filter((proposta) => proposta.id !== id));
    } catch (err) {
      console.error("Erro ao excluir proposta:", err);
      alert("Erro ao excluir proposta");
    }
  }

  const propostasFiltradas = propostas.filter(
    (proposta) =>
      proposta.nome_cliente?.toLowerCase().includes(busca.toLowerCase()) ||
      proposta.nome_projeto?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Histórico de Propostas</h1>
          <p className="text-gray-500">
            Visualize e gerencie todas as propostas criadas
          </p>
        </div>
        <button className="bg-black text-white px-4 py-2 rounded-lg">
          Nova proposta
        </button>
      </div>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por proposta ou cliente"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full border rounded-lg px-4 py-2"
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">ID</th>
              <th className="p-4">Cliente</th>
              <th className="p-4">Projeto</th>
              <th className="p-4">Orçamento</th>
              <th className="p-4">Início</th>
              <th className="p-4">Fim</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {propostasFiltradas.map((proposta) => (
              <tr key={proposta.id} className="border-b">
                <td className="p-4">{proposta.id}</td>
                <td className="p-4">{proposta.nome_cliente}</td>
                <td className="p-4">{proposta.nome_projeto}</td>
                <td className="p-4">{proposta.orcamento}</td>
                <td className="p-4">
                  {new Date(proposta.iproposta).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  {new Date(proposta.fproposta).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => excluirProposta(proposta.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}