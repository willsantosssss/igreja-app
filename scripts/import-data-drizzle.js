#!/usr/bin/env node

/**
 * Script para importar dados dos CSVs para o PostgreSQL do Railway usando Drizzle ORM
 * 
 * Uso: node scripts/import-data-drizzle.js <caminho-para-csvs>
 * Exemplo: node scripts/import-data-drizzle.js /home/ubuntu/upload
 */

const fs = require('fs');
const path = require('path');
const postgres = require('postgres');
const { drizzle } = require('drizzle-orm/postgres-js');
const { parse } = require('csv-parse/sync');

// Import schema
const {
  users, celulas, eventos, usuariosCadastrados, noticias, pedidosOracao,
  lideres, inscricoesEventos, inscricoesEscolaCrescimento, dadosContribuicao,
  contatosIgreja, avisoImportante
} = require('../drizzle/schema');

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
  const client = postgres(DATABASE_URL, {
    ssl: { rejectUnauthorized: false }
  });

  const db = drizzle(client);

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
      for (const user of usersData) {
        const userData = {
          id: parseInt(user.id),
          openId: user.openId,
          name: user.name || null,
          email: user.email || null,
          passwordHash: user.passwordHash || null,
          loginMethod: user.loginMethod || null,
          role: user.role || 'user',
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
          lastSignedIn: new Date(user.lastSignedIn)
        };
        
        try {
          await db.insert(users).values(userData).onConflictDoUpdate({
            target: users.id,
            set: userData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar usuário ${user.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${usersData.length} usuários importados`);
    }

    // 2. Import Células
    console.log('📥 Importando células...');
    const celulasData = readCSV('celulas_20260310_151919.csv');
    if (celulasData.length > 0) {
      for (const celula of celulasData) {
        const celulaData = {
          id: parseInt(celula.id),
          nome: celula.nome,
          lider: celula.lider,
          telefone: celula.telefone,
          endereco: celula.endereco,
          latitude: celula.latitude,
          longitude: celula.longitude,
          diaReuniao: celula.diaReuniao,
          horario: celula.horario,
          createdAt: new Date(celula.createdAt),
          updatedAt: new Date(celula.updatedAt)
        };
        
        try {
          await db.insert(celulas).values(celulaData).onConflictDoUpdate({
            target: celulas.id,
            set: celulaData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar célula ${celula.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${celulasData.length} células importadas`);
    }

    // 3. Import Eventos
    console.log('📥 Importando eventos...');
    const eventosData = readCSV('eventos_20260310_152007.csv');
    if (eventosData.length > 0) {
      for (const evento of eventosData) {
        const eventoData = {
          id: parseInt(evento.id),
          titulo: evento.titulo,
          descricao: evento.descricao,
          data: evento.data,
          horario: evento.horario,
          local: evento.local,
          tipo: evento.tipo,
          requireInscricao: parseInt(evento.requireInscricao) || 0,
          createdAt: new Date(evento.createdAt),
          updatedAt: new Date(evento.updatedAt)
        };
        
        try {
          await db.insert(eventos).values(eventoData).onConflictDoUpdate({
            target: eventos.id,
            set: eventoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar evento ${evento.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${eventosData.length} eventos importados`);
    }

    // 4. Import Usuários Cadastrados
    console.log('📥 Importando usuários cadastrados...');
    const usuariosCadastradosData = readCSV('usuariosCadastrados_20260310_152037.csv');
    if (usuariosCadastradosData.length > 0) {
      for (const usuario of usuariosCadastradosData) {
        const usuarioData = {
          id: parseInt(usuario.id),
          userId: parseInt(usuario.userId),
          nome: usuario.nome,
          dataNascimento: usuario.dataNascimento || null,
          celula: usuario.celula,
          createdAt: new Date(usuario.createdAt),
          updatedAt: new Date(usuario.updatedAt)
        };
        
        try {
          await db.insert(usuariosCadastrados).values(usuarioData).onConflictDoUpdate({
            target: usuariosCadastrados.id,
            set: usuarioData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar usuário cadastrado ${usuario.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${usuariosCadastradosData.length} usuários cadastrados importados`);
    }

    // 5. Import Noticias
    console.log('📥 Importando notícias...');
    const noticiasData = readCSV('noticias_20260310_152023.csv');
    if (noticiasData.length > 0) {
      for (const noticia of noticiasData) {
        const noticiaData = {
          id: parseInt(noticia.id),
          titulo: noticia.titulo,
          conteudo: noticia.conteudo,
          data: noticia.data,
          imagemUrl: noticia.imagemUrl || null,
          destaque: parseInt(noticia.destaque) || 0,
          createdAt: new Date(noticia.createdAt),
          updatedAt: new Date(noticia.updatedAt)
        };
        
        try {
          await db.insert(noticias).values(noticiaData).onConflictDoUpdate({
            target: noticias.id,
            set: noticiaData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar notícia ${noticia.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${noticiasData.length} notícias importadas`);
    }

    // 6. Import Pedidos de Oração
    console.log('📥 Importando pedidos de oração...');
    const pedidosOracaoData = readCSV('pedidosOracao_20260310_152027.csv');
    if (pedidosOracaoData.length > 0) {
      for (const pedido of pedidosOracaoData) {
        const pedidoData = {
          id: parseInt(pedido.id),
          nome: pedido.nome,
          descricao: pedido.descricao,
          categoria: pedido.categoria,
          contadorOrando: parseInt(pedido.contadorOrando) || 0,
          respondido: parseInt(pedido.respondido) || 0,
          testemunho: pedido.testemunho || null,
          createdAt: new Date(pedido.createdAt),
          updatedAt: new Date(pedido.updatedAt)
        };
        
        try {
          await db.insert(pedidosOracao).values(pedidoData).onConflictDoUpdate({
            target: pedidosOracao.id,
            set: pedidoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar pedido de oração ${pedido.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${pedidosOracaoData.length} pedidos de oração importados`);
    }

    // 7. Import Líderes
    console.log('📥 Importando líderes...');
    const lideresData = readCSV('lideres_20260310_152020.csv');
    if (lideresData.length > 0) {
      for (const lider of lideresData) {
        const liderData = {
          id: parseInt(lider.id),
          userId: parseInt(lider.userId),
          nome: lider.nome,
          celula: lider.celula,
          telefone: lider.telefone,
          email: lider.email || null,
          ativo: parseInt(lider.ativo) || 1,
          createdAt: new Date(lider.createdAt),
          updatedAt: new Date(lider.updatedAt)
        };
        
        try {
          await db.insert(lideres).values(liderData).onConflictDoUpdate({
            target: lideres.id,
            set: liderData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar líder ${lider.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${lideresData.length} líderes importados`);
    }

    // 8. Import Inscrições em Eventos
    console.log('📥 Importando inscrições em eventos...');
    const inscricoesEventosData = readCSV('inscricoesEventos_20260310_152016.csv');
    if (inscricoesEventosData.length > 0) {
      for (const inscricao of inscricoesEventosData) {
        const inscricaoData = {
          id: parseInt(inscricao.id),
          eventoId: parseInt(inscricao.eventoId),
          userId: parseInt(inscricao.userId),
          nome: inscricao.nome,
          telefone: inscricao.telefone,
          celula: inscricao.celula,
          status: inscricao.status || 'confirmado',
          createdAt: new Date(inscricao.createdAt),
          updatedAt: new Date(inscricao.updatedAt)
        };
        
        try {
          await db.insert(inscricoesEventos).values(inscricaoData).onConflictDoUpdate({
            target: inscricoesEventos.id,
            set: inscricaoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar inscrição em evento ${inscricao.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${inscricoesEventosData.length} inscrições em eventos importadas`);
    }

    // 9. Import Inscrições em Escola de Crescimento
    console.log('📥 Importando inscrições em escola de crescimento...');
    const inscricoesEscolaCrescimentoData = readCSV('inscricoesEscolaCrescimento_20260310_152012.csv');
    if (inscricoesEscolaCrescimentoData.length > 0) {
      for (const inscricao of inscricoesEscolaCrescimentoData) {
        const inscricaoData = {
          id: parseInt(inscricao.id),
          userId: parseInt(inscricao.userId),
          nome: inscricao.nome,
          celula: inscricao.celula,
          curso: inscricao.curso,
          status: inscricao.status || 'confirmado',
          createdAt: new Date(inscricao.createdAt),
          updatedAt: new Date(inscricao.updatedAt)
        };
        
        try {
          await db.insert(inscricoesEscolaCrescimento).values(inscricaoData).onConflictDoUpdate({
            target: inscricoesEscolaCrescimento.id,
            set: inscricaoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar inscrição em escola ${inscricao.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${inscricoesEscolaCrescimentoData.length} inscrições em escola de crescimento importadas`);
    }

    // 10. Import Dados de Contribuição
    console.log('📥 Importando dados de contribuição...');
    const dadosContribuicaoData = readCSV('dadosContribuicao_20260310_152003.csv');
    if (dadosContribuicaoData.length > 0) {
      for (const dados of dadosContribuicaoData) {
        const dadosData = {
          id: parseInt(dados.id),
          pixKey: dados.pixKey,
          pixType: dados.pixType,
          bank: dados.bank,
          agency: dados.agency,
          account: dados.account,
          cnpj: dados.cnpj,
          titular: dados.titular,
          mensagemMotivacional: dados.mensagemMotivacional,
          versiculoRef: dados.versiculoRef,
          mensagemAgradecimento: dados.mensagemAgradecimento,
          createdAt: new Date(dados.createdAt),
          updatedAt: new Date(dados.updatedAt)
        };
        
        try {
          await db.insert(dadosContribuicao).values(dadosData).onConflictDoUpdate({
            target: dadosContribuicao.id,
            set: dadosData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar dados de contribuição ${dados.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${dadosContribuicaoData.length} dados de contribuição importados`);
    }

    // 11. Import Contatos da Igreja
    console.log('📥 Importando contatos da igreja...');
    const contatosIgrejaData = readCSV('contatosIgreja_20260310_151958.csv');
    if (contatosIgrejaData.length > 0) {
      for (const contato of contatosIgrejaData) {
        const contatoData = {
          id: parseInt(contato.id),
          telefone: contato.telefone,
          whatsapp: contato.whatsapp,
          email: contato.email,
          createdAt: new Date(contato.createdAt),
          updatedAt: new Date(contato.updatedAt)
        };
        
        try {
          await db.insert(contatosIgreja).values(contatoData).onConflictDoUpdate({
            target: contatosIgreja.id,
            set: contatoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar contato da igreja ${contato.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${contatosIgrejaData.length} contatos da igreja importados`);
    }

    // 12. Import Aviso Importante
    console.log('📥 Importando aviso importante...');
    const avisoImportanteData = readCSV('avisoImportante_20260310_151943.csv');
    if (avisoImportanteData.length > 0) {
      for (const aviso of avisoImportanteData) {
        const avisoData = {
          id: parseInt(aviso.id),
          titulo: aviso.titulo,
          mensagem: aviso.mensagem,
          ativo: parseInt(aviso.ativo) || 1,
          dataExpiracao: aviso.dataExpiracao || null,
          createdAt: new Date(aviso.createdAt),
          updatedAt: new Date(aviso.updatedAt)
        };
        
        try {
          await db.insert(avisoImportante).values(avisoData).onConflictDoUpdate({
            target: avisoImportante.id,
            set: avisoData
          });
        } catch (err) {
          console.warn(`  ⚠️  Erro ao importar aviso importante ${aviso.id}: ${err.message}`);
        }
      }
      console.log(`  ✅ ${avisoImportanteData.length} avisos importantes importados`);
    }

    console.log('\n✅ Importação concluída com sucesso!');
    await client.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro durante importação:', error.message);
    console.error(error);
    process.exit(1);
  }
}

importData();
