document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    const response = await fetch("http://localhost:3000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    const messageBox = document.getElementById("registerMessage");
    messageBox.textContent = data.message;
    messageBox.style.display = "block";

    setTimeout(() => {
        messageBox.style.display = "none"; // Oculta a mensagem após 2 segundos
    }, 2000);

    if (data.message.includes("Usuário registrado com sucesso")) {
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
});
