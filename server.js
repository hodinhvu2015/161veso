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
	await pool.query(`
  CREATE TABLE IF NOT EXISTS dsd (
    STT SERIAL PRIMARY KEY,
    Ten VARCHAR(50),
    Nhom VARCHAR(50),
    Vecap1 VARCHAR(50),
    Vecap2 VARCHAR(50),
    Vetong VARCHAR(50),
    Nguon VARCHAR(50),
    Ngay VARCHAR(50)
  );
`);
await pool.query(`
CREATE TABLE IF NOT EXISTS dsnb (
  STT SERIAL PRIMARY KEY,
  Nguoiban VARCHAR(50),
  Trangthai VARCHAR(50),
  Ngaynghi VARCHAR(50),
  Ngayban VARCHAR(50),
  Nhom VARCHAR(50),
  Sapxep1 VARCHAR(50),
  Vl VARCHAR(50),
  Vecodinh VARCHAR(50)
);
`);
await pool.query(`
CREATE TABLE IF NOT EXISTS dsnv (
  id SERIAL PRIMARY KEY,
  ten VARCHAR(50),
  ngay VARCHAR(50),
  vecap1 VARCHAR(50),
  tra VARCHAR(50),
  ban VARCHAR(50),
  thuctra VARCHAR(50),
  thucban VARCHAR(50),
  vetrung VARCHAR(50),
  tienmat VARCHAR(50),
  nhom VARCHAR(50),
  vecap2 VARCHAR(50),
  tracap2 VARCHAR(50),
  vetong VARCHAR(50),
  nguon VARCHAR(50),
  tinhtrang VARCHAR(50),
  tuan VARCHAR(50)
);
`);
await pool.query(`
CREATE TABLE IF NOT EXISTS pvtv (
  id SERIAL PRIMARY KEY,
  nguoiban VARCHAR(50),
  dai1 VARCHAR(50),
  dai2 VARCHAR(50),
  dai3 VARCHAR(50),
  tong VARCHAR(50),
  tra1 VARCHAR(50),
  tra2 VARCHAR(50),
  tratong VARCHAR(50),
  ban VARCHAR(50),
  vl VARCHAR(50),
  vltra VARCHAR(50),
  ngay VARCHAR(50),
  ghichu VARCHAR(50),
  stt VARCHAR(50)
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
app.get("/api/dsd", checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dsd ORDER BY STT DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/dsnb", checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dsnb ORDER BY STT DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/dsnv", checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM dsnv ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});
app.get("/api/pvtv", checkAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM pvtv ORDER BY id DESC");
    res.json(result.rows);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Database error" });
  }
});

app.post("/api/dsnb", async (req, res) => {
  const { nguoiban, nhom } = req.body;

  await pool.query(
    "INSERT INTO dsnb (nguoiban, trangthai, nhom) VALUES ($1, 'Bán', $2)",
    [nguoiban, nhom]
  );

  res.json({ success: true });
});
app.put("/api/dsnb/:id", checkAdmin, async (req, res) => {
  const { trangthai } = req.body;

  await pool.query(
    "UPDATE dsnb SET trangthai = $1 WHERE STT = $2",
    [trangthai, req.params.id]
  );

  res.json({ success: true });
});
app.put("/api/dsnb/:id/full", async (req, res) => {

  const {
    nguoiban,
    trangthai,
    nhom,
    sapxep1,
    vl,
    vecodinh,
    ngaynghi,
    ngayban
  } = req.body;

  await pool.query(
    `UPDATE dsnb 
     SET nguoiban=$1,
         trangthai=$2,
         nhom=$3,
         sapxep1=$4,
         vl=$5,
         vecodinh=$6,
         ngaynghi=$7,
         ngayban=$8
     WHERE stt=$9`,
    [nguoiban, trangthai, nhom, sapxep1, vl, vecodinh, ngaynghi, ngayban, req.params.id]
  );

  res.json({ success:true });
});
app.post("/api/dsd", checkAdmin, async (req, res) => {
  const { Ten, Nhom, Vecap1, Vecap2, Vetong, Nguon, Ngay } = req.body;

  await pool.query(
    `INSERT INTO dsd (Ten,Nhom,Vecap1,Vecap2,Vetong,Nguon,Ngay)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [Ten,Nhom,Vecap1,Vecap2,Vetong,Nguon,Ngay]
  );

  res.json({ success: true });
});
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
    return res.status(401).json({ error: "Unauthorized" });
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