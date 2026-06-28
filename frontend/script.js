let currentDate = new Date();
let selectedService = "";
let selectedDate = null;
let selectedTime = "";
let services = [];



async function loadLashes() {
    const res = await fetch("/api/lashes");
    const data = await res.json();

    const container = document.getElementById("lashesList");
    container.innerHTML = "";

    data.forEach(item => {
        const btn = document.createElement("button");

        btn.classList.add("service-btn");
        btn.innerText = `${item.name} — ${item.price} грн`;

        btn.onclick = () => {
            selectService(`${item.name} - ${item.price} грн`);
        };

        container.appendChild(btn);
    });
}
/* =========================
   КАЛЕНДАРЬ
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

  const daysContainer = document.getElementById("calendarDays");
  daysContainer.innerHTML = "";

  const weekDays = ["ПН","ВТ","СР","ЧТ","ПТ","СБ","НД"];

weekDays.forEach(d => {
  const el = document.createElement("div");
  el.innerText = d;
  el.style.fontWeight = "bold";
  el.style.color = "gold";
  el.style.fontSize = "12px";
  daysContainer.appendChild(el);
});

 let firstDay = new Date(year, month, 1).getDay();
  firstDay = (firstDay + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    daysContainer.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= daysInMonth; day++) {
  const div = document.createElement("div");
  div.classList.add("day");
  div.innerText = day;
  const now = new Date();

if (
  day === now.getDate() &&
  month === now.getMonth() &&
  year === now.getFullYear()
) {
  div.style.border = "1px solid gold";
  div.style.boxShadow = "0 0 10px rgba(212,175,55,0.6)";
}

  const today = new Date();
  today.setHours(0,0,0,0);

  const thisDate = new Date(year, month, day);

  // ❌ ЗАПРЕТ ПРОШЛЫХ ДНЕЙ
  if (thisDate < today) {
    div.style.opacity = "0.3";
    div.style.pointerEvents = "none";
  }

  div.onclick = () => {
    document.querySelectorAll(".day").forEach(d => d.classList.remove("active"));
    div.classList.add("active");

    selectedDate =
    `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

    // 🔥 авто переход дальше
    setTimeout(() => {
      document.getElementById("dateBlock").style.display = "none";
      document.getElementById("timeBlock").style.display = "block";

      loadBusyTimes();
    }, 200);
  };

  daysContainer.appendChild(div);
}
}

function prevMonth() {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar();
}

function nextMonth() {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar();
}


/* =========================
   SERVICE
========================= */
function selectService(service) {
    selectedService = service;

    document.getElementById("services").style.display = "none";
    document.getElementById("lashes").style.display = "none";

    document.getElementById("dateBlock").style.display = "block";

    renderCalendar();
}

/* =========================
   DATE → TIME
========================= */
function goToTime() {
  if (!selectedDate) {
    alert("Оберіть дату");
    return;
  }

  loadBusyTimes();

  document.getElementById("dateBlock").style.display = "none";
  document.getElementById("timeBlock").style.display = "block";
}

/* =========================
   TIME → USER
========================= */
function selectTimeAndNext(time) {
  selectedTime = time;

  document.getElementById("timeBlock").style.display = "none";
  document.getElementById("userBlock").style.display = "block";
}

/* =========================
   CONFIRM BOOKING
========================= */
function confirmBooking() {
  const name = document.getElementById("name").value;
  const phone = document.getElementById("phone").value;

  if (!selectedTime) {
    alert("Оберіть час");
    return;
  }

  if (!name || !phone) {
    alert("Введіть ім’я і телефон");
    return;
  }

  const bookingData = {
    name,
    phone,
    service: selectedService,
    date: selectedDate,
    time: selectedTime
  };

  fetch("/bookings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(bookingData)
  })
  .then(res => res.json())
  .then(data => {

    document.getElementById("userBlock").style.display = "none";

    const success = document.getElementById("successBlock");
    success.style.display = "block";

    setTimeout(() => {
      success.classList.add("show");
    }, 50);

    document.getElementById("successText").innerText =
      `Ви записані на ${selectedDate} о ${selectedTime}`;

  })
  .catch(err => {
    console.error(err);
    alert("Помилка відправки");
  });
}

