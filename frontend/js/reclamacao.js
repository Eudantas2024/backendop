// Aqui é feito o cadastro do Consumidor e tambem onde ele vai registrar a sua reclamação


// api viacep, busca os dados do endereço quando digita o cep.
function buscarCEP() {
    const cep = document.getElementById("cep").value;
    if (cep.length === 8) {
        fetch(`https://viacep.com.br/ws/${cep}/json/`)
            .then(res => res.json())
            .then(data => {
                if (!data.erro) {
                    document.getElementById("logradouro").value = data.logradouro;
                    document.getElementById("bairro").value = data.bairro;
                    document.getElementById("cidade").value = data.localidade;
                    document.getElementById("uf").value = data.uf;
                }
            });
    }
}

function cadastrarConsumidor(event) {
    event.preventDefault();
    const dados = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        cep: document.getElementById("cep").value,
        logradouro: document.getElementById("logradouro").value,
        numero: document.getElementById("numero").value,
        complemento: document.getElementById("complemento").value,
        bairro: document.getElementById("bairro").value,
        cidade: document.getElementById("cidade").value,
        uf: document.getElementById("uf").value,
        empresa: document.getElementById("empresa").value,
        comentario: document.getElementById("comentario").value
    };

    fetch("http://localhost:3000/api/opinioes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dados)
    })
    .then(res => res.json())
    .then(response => {
        document.getElementById("resultado").innerText = response.mensagem || "Reclamação enviada com sucesso.";
    })
    .catch(() => {
        document.getElementById("resultado").innerText = "Erro ao enviar reclamação.";
    });
}
