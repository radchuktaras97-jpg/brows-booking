let currentDate = new Date();
let selectedDate = null;
let busyDays = {};

/* =========================
   AUTH
========================= */
if (sessionStorage.getItem("adminAuth") !== "true") {
    location.href = "login.html";
}

/* =========================
   LOAD BUSY DAYS
========================= */
async function loadBusyDays() {
    try {
        const res = await fetch("/busy-days");
        busyDays = await res.json();
        renderCalendar();
    } catch (e) {
        console.error("busy-days error", e);
    }
}

/* =========================
   CALENDAR
========================= */
function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "Січень","Лютий","Березень","Квітень","Травень","Червень",
        "Липень","Серпень","Вересень","Жовтень","Листопад","Грудень"
    ];

    const monthLabel = document.getElementById("monthLabel");
    const daysContainer = document.getElementById("calendarDays");

    if (!monthLabel || !daysContainer) return;

    monthLabel.textContent = `${monthNames[month]} ${year}`;
    daysContainer.innerHTML = "";

    const weekDays = ["ПН","ВТ","СР","ЧТ","ПТ","СБ","НД"];

    weekDays.forEach(d => {
        const el = document.createElement("div");
        el.textContent = d;
        el.style.fontWeight = "bold";
        daysContainer.appendChild(el);
    });

    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < offset; i++) {
        daysContainer.appendChild(document.createElement("div"));
    }

    const today = new Date();

    for (let day = 1; day <= daysInMonth; day++) {

        const dateKey =
            `${year}-${String(month + 1).padStart(2,"0")}-${String(day).padStart(2,"0")}`;

        const div = document.createElement("div");
        div.classList.add("day");
        div.textContent = day;

        const thisDate = new Date(year, month, day);
        const shift = getShiftType(thisDate);

        if (shift === "EVENING") {
            div.classList.add("evening-shift");
        }

        if (
            day === today.getDate() &&
            month === today.getMonth() &&
            year === today.getFullYear()
        ) {
            div.classList.add("today");
        }

        if (busyDays?.[dateKey] > 0) {
            div.classList.add("has-booking");
        }

        div.onclick = () => {
            document.querySelectorAll(".day")
                .forEach(d => d.classList.remove("active"));

            div.classList.add("active");
            selectedDate = dateKey;

            loadDayData();
        };

        daysContainer.appendChild(div);
    }
}

/* =========================
   NAV
========================= */
function prevMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
}

/* =========================
   LOAD DAY
========================= */
async function loadDayData() {
    if (!selectedDate) return;

    try {
        const bookings = await fetch(
            `/api/bookings?date=${selectedDate}`
        ).then(r => r.json());

        const blocks = await fetch(
            "/api/blocks"
        ).then(r => r.json());

        const dayBlocks = blocks.filter(b => b.date === selectedDate);

        renderBookings(bookings);
        renderBlocks(dayBlocks);
        renderTimes(bookings, dayBlocks);

    } catch (e) {
        console.error(e);
    }
}

/* =========================
   BOOKINGS
========================= */
function renderBookings(bookings) {
    const container = document.getElementById("dayBookings");
    if (!container) return;

    container.innerHTML = "";

    if (!bookings.length) {
        container.innerHTML = "<div>Немає записів</div>";
        return;
    }

    bookings.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("booking");

        div.innerHTML = `
            <div><strong>${item.name}</strong></div>
            <div>📞 ${item.phone}</div>
            <div>💅 ${item.service}</div>
            <div>⏰ ${item.time}</div>
        `;

        const btn = document.createElement("button");
        btn.textContent = "Удалить";

        btn.onclick = () => deleteBooking(item._id);

        div.appendChild(btn);
        container.appendChild(div);
    });
}

/* =========================
   BLOCKS
========================= */
function renderBlocks(dayBlocks) {
    const container = document.getElementById("dayBlocks");
    if (!container) return;

    container.innerHTML = "";

    if (!dayBlocks.length) {
        container.innerHTML = "<div>Немає блоків</div>";
        return;
    }

    dayBlocks.forEach(item => {
        const div = document.createElement("div");
        div.classList.add("block");

        div.textContent = `🚫 ${item.time}`;

        const btn = document.createElement("button");
        btn.textContent = "Удалить";

        btn.onclick = () => deleteBlock(item.date, item.time);

        div.appendChild(btn);
        container.appendChild(div);
    });
}

/* =========================
   TIMES
========================= */
function renderTimes(bookings, dayBlocks) {
    const container = document.getElementById("dayBusy");
    if (!container) return;

    container.innerHTML = "";

    // защита: если дата не выбрана
    if (!selectedDate) return;

    let times = [];

    const shift = getShiftType(new Date(selectedDate));

    // 3 дня полный день / 3 дня вечер
    if (shift === "FULL") {
        times = [
            "08:00","09:00","10:00","11:00",
            "12:00","13:00","14:00","15:00",
            "16:00","17:00","18:00",
            "19:30","20:30","21:30","22:30"
        ];
    } else {
        times = [
            "19:30","20:30","21:30","22:30"
        ];
    }

    times.forEach(time => {

        const bookingExists = bookings.some(b => b.time === time);
        const blockExists = dayBlocks.some(b => b.time === time);

        const div = document.createElement("div");
        div.classList.add("block");

        if (bookingExists) {
            div.textContent = 🔴 ${time} — занято;

        } else if (blockExists) {
            div.textContent = 🚫 ${time} — заблокировано;

            const btn = document.createElement("button");
            btn.textContent = "Разблокировать";

            btn.onclick = async () => {
                await fetch(`/api/blocks/${selectedDate}/${time}`, {
                    method: "DELETE"
                });

                loadDayData();
            };

            div.appendChild(btn);

        } else {
            div.textContent = 🟢 ${time} — свободно;

            const btn = document.createElement("button");
            btn.textContent = "Блокировать";

            btn.onclick = async () => {
                await fetch("/api/blocks", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        date: selectedDate,
                        time
                    })
                });

                loadDayData();
            };

            div.appendChild(btn);
        }

        container.appendChild(div);
    });
}

/* =========================
   DELETE
========================= */
async function deleteBooking(id) {
    await fetch(`/api/bookings/${id}`, { method: "DELETE" });
    loadDayData();
}

async function deleteBlock(date, time) {

    await fetch(
        `/api/blocks/${date}/${time}`,
        {
            method: "DELETE"
        }
    );

    loadDayData();
}
function getShiftType(date) {
    const start = new Date("2026-01-01");
    const diffDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));

    const cycle = diffDays % 6;

    if (cycle >= 0 && cycle <= 2) {
        return "FULL"; // 3 дня полный день
    } else {
        return "EVENING"; // 3 дня только вечер
    }
}

/* =========================
   INIT
========================= */
renderCalendar();
loadBusyDays();