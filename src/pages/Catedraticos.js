import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Input,
  ListGroup,
  ListGroupItem,
  Spinner,
  Card,
  CardBody,
  CardTitle,
  CardText,
} from "reactstrap";
import "bootstrap/dist/css/bootstrap.min.css";

//! probando git

const Catedraticos = () => {
  const [catedraticos, setCatedraticos] = useState([]);
  const [filteredCatedraticos, setFilteredCatedraticos] = useState([]);
  const [selectedCatedratico, setSelectedCatedratico] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [periodos, setPeriodos] = useState([]); // Nuevo estado para periodos
  const [selectedPeriodo, setSelectedPeriodo] = useState(""); // Nuevo estado para el periodo seleccionado

  useEffect(() => {
    const fetchCatedraticos = async () => {
      try {
        const response = await fetch("https://apiclasessap-lygw.onrender.com/api/catedraticos");
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        console.log("Catedraticos:", result);
        setCatedraticos(result);
        setFilteredCatedraticos(result);
      } catch (error) {
        console.error("Error fetching catedraticos:", error);
      }
    };
    fetchCatedraticos();
  }, []);

  useEffect(() => {
    const fetchPeriodos = async () => {
      try {
        const response = await fetch("https://apiclasessap-lygw.onrender.com/api/getPeriodos"); // Asegúrate de tener esta API
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        setPeriodos(result || []);
        if (result.length > 0) {
          setSelectedPeriodo(result[0].id_periodo); // Establece el primer periodo como seleccionado por defecto
        }
      } catch (error) {
        console.error("Error fetching periodos:", error);
      }
    };
    fetchPeriodos();
  }, []);

  useEffect(() => {
    if (selectedCatedratico && searchQuery.trim() !== "" && selectedPeriodo) {
      const fetchClasses = async () => {
        try {
          setLoading(true);
          const response = await fetch(
            `https://apiclasessap-lygw.onrender.com/api/catedraticos/${selectedCatedratico.id_catedratico}/${selectedPeriodo}`
          );
          if (!response.ok) throw new Error("Network response was not ok");
          const result = await response.json();

          // Procesar la cadena 'secciones' para convertirla en un array de objetos
          // Procesamos cada elemento del array 'result'
          const processedClasses = result.map((classData) => {
            // Inicializamos un array vacío para 'secciones'
            let seccionesArray = [];
            try {
              // Intentamos parsear 'classData.secciones'. Si es null o undefined, usamos un array vacío por defecto.
              const parsed = JSON.parse(classData.secciones || "[]");
              // Verificamos si el resultado es un array. Si no lo es, lo convertimos en un array con un solo elemento.
              seccionesArray = Array.isArray(parsed) ? parsed : [parsed];
            } catch (error) {
              // Si ocurre un error durante el parseo, lo capturamos y mostramos en la consola.
              console.error("Error parsing secciones:", error);
            }
            // Devolvemos un nuevo objeto que es una copia de 'classData', pero con 'secciones' reemplazado por 'seccionesArray'.
            return {
              ...classData,
              secciones: seccionesArray,
            };
          });

          setClasses(processedClasses);
        } catch (error) {
          console.error("Error fetching classes:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchClasses();
    } else {
      setClasses([]); // Clear classes if no catedratico is selected, search query is empty, or period is not selected
    }
  }, [selectedCatedratico, searchQuery, selectedPeriodo]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredCatedraticos([]);
      setSelectedCatedratico(null);
    } else {
      setFilteredCatedraticos(
        catedraticos.filter(
          (c) =>
            c.nombre_catedratico &&
            c.nombre_catedratico.toLowerCase().includes(query.toLowerCase())
        )
      );
      setSelectedCatedratico(null);
    }
  };

  const handleCatedraticoSelect = (catedratico) => {
    setSelectedCatedratico(catedratico);
    setSearchQuery(catedratico.nombre_catedratico);
    setFilteredCatedraticos([]);
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col sm="12">
          <Input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Buscar catedrático"
            style={{ marginTop: "3rem" }}
          />
          <Input
            type="select"
            value={selectedPeriodo}
            onChange={(e) => setSelectedPeriodo(e.target.value)}
            style={{ marginTop: "1rem" }}
          >
            {periodos.map((p) => (
              <option key={p.id_periodo} value={p.id_periodo}>
                {p.id_periodo}
              </option>
            ))}
          </Input>

          {searchQuery.trim() !== "" && filteredCatedraticos.length > 0 && (
            <ListGroup className="mt-2">
              {filteredCatedraticos.map((c) => (
                <ListGroupItem
                  key={c.id_catedratico}
                  onClick={() => handleCatedraticoSelect(c)}
                  style={{ cursor: "pointer" }}
                >
                  {c.nombre_catedratico}
                </ListGroupItem>
              ))}
            </ListGroup>
          )}

          {loading ? (
            <Spinner color="primary" />
          ) : (
            <Row className="mt-4">
              {classes.length > 0 ? (
                classes.map((classData, index) => (
                  <Col sm="4" key={index} className="mb-4">
                    <Card>
                      <CardBody>
                        <CardTitle tag="h5">{classData.nombre_clase}</CardTitle>
                        <CardText>ID Clase: {classData.id_clase}</CardText>
                        <CardText>Créditos: {classData.creditos}</CardText>
                        <CardText>Secciones:</CardText>
                        <ul>
                          {classData.secciones.length > 0 ? (
                            classData.secciones.map((seccion, idx) => (
                              <li key={idx}>
                                Sección: {seccion.seccion} - Hora Inicio:{" "}
                                {seccion.hora_inicio}
                              </li>
                            ))
                          ) : (
                            <li>No secciones disponibles.</li>
                          )}
                        </ul>
                      </CardBody>
                    </Card>
                  </Col>
                ))
              ) : (
                <Col sm="12">
                  <p>No se encontraron clases.</p>
                </Col>
              )}
            </Row>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Catedraticos;