/* =========================
   BUSY TIMES
========================= */
async function loadBusyTimes() {
  if (!selectedDate) return;

  const res = await fetch(`/busy?date=${selectedDate}`);
  const busy = await res.json();

  const buttons = document.querySelectorAll(".time button");

  buttons.forEach(btn => {
    const time = btn.innerText;

    if (busy.includes(time)) {
      btn.disabled = true;
      btn.style.background = "#444";
      btn.style.color = "#999";
      btn.style.cursor = "not-allowed";
    } else {
      btn.disabled = false;
      btn.style.background = "";
      btn.style.color = "";
      btn.style.cursor = "pointer";
    }
  });
}
function showWish() {
  const btn = document.getElementById("wishBtn");
  const text = document.getElementById("wishText");
  const home = document.getElementById("homeBtn");

  btn.style.display = "none";

  // 🎲 случайное пожелание
  const randomIndex = Math.floor(Math.random() * wishes.length);
  const randomWish = wishes[randomIndex];

  text.innerText = randomWish;
  text.style.display = "block";
  text.classList.add("showWish");

  setTimeout(() => {
    home.style.display = "inline-block";
  }, 600);
}

const wishes = [
  "Виконання всіх бажань — ось що чекає на тебе попереду!",
  "Вір у себе, і справжнє диво обов'язково станеться!",
  "Тебе очікує велика порція щастя та посмішок.",
  "Твоє найзаповітніше бажання здійсниться найближчим часом.",
  "Зірки обіцяють тобі дуже світлий та радісний період.",
  "Шукай радість у дрібницях — це твій ключ до гармонії.",
  "Очікуй на неймовірний приплив енергії та натхнення.",
  "Життя готує для тебе приємний сюрприз.",
  "Дозволь собі мріяти по-крупному, твої мрії збудуться!",
  "Твоє серце буде сповнене тепла і любові.",
  "Тебе чекає вихід на новий рівень у житті.",
  "Очікуй на вигідні пропозиції, що змінять твій день.",
  "Сприятливий час для нових починань та проєктів.",
  "Удача буде на твоєму боці — довірся своєму розуму.",
  "Зроби крок назустріч невідомому, на тебе чекає успіх.",
  "Усі перешкоди легко зникнуть на твоєму шляху.",
  "Час для великих звершень та сміливих рішень.",
  "Твої старання нарешті принесуть заслужені плоди.",
  "Нові знайомства принесуть несподівану користь.",
  "Відкрий двері для нових можливостей.",
  "Хтось дуже сильно чекає на зустріч з тобою.",
  "На тебе чекає романтична пригода.",
  "Поділися теплом, і воно повернеться до тебе сторицею.",
  "У твоєму домі пануватимуть затишок та злагода.",
  "Зустріч, яка здасться випадковою, змінить твоє життя.",
  "Незабаром на тебе чекає чудова подорож.",
  "Пакуй валізи, попереду поїздка твоєї мрії!",
  "Зміни обстановку — це принесе тобі нові ідеї.",
  "Готуйся до захопливих пригод та яскравих емоцій.",
  "Чекай веселої звістки, яка покращить настрій.",
  "Сьогодні Всесвіт на твоєму боці — сміливо загадуй бажання.",
  "Скоро станеться щось дивовижне і прекрасне.",
  "Диво поруч, просто озирнися навколо.",
  "Твої креативні ідеї приведуть до неймовірних результатів."
];
async function loadServices() {

    const res =
        await fetch(
            "/api/services"
        );

    services =
        await res.json();

    const container =
        document.getElementById(
            "servicesList"
        );

    container.innerHTML = "";

    services.forEach(service => {

    container.innerHTML += `
        <button onclick="selectService('${service.name} - ${service.price} грн')">

            <span class="service-name">
                ${service.name}
            </span>

            <span class="service-price">
                ${service.price} грн
            </span>

        </button>
    `;
});
} 

function backToServices() {
  document.getElementById("dateBlock").style.display = "none";
  document.getElementById("services").style.display = "block";
}

function backToCalendar() {
  document.getElementById("timeBlock").style.display = "none";
  document.getElementById("dateBlock").style.display = "block";
}
function backToTime() {
  document.getElementById("userBlock").style.display = "none";
  document.getElementById("timeBlock").style.display = "block";
}

function openBrows() {

    document.getElementById("categories").style.display = "none";
    document.getElementById("services").style.display = "block";

}

function openLashes() {
    document.getElementById("categories").style.display = "none";
    document.getElementById("lashes").style.display = "block";

    loadLashes();
}

function backToCategories() {

    document.getElementById("categories").style.display = "block";
    document.getElementById("services").style.display = "none";
    document.getElementById("lashes").style.display = "none";

}

document.getElementById("dateBlock").style.display = "none";
document.getElementById("timeBlock").style.display = "none";
document.getElementById("userBlock").style.display = "none";

renderCalendar();
loadServices();