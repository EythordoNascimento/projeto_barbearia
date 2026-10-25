// =====================================================
// AGENDAMENTO - BARBEARIA
// Serviço + calendário + horários (livres / ocupados)
// =====================================================

(function () {
  "use strict";

  // ---------------------------------------------------
  // CONFIGURAÇÕES
  // ---------------------------------------------------
  const STORAGE_KEY = "agendamentos_barbearia";
  const MAX_MESES_A_FRENTE = 3; // até quantos meses à frente dá para agendar

  // Sem back-end, nada fica "ocupado" além do que o próprio navegador salvou.
  // Com true, alguns horários aparecem ocupados de exemplo (sempre os mesmos
  // para cada data). Coloque false quando conectar a um banco de dados real.
  const SIMULAR_OCUPADOS = true;

  const MESES = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
  ];

  const DIAS_SEMANA = [
    "domingo", "segunda-feira", "terça-feira", "quarta-feira",
    "quinta-feira", "sexta-feira", "sábado",
  ];

  // ---------------------------------------------------
  // ELEMENTOS
  // ---------------------------------------------------
  const form = document.getElementById("formAgendamento");

  const servicoSelect = document.getElementById("servicoSelect");
  const servicoTexto = document.getElementById("servicoTexto");
  const servicoInput = document.getElementById("servicoSelecionado");

  const calTitulo = document.getElementById("calendarioTitulo");
  const calDias = document.getElementById("calendarioDias");
  const btnAnterior = document.getElementById("mesAnterior");
  const btnProximo = document.getElementById("mesProximo");

  const horariosTitulo = document.getElementById("horariosTitulo");
  const horariosAviso = document.getElementById("horariosAviso");
  const horariosGrid = document.getElementById("horariosGrid");

  const dataInput = document.getElementById("dataSelecionada");
  const horarioInput = document.getElementById("horarioSelecionado");

  const resumoNome = document.getElementById("resumoNome");
  const nomeInput = document.getElementById("nome");
  const resumoServico = document.getElementById("resumoServico");
  const resumoData = document.getElementById("resumoData");
  const resumoHorario = document.getElementById("resumoHorario");

  const erroBox = document.getElementById("erroAgendamento");
  const sucessoBox = document.getElementById("mensagemSucesso");

  // ---------------------------------------------------
  // ESTADO
  // ---------------------------------------------------
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  let mesVisivel = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  let dataSel = null; // "AAAA-MM-DD"
  let horarioSel = null; // "HH:MM"

  // ---------------------------------------------------
  // UTILITÁRIOS DE DATA E HORA
  // ---------------------------------------------------
  function pad(n) {
    return String(n).padStart(2, "0");
  }

  // Gera "AAAA-MM-DD" no fuso local (toISOString poderia mudar o dia)
  function chaveData(d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  }

  function dataDaChave(chave) {
    const [a, m, d] = chave.split("-").map(Number);
    return new Date(a, m - 1, d);
  }

  function gerarHorarios(inicioMin, fimMin) {
    const lista = [];
    for (let t = inicioMin; t <= fimMin; t += 30) {
      lista.push(pad(Math.floor(t / 60)) + ":" + pad(t % 60));
    }
    return lista;
  }

  // Funcionamento: seg-sex 08h–18h (almoço 12h–13h) | sáb 08h–12h | dom fechado
  // O último horário é 17:30, pois a barbearia fecha às 18h.
  function horariosDoDia(data) {
    const dia = data.getDay();
    if (dia === 0) return [];
    if (dia === 6) return gerarHorarios(8 * 60, 11 * 60 + 30);
    return gerarHorarios(8 * 60, 11 * 60 + 30).concat(
      gerarHorarios(13 * 60, 17 * 60 + 30)
    );
  }

  function formatarDataLonga(chave) {
    const d = dataDaChave(chave);
    return (
      DIAS_SEMANA[d.getDay()] +
      ", " + d.getDate() +
      " de " + MESES[d.getMonth()] +
      " de " + d.getFullYear()
    );
  }

  // ---------------------------------------------------
  // AGENDAMENTOS (localStorage)
  // ---------------------------------------------------
  function lerAgendamentos() {
    try {
      const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return Array.isArray(dados) ? dados : [];
    } catch (e) {
      return [];
    }
  }

  function salvarAgendamento(registro) {
    try {
      const lista = lerAgendamentos();
      lista.push(registro);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lista));
      return true;
    } catch (e) {
      return false;
    }
  }

  // Ocupados de exemplo: determinísticos por data (~1 a cada 4 horários)
  function ocupadosSimulados(chave, horarios) {
    if (!SIMULAR_OCUPADOS) return [];
    let hash = 0;
    for (let i = 0; i < chave.length; i++) {
      hash = (hash * 31 + chave.charCodeAt(i)) % 9973;
    }

    // Simula ocupação em apenas algumas datas, em vez de todas.
    if (hash % 3 !== 0) return [];
    return horarios.filter((_, i) => (hash + i * 7) % 4 === 0);
  }

  function horariosOcupados(chave) {
    const data = dataDaChave(chave);
    const reais = lerAgendamentos()
      .filter((a) => a.data === chave)
      .map((a) => a.horario);
    return new Set(reais.concat(ocupadosSimulados(chave, horariosDoDia(data))));
  }

  function horarioPassou(chave, hora) {
    if (chave !== chaveData(hoje)) return false;
    const agora = new Date();
    const [h, m] = hora.split(":").map(Number);
    return h * 60 + m <= agora.getHours() * 60 + agora.getMinutes();
  }

  function horariosLivres(chave) {
    const ocupados = horariosOcupados(chave);
    return horariosDoDia(dataDaChave(chave)).filter(
      (h) => !ocupados.has(h) && !horarioPassou(chave, h)
    );
  }

  // ---------------------------------------------------
  // SELECT DE SERVIÇO
  // ---------------------------------------------------
  const servicoHeader = servicoSelect.querySelector(".select-header");

  servicoHeader.addEventListener("click", () => {
    servicoSelect.classList.toggle("aberto");
  });

  servicoSelect.querySelectorAll(".opcao").forEach((botao) => {
    botao.addEventListener("click", () => {
      const servico = botao.dataset.servico;

      servicoSelect
        .querySelectorAll(".opcao")
        .forEach((o) => o.classList.remove("selecionada"));
      botao.classList.add("selecionada");

      servicoTexto.textContent = servico;
      servicoInput.value = servico;
      servicoSelect.classList.remove("aberto");

      atualizarResumo();
      esconderMensagens();
    });
  });

  // Fecha o select ao clicar fora
  document.addEventListener("click", (e) => {
    if (!servicoSelect.contains(e.target)) {
      servicoSelect.classList.remove("aberto");
    }
  });

  // ---------------------------------------------------
  // CALENDÁRIO
  // ---------------------------------------------------
  function renderCalendario() {
    const ano = mesVisivel.getFullYear();
    const mes = mesVisivel.getMonth();

    calTitulo.textContent = MESES[mes] + " " + ano;
    calDias.innerHTML = "";

    // Navegação: não volta antes do mês atual nem passa do limite
    const limite = new Date(hoje.getFullYear(), hoje.getMonth() + MAX_MESES_A_FRENTE, 1);
    btnAnterior.disabled =
      mesVisivel.getTime() <= new Date(hoje.getFullYear(), hoje.getMonth(), 1).getTime();
    btnProximo.disabled = mesVisivel.getTime() >= limite.getTime();

    // Espaços antes do dia 1 (calendário começa no domingo)
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    for (let i = 0; i < primeiroDiaSemana; i++) {
      const vazio = document.createElement("span");
      vazio.className = "dia dia--vazio";
      calDias.appendChild(vazio);
    }

    const totalDias = new Date(ano, mes + 1, 0).getDate();

    for (let dia = 1; dia <= totalDias; dia++) {
      const data = new Date(ano, mes, dia);
      const chave = chaveData(data);

      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "dia";
      botao.textContent = dia;

      const passado = data < hoje;
      const fechado = data.getDay() === 0;
      const semHorarios = !passado && !fechado && horariosLivres(chave).length === 0;

      if (chave === chaveData(hoje)) botao.classList.add("dia--hoje");

      if (passado || fechado || semHorarios) {
        botao.disabled = true;
        if (fechado) botao.title = "Fechado aos domingos";
        else if (semHorarios) botao.title = "Sem horários disponíveis";
        else botao.title = "Data passada";
      } else {
        if (horariosOcupados(chave).size > 0) {
          botao.classList.add("dia--parcial");
        } else {
          botao.classList.add("dia--disponivel");
        }
        if (chave === dataSel) botao.classList.add("dia--selecionado");

        botao.setAttribute("aria-label", formatarDataLonga(chave));
        botao.addEventListener("click", () => selecionarData(chave));
      }

      calDias.appendChild(botao);
    }
  }

  btnAnterior.addEventListener("click", () => {
    mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() - 1, 1);
    renderCalendario();
  });

  btnProximo.addEventListener("click", () => {
    mesVisivel = new Date(mesVisivel.getFullYear(), mesVisivel.getMonth() + 1, 1);
    renderCalendario();
  });

  function selecionarData(chave) {
    dataSel = chave;
    dataInput.value = chave;

    // Se o horário escolhido antes não serve para o novo dia, limpa
    if (horarioSel && !horariosLivres(chave).includes(horarioSel)) {
      horarioSel = null;
      horarioInput.value = "";
    }

    renderCalendario();
    renderHorarios();
    atualizarResumo();
    esconderMensagens();
  }

  // ---------------------------------------------------
  // HORÁRIOS DO DIA
  // ---------------------------------------------------
  function renderHorarios() {
    horariosGrid.innerHTML = "";

    if (!dataSel) {
      horariosTitulo.textContent = "Horários";
      horariosAviso.textContent = "Selecione um dia no calendário para ver os horários.";
      return;
    }

    const data = dataDaChave(dataSel);
    const todos = horariosDoDia(data);
    const ocupados = horariosOcupados(dataSel);
    const livres = horariosLivres(dataSel).length;

    horariosTitulo.textContent = formatarDataLonga(dataSel);
    horariosAviso.textContent =
      livres + (livres === 1 ? " horário livre" : " horários livres") +
      " · " + ocupados.size + (ocupados.size === 1 ? " já escolhido" : " já escolhidos");

    todos.forEach((hora) => {
      const botao = document.createElement("button");
      botao.type = "button";
      botao.className = "horario";

      const spanHora = document.createElement("span");
      spanHora.className = "horario__hora";
      spanHora.textContent = hora;
      botao.appendChild(spanHora);

      if (ocupados.has(hora)) {
        botao.classList.add("horario--ocupado");
        botao.disabled = true;
        const rotulo = document.createElement("small");
        rotulo.textContent = "Ocupado";
        botao.appendChild(rotulo);
      } else if (horarioPassou(dataSel, hora)) {
        botao.classList.add("horario--passado");
        botao.disabled = true;
        const rotulo = document.createElement("small");
        rotulo.textContent = "Passou";
        botao.appendChild(rotulo);
      } else {
        if (hora === horarioSel) botao.classList.add("horario--selecionado");
        botao.addEventListener("click", () => selecionarHorario(hora));
      }

      horariosGrid.appendChild(botao);
    });
  }

  function selecionarHorario(hora) {
    horarioSel = hora;
    horarioInput.value = hora;
    renderHorarios();
    atualizarResumo();
    esconderMensagens();
  }

  // ---------------------------------------------------
  // RESUMO
  // ---------------------------------------------------
  function atualizarResumo() {
    resumoNome.textContent = nomeInput.value.trim() || "Não informado";
    resumoServico.textContent = servicoInput.value || "Não selecionado";
    resumoData.textContent = dataSel ? formatarDataLonga(dataSel) : "Não selecionada";
    resumoHorario.textContent = horarioSel || "Não selecionado";
  }

  // ---------------------------------------------------
  // MENSAGENS
  // ---------------------------------------------------
  function mostrarErro(texto) {
    sucessoBox.hidden = true;
    erroBox.textContent = texto;
    erroBox.hidden = false;
  }

  function esconderMensagens() {
    erroBox.hidden = true;
  }

  // ---------------------------------------------------
  // TELEFONE (máscara)
  // ---------------------------------------------------
  const telefone = document.getElementById("telefone");

  telefone.addEventListener("input", () => {
    let v = telefone.value.replace(/\D/g, "").slice(0, 11);

    if (v.length > 10) {
      v = v.replace(/^(\d{2})(\d{5})(\d{4}).*/, "($1) $2-$3");
    } else if (v.length > 6) {
      v = v.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, "($1) $2-$3");
    } else if (v.length > 2) {
      v = v.replace(/^(\d{2})(\d{0,5}).*/, "($1) $2");
    } else if (v.length > 0) {
      v = v.replace(/^(\d{0,2}).*/, "($1");
    }

    telefone.value = v;
  });

  // Mostra o nome no resumo enquanto a pessoa digita
  nomeInput.addEventListener("input", atualizarResumo);

  // ---------------------------------------------------
  // ENVIO DO FORMULÁRIO
  // ---------------------------------------------------
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!servicoInput.value) {
      mostrarErro("Selecione um serviço.");
      servicoSelect.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!dataSel) {
      mostrarErro("Escolha um dia no calendário.");
      calDias.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!horarioSel) {
      mostrarErro("Escolha um horário disponível.");
      horariosGrid.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    // Confere de novo se o horário ainda está livre
    if (!horariosLivres(dataSel).includes(horarioSel)) {
      horarioSel = null;
      horarioInput.value = "";
      renderCalendario();
      renderHorarios();
      atualizarResumo();
      mostrarErro("Esse horário acabou de ser ocupado. Escolha outro, por favor.");
      return;
    }

    const registro = {
      servico: servicoInput.value,
      data: dataSel,
      horario: horarioSel,
      nome: document.getElementById("nome").value.trim(),
      email: document.getElementById("email").value.trim(),
      telefone: telefone.value,
      criadoEm: new Date().toISOString(),
    };

    if (!salvarAgendamento(registro)) {
      mostrarErro("Não foi possível salvar o agendamento neste navegador.");
      return;
    }

    // Mensagem de confirmação
    esconderMensagens();
    sucessoBox.textContent =
      "Agendamento confirmado! " + registro.servico + " em " +
      formatarDataLonga(registro.data) + " às " + registro.horario +
      ", em nome de " + registro.nome + ".";
    sucessoBox.hidden = false;

    // Limpa o formulário e atualiza calendário/horários
    form.reset();
    servicoInput.value = "";
    servicoTexto.textContent = "Selecionar Serviço";
    servicoSelect
      .querySelectorAll(".opcao")
      .forEach((o) => o.classList.remove("selecionada"));

    dataSel = null;
    horarioSel = null;
    dataInput.value = "";
    horarioInput.value = "";

    renderCalendario();
    renderHorarios();
    atualizarResumo();

    sucessoBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  // ---------------------------------------------------
  // INÍCIO
  // ---------------------------------------------------
  renderCalendario();
  renderHorarios();
  atualizarResumo();
})();