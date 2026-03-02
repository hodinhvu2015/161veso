const express = require("express");
const session = require("express-session");
const bcrypt = require("bcrypt");
const path = require("path");
const { Pool } = require("pg");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "secretkey123",
    resave: false,
    saveUninitialized: false
}));

app.use(express.static("public"));

/* ============================= */
/*  KẾT NỐI POSTGRESQL (RENDER) */
/* ============================= */

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

/* ============================= */
/*  TẠO BẢNG NẾU CHƯA CÓ        */
/* ============================= */

async function initDB() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username VARCHAR(100) UNIQUE,
            password VARCHAR(255),
            role VARCHAR(20)
        );
    `);

    // Tạo admin mặc định nếu chưa có
    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        ["admin"]
    );

    if (result.rows.length === 0) {
        const hash = await bcrypt.hash("123456", 10);

        await pool.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)",
            ["admin", hash, "admin"]
        );

        console.log("Admin mặc định đã được tạo.");
    }
}

initDB();

/* ============================= */
/*          ROUTES               */
/* ============================= */

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public/login.html"));
});

app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    const result = await pool.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.json({ success: false });
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
        return res.json({ success: false });
    }

    req.session.user = {
        id: user.id,
        role: user.role
    };

    res.json({ success: true });
});

function checkAdmin(req, res, next) {
    if (!req.session.user || req.session.user.role !== "admin") {
        return res.redirect("/");
    }
    next();
}

app.get("/admin", checkAdmin, (req, res) => {
    res.sendFile(path.join(__dirname, "public/admin.html"));
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running..."));