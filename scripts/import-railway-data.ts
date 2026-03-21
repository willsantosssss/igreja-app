import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

// Dados reais para importar
const DADOS = {
  eventos: [
    {
      id: 120001,
      titulo: "CEIA DO SENHOR",
      descricao: "O convite para estarmos à mesa de Jesus se extende a todos os que nele é confiam suas vidas a Ele. Vamos juntos!",
      data: "2026-04-05",
      horario: "19:00",
      local: "2IEQ",
      tipo: "culto",
      requireInscricao: 0,
    },
    {
      id: 120002,
      titulo: "DIA DA VISÃO 2026",
      descricao: "A visão está muito clara, o propósito está diante de nós. Chame toda sua célula e vamos juntos. Será maravilhoso!",
      data: "2026-03-07",
      horario: "16:00",
      local: "2IEQ",
      tipo: "evento-especial",
      requireInscricao: 0,
    },
    {
      id: 150001,
      titulo: "CULTO DA FAMILIA",
      descricao: "Vamos celebrar junto ao nosso Rei.",
      data: "2026-03-22",
      horario: "19:00",
      local: "2IEQ",
      tipo: "culto",
      requireInscricao: 0,
    },
    {
      id: 240001,
      titulo: "Evento teste",
      descricao: "Encontro",
      data: "2026-03-22",
      horario: "19:00",
      local: "2IEQ",
      tipo: "evento-especial",
      requireInscricao: 0,
    },
  ],
  inscricoesEventos: [
    { id: 300003, eventoId: 240001, nomeInscrito: "Novo teste", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Pr. Will e Pra. Fernanda" },
    { id: 300004, eventoId: 240001, nomeInscrito: "Teste vb", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Pr. Will e Pra. Fernanda" },
    { id: 300005, eventoId: 240001, nomeInscrito: "teste testes", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Pr. Will e Pra. Fernanda" },
    { id: 300006, eventoId: 240001, nomeInscrito: "Agora sim", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Wellington e Joice" },
    { id: 300007, eventoId: 240001, nomeInscrito: "teste kkkk", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Pr. Will e Pra. Fernanda" },
    { id: 330001, eventoId: 120002, nomeInscrito: "Teste falso", emailInscrito: "", telefoneinscrito: "+5566996357700", celulaInscrito: "Jucilene" },
  ],
  inscricoesEscolaCrescimento: [
    { id: 180001, nome: "Teste tu", email: "", celula: "Deisiane", curso: "Conecte" },
    { id: 180002, nome: "Estes do", email: "", celula: "Adalberto e Julia", curso: "Lidere 1" },
  ],
  lideres: [
    { id: 150002, nome: "Guilherme", email: "oguicaiofilmmaker@gmail.com", telefone: "123456", celula: "Guilherme e Maria Eduarda", funcao: "Líder de Célula" },
    { id: 150003, nome: "Pra. Fernanda", email: "fernandaborgeslima@gmail.com", telefone: "121722", celula: "Pr. Will e Pra. Fernanda", funcao: "Líder de Célula" },
    { id: 180002, nome: "Pr. Will", email: "prwill@example.com", telefone: "250866", celula: "Pr. Will e Pra. Fernanda", funcao: "Pastor" },
    { id: 270002, nome: "Wellington", email: "wellingtonpc89@gmail.com", telefone: "123456", celula: "Wellington e Joice", funcao: "Líder de Célula" },
    { id: 270003, nome: "Joice", email: "joicebarbosaoliveira6@gmail.com", telefone: "123456", celula: "Wellington e Joice", funcao: "Líder de Célula" },
    { id: 270004, nome: "Deisiane", email: "deisisouza453@gmail.com", telefone: "123456", celula: "Deisiane", funcao: "Líder de Célula" },
    { id: 270005, nome: "Jucilene", email: "jucilenerochadesouza0@gmail.com", telefone: "123456", celula: "Jucilene", funcao: "Líder de Célula" },
    { id: 270006, nome: "Beto", email: "betonegofilho@gmail.com", telefone: "123456", celula: "Adalberto e Julia", funcao: "Líder de Célula" },
    { id: 270007, nome: "Julia", email: "anajuliadias256@gmail.com", telefone: "123456", celula: "Adalberto e Julia", funcao: "Líder de Célula" },
    { id: 270008, nome: "Kacio", email: "kacio.rts@gmail.com", telefone: "123456", celula: "Kacio e Nivia", funcao: "Líder de Célula" },
    { id: 270009, nome: "Nivia", email: "niviacorreasilva@gmail.com", telefone: "123456", celula: "Kacio e Nivia", funcao: "Líder de Célula" },
    { id: 270010, nome: "Vitor", email: "vitolahugosantos@gmail.com", telefone: "123456", celula: "Vitor e Rayara", funcao: "Líder de Célula" },
    { id: 270011, nome: "Rayara", email: "rayaragabriel99@gmail.com", telefone: "123456", celula: "Vitor e Rayara", funcao: "Líder de Célula" },
    { id: 270012, nome: "João", email: "joaoluansantiago@gmail.com", telefone: "123456", celula: "João Luan e Karine", funcao: "Líder de Célula" },
    { id: 270013, nome: "Karine", email: "Karine123@gmail.com", telefone: "123456", celula: "João Luan e Karine", funcao: "Líder de Célula" },
    { id: 270014, nome: "Madu", email: "maduoliveira@gmail.com", telefone: "123456", celula: "Guilherme e Maria Eduarda", funcao: "Líder de Célula" },
    { id: 270015, nome: "Vitor", email: "vitorindiano12@gmail.com", telefone: "123456", celula: "Vitor Indiano e Mariani", funcao: "Líder de Célula" },
    { id: 270016, nome: "Mariani", email: "marianiantoniadiasrodrigues@gmail.com", telefone: "123456", celula: "Vitor Indiano e Mariani", funcao: "Líder de Célula" },
  ],
  users: [
    { id: 30598, email: "2ieqroo@gmail.com", name: "Pr. Will", password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
    { id: 90002, email: "oguicaiofilmmaker@gmail.com", name: "Guilherme Caio", password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
    { id: 90003, email: "fernandaborgeslima@gmail.com", name: "Fernanda Borges", password: "8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92" },
  ],
  pagamentos_eventos: [
    { id: 1, eventoId: 240001, nomeInscrito: "Cruzada Nacional de Evangelização", emailInscrito: "", valor: "R$ 180,00", dataPagamento: "2026-03-20", status: "pendente" },
    { id: 2, eventoId: 240001, nomeInscrito: "Cruzada Nacional de Evangelização", emailInscrito: "", valor: "R$ 180,00", dataPagamento: "2026-03-20", status: "pago" },
    { id: 30001, eventoId: 120002, nomeInscrito: "Cruzada Nacional de Evangelização", emailInscrito: "", valor: "R$ 180,00", dataPagamento: "2026-03-20", status: "pago" },
  ],
  pedidosOracao: [
    { id: 60001, nome: "Pelo batismo", email: "", pedido: "Para que as pessoas possam tomar a decisão de nascer de novo", dataRequisicao: new Date("2026-02-19 14:29:36") },
    { id: 90001, nome: "Cura para a vó Luzia", email: "", pedido: "Temos orado para que o Senhor cure ela completamente do AVC sofrido que paralisou seu lado direito. Cremos no milagre. 🙏🏼", dataRequisicao: new Date("2026-03-19 20:35:45") },
  ],
  noticias: [
    { id: 1, titulo: "ENCONTRO COM DEUS KIDS", conteudo: "Foi incrível! Nossas crianças foram alcançadas e impactadas pela glória de Deus.", data: "2026-03-14" },
  ],
  relatorios: [
    { id: 330001, titulo: "Relatório Semanal", descricao: "Pr. Will e Pra. Fernanda", observacoes: "Presentes: 24, Novos Visitantes: 1, Conversões: 0", dataRelatorio: "2026-03-19" },
  ],
  usuariosCadastrados: [
    { id: 30017, nome: "Pr. Will", email: "", telefone: "", dataRegistro: new Date("2026-02-19 20:12:47") },
    { id: 90001, nome: "Guilherme Caio Silva Costa", email: "", telefone: "", dataRegistro: new Date("2026-02-23 23:20:21") },
    { id: 90002, nome: "Fernanda Borges Lima Santos", email: "", telefone: "", dataRegistro: new Date("2026-02-23 23:36:59") },
  ],
};

async function importData() {
  // Parse DATABASE_URL properly
  const dbUrl = process.env.DATABASE_URL || "";
  const url = new URL(dbUrl.replace(/\?.*$/, "")); // Remove query params
  
  const pool = mysql.createPool({
    host: url.hostname,
    port: parseInt(url.port || "3306"),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const connection = await pool.getConnection();
    console.log("✅ Conectado ao banco de dados!");

    // Limpar tabelas existentes
    console.log("\n🗑️  Limpando tabelas existentes...");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 0");
    await connection.execute("TRUNCATE TABLE usuariosCadastrados");
    await connection.execute("TRUNCATE TABLE relatorios");
    await connection.execute("TRUNCATE TABLE anexos");
    await connection.execute("TRUNCATE TABLE noticias");
    await connection.execute("TRUNCATE TABLE pedidosOracao");
    await connection.execute("TRUNCATE TABLE pagamentos_eventos");
    await connection.execute("TRUNCATE TABLE inscricoesEscolaCrescimento");
    await connection.execute("TRUNCATE TABLE inscricoesEventos");
    await connection.execute("TRUNCATE TABLE lideres");
    await connection.execute("TRUNCATE TABLE users");
    await connection.execute("TRUNCATE TABLE eventos");
    await connection.execute("SET FOREIGN_KEY_CHECKS = 1");
    console.log("✅ Tabelas limpas!");

    // Inserir eventos
    console.log("\n📝 Inserindo eventos...");
    for (const evento of DADOS.eventos) {
      await connection.execute(
        "INSERT INTO eventos (id, titulo, descricao, data, horario, local, tipo, requireInscricao) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [evento.id, evento.titulo, evento.descricao, evento.data, evento.horario, evento.local, evento.tipo, evento.requireInscricao]
      );
      console.log(`  ✅ ${evento.titulo}`);
    }

    // Inserir inscrições em eventos
    console.log("\n📝 Inserindo inscrições em eventos...");
    for (const inscricao of DADOS.inscricoesEventos) {
      await connection.execute(
        "INSERT INTO inscricoesEventos (id, eventoId, nomeInscrito, emailInscrito, telefoneInscrito, celulaInscrito) VALUES (?, ?, ?, ?, ?, ?)",
        [inscricao.id, inscricao.eventoId, inscricao.nomeInscrito, inscricao.emailInscrito || null, inscricao.telefoneinscrito || null, inscricao.celulaInscrito]
      );
      console.log(`  ✅ ${inscricao.nomeInscrito}`);
    }

    // Inserir inscrições em Escola de Crescimento
    console.log("\n📝 Inserindo inscrições em Escola de Crescimento...");
    for (const inscricao of DADOS.inscricoesEscolaCrescimento) {
      await connection.execute(
        "INSERT INTO inscricoesEscolaCrescimento (id, nome, email, celula, curso) VALUES (?, ?, ?, ?, ?)",
        [inscricao.id, inscricao.nome, inscricao.email, inscricao.celula, inscricao.curso]
      );
      console.log(`  ✅ ${inscricao.nome}`);
    }

    // Inserir líderes
    console.log("\n📝 Inserindo líderes...");
    for (const lider of DADOS.lideres) {
      await connection.execute(
        "INSERT INTO lideres (id, nome, email, telefone, celula, funcao) VALUES (?, ?, ?, ?, ?, ?)",
        [lider.id, lider.nome, lider.email, lider.telefone, lider.celula, lider.funcao]
      );
      console.log(`  ✅ ${lider.nome}`);
    }

    // Inserir usuários
    console.log("\n📝 Inserindo usuários...");
    for (const user of DADOS.users) {
      await connection.execute(
        "INSERT INTO users (id, email, name, password) VALUES (?, ?, ?, ?)",
        [user.id, user.email, user.name, user.password]
      );
      console.log(`  ✅ ${user.name}`);
    }

    // Inserir pagamentos
    console.log("\n📝 Inserindo pagamentos...");
    for (const pagamento of DADOS.pagamentos_eventos) {
      await connection.execute(
        "INSERT INTO pagamentos_eventos (id, eventoId, nomeInscrito, emailInscrito, valor, dataPagamento, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [pagamento.id, pagamento.eventoId, pagamento.nomeInscrito, pagamento.emailInscrito, pagamento.valor, pagamento.dataPagamento, pagamento.status]
      );
      console.log(`  ✅ Pagamento ${pagamento.id}`);
    }

    // Inserir pedidos de oração
    console.log("\n📝 Inserindo pedidos de oração...");
    for (const pedido of DADOS.pedidosOracao) {
      await connection.execute(
        "INSERT INTO pedidosOracao (id, nome, email, pedido, dataRequisicao) VALUES (?, ?, ?, ?, ?)",
        [pedido.id, pedido.nome, pedido.email, pedido.pedido, pedido.dataRequisicao]
      );
      console.log(`  ✅ ${pedido.nome}`);
    }

    // Inserir notícias
    console.log("\n📝 Inserindo notícias...");
    for (const noticia of DADOS.noticias) {
      await connection.execute(
        "INSERT INTO noticias (id, titulo, conteudo, data) VALUES (?, ?, ?, ?)",
        [noticia.id, noticia.titulo, noticia.conteudo, noticia.data]
      );
      console.log(`  ✅ ${noticia.titulo}`);
    }

    // Inserir relatórios
    console.log("\n📝 Inserindo relatórios...");
    for (const relatorio of DADOS.relatorios) {
      await connection.execute(
        "INSERT INTO relatorios (id, titulo, descricao, observacoes, dataRelatorio) VALUES (?, ?, ?, ?, ?)",
        [relatorio.id, relatorio.titulo, relatorio.descricao, relatorio.observacoes, relatorio.dataRelatorio]
      );
      console.log(`  ✅ ${relatorio.titulo}`);
    }

    // Inserir usuários cadastrados
    console.log("\n📝 Inserindo usuários cadastrados...");
    for (const usuario of DADOS.usuariosCadastrados) {
      await connection.execute(
        "INSERT INTO usuariosCadastrados (id, nome, email, telefone, dataRegistro) VALUES (?, ?, ?, ?, ?)",
        [usuario.id, usuario.nome, usuario.email, usuario.telefone, usuario.dataRegistro]
      );
      console.log(`  ✅ ${usuario.nome}`);
    }

    console.log("\n✅ Todos os dados foram importados com sucesso!");

    // Verificar totais
    const [eventosCount] = await connection.execute("SELECT COUNT(*) as count FROM eventos");
    const [inscricoesCount] = await connection.execute("SELECT COUNT(*) as count FROM inscricoesEventos");
    const [lideresCount] = await connection.execute("SELECT COUNT(*) as count FROM lideres");
    const [usersCount] = await connection.execute("SELECT COUNT(*) as count FROM users");

    console.log("\n📊 Resumo:");
    console.log(`  Eventos: ${(eventosCount as any)[0].count}`);
    console.log(`  Inscrições em Eventos: ${(inscricoesCount as any)[0].count}`);
    console.log(`  Líderes: ${(lideresCount as any)[0].count}`);
    console.log(`  Usuários: ${(usersCount as any)[0].count}`);

    connection.release();
  } catch (error) {
    console.error("❌ Erro:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

importData();
