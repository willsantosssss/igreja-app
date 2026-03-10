#!/usr/bin/env node

/**
 * Script para importar dados dos CSVs para o PostgreSQL do Railway usando SQL direto
 * 
 * Uso: node scripts/import-data-sql.js <caminho-para-csvs>
 * Exemplo: node scripts/import-data-sql.js /home/ubuntu/upload
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { parse } = require('csv-parse/sync');

const csvDir = process.argv[2] || '/home/ubuntu/upload';

if (!fs.existsSync(csvDir)) {
  console.error(`❌ Diretório não encontrado: ${csvDir}`);
  process.exit(1);
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('❌ DATABASE_URL não configurada');
  process.exit(1);
}

async function importData() {
  const sql = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log('📊 Iniciando importação de dados...\n');

    // Helper function to read and parse CSV
    function readCSV(filename) {
      const filepath = path.join(csvDir, filename);
      if (!fs.existsSync(filepath)) {
        return [];
      }
      const content = fs.readFileSync(filepath, 'utf-8');
      return parse(content, { columns: true, skip_empty_lines: true });
    }

    // 1. Import Users
    console.log('📥 Importando users...');
    const usersData = readCSV('users_20260310_151934.csv');
    if (usersData.length > 0) {
      let count = 0;
      for (const user of usersData) {
        try {
          await sql`
            INSERT INTO users (id, "openId", name, email, "passwordHash", "loginMethod", role, "createdAt", "updatedAt", "lastSignedIn")
            VALUES (
              ${parseInt(user.id)},
              ${user.openId},
              ${user.name || null},
              ${user.email || null},
              ${user.passwordHash || null},
              ${user.loginMethod || null},
              ${user.role || 'user'},
              ${new Date(user.createdAt)},
              ${new Date(user.updatedAt)},
              ${new Date(user.lastSignedIn)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "openId" = EXCLUDED."openId",
              name = EXCLUDED.name,
              email = EXCLUDED.email,
              "passwordHash" = EXCLUDED."passwordHash",
              "loginMethod" = EXCLUDED."loginMethod",
              role = EXCLUDED.role,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar usuário ${user.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} usuários importados`);
    }

    // 2. Import Células
    console.log('📥 Importando células...');
    const celulasData = readCSV('celulas_20260310_151919.csv');
    if (celulasData.length > 0) {
      let count = 0;
      for (const celula of celulasData) {
        try {
          await sql`
            INSERT INTO celulas (id, nome, lider, telefone, endereco, latitude, longitude, "diaReuniao", horario, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(celula.id)},
              ${celula.nome},
              ${celula.lider},
              ${celula.telefone},
              ${celula.endereco},
              ${celula.latitude},
              ${celula.longitude},
              ${celula.diaReuniao},
              ${celula.horario},
              ${new Date(celula.createdAt)},
              ${new Date(celula.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome,
              lider = EXCLUDED.lider,
              telefone = EXCLUDED.telefone,
              endereco = EXCLUDED.endereco,
              latitude = EXCLUDED.latitude,
              longitude = EXCLUDED.longitude,
              "diaReuniao" = EXCLUDED."diaReuniao",
              horario = EXCLUDED.horario,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar célula ${celula.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} células importadas`);
    }

    // 3. Import Eventos
    console.log('📥 Importando eventos...');
    const eventosData = readCSV('eventos_20260310_152007.csv');
    if (eventosData.length > 0) {
      let count = 0;
      for (const evento of eventosData) {
        try {
          await sql`
            INSERT INTO eventos (id, titulo, descricao, data, horario, local, tipo, "requireInscricao", "createdAt", "updatedAt")
            VALUES (
              ${parseInt(evento.id)},
              ${evento.titulo},
              ${evento.descricao},
              ${evento.data},
              ${evento.horario},
              ${evento.local},
              ${evento.tipo},
              ${parseInt(evento.requireInscricao) || 0},
              ${new Date(evento.createdAt)},
              ${new Date(evento.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              titulo = EXCLUDED.titulo,
              descricao = EXCLUDED.descricao,
              data = EXCLUDED.data,
              horario = EXCLUDED.horario,
              local = EXCLUDED.local,
              tipo = EXCLUDED.tipo,
              "requireInscricao" = EXCLUDED."requireInscricao",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar evento ${evento.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} eventos importados`);
    }

    // 4. Import Usuários Cadastrados
    console.log('📥 Importando usuários cadastrados...');
    const usuariosCadastradosData = readCSV('usuariosCadastrados_20260310_152037.csv');
    if (usuariosCadastradosData.length > 0) {
      let count = 0;
      for (const usuario of usuariosCadastradosData) {
        try {
          await sql`
            INSERT INTO "usuariosCadastrados" (id, "userId", nome, "dataNascimento", celula, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(usuario.id)},
              ${parseInt(usuario.userId)},
              ${usuario.nome},
              ${usuario.dataNascimento || null},
              ${usuario.celula},
              ${new Date(usuario.createdAt)},
              ${new Date(usuario.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "userId" = EXCLUDED."userId",
              nome = EXCLUDED.nome,
              "dataNascimento" = EXCLUDED."dataNascimento",
              celula = EXCLUDED.celula,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar usuário cadastrado ${usuario.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} usuários cadastrados importados`);
    }

    // 5. Import Noticias
    console.log('📥 Importando notícias...');
    const noticiasData = readCSV('noticias_20260310_152023.csv');
    if (noticiasData.length > 0) {
      let count = 0;
      for (const noticia of noticiasData) {
        try {
          await sql`
            INSERT INTO noticias (id, titulo, conteudo, data, "imagemUrl", destaque, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(noticia.id)},
              ${noticia.titulo},
              ${noticia.conteudo},
              ${noticia.data},
              ${noticia.imagemUrl || null},
              ${parseInt(noticia.destaque) || 0},
              ${new Date(noticia.createdAt)},
              ${new Date(noticia.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              titulo = EXCLUDED.titulo,
              conteudo = EXCLUDED.conteudo,
              data = EXCLUDED.data,
              "imagemUrl" = EXCLUDED."imagemUrl",
              destaque = EXCLUDED.destaque,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar notícia ${noticia.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} notícias importadas`);
    }

    // 6. Import Pedidos de Oração
    console.log('📥 Importando pedidos de oração...');
    const pedidosOracaoData = readCSV('pedidosOracao_20260310_152027.csv');
    if (pedidosOracaoData.length > 0) {
      let count = 0;
      for (const pedido of pedidosOracaoData) {
        try {
          await sql`
            INSERT INTO "pedidosOracao" (id, nome, descricao, categoria, "contadorOrando", respondido, testemunho, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(pedido.id)},
              ${pedido.nome},
              ${pedido.descricao},
              ${pedido.categoria},
              ${parseInt(pedido.contadorOrando) || 0},
              ${parseInt(pedido.respondido) || 0},
              ${pedido.testemunho || null},
              ${new Date(pedido.createdAt)},
              ${new Date(pedido.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              nome = EXCLUDED.nome,
              descricao = EXCLUDED.descricao,
              categoria = EXCLUDED.categoria,
              "contadorOrando" = EXCLUDED."contadorOrando",
              respondido = EXCLUDED.respondido,
              testemunho = EXCLUDED.testemunho,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar pedido de oração ${pedido.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} pedidos de oração importados`);
    }

    // 7. Import Líderes
    console.log('📥 Importando líderes...');
    const lideresData = readCSV('lideres_20260310_152020.csv');
    if (lideresData.length > 0) {
      let count = 0;
      for (const lider of lideresData) {
        try {
          await sql`
            INSERT INTO lideres (id, "userId", nome, celula, telefone, email, ativo, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(lider.id)},
              ${parseInt(lider.userId)},
              ${lider.nome},
              ${lider.celula},
              ${lider.telefone},
              ${lider.email || null},
              ${parseInt(lider.ativo) || 1},
              ${new Date(lider.createdAt)},
              ${new Date(lider.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "userId" = EXCLUDED."userId",
              nome = EXCLUDED.nome,
              celula = EXCLUDED.celula,
              telefone = EXCLUDED.telefone,
              email = EXCLUDED.email,
              ativo = EXCLUDED.ativo,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar líder ${lider.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} líderes importados`);
    }

    // 8. Import Inscrições em Eventos
    console.log('📥 Importando inscrições em eventos...');
    const inscricoesEventosData = readCSV('inscricoesEventos_20260310_152016.csv');
    if (inscricoesEventosData.length > 0) {
      let count = 0;
      for (const inscricao of inscricoesEventosData) {
        try {
          await sql`
            INSERT INTO "inscricoesEventos" (id, "eventoId", "userId", nome, telefone, celula, status, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(inscricao.id)},
              ${parseInt(inscricao.eventoId)},
              ${parseInt(inscricao.userId)},
              ${inscricao.nome},
              ${inscricao.telefone},
              ${inscricao.celula},
              ${inscricao.status || 'confirmado'},
              ${new Date(inscricao.createdAt)},
              ${new Date(inscricao.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "eventoId" = EXCLUDED."eventoId",
              "userId" = EXCLUDED."userId",
              nome = EXCLUDED.nome,
              telefone = EXCLUDED.telefone,
              celula = EXCLUDED.celula,
              status = EXCLUDED.status,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar inscrição em evento ${inscricao.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} inscrições em eventos importadas`);
    }

    // 9. Import Inscrições em Escola de Crescimento
    console.log('📥 Importando inscrições em escola de crescimento...');
    const inscricoesEscolaCrescimentoData = readCSV('inscricoesEscolaCrescimento_20260310_152012.csv');
    if (inscricoesEscolaCrescimentoData.length > 0) {
      let count = 0;
      for (const inscricao of inscricoesEscolaCrescimentoData) {
        try {
          await sql`
            INSERT INTO "inscricoesEscolaCrescimento" (id, "userId", nome, celula, curso, status, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(inscricao.id)},
              ${parseInt(inscricao.userId)},
              ${inscricao.nome},
              ${inscricao.celula},
              ${inscricao.curso},
              ${inscricao.status || 'confirmado'},
              ${new Date(inscricao.createdAt)},
              ${new Date(inscricao.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "userId" = EXCLUDED."userId",
              nome = EXCLUDED.nome,
              celula = EXCLUDED.celula,
              curso = EXCLUDED.curso,
              status = EXCLUDED.status,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar inscrição em escola ${inscricao.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} inscrições em escola de crescimento importadas`);
    }

    // 10. Import Dados de Contribuição
    console.log('📥 Importando dados de contribuição...');
    const dadosContribuicaoData = readCSV('dadosContribuicao_20260310_152003.csv');
    if (dadosContribuicaoData.length > 0) {
      let count = 0;
      for (const dados of dadosContribuicaoData) {
        try {
          await sql`
            INSERT INTO "dadosContribuicao" (id, "pixKey", "pixType", bank, agency, account, cnpj, titular, "mensagemMotivacional", "versiculoRef", "mensagemAgradecimento", "createdAt", "updatedAt")
            VALUES (
              ${parseInt(dados.id)},
              ${dados.pixKey},
              ${dados.pixType},
              ${dados.bank},
              ${dados.agency},
              ${dados.account},
              ${dados.cnpj},
              ${dados.titular},
              ${dados.mensagemMotivacional},
              ${dados.versiculoRef},
              ${dados.mensagemAgradecimento},
              ${new Date(dados.createdAt)},
              ${new Date(dados.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              "pixKey" = EXCLUDED."pixKey",
              "pixType" = EXCLUDED."pixType",
              bank = EXCLUDED.bank,
              agency = EXCLUDED.agency,
              account = EXCLUDED.account,
              cnpj = EXCLUDED.cnpj,
              titular = EXCLUDED.titular,
              "mensagemMotivacional" = EXCLUDED."mensagemMotivacional",
              "versiculoRef" = EXCLUDED."versiculoRef",
              "mensagemAgradecimento" = EXCLUDED."mensagemAgradecimento",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar dados de contribuição ${dados.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} dados de contribuição importados`);
    }

    // 11. Import Contatos da Igreja
    console.log('📥 Importando contatos da igreja...');
    const contatosIgrejaData = readCSV('contatosIgreja_20260310_151958.csv');
    if (contatosIgrejaData.length > 0) {
      let count = 0;
      for (const contato of contatosIgrejaData) {
        try {
          await sql`
            INSERT INTO "contatosIgreja" (id, telefone, whatsapp, email, "createdAt", "updatedAt")
            VALUES (
              ${parseInt(contato.id)},
              ${contato.telefone},
              ${contato.whatsapp},
              ${contato.email},
              ${new Date(contato.createdAt)},
              ${new Date(contato.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              telefone = EXCLUDED.telefone,
              whatsapp = EXCLUDED.whatsapp,
              email = EXCLUDED.email,
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar contato da igreja ${contato.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} contatos da igreja importados`);
    }

    // 12. Import Aviso Importante
    console.log('📥 Importando aviso importante...');
    const avisoImportanteData = readCSV('avisoImportante_20260310_151943.csv');
    if (avisoImportanteData.length > 0) {
      let count = 0;
      for (const aviso of avisoImportanteData) {
        try {
          await sql`
            INSERT INTO "avisoImportante" (id, titulo, mensagem, ativo, "dataExpiracao", "createdAt", "updatedAt")
            VALUES (
              ${parseInt(aviso.id)},
              ${aviso.titulo},
              ${aviso.mensagem},
              ${parseInt(aviso.ativo) || 1},
              ${aviso.dataExpiracao || null},
              ${new Date(aviso.createdAt)},
              ${new Date(aviso.updatedAt)}
            )
            ON CONFLICT (id) DO UPDATE SET
              titulo = EXCLUDED.titulo,
              mensagem = EXCLUDED.mensagem,
              ativo = EXCLUDED.ativo,
              "dataExpiracao" = EXCLUDED."dataExpiracao",
              "updatedAt" = EXCLUDED."updatedAt"
          `;
          count++;
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar aviso importante ${aviso.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${count} avisos importantes importados`);
    }

    console.log('\n✅ Importação concluída com sucesso!');
    await sql.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro durante importação:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importData();
