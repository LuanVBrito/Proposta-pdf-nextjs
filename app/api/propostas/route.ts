import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query(`
      SELECT 
        id,
        nome_cliente,
        nome_projeto,
        orcamento,
        iproposta,
        fproposta
      FROM propostas
      ORDER BY id DESC
    `);

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar propostas:", error);

    return NextResponse.json(
      { error: "Erro ao buscar propostas" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      nome_cliente,
      nome_projeto,
      orcamento,
      iproposta,
      fproposta,
    } = body;

    const result = await pool.query(
      `
      INSERT INTO propostas (
        nome_cliente,
        nome_projeto,
        orcamento,
        iproposta,
        fproposta
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [nome_cliente, nome_projeto, orcamento, iproposta, fproposta]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    console.error("Erro ao salvar proposta:", error);

    return NextResponse.json(
      { error: "Erro ao salvar proposta" },
      { status: 500 }
    );
  }
}