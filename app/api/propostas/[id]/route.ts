import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: Request, context: Context) {
  try {
    const { id } = await context.params;

    const result = await pool.query(
      "DELETE FROM propostas WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Proposta não encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Proposta excluída com sucesso",
      proposta: result.rows[0],
    });
  } catch (error) {
    console.error("Erro ao excluir proposta:", error);

    return NextResponse.json(
      { error: "Erro ao excluir proposta" },
      { status: 500 }
    );
  }
}