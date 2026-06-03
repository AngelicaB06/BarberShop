import { useEffect, useState } from "react";
import "./App.css";
import axios from "axios";
import Admin from "./Admin";

const API =
  "https://barbershop-production-3e87.up.railway.app";

export default function App() {

  const [formulario, setFormulario] = useState({
    nombre: "",
    combo: "",
    fecha: "",
    hora: "",
    barbero: "",
  });

  const [horariosOcupados, setHorariosOcupados] = useState([]);
  const [menuAbierto, setMenuAbierto] = useState(false);

  const [mostrarLogin, setMostrarLogin] = useState(false);
  const [mostrarAdmin, setMostrarAdmin] = useState(false);

  const [credenciales, setCredenciales] = useState({
    usuario: "",
    password: "",
  });

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

  const barberos = [
    "Rodrigo",
    "Antonio",
  ];

  const combos = [
    "Niño - $130",
    "Dama - $160",
    "Plata - $180",
    "Oro - $230",
    "Diamante - $280",
  ];

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

  const handleLoginChange = (e) => {
    const { name, value } = e.target;

    setCredenciales((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const iniciarSesion = (e) => {
    e.preventDefault();

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

  useEffect(() => {
    if (formulario.fecha && formulario.barbero) {
      fetch(
        `${API}/citas/${formulario.fecha}/${formulario.barbero}`
      )
        .then((res) => res.json())
        .then((data) => {
          const horas = data.map((cita) => cita.hora);
          setHorariosOcupados(horas);
        })
        .catch((err) => console.log(err));
    }
  }, [formulario.fecha, formulario.barbero]);

  const barberoDescansa = () => {
    if (!formulario.fecha || !formulario.barbero) {
      return false;
    }

    const fecha = new Date(formulario.fecha);
    const dia = fecha.getDay();

    if (
      formulario.barbero === "Rodrigo" &&
      dia === 3
    ) {
      return true;
    }

    if (
      formulario.barbero === "Antonio" &&
      dia === 1
    ) {
      return true;
    }

    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/agendar`, formulario);

      alert("✨ Cita agendada correctamente ✨");

      setFormulario({
        nombre: "",
        combo: "",
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

  return (
    <div className="app-container">

      <div className="background-overlay"></div>

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
            <h3>💈 Barbería Clásica El General</h3>

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

      <div className="content-wrapper">

        <div className="form-container">

          <div className="card">

            <h1 className="titulo">
              💈 Barbería Clásica El General
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

              <select
                name="combo"
                value={formulario.combo}
                onChange={handleChange}
                className="form-select"
                required
              >
                <option value="">
                  Selecciona un combo
                </option>

                {combos.map((combo, index) => (
                  <option
                    key={index}
                    value={combo}
                  >
                    {combo}
                  </option>
                ))}
              </select>

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
                  {barberoDescansa()
                    ? "Barbero no disponible este día"
                    : "Selecciona una hora"}
                </option>

                {horarios.map((hora, index) => (
                  <option
                    key={index}
                    value={hora}
                    disabled={horariosOcupados.includes(hora)}
                  >
                    {hora}
                    {horariosOcupados.includes(hora)
                      ? " - Ocupado"
                      : ""}
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

      </div>

    </div>
  );
}