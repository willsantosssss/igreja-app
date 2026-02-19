  const carregarEstatisticas = async (celulaNome: string) => {
    const membrosDaCelula = membrosDB.filter((m: any) => m.celula === celulaNome);
    const mesAtual = new Date().getMonth() + 1;
    const aniversariantes = membrosDaCelula.filter((m: any) => {
      if (!m.dataNascimento) return false;
      const dataNasc = new Date(m.dataNascimento);
      return dataNasc.getMonth() + 1 === mesAtual;
    });

    setStats({
      totalMembros: membrosDaCelula.length,
      aniversariantesMes: aniversariantes.length,
      inscritosEventos: 0,
      totalRelatorios: 0,
      mediaPresenca: 0,
      mediaVisitantes: 0,
    });
    carregarInscritosEventosEspeciais(celulaNome);
  };

  const carregarInscritosEventosEspeciais = async (celulaNome: string) => {
    setCarregandoInscritosEspeciais(true);
    try {
      // @ts-expect-error - Endpoint será tipado após reiniciar servidor
      const inscritos = await trpc.eventos.getInscritosEspeciaisByCelula.query(celulaNome);
      setInscritosEventosEspeciais(inscritos || []);
    } catch (error) {
      console.error("Erro ao buscar inscritos em eventos especiais:", error);
      setInscritosEventosEspeciais([]);
    } finally {
      setCarregandoInscritosEspeciais(false);
    }
  };
