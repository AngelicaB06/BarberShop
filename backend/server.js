require("dotenv").config();


const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const axios = require("axios");

const app = express();

process.on("uncaughtException", (err) => {
  console.log("ERROR GLOBAL");
  console.log(err);
});

process.on("unhandledRejection", (err) => {
  console.log("PROMISE ERROR");
  console.log(err);
});

const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARES
// ============================================

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

app.use((err, req, res, next) => {

  console.log("❌ ERROR EXPRESS:");
  console.log(err);

  res.status(500).send(err.message);

});

// ============================================
// WHATSAPP BUSINESS API
// ============================================

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// ============================================
// TELÉFONOS BARBEROS
// ============================================

const telefonosBarberos = {
  Rodrigo: "525665094429",
  Antonio: "525520523608",
};

// ============================================
// CONEXIÓN MYSQL
// ============================================

console.log("MYSQLHOST:", process.env.MYSQLHOST);
console.log("MYSQLUSER:", process.env.MYSQLUSER);
console.log("MYSQLDATABASE:", process.env.MYSQLDATABASE);
console.log("MYSQLPORT:", process.env.MYSQLPORT);

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

console.log("✅ Pool MySQL iniciado");

db.getConnection((err, connection) => {

  if (err) {
    console.log("❌ Error conectando MySQL");
    console.log(err);
  } else {
    console.log("✅ MySQL conectado");

    connection.release();
  }

});

// ============================================
// RUTA PRINCIPAL
// ============================================

app.get("/", (req, res) => {
  res.send("🚀 API funcionando correctamente");
});

// ============================================
// OBTENER HORARIOS OCUPADOS
// ============================================

app.get("/citas/:fecha/:barbero", (req, res) => {

  const fecha = req.params.fecha;
  const barbero = req.params.barbero;

  const sql =
    "SELECT hora FROM citas WHERE fecha = ? AND barbero = ?";

  db.query(sql, [fecha, barbero], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).send("Error al obtener horarios");
    }

    res.json(result);

  });

});

// ============================================
// AGENDAR CITA
// ============================================

app.post("/agendar", (req, res) => {

  const {
    nombre,
    fecha,
    hora,
    barbero,
  } = req.body;

  if (!nombre || !fecha || !hora || !barbero) {
    return res
      .status(400)
      .send("⚠️ Todos los campos son obligatorios");
  }

  const fechaSeleccionada = new Date(fecha);
  const dia = fechaSeleccionada.getDay();

  // Rodrigo descansa miércoles
  if (
    barbero === "Rodrigo" &&
    dia === 3
  ) {
    return res
      .status(400)
      .send("❌ Rodrigo no trabaja los miércoles");
  }

  // Antonio descansa lunes
  if (
    barbero === "Antonio" &&
    dia === 1
  ) {
    return res
      .status(400)
      .send("❌ Antonio no trabaja los lunes");
  }

  const verificar =
    "SELECT * FROM citas WHERE fecha = ? AND hora = ? AND barbero = ?";

  db.query(
    verificar,
    [fecha, hora, barbero],
    async (err, resultado) => {

      if (err) {
        console.log(err);
        return res.status(500).send("Error del servidor");
      }

      if (resultado.length > 0) {
        return res
          .status(400)
          .send("⚠️ Este horario ya está ocupado");
      }

      const sql =
        "INSERT INTO citas(nombre, fecha, hora, barbero) VALUES (?, ?, ?, ?)";

      db.query(
        sql,
        [nombre, fecha, hora, barbero],
        async (err, result) => {

          if (err) {
            console.log(err);
            return res
              .status(500)
              .send("Error al guardar cita");
          }

          // ============================================
          // ENVIAR WHATSAPP
          // ============================================

          try {

            const telefonoBarbero =
              telefonosBarberos[barbero];

            await axios.post(
              `https://graph.facebook.com/v22.0/${PHONE_NUMBER_ID}/messages`,
              {
                messaging_product: "whatsapp",

                to: telefonoBarbero,

                type: "text",

                text: {
                  body:
`💈 Nueva cita agendada

👤 Cliente: ${nombre}
📅 Fecha: ${fecha}
⏰ Hora: ${hora}
✂️ Barbero: ${barbero}`
                }
              },
              {
                headers: {
                  Authorization:
                    `Bearer ${ACCESS_TOKEN}`,

                  "Content-Type":
                    "application/json",
                },
              }
            );

            console.log("✅ WhatsApp enviado");

          } catch (error) {

            console.log("❌ Error WhatsApp");

            console.log(
              error.response?.data ||
              error.message
            );

          }

          res.send(
            "✅ Cita guardada correctamente"
          );

        }
      );

    }
  );

});

// ============================================
// OBTENER TODAS LAS CITAS
// ============================================

app.get("/todas", (req, res) => {

  const sql =
    "SELECT * FROM citas ORDER BY fecha ASC, hora ASC";

  db.query(sql, (err, result) => {

    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error al obtener citas");
    }

    res.json(result);

  });

});

// ============================================
// ELIMINAR CITA
// ============================================

app.delete("/eliminar/:id", (req, res) => {

  const id = req.params.id;

  const sql =
    "DELETE FROM citas WHERE id = ?";

  db.query(sql, [id], (err, result) => {

    if (err) {
      console.log(err);
      return res
        .status(500)
        .send("Error al eliminar");
    }

    res.send("Cita eliminada");

  });

});

// ============================================
// EDITAR CITA
// ============================================

app.put("/editar/:id", (req, res) => {

  const id = req.params.id;

  const {
    nombre,
    fecha,
    hora,
    barbero,
  } = req.body;

  const sql =
    "UPDATE citas SET nombre=?, fecha=?, hora=?, barbero=? WHERE id=?";

  db.query(
    sql,
    [nombre, fecha, hora, barbero, id],
    (err, result) => {

      if (err) {
        console.log(err);
        return res
          .status(500)
          .send("Error al editar");
      }

      res.send("Cita actualizada");

    }
  );

});

// ============================================
// SERVIDOR
// ============================================

console.log("🚀 ARRANCANDO BACKEND...");
console.log("📡 Intentando iniciar servidor...");

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor iniciado en puerto ${PORT}`);
});