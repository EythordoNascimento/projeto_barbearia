document.addEventListener("DOMContentLoaded", () => {
    // ===== FUNÇÃO GENÉRICA PARA DROPDOWN =====
    function configurarSelect(idSelect, idTexto, idResumo, idHidden, tipo) {
      const select = document.getElementById(idSelect);
      const header = select.querySelector(".select-header");
      const texto = document.getElementById(idTexto);
      const resumo = document.getElementById(idResumo);
      const hidden = document.getElementById(idHidden);
  
      // Abre/fecha o menu
      header.addEventListener("click", () => {
        select.classList.toggle("aberto");
      });
  
      // Seleciona opção
      select.querySelectorAll(".opcao").forEach(opcao => {
        opcao.addEventListener("click", () => {
          texto.textContent = opcao.textContent;
          hidden.value = tipo === "servico" ? opcao.dataset.servico : opcao.dataset.horario;
          resumo.textContent = opcao.textContent;
  
          // Fecha o menu e marca a opção
          select.classList.remove("aberto");
          select.querySelectorAll(".opcao").forEach(o => o.classList.remove("selecionada"));
          opcao.classList.add("selecionada");
        });
      });
    }
  
    // Configura os dois selects
    configurarSelect("servicoSelect", "servicoTexto", "resumoServico", "servicoSelecionado", "servico");
    configurarSelect("horarioSelect", "horarioTexto", "resumoHorario", "horarioSelecionado", "horario");
  
    // ===== BOTÃO DE CONFIRMAR =====
    const form = document.getElementById("formAgendamento");
    form.addEventListener("submit", e => {
      e.preventDefault();
  
      const servico = document.getElementById("servicoSelecionado").value;
      const horario = document.getElementById("horarioSelecionado").value;
      const nome = document.getElementById("nome").value;
      const email = document.getElementById("email").value;
      const telefone = document.getElementById("telefone").value;
  
      if (!servico || !horario || !nome || !email || !telefone) {
        alert("⚠️ Preencha todos os campos antes de confirmar o agendamento.");
        return;
      }
  
      alert(`✅ Agendamento confirmado!\n\nServiço: ${servico}\nHorário: ${horario}\nCliente: ${nome}`);
      form.reset();
  
      // Reseta os textos
      document.getElementById("servicoTexto").textContent = "Selecionar Serviço";
      document.getElementById("horarioTexto").textContent = "Escolher horário";
      document.getElementById("resumoServico").textContent = "Não selecionado";
      document.getElementById("resumoHorario").textContent = "Não selecionado";
      document.getElementById("resumoNome").textContent = "Não informado";
      document.getElementById("resumoEmail").textContent = "Não informado";
      document.getElementById("resumoTelefone").textContent = "Não informado";
    });
  
    // ===== ATUALIZAÇÃO AUTOMÁTICA DO RESUMO =====
    const nomeInput = document.getElementById("nome");
    const emailInput = document.getElementById("email");
    const telefoneInput = document.getElementById("telefone");
  
    const resumoContainer = document.querySelector(".resumo");
  
    // Cria elementos no resumo
    let resumoNome = document.createElement("p");
    let resumoEmail = document.createElement("p");
    let resumoTelefone = document.createElement("p");
  
    resumoNome.innerHTML = "<strong>Nome:</strong> <span id='resumoNome'>Não informado</span>";
    resumoEmail.innerHTML = "<strong>Email:</strong> <span id='resumoEmail'>Não informado</span>";
    resumoTelefone.innerHTML = "<strong>Telefone:</strong> <span id='resumoTelefone'>Não informado</span>";
  
    resumoContainer.appendChild(resumoNome);
    resumoContainer.appendChild(resumoEmail);
    resumoContainer.appendChild(resumoTelefone);
  
    // Atualiza conforme digita
    nomeInput.addEventListener("input", () => {
      document.getElementById("resumoNome").textContent = nomeInput.value || "Não informado";
    });
  
    emailInput.addEventListener("input", () => {
      document.getElementById("resumoEmail").textContent = emailInput.value || "Não informado";
    });
  
    telefoneInput.addEventListener("input", () => {
      document.getElementById("resumoTelefone").textContent = telefoneInput.value || "Não informado";
    });
  });
  