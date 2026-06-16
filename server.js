require("dotenv").config();
process.env.NODE_OPTIONS = "--dns-result-order=ipv4first";

const { ObjectId } = require("mongodb");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const Booking = require("./models/Booking");
const Block = require("./models/Block");
const Service = require("./models/Service");

const app = express();
const PORT = process.env.PORT || 3000;



// 👇 ВОТ СЮДА
console.log(__dirname);
console.log(path.join(__dirname, "frontend"));

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.url.includes(".env")) {
    return res.status(403).send("Forbidden");
  }
  next();
});

app.use(
  express.static(
    path.join(__dirname, "frontend")
  )
);
console.log("SERVER:", __dirname);
console.log(
  "FRONTEND:",
  path.join(__dirname, "frontend")
);

app.get("/api/blocks", async (req, res) => {
    res.json(await Block.find());
});

app.post("/api/blocks", async (req, res) => {

    await Block.create(req.body);

    res.json({ success: true });
});
// =========================
// TEST ROUTE
// =========================
app.get("/", (req, res) => {
  res.send("Brows Oleksandra server работает 💅");
});

// =========================
// TELEGRAM
// =========================
async function sendTG(booking) {
  try {
    const TOKEN = process.env.TG_TOKEN;
    const CHAT_ID = process.env.TG_CHAT_ID;

    const text = `
💅 НОВАЯ ЗАПИСЬ

👤 ${booking.name}
📞 ${booking.phone}

💎 ${booking.service}
📅 ${booking.date}
⏰ ${booking.time}
`;

    await axios.post(
      `https://api.telegram.org/bot${TOKEN}/sendMessage`,
      {
        chat_id: CHAT_ID,
        text
      }
    );

  } catch (err) {
    console.log("Ошибка Telegram:", err.message);
  }
}

// =========================
// CREATE BOOKING
// =========================
app.post("/bookings", async (req, res) => {
  try {

    const { date, time } = req.body;

    // 1. сначала проверка БЛОКОВ
    const blocked = await Block.findOne({ date, time });

    if (blocked) {
      return res.status(400).json({
        error: "Цей час заблокований"
      });
    }

    // 2. потом проверка записей
    const exists = await Booking.findOne({ date, time });

    if (exists) {
      return res.status(400).json({
        error: "Цей час вже зайнятий"
      });
    }

    // 3. только потом создаём
    const booking = await Booking.create(req.body);

    await sendTG(req.body);

    res.json({ success: true, data: booking });

  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "server error" });
  }
});

// =========================
// GET BOOKINGS
// =========================
app.get("/api/bookings", async (req, res) => {
  try {

    const { date } = req.query;

    let filter = {};
    if (date) filter.date = date;

    const bookings = await Booking
      .find(filter)
      .sort({ date: -1, time: -1 });

    res.json(bookings);

  } catch (err) {
    res.status(500).json({ error: "error" });
  }
});

// =========================
// DELETE BOOKING
// =========================
app.delete("/api/blocks/:date/:time", async (req, res) => {
  try {
    const { date, time } = req.params;

    await Block.deleteOne({ date, time });

    res.json({ success: true });

  } catch (err) {
    res.status(500).json({ error: "block delete error" });
  }
});
app.delete("/api/bookings/:id", async (req, res) => {
  try {
    const id = req.params.id;

    await db.collection("bookings").deleteOne({
      _id: new ObjectId(id)
    });

    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});
// =========================
// BUSY TIMES
// =========================
app.get("/busy", async (req, res) => {
  try {
    const { date } = req.query;

    const bookings = await Booking.find({ date });
    const blocks = await Block.find({ date });

    const busyTimes = [
      ...bookings.map(b => b.time),
      ...blocks.map(b => b.time)
    ];

    res.json(busyTimes);

  } catch (err) {
    res.status(500).json({ error: "busy error" });
  }
});
// =========================
// BUSY DAYS
// =========================
app.get("/busy-days", async (req, res) => {
  const bookings = await Booking.find();

  const map = {};

  bookings.forEach(b => {
    map[b.date] = (map[b.date] || 0) + 1;
  });

  res.json(map);
});
// =========================
// STATS
// =========================
app.get("/stats", async (req, res) => {
  try {

    const total =
      await Booking.countDocuments();

    const today =
      new Date().toISOString().slice(0, 10);

    const todayCount =
      await Booking.countDocuments({
        date: today
      });

    res.json({
      total,
      today: todayCount
    });

  } catch (err) {
    res.status(500).json({
      error: "stats error"
    });
  }
});
app.get("/api/admin/stats", async (req, res) => {
  try {

    const bookings = await Booking.countDocuments();
    const blocks = await Block.countDocuments();

    res.json({
      bookings,
      blocks
    });

  } catch (err) {
    res.status(500).json({ error: "stats error" });
  }
});
// =========================
// CLIENTS
// =========================
app.get("/api/clients", async (req, res) => {

    const bookings =
        await Booking.find();

    const unique = {};

    bookings.forEach(item => {

        unique[item.phone] = {
            name: item.name,
            phone: item.phone
        };

    });

    res.json(
        Object.values(unique)
    );
});

  app.get("/api/services", async (req, res) => {

    const services = await Service.find();

    res.json(services);

});

app.put("/api/services/:id", async (req, res) => {

    await Service.findByIdAndUpdate(
        req.params.id,
        req.body
    );

    res.json({ success:true });

});

try {
  console.log("FILES IN FRONTEND:");
} catch (e) {
  console.log("❌ FRONTEND NOT FOUND:", e.message);
}
app.post("/api/login", (req, res) => {

    const { password } = req.body;

    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

    if (password === ADMIN_PASSWORD) {

        return res.json({
            success: true
        });
    }

    return res.status(401).json({
        success: false
    });
});
// =========================
// CONNECT + START
// =========================
mongoose.connect(process.env.MONGO_URI)
  .then(async () => {

    console.log("MongoDB подключена 💾");

    app.listen(PORT, () => {
      console.log(`Server запущен на http://localhost:${PORT}`);
    });

  })
  .catch(err => console.log(err));
