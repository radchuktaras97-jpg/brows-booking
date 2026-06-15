console.log("SCRIPT LOADED");

let currentDate = new Date();
let selectedService = "";
let selectedDate = null;
let selectedTime = "";

/* =========================
   INIT
========================= */
window.addEventListener("DOMContentLoaded", () => {
  console.log("DOM READY");

  renderCalendar();
  loadServices();
});

/* =========================
   SERVICES (FIXED)
========================= */
async function loadServices() {
  const container = document.getElementById("servicesList");
  container.innerHTML = "";

  try {
    const res = await fetch("/api/services");
    const data = await res.json();

    console.log("SERVICES:", data);

    if (!data || data.length === 0) {
      container.innerHTML = "<p>Немає послуг</p>";
      return;
    }

    data.forEach(service => {
      const btn = document.createElement("button");

      btn.innerText = `${service.name} — ${service.price} грн`;

      btn.addEventListener("click", () => {
        console.log("CLICK WORKS");

        selectedService = `${service.name} - ${service.price} грн`;

        document.getElementById("services").style.display = "none";
        document.getElementById("dateBlock").style.display = "block";

        renderCalendar();
      });

      container.appendChild(btn);
    });

  } catch (err) {
    console.error("SERVICE ERROR:", err);

    container.innerHTML = "<p style='color:red'>Ошибка загрузки услуг</p>";
  }
}

/* =========================
   CALENDAR (FIXED)
========================= */
function renderCalendar() {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    "Січень","Лютий","Березень","Квітень","Травень","Червень",
    "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
  ];

  document.getElementById("monthLabel").innerText =
    `${monthNames[month]} ${year}`;

  const container = document.getElementById("calendarDays");
  container.innerHTML = "";

  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;

  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < offset; i++) {
    container.appendChild(document.createElement("div"));
  }

  const today = new Date();
  today.setHours(0,0,0,0);

  for (let d = 1; d <= daysInMonth; d++) {
    const el = document.createElement("div");
    el.innerText = d;

    const date = new Date(year, month, d);

    if (date < today) {
      el.style.opacity = "0.3";
      el.style.pointerEvents = "none";
    }

    el.onclick = () => {
      selectedDate =
        `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;

      console.log("DATE:", selectedDate);

      document.getElementById("dateBlock").style.display = "none";
      document.getElementById("timeBlock").style.display = "block";
    };

    container.appendChild(el);
  }
}

/* =========================
   TIME
========================= */
function selectTimeAndNext(time) {
  selectedTime = time;

  document.getElementById("timeBlock").style.display = "none";
  document.getElementById("userBlock").style.display = "block";
}

/* =========================
   BOOKING (FIXED)
========================= */
function confirmBooking() {
  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!selectedService) return alert("Оберіть послугу");
  if (!selectedDate) return alert("Оберіть дату");
  if (!selectedTime) return alert("Оберіть час");
  if (!name || !phone) return alert("Введіть дані");

  fetch("/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name,
      phone,
      service: selectedService,
      date: selectedDate,
      time: selectedTime
    })
  })
  .then(r => r.json())
  .then(() => {
    document.getElementById("userBlock").style.display = "none";
    document.getElementById("successBlock").style.display = "block";
  })
  .catch(err => {
    console.error(err);
    alert("Ошибка записи");
  });
}