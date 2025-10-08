const express = require("express");
const mysql = require("mysql2");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = 8000;

const db = mysql.createConnection({
    host: "localhost",
    user: "chayka",
    password: "123",
    database: "photo_album",
});

db.connect((err) => {
    if (err) {
        console.error("Ошибка подключения к базе данных:", err.message);
        return;
    }
    console.log("Подключение к базе данных успешно установлено");
});

app.use(cors());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

const monthMapping = {
    "Январь": "January_2024",
    "Февраль": "February_2024",
    "Март": "March_2024",
    "Апрель": "April_2024",
    "Май": "May_2024",
    "Июнь": "June_2024",
    "Июль": "July_2024",
    "Август": "August_2024",
    "Сентябрь": "September_2024",
    "Октябрь": "October_2024",
    "Ноябрь": "November_2024",
    "Декабрь": "December_2024",
};

app.get("/photos", (req, res) => {
    const { month } = req.query;

    if (!month) {
        return res.status(400).json({ error: "Месяц не указан" });
    }

    const folderName = monthMapping[month];
    if (!folderName) {
        return res.status(400).json({ error: "Некорректный месяц" });
    }

    const folderPath = path.join(__dirname, "public", "photos", folderName);

    if (!fs.existsSync(folderPath)) {
        console.error(`Папка не найдена: ${folderPath}`);
        return res.status(404).json({ error: "Папка не найдена" });
    }

    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error(`Ошибка чтения папки: ${folderPath}`, err);
            return res.status(500).json({ error: "Ошибка чтения папки" });
        }

        const images = files
            .filter((file) => /\.(jpg|jpeg|png|gif)$/i.test(file))
            .map((file) => `/photos/${folderName}/${file}`);

        console.log(`Фотографии найдены: ${images}`);
        res.json(images);
    });
});


app.get("/caption", (req, res) => {
    const { photo } = req.query;

    if (!photo) {
        return res.status(400).json({ error: "Фотография не указана" });
    }

    const sql = "SELECT caption FROM captions WHERE photo_path = ?";
    db.query(sql, [photo], (err, results) => {
        if (err) {
            console.error("Ошибка получения данных из базы:", err);
            return res.status(500).json({ error: "Ошибка получения данных" });
        }

        const caption = results.length ? results[0].caption : "";
        res.json({ caption });
    });
});


app.get("/caption", (req, res) => {
    const { photo } = req.query;

    if (!photo) {
        return res.status(400).json({ error: "Фотография не указана" });
    }

    const sql = "SELECT caption FROM captions WHERE photo_path = ?";
    db.query(sql, [photo], (err, results) => {
        if (err) {
            console.error("Ошибка получения данных из базы:", err);
            return res.status(500).json({ error: "Ошибка получения данных" });
        }

        const caption = results.length ? results[0].caption : "Нет подписи.";
        res.json({ photo, caption });
    });
});

app.post("/caption", (req, res) => {
    const { photo, caption } = req.body;

    if (!photo || !caption) {
        return res.status(400).json({ error: "Фотография или подпись не указаны" });
    }

    const dateMatch = photo.match(/@(\d{2}-\d{2}-\d{4})_/);
    const date = dateMatch ? dateMatch[1].split('-').reverse().join('-') : null;

    if (!date) {
        return res.status(400).json({ error: "Не удалось извлечь дату из имени файла" });
    }

    const sql =
        "INSERT INTO captions (photo_path, caption, date) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE caption = ?";
    db.query(sql, [photo, caption, date, caption], (err) => {
        if (err) {
            console.error("Ошибка сохранения данных:", err);
            return res.status(500).json({ error: "Ошибка сохранения данных" });
        }

        res.json({ success: true });
    });
});




// Запуск сервера
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});

