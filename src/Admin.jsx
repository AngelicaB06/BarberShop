import { useEffect, useState } from "react";
import axios from "axios";
import "./Admin.css";

export default function Admin({ cerrar }) {

  const [citas, setCitas] = useState([]);
  const [cargando, setCargando] = useState(false);

  // ============================================
  // OBTENER CITAS
  // ============================================

  const obtenerCitas = async () => {

    setCargando(true);

    try {

      const res = await axios.get(
        "http://localhost:3001/todas"
      );

      setCitas(res.data);

    } catch (error) {

      console.log(error);
      alert("Error al cargar las citas");

    } finally {

      setCargando(false);

    }

  };

  useEffect(() => {

    obtenerCitas();

  }, []);

  // ============================================
  // ELIMINAR CITA
  // ============================================

  const eliminarCita = async (id) => {

    const confirmar = window.confirm(
      "¿Estás seguro de eliminar esta cita?"
    );

    if (!confirmar) return;

    try {

      await axios.delete(
        `http://localhost:3001/eliminar/${id}`
      );

      alert("🗑️ Cita eliminada correctamente");

      obtenerCitas();

    } catch (error) {

      console.log(error);

      alert("Error al eliminar la cita");

    }

  };

  // Calcular estadísticas
  const barberosUnicos = [...new Set(citas.map(cita => cita.barbero))];
  const fechasUnicas = [...new Set(citas.map(cita => cita.fecha))];

  return (

    <div className="admin-modal-container">

      <button className="admin-modal-cerrar" onClick={cerrar}>
        ✕ Cerrar
      </button>

      <h1 className="admin-modal-title">
        💈 Panel Administrador
      </h1>

      {/* Tarjetas de estadísticas */}
      <div className="admin-modal-stats">
        <div className="admin-modal-stat-card">
          <span className="admin-modal-stat-numero">{citas.length}</span>
          <span className="admin-modal-stat-label">Total de Citas</span>
        </div>
        <div className="admin-modal-stat-card">
          <span className="admin-modal-stat-numero">{barberosUnicos.length}</span>
          <span className="admin-modal-stat-label">Barberos Activos</span>
        </div>
        <div className="admin-modal-stat-card">
          <span className="admin-modal-stat-numero">{fechasUnicas.length}</span>
          <span className="admin-modal-stat-label">Días con Citas</span>
        </div>
      </div>

      <div className="admin-modal-tabla-container">

        {cargando ? (
          <div className="admin-modal-cargando">⏳ Cargando citas...</div>
        ) : (
          <table className="admin-modal-tabla">

            <thead>

              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Fecha</th>
                <th>Hora</th>
                <th>Barbero</th>
                <th>Acción</th>
              </tr>

            </thead>

            <tbody>

              {citas.length > 0 ? (

                citas.map((cita) => (

                  <tr key={cita.id}>

                    <td>#{cita.id}</td>
                    <td>{cita.nombre}</td>
                    <td>{cita.fecha}</td>
                    <td>{cita.hora}</td>
                    <td>💈 {cita.barbero}</td>
                    <td>

                      <button
                        className="admin-modal-btn-eliminar"
                        onClick={() =>
                          eliminarCita(cita.id)
                        }
                      >
                        🗑️ Eliminar
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>
                  <td colSpan="6" className="admin-modal-sin-citas">
                    📋 No hay citas registradas
                  </td>
                </tr>

              )}

            </tbody>

          </table>
        )}

      </div>

    </div>

  );

}