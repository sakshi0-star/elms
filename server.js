const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// DB
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "enms"
});

db.connect(() => console.log("MySQL Connected 🚀"));

/* ---------------- LOGIN ---------------- */
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email=? AND password=?";

    db.query(sql, [email, password], (err, result) => {
        if (result.length > 0) {
            res.json({ success: true, user: result[0] });
        } else {
            res.json({ success: false });
        }
    });
});

/* ------------- APPLY LEAVE ------------- */
app.post("/leave", (req, res) => {
    const { user_id, type, start_date, end_date } = req.body;

    const sql = `
        INSERT INTO leave_requests (user_id, type, start_date, end_date, status)
        VALUES (?, ?, ?, ?, 'pending')
    `;

    db.query(sql, [user_id, type, start_date, end_date], (err) => {
        if (err) return res.send(err);
        res.json({ message: "Leave Applied" });
    });
});

/* -------- EMPLOYEE LEAVES -------- */
app.get("/leaves/:id", (req, res) => {
    db.query(
        "SELECT * FROM leave_requests WHERE user_id=?",
        [req.params.id],
        (err, result) => {
            res.json(result);
        }
    );
});

/* -------- MANAGER DASHBOARD -------- */
app.get("/manager/leaves", (req, res) => {
    db.query("SELECT * FROM leave_requests", (err, result) => {
        res.json(result);
    });
});

/* -------- APPROVE -------- */
app.put("/approve/:id", (req, res) => {
    db.query(
        "UPDATE leave_requests SET status='approved' WHERE id=?",
        [req.params.id],
        () => res.json({ message: "Approved" })
    );
});

/* -------- REJECT -------- */
app.put("/reject/:id", (req, res) => {
    db.query(
        "UPDATE leave_requests SET status='rejected' WHERE id=?",
        [req.params.id],
        () => res.json({ message: "Rejected" })
    );
});

app.listen(3000, () => {
    console.log("Server running on 3000");
});