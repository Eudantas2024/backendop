// Carrega as reclamações e exibe na página
function carregarReclamacoes() {
  fetch("http://localhost:3000/api/opinioes")
    .then((res) => res.json())
    .then((reclamacoes) => {
      const container = document.getElementById("listaReclamacoes");
      container.innerHTML = "";
      reclamacoes.slice().reverse().forEach((rec) => {
        const data = new Date(rec.data);
        const dataFormatada = data.toLocaleDateString("pt-BR");
        const horaFormatada = data.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        const div = document.createElement("div");
        div.className = "reclamacao";
        div.innerHTML = `
          <p><strong>Registrado em:</strong> ${dataFormatada} às ${horaFormatada}</p>
          <p><strong>Empresa Reclamada:</strong> ${rec.empresa}</p>
          <p><strong>Nome:</strong> ${rec.nome} | <strong>Email:</strong> ${rec.email}</p>
          <p><strong>Endereço:</strong> ${rec.logradouro}, Nº ${rec.numero}, Bairro: ${rec.bairro}, ${rec.cidade} - ${rec.uf}</p>
          <p><strong>Comentário:</strong> ${rec.comentario}</p>
          <button class="btn-excluir" onclick="excluirReclamacao('${rec._id}')">Excluir</button>
          <button class="editar-btn" data-id="${rec._id}">Editar</button>
          <hr/>
        `;
        container.appendChild(div);
      });

      // Agora passamos `reclamacoes` para evitar erro
      adicionarEventosEdicao(reclamacoes);
    })
    .catch(() => {
      document.getElementById("listaReclamacoes").innerText =
        "Erro ao carregar reclamações.";
    });
}


// Adiciona eventos aos botões "Editar"
function adicionarEventosEdicao(reclamacoes) {
  document.querySelectorAll(".editar-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      console.log("Botão Editar clicado"); // Teste para ver se o evento está funcionando
      const id = this.getAttribute("data-id");
      const reclamacao = reclamacoes.find((r) => r._id === id);
      editarReclamacao(id, reclamacao);
    });
  });
}


// Excluir uma reclamação via DELETE
function excluirReclamacao(id) {
  if (confirm("Tem certeza que deseja excluir esta reclamação?")) {
    fetch(`http://localhost:3000/api/opinioes/${id}`, {
      method: "DELETE",
    })
      .then((res) => {
        if (res.ok) {
          alert("Reclamação excluída.");
          carregarReclamacoes();
        } else {
          alert("Erro ao excluir.");
        }
      })
      .catch(() => alert("Erro de conexão."));
  }
}

// Abrir o formulário de edição preenchido
function editarReclamacao(id, dadosAtuais) {
  const modal = document.getElementById("editarForm");

  if (!modal) {
    console.error("Modal não encontrado! Verifique o ID no HTML.");
    return;
  }

  console.log("Abrindo modal de edição..."); // Verificação no console

  modal.style.display = "block"; // Exibir corretamente o modal

  document.getElementById("editNome").value = dadosAtuais.nome;
  document.getElementById("editEmail").value = dadosAtuais.email;
  document.getElementById("editEmpresa").value = dadosAtuais.empresa;
  document.getElementById("editLogradouro").value = dadosAtuais.logradouro;
  document.getElementById("editNumero").value = dadosAtuais.numero;
  document.getElementById("editBairro").value = dadosAtuais.bairro;
  document.getElementById("editComplemento").value = dadosAtuais.complemento;
  document.getElementById("editCidade").value = dadosAtuais.cidade;
  document.getElementById("editUf").value = dadosAtuais.uf;
  document.getElementById("editComentario").value = dadosAtuais.comentario;

  document.getElementById("salvarEdicao").setAttribute("data-id", id);
}


// **Correção na função de fechar o modal**
function fecharFormulario() {
  const modal = document.getElementById("editarForm");
  modal.style.display = "none"; // Agora garante que ele desapareça corretamente
  modal.classList.remove("ativo"); // Remove a classe ativa (se estiver usando ela)
}


// Salvar edição via PUT
document.getElementById("salvarEdicao").addEventListener("click", function () {
  const id = this.getAttribute("data-id");

  const atualizados = {
    nome: document.getElementById("editNome").value,
    email: document.getElementById("editEmail").value,
    empresa: document.getElementById("editEmpresa").value,
    logradouro: document.getElementById("editLogradouro").value,
    numero: document.getElementById("editNumero").value,
    bairro: document.getElementById("editBairro").value,
    complemento: document.getElementById("editComplemento").value,
    cidade: document.getElementById("editCidade").value,
    uf: document.getElementById("editUf").value,
    comentario: document.getElementById("editComentario").value,
  };

  fetch(`http://localhost:3000/api/opinioes/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(atualizados),
  })
    .then((res) => {
      if (res.ok) {
        alert("Reclamação atualizada com sucesso.");
        carregarReclamacoes();
        fecharFormulario();
      } else {
        alert("Erro ao atualizar.");
      }
    })
    .catch(() => alert("Erro de conexão."));
});

// Carrega as reclamações ao iniciar a página
window.onload = function () {
  document.getElementById("editarForm").style.display = "none"; // Agora começa oculto
  carregarReclamacoes();
};
