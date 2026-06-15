async function openClients() {

    const res = await fetch("/api/clients");
    const clients = await res.json();

    const container = document.getElementById("content");
    container.innerHTML = "<h2>База клієнтів</h2>";

    const fragment = document.createDocumentFragment();

    clients.forEach(client => {
        const div = document.createElement("div");
        div.classList.add("block");

        div.innerHTML = `
            <strong>${client.name}</strong><br>
            <a href="tel:${client.phone}">${client.phone}</a>
        `;

        fragment.appendChild(div);
    });

    container.appendChild(fragment);
}

/* ========================= */

async function openStats() {

    const res = await fetch("/api/admin/stats");
    const data = await res.json();

    document.getElementById("content").innerHTML = `
        <div class="block">📊 Всього записів: ${data.bookings}</div>
        <div class="block">⛔ Блокувань: ${data.blocks}</div>
    `;
}

/* ========================= */

async function openServices() {

    const res = await fetch("/api/services");
    const services = await res.json();

    const container = document.getElementById("content");
    container.innerHTML = "";

    services.forEach(service => {

        const div = document.createElement("div");
        div.classList.add("block");

        div.innerHTML = `
            <strong>${service.name}</strong><br>
            <input type="number" id="price-${service._id}" value="${service.price || 0}">
        `;

        const btn = document.createElement("button");
        btn.textContent = "Зберегти";

        btn.onclick = () => saveService(service._id);

        div.appendChild(btn);
        container.appendChild(div);
    });
}

/* ========================= */

async function saveService(id) {

    const price = document.getElementById(`price-${id}`).value;

    await fetch(`/api/services/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ price })
    });

    alert("Збережено");
}

/* ========================= */

function logout() {
    sessionStorage.removeItem("adminAuth");
    location.href = "login.html";
}