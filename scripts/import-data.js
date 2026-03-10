#!/usr/bin/env node

/**
 * Script para importar dados dos CSVs para o PostgreSQL do Railway
 * 
 * Uso: node scripts/import-data.js <caminho-para-csvs>
 * Exemplo: node scripts/import-data.js /home/ubuntu/upload
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const csv = require('csv-parse/sync');

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

    // 1. Importar Users
    console.log('📥 Importando users...');
    const usersFile = path.join(csvDir, 'users_20260310_151934.csv');
    if (fs.existsSync(usersFile)) {
      const usersData = fs.readFileSync(usersFile, 'utf-8');
      const users = csv.parse(usersData, { columns: true, skip_empty_lines: true });
      
      for (const user of users) {
        await sql`
          INSERT INTO users (id, openId, name, email, passwordHash, loginMethod, role, createdAt, updatedAt, lastSignedIn)
          VALUES (${user.id}, ${user.openId}, ${user.name}, ${user.email}, ${user.passwordHash}, ${user.loginMethod}, ${user.role}, ${user.createdAt}, ${user.updatedAt}, ${user.lastSignedIn})
          ON CONFLICT (id) DO UPDATE SET
            openId = EXCLUDED.openId,
            name = EXCLUDED.name,
            email = EXCLUDED.email,
            passwordHash = EXCLUDED.passwordHash,
            loginMethod = EXCLUDED.loginMethod,
            role = EXCLUDED.role,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${users.length} usuários importados`);
    }

    // 2. Importar Células
    console.log('📥 Importando células...');
    const celulasFile = path.join(csvDir, 'celulas_20260310_151919.csv');
    if (fs.existsSync(celulasFile)) {
      const celulasData = fs.readFileSync(celulasFile, 'utf-8');
      const celulas = csv.parse(celulasData, { columns: true, skip_empty_lines: true });
      
      for (const celula of celulas) {
        await sql`
          INSERT INTO celulas (id, nome, lider, telefone, endereco, latitude, longitude, diaReuniao, horario, createdAt, updatedAt)
          VALUES (${celula.id}, ${celula.nome}, ${celula.lider}, ${celula.telefone}, ${celula.endereco}, ${celula.latitude}, ${celula.longitude}, ${celula.diaReuniao}, ${celula.horario}, ${celula.createdAt}, ${celula.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            lider = EXCLUDED.lider,
            telefone = EXCLUDED.telefone,
            endereco = EXCLUDED.endereco,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            diaReuniao = EXCLUDED.diaReuniao,
            horario = EXCLUDED.horario,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${celulas.length} células importadas`);
    }

    // 3. Importar Eventos
    console.log('📥 Importando eventos...');
    const eventosFile = path.join(csvDir, 'eventos_20260310_152007.csv');
    if (fs.existsSync(eventosFile)) {
      const eventosData = fs.readFileSync(eventosFile, 'utf-8');
      const eventos = csv.parse(eventosData, { columns: true, skip_empty_lines: true });
      
      for (const evento of eventos) {
        await sql`
          INSERT INTO eventos (id, titulo, descricao, data, horario, local, tipo, requireInscricao, createdAt, updatedAt)
          VALUES (${evento.id}, ${evento.titulo}, ${evento.descricao}, ${evento.data}, ${evento.horario}, ${evento.local}, ${evento.tipo}, ${evento.requireInscricao}, ${evento.createdAt}, ${evento.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            titulo = EXCLUDED.titulo,
            descricao = EXCLUDED.descricao,
            data = EXCLUDED.data,
            horario = EXCLUDED.horario,
            local = EXCLUDED.local,
            tipo = EXCLUDED.tipo,
            requireInscricao = EXCLUDED.requireInscricao,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${eventos.length} eventos importados`);
    }

    // 4. Importar Usuários Cadastrados
    console.log('📥 Importando usuários cadastrados...');
    const usuariosCadastradosFile = path.join(csvDir, 'usuariosCadastrados_20260310_152037.csv');
    if (fs.existsSync(usuariosCadastradosFile)) {
      const usuariosCadastradosData = fs.readFileSync(usuariosCadastradosFile, 'utf-8');
      const usuariosCadastrados = csv.parse(usuariosCadastradosData, { columns: true, skip_empty_lines: true });
      
      for (const usuario of usuariosCadastrados) {
        await sql`
          INSERT INTO usuariosCadastrados (id, userId, nome, dataNascimento, celula, createdAt, updatedAt)
          VALUES (${usuario.id}, ${usuario.userId}, ${usuario.nome}, ${usuario.dataNascimento}, ${usuario.celula}, ${usuario.createdAt}, ${usuario.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            userId = EXCLUDED.userId,
            nome = EXCLUDED.nome,
            dataNascimento = EXCLUDED.dataNascimento,
            celula = EXCLUDED.celula,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${usuariosCadastrados.length} usuários cadastrados importados`);
    }

    // 5. Importar Noticias
    console.log('📥 Importando notícias...');
    const noticiasFile = path.join(csvDir, 'noticias_20260310_152023.csv');
    if (fs.existsSync(noticiasFile)) {
      const noticiasData = fs.readFileSync(noticiasFile, 'utf-8');
      const noticias = csv.parse(noticiasData, { columns: true, skip_empty_lines: true });
      
      for (const noticia of noticias) {
        await sql`
          INSERT INTO noticias (id, titulo, conteudo, data, imagemUrl, destaque, createdAt, updatedAt)
          VALUES (${noticia.id}, ${noticia.titulo}, ${noticia.conteudo}, ${noticia.data}, ${noticia.imagemUrl}, ${noticia.destaque}, ${noticia.createdAt}, ${noticia.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            titulo = EXCLUDED.titulo,
            conteudo = EXCLUDED.conteudo,
            data = EXCLUDED.data,
            imagemUrl = EXCLUDED.imagemUrl,
            destaque = EXCLUDED.destaque,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${noticias.length} notícias importadas`);
    }

    // 6. Importar Pedidos de Oração
    console.log('📥 Importando pedidos de oração...');
    const pedidosOracaoFile = path.join(csvDir, 'pedidosOracao_20260310_152027.csv');
    if (fs.existsSync(pedidosOracaoFile)) {
      const pedidosOracaoData = fs.readFileSync(pedidosOracaoFile, 'utf-8');
      const pedidosOracao = csv.parse(pedidosOracaoData, { columns: true, skip_empty_lines: true });
      
      for (const pedido of pedidosOracao) {
        await sql`
          INSERT INTO pedidosOracao (id, nome, descricao, categoria, contadorOrando, respondido, testemunho, createdAt, updatedAt)
          VALUES (${pedido.id}, ${pedido.nome}, ${pedido.descricao}, ${pedido.categoria}, ${pedido.contadorOrando}, ${pedido.respondido}, ${pedido.testemunho}, ${pedido.createdAt}, ${pedido.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            nome = EXCLUDED.nome,
            descricao = EXCLUDED.descricao,
            categoria = EXCLUDED.categoria,
            contadorOrando = EXCLUDED.contadorOrando,
            respondido = EXCLUDED.respondido,
            testemunho = EXCLUDED.testemunho,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${pedidosOracao.length} pedidos de oração importados`);
    }

    // 7. Importar Líderes
    console.log('📥 Importando líderes...');
    const lideresFile = path.join(csvDir, 'lideres_20260310_152020.csv');
    if (fs.existsSync(lideresFile)) {
      const lideresData = fs.readFileSync(lideresFile, 'utf-8');
      const lideres = csv.parse(lideresData, { columns: true, skip_empty_lines: true });
      
      for (const lider of lideres) {
        await sql`
          INSERT INTO lideres (id, userId, nome, celula, telefone, email, ativo, createdAt, updatedAt)
          VALUES (${lider.id}, ${lider.userId}, ${lider.nome}, ${lider.celula}, ${lider.telefone}, ${lider.email}, ${lider.ativo}, ${lider.createdAt}, ${lider.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            userId = EXCLUDED.userId,
            nome = EXCLUDED.nome,
            celula = EXCLUDED.celula,
            telefone = EXCLUDED.telefone,
            email = EXCLUDED.email,
            ativo = EXCLUDED.ativo,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${lideres.length} líderes importados`);
    }

    // 8. Importar Inscrições em Eventos
    console.log('📥 Importando inscrições em eventos...');
    const inscricoesEventosFile = path.join(csvDir, 'inscricoesEventos_20260310_152016.csv');
    if (fs.existsSync(inscricoesEventosFile)) {
      const inscricoesEventosData = fs.readFileSync(inscricoesEventosFile, 'utf-8');
      const inscricoesEventos = csv.parse(inscricoesEventosData, { columns: true, skip_empty_lines: true });
      
      for (const inscricao of inscricoesEventos) {
        await sql`
          INSERT INTO inscricoesEventos (id, eventoId, userId, nome, telefone, celula, status, createdAt, updatedAt)
          VALUES (${inscricao.id}, ${inscricao.eventoId}, ${inscricao.userId}, ${inscricao.nome}, ${inscricao.telefone}, ${inscricao.celula}, ${inscricao.status}, ${inscricao.createdAt}, ${inscricao.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            eventoId = EXCLUDED.eventoId,
            userId = EXCLUDED.userId,
            nome = EXCLUDED.nome,
            telefone = EXCLUDED.telefone,
            celula = EXCLUDED.celula,
            status = EXCLUDED.status,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${inscricoesEventos.length} inscrições em eventos importadas`);
    }

    // 9. Importar Inscrições em Escola de Crescimento
    console.log('📥 Importando inscrições em escola de crescimento...');
    const inscricoesEscolaCrescimentoFile = path.join(csvDir, 'inscricoesEscolaCrescimento_20260310_152012.csv');
    if (fs.existsSync(inscricoesEscolaCrescimentoFile)) {
      const inscricoesEscolaCrescimentoData = fs.readFileSync(inscricoesEscolaCrescimentoFile, 'utf-8');
      const inscricoesEscolaCrescimento = csv.parse(inscricoesEscolaCrescimentoData, { columns: true, skip_empty_lines: true });
      
      for (const inscricao of inscricoesEscolaCrescimento) {
        await sql`
          INSERT INTO inscricoesEscolaCrescimento (id, userId, nome, celula, curso, status, createdAt, updatedAt)
          VALUES (${inscricao.id}, ${inscricao.userId}, ${inscricao.nome}, ${inscricao.celula}, ${inscricao.curso}, ${inscricao.status}, ${inscricao.createdAt}, ${inscricao.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            userId = EXCLUDED.userId,
            nome = EXCLUDED.nome,
            celula = EXCLUDED.celula,
            curso = EXCLUDED.curso,
            status = EXCLUDED.status,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${inscricoesEscolaCrescimento.length} inscrições em escola de crescimento importadas`);
    }

    // 10. Importar Dados de Contribuição
    console.log('📥 Importando dados de contribuição...');
    const dadosContribuicaoFile = path.join(csvDir, 'dadosContribuicao_20260310_152003.csv');
    if (fs.existsSync(dadosContribuicaoFile)) {
      const dadosContribuicaoData = fs.readFileSync(dadosContribuicaoFile, 'utf-8');
      const dadosContribuicao = csv.parse(dadosContribuicaoData, { columns: true, skip_empty_lines: true });
      
      for (const dados of dadosContribuicao) {
        await sql`
          INSERT INTO dadosContribuicao (id, pixKey, pixType, bank, agency, account, cnpj, titular, mensagemMotivacional, versiculoRef, mensagemAgradecimento, createdAt, updatedAt)
          VALUES (${dados.id}, ${dados.pixKey}, ${dados.pixType}, ${dados.bank}, ${dados.agency}, ${dados.account}, ${dados.cnpj}, ${dados.titular}, ${dados.mensagemMotivacional}, ${dados.versiculoRef}, ${dados.mensagemAgradecimento}, ${dados.createdAt}, ${dados.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            pixKey = EXCLUDED.pixKey,
            pixType = EXCLUDED.pixType,
            bank = EXCLUDED.bank,
            agency = EXCLUDED.agency,
            account = EXCLUDED.account,
            cnpj = EXCLUDED.cnpj,
            titular = EXCLUDED.titular,
            mensagemMotivacional = EXCLUDED.mensagemMotivacional,
            versiculoRef = EXCLUDED.versiculoRef,
            mensagemAgradecimento = EXCLUDED.mensagemAgradecimento,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${dadosContribuicao.length} dados de contribuição importados`);
    }

    // 11. Importar Contatos da Igreja
    console.log('📥 Importando contatos da igreja...');
    const contatosIgrejaFile = path.join(csvDir, 'contatosIgreja_20260310_151958.csv');
    if (fs.existsSync(contatosIgrejaFile)) {
      const contatosIgrejaData = fs.readFileSync(contatosIgrejaFile, 'utf-8');
      const contatosIgreja = csv.parse(contatosIgrejaData, { columns: true, skip_empty_lines: true });
      
      for (const contato of contatosIgreja) {
        await sql`
          INSERT INTO contatosIgreja (id, telefone, whatsapp, email, createdAt, updatedAt)
          VALUES (${contato.id}, ${contato.telefone}, ${contato.whatsapp}, ${contato.email}, ${contato.createdAt}, ${contato.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            telefone = EXCLUDED.telefone,
            whatsapp = EXCLUDED.whatsapp,
            email = EXCLUDED.email,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${contatosIgreja.length} contatos da igreja importados`);
    }

    // 12. Importar Aviso Importante
    console.log('📥 Importando aviso importante...');
    const avisoImportanteFile = path.join(csvDir, 'avisoImportante_20260310_151943.csv');
    if (fs.existsSync(avisoImportanteFile)) {
      const avisoImportanteData = fs.readFileSync(avisoImportanteFile, 'utf-8');
      const avisoImportante = csv.parse(avisoImportanteData, { columns: true, skip_empty_lines: true });
      
      for (const aviso of avisoImportante) {
        await sql`
          INSERT INTO avisoImportante (id, titulo, mensagem, ativo, dataExpiracao, createdAt, updatedAt)
          VALUES (${aviso.id}, ${aviso.titulo}, ${aviso.mensagem}, ${aviso.ativo}, ${aviso.dataExpiracao}, ${aviso.createdAt}, ${aviso.updatedAt})
          ON CONFLICT (id) DO UPDATE SET
            titulo = EXCLUDED.titulo,
            mensagem = EXCLUDED.mensagem,
            ativo = EXCLUDED.ativo,
            dataExpiracao = EXCLUDED.dataExpiracao,
            updatedAt = EXCLUDED.updatedAt
        `;
      }
      console.log(`  ✅ ${avisoImportante.length} avisos importantes importados`);
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
