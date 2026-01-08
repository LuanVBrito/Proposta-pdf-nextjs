import { NextResponse } from "next/server";
import PDFDocument from "pdfkit";
import { cwd } from "process";
import path from "path";
import fs from "fs";
import { Poppins } from "next/font/google";
import { Pool } from "pg";


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

  type EscopoNode = {
      id: string;
      label: string;
      children?: EscopoNode[];
    };

  // função de imprimir escopo
  function renderEscopoDesejavelPDF(
    nodes: EscopoNode[],
    doc: PDFKit.PDFDocument,
    nivel = 0
  ) {
    const BASE_INDENT = 10;

    nodes.forEach((node) => {
      // pai
      doc
        .font("Poppins-Bold")
        .fontSize(11)
        .text(node.label, {
          indent: BASE_INDENT + nivel * 20,
          lineGap: 6,
        });

      // filho
      if (node.children && node.children.length > 0) {
        doc.font("Regular");

        node.children.forEach((child) => {
          doc.text(child.label, {
            indent: BASE_INDENT + (nivel + 1) * 20,
            lineGap: 6,
          });
        });
      }

      doc.moveDown(0.3);
    });
  }

  function formatarDataBR(data: string) {
    if (!data) return "Não informado";
    const [ano, mes, dia] = data.split("-");
    return `${dia}/${mes}/${ano}`;
  }


