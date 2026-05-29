import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import Admin from "./Admin";

const API =
  "https://barbershop-production-4f2a.up.railway.app";

export default function App() {

  // ============================================
  // ESTADOS
  // ============================================

  const [formulario, setFormulario] = useState({
    nombre: "",
    fecha: "",
    hora: "",
    barbero: "",
  });

  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  // LOGIN ADMIN
  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  const [credenciales, setCredenciales] = useState({
    usuario: "",
    password: "",
  });

  // ============================================
  // HORARIOS
  // ============================================

  const horarios = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
    "06:00 PM",
    "07:00 PM",
  ];

  // ============================================
  // BARBEROS
  // ============================================

  const barberos = [
    "Rodrigo",
    "Antonio",
  ];

  // ============================================
  // INPUTS FORMULARIO
  // ============================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormulario((prev) => ({

      ...prev,

      [name]: value,

      ...(name === "fecha" || name === "barbero"
        ? { hora: "" }
        : {}),

    }));

  };

  // ============================================
  // LOGIN INPUTS
  // ============================================

  const handleLoginChange = (e) => {

    const { name, value } = e.target;

    setCredenciales((prev) => ({
      ...prev,
      [name]: value,
    }));

  };

  // ============================================
  // VALIDAR LOGIN
  // ============================================

  const iniciarSesion = (e) => {

    e.preventDefault();

    // USUARIO Y CONTRASEÑA
    if (
      credenciales.usuario === "admin" &&
      credenciales.password === "1234"
    ) {

      setMostrarLogin(false);

      setMostrarAdmin(true);

      setCredenciales({
        usuario: "",
        password: "",
      });

    } else {

      alert("❌ Usuario o contraseña incorrectos");

    }

  };

  // ============================================
  // HORARIOS OCUPADOS
  // ============================================

  useEffect(() => {

    if (formulario.fecha && formulario.barbero) {

      fetch(
        `https://barbershop-production-4f2a.up.railway.app/citas/${formulario.fecha}/${formulario.barbero}`
      )
        .then((res) => res.json())
        .then((data) => {

          const horas = data.map((cita) => cita.hora);

          setHorariosOcupados(horas);

        })
        .catch((err) => console.log(err));

    }

  }, [formulario.fecha, formulario.barbero]);

  // ============================================
  // DÍAS DE DESCANSO
  // ============================================

  const barberoDescansa = () => {

    if (!formulario.fecha || !formulario.barbero) {
      return false;
    }

    const fecha = new Date(formulario.fecha);

    const dia = fecha.getDay();

    // Rodrigo descansa miércoles
    if (
      formulario.barbero === "Rodrigo" &&
      dia === 2
    ) {
      return true;
    }

    // Antonio descansa lunes
    if (
      formulario.barbero === "Antonio" &&
      dia === 0
    ) {
      return true;
    }

    return false;

  };

  // ============================================
  // GUARDAR CITA
  // ============================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      await axios.post(`${API}/agendar`, formulario);

      alert("✨ Cita agendada correctamente ✨");

      setFormulario({
        nombre: "",
        fecha: "",
        hora: "",
        barbero: "",
      });

      setHorariosOcupados([]);

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data ||
        "Error al guardar la cita"
      );

    }

  };

  // ============================================
  // INTERFAZ
  // ============================================

  return (

    <div className="app-container">

      <div className="background-overlay"></div>

      {/* ============================================
          MENÚ HAMBURGUESA
      ============================================ */}

      <div
        className={`menu-overlay ${
          menuAbierto ? "activo" : ""
        }`}
        onClick={() => setMenuAbierto(false)}
      ></div>

      <div className="menu-hamburguesa">

        <button
          className={`menu-btn ${
            menuAbierto ? "abierto" : ""
          }`}
          onClick={() =>
            setMenuAbierto(!menuAbierto)
          }
        >

          <span></span>
          <span></span>
          <span></span>

        </button>

        <nav
          className={`menu-nav ${
            menuAbierto ? "activo" : ""
          }`}
        >

          <div className="menu-header">

            <h3>💈 Barber Shop</h3>

            <button
              className="menu-cerrar"
              onClick={() =>
                setMenuAbierto(false)
              }
            >
              ✕
            </button>

          </div>

          <ul className="menu-lista">

            <li>

              <button

                onClick={() => {

                  setMostrarLogin(true);

                  setMenuAbierto(false);

                }}

                className="menu-item"
              >

                <span>🔐</span>

                Login Administrador

              </button>

            </li>

          </ul>

        </nav>

      </div>

      {/* ============================================
          CONTENIDO PRINCIPAL
      ============================================ */}

      <div className="content-wrapper">

        {/* FORMULARIO */}

        <div className="form-container">

          <div className="card">

            <h1 className="titulo">
              💈 Barber Shop
            </h1>

            <p className="subtitulo">
              Agenda tu cita fácilmente
            </p>

            <form
              onSubmit={handleSubmit}
              className="form"
            >

              <input
                type="text"
                name="nombre"
                value={formulario.nombre}
                onChange={handleChange}
                placeholder="Nombre del cliente"
                className="form-input"
                required
              />

              <input
                type="date"
                name="fecha"
                value={formulario.fecha}
                onChange={handleChange}
                className="form-input"
                min={
                  new Date()
                    .toISOString()
                    .split("T")[0]
                }
                required
              />

              <select
                name="barbero"
                value={formulario.barbero}
                onChange={handleChange}
                className="form-select"
                required
              >

                <option value="">
                  Selecciona un barbero
                </option>

                {barberos.map((barbero, index) => (

                  <option
                    key={index}
                    value={barbero}
                  >
                    {barbero}
                  </option>

                ))}

              </select>

              <select
                name="hora"
                value={formulario.hora}
                onChange={handleChange}
                className="form-select"
                required
                disabled={barberoDescansa()}
              >

                <option value="">

                  {
                    barberoDescansa()
                      ? "Barbero no disponible este día"
                      : "Selecciona una hora"
                  }

                </option>

                {horarios.map((hora, index) => (

                  <option
                    key={index}
                    value={hora}
                    disabled={
                      horariosOcupados.includes(hora)
                    }
                  >

                    {hora}

                    {
                      horariosOcupados.includes(hora)
                        ? " - Ocupado"
                        : ""
                    }

                  </option>

                ))}

              </select>

              <button
                type="submit"
                className="submit-btn"
              >

                ✂️ Agendar cita

              </button>

            </form>

          </div>

        </div>

        {/* INFO */}

        <div className="info-container">

          <div className="info-card">

            <h2 className="info-title">
              ✨ Sobre Nosotros
            </h2>

            <p className="info-text">
              En Barber Shop ofrecemos los mejores
              cortes y afeitados con atención
              profesional y estilo moderno.
            </p>

            <div className="info-item">
              📍 Av. Principal #123
            </div>

            <div className="info-item">
              📞 +52 55 1234 5678
            </div>

            <div className="info-item">
              🕒 Lun - Sáb | 10AM - 8PM
            </div>

            <div className="info-item">
              📸 @BarberShop
            </div>

          </div>

        </div>

      </div>

      {/* ============================================
          LOGIN MODAL
      ============================================ */}

      {

        mostrarLogin && (

          <div className="login-modal">

            <div className="login-modal-content">

              <button
                className="login-modal-cerrar"
                onClick={() =>
                  setMostrarLogin(false)
                }
              >
                ✕
              </button>

              <h2 className="login-modal-title">
                🔐 Login Administrador
              </h2>

              <form
                onSubmit={iniciarSesion}
                className="login-form"
              >

                <input
                  type="text"
                  name="usuario"
                  placeholder="Usuario"
                  value={credenciales.usuario}
                  onChange={handleLoginChange}
                  className="login-input"
                  required
                />

                <input
                  type="password"
                  name="password"
                  placeholder="Contraseña"
                  value={credenciales.password}
                  onChange={handleLoginChange}
                  className="login-input"
                  required
                />

                <button
                  type="submit"
                  className="login-submit-btn"
                >
                  Iniciar Sesión
                </button>

              </form>

            </div>

          </div>

        )

      }

      {/* ============================================
          PANEL ADMIN MODAL
      ============================================ */}

      {

        mostrarAdmin && (

          <div className="admin-modal">
            <div className="admin-modal-content">
              <Admin
                cerrar={() =>
                  setMostrarAdmin(false)
                }
              />
            </div>
          </div>

        )

      }

    </div>

  );

}