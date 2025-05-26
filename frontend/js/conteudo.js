async function checkAuth() {
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "index.html";
        return;
    }

    const response = await fetch("http://localhost:3000/conteudo", {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });

    const data = await response.json();
    if (response.status !== 200) {
        localStorage.removeItem("token");
        window.location.href = "index.html";
    } else {
        document.getElementById("restrictedContent").style.display = "block"; // Exibe o conteúdo apenas após validação
    }
}

checkAuth();

function logout() {
    localStorage.removeItem("token");
    document.getElementById("logoutMessage").style.display = "block";

    setTimeout(() => {
        document.getElementById("logoutMessage").style.display = "none";
        window.location.href = "index.html";
    }, 2000);
}