export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      nomeCliente,
      nomeProjeto,
      objetivo,
      orcamento,
      escopoSelecionado,
      escopoDesejavel,
      futurav,
      requisitost,
      iproposta,
      fproposta,
    } = body as {
      nomeCliente: string;
      nomeProjeto: string;
      objetivo: string;
      orcamento: string;
      escopoSelecionado: string[];
      escopoDesejavel: EscopoNode | null;
      futurav: string;
      requisitost: string;
      iproposta: string;
      fproposta: string;
    };

    const insertQuery = `
    INSERT INTO propostas (
        nome_cliente,
        nome_projeto,
        orcamento,
        iproposta,
        fproposta
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
    `;
    const values = [
      nomeCliente,
      nomeProjeto,
      orcamento,
      iproposta,
      fproposta,
    ];
    const result = await pool.query(insertQuery, values);
    const propostaId = result.rows[0].id;


    // caminhos das imagens
    const imagePath = path.join(cwd(), "public", "capa.jpg");
    const logoPath = path.join(cwd(), "public", "logo.png");
    const designPath = path.join(cwd(), "public", "design.png");
    const ltempoPath = path.join(cwd(), "public", "ltempo.png");
    const finalPath = path.join(cwd(), "public", "final.png");

    if (!fs.existsSync(imagePath)) {
      return NextResponse.json(
        { error: "Imagem da capa não encontrada em /public/capa.jpg" },
        { status: 500 }
      );
    }

    const doc = new PDFDocument({ size: "A4", margin: 40 });

    // desenha a logo na primeira página
    desenharLogo(doc);

    // sempre que uma nova página for criada
    doc.on("pageAdded", () => {
      desenharLogo(doc);
    });

    const chunks: Buffer[] = [];
    
    function desenharLogo(doc: PDFKit.PDFDocument) {
      if (fs.existsSync(logoPath)) {
        doc.image(logoPath, doc.page.width - 110, 20, {
          width: 30,
        });
      }
    }
    // fontes
    doc.registerFont("Regular", "public/fonts/Poppins/Poppins-Regular.ttf");
    doc.registerFont("Poppins-Bold", "public/fonts/Poppins/Poppins-Bold.ttf");

    const PAGE = {
      width: doc.page.width,
      height: doc.page.height,
    };
    const FRAME = {
      x: 70,
      y: () => doc.y,
      width: PAGE.width - 140,
    };

    function writeG(
      text: string,
      options: {
        indent?: number;
        lineGap?: number;
        bold?: boolean;
        size?: number;
        color?: string;
      } = {}
    ) {
      const {
        indent = 0,
        lineGap = 6,
        bold = false,
        size = 11,
        color = "black",
      } = options;

      doc
        .font(bold ? "Poppins-Bold" : "Poppins-Regular")
        .fontSize(size)
        .fillColor(color)
        .text(text, FRAME.x, FRAME.y(), {
          width: FRAME.width,
          indent,
          lineGap,
          align: "justify",
        });
    }

    // escrita dos pais e filhos
    function write(
      text: string,
      options: { indent?: number } = {}
    ) {
      const MARGIN_LEFT = 70;
      const TEXT_WIDTH = doc.page.width - 150;

      doc.text(text, MARGIN_LEFT, doc.y, {
        width: TEXT_WIDTH,
        align: "justify",
        lineGap: 8,
        indent: options.indent ?? 0,
      });
    }


    function renderEscopoPDF(
      nodes: EscopoNode[],
      selecionados: Set<string>,
      write: (text: string, options?: any) => void,
      doc: PDFKit.PDFDocument
    ) {
      nodes.forEach((node) => {
        const filhosSelecionados =
          node.children?.filter((c) => selecionados.has(c.id)) || [];

        // imprime o pai se ele ou algum filho estiver selecionado
        if (selecionados.has(node.id) || filhosSelecionados.length > 0) {

          write(`${node.id}. ${node.label}`, { indent: 5 });


          filhosSelecionados.forEach((child) => {
            write(`• ${child.id} ${child.label}`, { indent: 25 });
          });

          doc.moveDown(0.5);
        }
      });
    }

    // captura de pdf
    return new Promise((resolve, reject) => {
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => {
        resolve(
          new NextResponse(Buffer.concat(chunks), {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": "attachment; filename=proposta.pdf",
            },
          })
        );
      });
      
      doc.on("error", reject);

      // primeira imagem
      doc.image(imagePath, 0, 0, { width: 595, height: 842 });
      doc.addPage();

      // fundo cinza 
      doc.rect(0, 0, doc.page.width, doc.page.height).fill("#F2F2F2");
      doc.fillColor("black");
      doc.image(logoPath, doc.page.width - 110, 20, { width: 30 });

      doc.moveDown(3);

      // prezado + cliente + apresentação
      doc.fillColor("#05483f");
      doc.font("Poppins-Bold").fontSize(16);
      write(`Prezado ${String(nomeCliente || "Cliente")}`);

      doc.fillColor("#474747").font("Regular").fontSize(11);
      write(
        "Pronto para invocar a sua ideia do plano sutil, tirá-la do silêncio do papel e dar forma a ela no reino digital, onde código vira estrutura, intenção vira experiência e conceito vira impacto?",
      { indent: 30});
      

      // inicio
      doc.fillColor("black");
      doc.font("Poppins-Bold").fontSize(16);
      doc.moveDown(1);

      write("PROPOSTA COMERCIAL DE PRESTAÇÃO DE SERVIÇOS", {indent: 5});
      doc.moveDown(1);
      
      // texto informativo
      doc.font("Regular").fontSize(11);

      write(
        "Todas as informações presentes neste documento, anexos ou qualquer outra comunicação verbal ou formal no âmbito deste processo comercial são propriedade intelectual da Luis Sousa Software engineer e estritamente confidenciais, contendo informações comerciais relevantes e devendo ser divulgadas apenas aos responsáveis pela tomada de decisão do processo. A divulgação desta proposta a terceiros ou utilização dela ou de qualquer parte de seu conteúdo para outros fins que não este processo comercial é expressamente proibida.", { indent: 30 });

      write(
        "A utilização deste documento ou de qualquer de seus anexos por funcionários ou qualquer terceiro da empresa cliente que não estejam envolvidos no processo de seleção de fornecedores para esse processo comercial estará em não-conformidade e deverá ser informada expressamente à Luis Sousa Software engineer.", { indent : 30});

      write(
        "Todos os documentos e informações recebidas pela Luis Sousa Software engineer ao longo do processo comercial do qual resultou essa proposta serão tratados da mesma forma pela Luis Sousa Software engineer, com expressa confidencialidade e sigilo, não sendo revelados a nenhuma parte fora da empresa, tenha a Luis Sousa Software engineer assinado ou não qualquer contrato ou acordo de confidencialidade.", { indent: 30 });

      doc.addPage();
      // objetivo
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("1. Objetivo do Projeto");

      doc.font("Regular").fontSize(11).fillColor("black");
      writeG(`${objetivo || "Não informado."}`, {indent : 5});

      doc.moveDown(1);

      // Escopo
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("2. Escopo funcional mapeado");

      doc.font("Regular").fontSize(11).fillColor("black");
      if (escopoDesejavel == null) {
        writeG("Não informado.")
      }
      if (escopoDesejavel?.children?.length) {
        renderEscopoDesejavelPDF(escopoDesejavel.children, doc);
      }

      // Futura Versão
      if (futurav && futurav.trim() !== "") {
        doc.font("Poppins-Bold").fontSize(12).fillColor("black");
        write("Obs: Futura Versão");

        const linhasFutura = futurav
          .split("\n")
          .map((l: string) => l.trim())
          .filter((l: string) => l !== "");

        linhasFutura.forEach((item: string) => {
          const y = doc.y;

          // bolinha
          doc.circle(70, y + 4, 2).fill("black");

          // texto
          doc.font("Poppins-Regular").fontSize(11).fillColor("black");
          doc.text(item, 80, y, {
            width: doc.page.width - 120,
            align: "justify",
            lineGap: 4,
          });

          doc.moveDown(0.5);
        });
      }
      doc.moveDown(1);

      // Metodologia de entrega
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f")
      write("3. Metodologia de Entrega Desenvolvimento de Software")

      doc.font("Regular").fontSize(11).fillColor("black");
      writeG("O desenvolvimento será realizado utilizando metodologias ágeis, baseando-se nos frameworks Kanban e Scrum, com sprints semanais. As entregas serão realizadas todas as segundas-feiras. A comunicação será efetuada por meio de um chat, acompanhada de relatórios de progresso semanais e interações diárias para resolver quaisquer impedimentos que possam surgir.", {indent: 30});
      doc.moveDown(1.5);

      
      // Requisitos Técnicos
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("4. Requisitos Técnicos");
      
      doc.font("Regular").fontSize(11).fillColor("black");
      if (requisitost == "") {
        writeG("Não informado.")
      }

      // separa as linhas recebidas do front
      const linhas = requisitost
        .split("\n")
        .map((l: string) => l.trim())
        .filter((l: string) => l !== "");

      linhas.forEach((item: string, index: number) => {
        const letra = String.fromCharCode(97 + index); // a, b, c...

        const [titulo, resto] = item.split(/:(.+)/).map(s => s?.trim());

        const x = 70;

        // Parte em negrito (a. Banco de Dados:)
        doc.font("Poppins-Bold").fontSize(11).fillColor("black");
        
        if (resto) {
          doc.text(`${letra}. ${titulo}:`, x, doc.y, {
            continued: true,
          });

          // Parte regular (PostgreSQL)
          doc.font("Poppins-Regular").fontSize(11);
          doc.text(` ${resto}`, {
            width: doc.page.width - 120,
            align: "justify",
            lineGap: 4,
          });

        } else {
          // Linha sem ":" → tudo em bold, MAS quebra linha
          doc.text(`${letra}. ${item}`, x, doc.y, {
            width: doc.page.width - 120,
            align: "justify",
            lineGap: 4,
          });
        }
      });
      doc.moveDown(1);
    
      /*// tabela
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("Cronograma de Desenvolvimento:");

      // configurações da tabela
      const startX = 50;
      let startY = doc.y;

      const colWidths = [200, 60, 60, 60, 60, 60];
      const rowHeight = 28;
      const tableWidth = colWidths.reduce((a, b) => a + b, 0);

      // cabeçalho
      doc.rect(startX, startY, tableWidth, rowHeight).fill("#05483f");

      doc.font("Poppins-Bold").fontSize(11).fillColor("white");

      const headers = ["Sprint / Semana", "1", "2", "3", "4", "5"];

      let x = startX;
      headers.forEach((text, i) => {
        doc.text(text, x, startY + 8, {
          width: colWidths[i],
          align: "center",
        });
        x += colWidths[i];
      });

      doc.fillColor("black");
      startY += rowHeight;

      // dados
      const tabela = [
        { nome: "Funcionalidades Gerais", sprints: [1, 2, 3, 4] },
        { nome: "Login", sprints: [1] },
        { nome: "Esqueci Senha", sprints: [1] },
        { nome: "Cadastro", sprints: [1] },
        { nome: "Início/Home", sprints: [2] },
        { nome: "Tela Caixa", sprints: [3] },
        { nome: "Tela de Cliente", sprints: [4] },
        { nome: "Tela de Produto", sprints: [5] },
        { nome: "Tela de Atendimento", sprints: [5] },
      ];

      tabela.forEach((linha) => {
        let x = startX;

        // coluna funcionalidade
        doc.rect(x, startY, colWidths[0], rowHeight).stroke();
        doc.font("Poppins-Regular").fontSize(11);
        doc.text(linha.nome, x + 5, startY + 8, {
          width: colWidths[0] - 10,
        });
        x += colWidths[0];

        // colunas de sprints
        for (let i = 1; i <= 5; i++) {
          doc.rect(x, startY, colWidths[i], rowHeight).stroke();

          if (linha.sprints.includes(i)) {
            doc.font("ZapfDingbats").fontSize(14);
            doc.text("4", x + colWidths[i] / 2 - 4, startY + 20);
          }

          x += colWidths[i];
        }

        startY += rowHeight;
      });
      */

      // Validade da proposta
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("5. Validade da proposta")

      doc.font("Regular").fontSize(11).fillColor("black");
      writeG(`A proposta atual tem validade de 7 dias corridos, iniciando em ${formatarDataBR(iproposta) || "Não informado"} com termino em ${formatarDataBR(fproposta) || "Não informado"}, após encerramento do período, será necessário revisão do prazo e validação do orçamento.`, {indent: 30});

      doc.moveDown(1);

      // orçamento
      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("6. Orçamento");

      doc.font("Regular").fontSize(11).fillColor("black");
      doc.text(`O orçamento total estimado para o `, {continued: true });

      doc.font("Poppins-Bold");
      doc.text(`investimento do projeto `, {continued: true});

      doc.font("Regular");
      doc.text(`é de `, {continued: true});

      doc.font("Poppins-Bold");
      doc.text(`${orcamento || "Não informado"}`, {continued: true}); 

      doc.font("Regular");
      doc.text(` para o desenvolvimento.`, {continued: false});

      doc.moveDown(1);
      doc.font("Poppins-Bold").fontSize(11);
      doc.text("O orçamento acima contempla:", {
        width: doc.page.width - 100,
      });
      doc.moveDown(0.5);

      const listaO = [
      "O desenvolvimento de software de acordo ao escopo acima detalhado;",
      "Documentação de Guia do Usuário sumarizado e categorizado;",
      "Uma semana para ajustes e refinamentos após a entrega final;",
      "Garantia vitalícia para bugs sob o escopo contratado.",
    ];

      // Fonte normal para a lista
      doc.font("Regular").fontSize(11).fillColor("black");

      listaO.forEach((item) => {
        doc.text(`• ${item}`, {
          indent: 20, 
          lineGap: 4,
          align: "justify",
        });
      });
      doc.moveDown(1);

      doc.font("Poppins-Bold").fontSize(13).fillColor("#05483f");
      write("7. Informações importantes");

      const listaInfo = [
        "Sua disponibilidade é fundamental para o cumprimento do prazo;",
        "Condição de pagamento antecipado por etapa e/ou sprint;",
        "Uma sprint equivale a uma semana (7 dias corridos);",
        "O Ciclo de abertura e fechamento de sprint ocorre nas segundas-feiras",
      ];

      // Fonte normal para s lista
      doc.font("Regular").fontSize(11).fillColor("black");

      listaInfo.forEach((item) => {
        doc.text(`• ${item}`, {
          indent: 20,
          lineGap: 4,
          align: "justify",
        });
      });

      doc.addPage();
      // design imagem
      doc.image(designPath, 0, 0, { width: 595, height: 842 });
      if (!fs.existsSync(designPath)) {
      return NextResponse.json(
        { error: "Imagem do design não encontrada em /public/design.jpg" },
        { status: 500 }
      );
    }
      
    doc.addPage();
      // linha do tempo imagem
      doc.image(ltempoPath, 0, 0, { width: 595, height: 842 });
      if (!fs.existsSync(ltempoPath)) {
      return NextResponse.json(
        { error: "Imagem da linha do tempo não encontrada em /public/ltempo.jpg" },
        { status: 500 }
      );
    }
      
      doc.addPage();
      // ultima página imagem
      doc.image(finalPath, 0, 0, { width: 595, height: 842 });
      if (!fs.existsSync(finalPath)) {
      return NextResponse.json(
        { error: "Imagem da capa não encontrada em /public/design.jpg" },
        { status: 500 }
      );
    }

      // fim
      doc.end();
    });
  } catch (error) {
    console.error("Erro ao gerar PDF:", error);
    return NextResponse.json(
      { error: "Erro ao gerar o PDF" },
      { status: 500 }
    );
  }
}


