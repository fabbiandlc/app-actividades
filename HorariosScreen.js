import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Alert,
  TextInput,
  SafeAreaView,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Picker } from "@react-native-picker/picker";

const HorariosScreen = ({ navigation }) => {
  // Estados para datos
  const [horarios, setHorarios] = useState([]);
  const [docentes, setDocentes] = useState([]);
  const [materias, setMaterias] = useState([]);
  const [salones, setSalones] = useState([]);
  const [filteredDocentes, setFilteredDocentes] = useState([]);

  // Estados de UI
  const [modalVisible, setModalVisible] = useState(false);
  const [docenteModalVisible, setDocenteModalVisible] = useState(false);
  const [selectedDocente, setSelectedDocente] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentView, setCurrentView] = useState("list"); // 'list' o 'schedule'
  const [editingHorario, setEditingHorario] = useState(null);

  // Estado para nuevo docente
  const [newDocente, setNewDocente] = useState({
    nombre: "",
    apellido: "",
  });

  // Estado para el nuevo horario
  const [newHorario, setNewHorario] = useState({
    docenteId: "",
    dia: "Lunes",
    horaInicio: "07:00",
    horaFin: "08:00",
    materiaId: "",
    salonId: "",
  });

  // Definición de horas disponibles (de 7:00 a 20:00)
  const horasDisponibles = useMemo(() => {
    const horas = [];
    for (let i = 7; i <= 20; i++) {
      const hora = i < 10 ? `0${i}:00` : `${i}:00`;
      horas.push(hora);
    }
    return horas;
  }, []);

  // Días de la semana
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];

  // Cargar datos simulados para pruebas
  useEffect(() => {
    // Solo cargar materias y salones, no docentes
    setMaterias([
      { id: "1", nombre: "Matemáticas", codigo: "MAT101" },
      { id: "2", nombre: "Español", codigo: "ESP201" },
      { id: "3", nombre: "Ciencias", codigo: "CIE301" },
    ]);

    setSalones([
      { id: "1", nombre: "Aula 101" },
      { id: "2", nombre: "Aula 102" },
      { id: "3", nombre: "Laboratorio 1" },
    ]);

    // No precargar horarios
    setHorarios([]);
  }, []);

  // Filtrar docentes según la búsqueda
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filtered = docentes.filter(
        (docente) =>
          docente.nombre.toLowerCase().includes(query) ||
          docente.apellido.toLowerCase().includes(query)
      );
      setFilteredDocentes(filtered);
    } else {
      setFilteredDocentes(docentes);
    }
  }, [searchQuery, docentes]);

  // Obtener nombre completo del docente
  const getDocenteNombre = useCallback(
    (docenteId) => {
      const docente = docentes.find((d) => d.id === docenteId);
      return docente
        ? `${docente.nombre} ${docente.apellido}`
        : "Docente no encontrado";
    },
    [docentes]
  );

  // Obtener nombre de la materia
  const getMateriaNombre = useCallback(
    (materiaId) => {
      const materia = materias.find((m) => m.id === materiaId);
      return materia ? materia.nombre : "Materia no encontrada";
    },
    [materias]
  );

  // Obtener nombre del salón
  const getSalonNombre = useCallback(
    (salonId) => {
      const salon = salones.find((s) => s.id === salonId);
      return salon ? salon.nombre : "Salón no encontrado";
    },
    [salones]
  );

  // Verificar si hay conflictos en el horario
  const verificarConflictos = useCallback(
    (horario, horarioId = null) => {
      // Verificar conflictos de horario para el mismo docente, salón o con horarios existentes
      const conflictos = horarios.filter((h) => {
        // Si estamos editando, excluir el horario actual
        if (horarioId && h.id === horarioId) return false;

        // Verificar si es el mismo día
        if (h.dia !== horario.dia) return false;

        // Verificar si hay superposición de horas
        const inicio1 = convertirHoraAMinutos(horario.horaInicio);
        const fin1 = convertirHoraAMinutos(horario.horaFin);
        const inicio2 = convertirHoraAMinutos(h.horaInicio);
        const fin2 = convertirHoraAMinutos(h.horaFin);

        const hayConflictoHoras =
          (inicio1 < fin2 && fin1 > inicio2) ||
          (inicio2 < fin1 && fin2 > inicio1);

        if (!hayConflictoHoras) return false;

        // Verificar conflicto por docente, materia o salón
        return (
          h.docenteId === horario.docenteId || h.salonId === horario.salonId
        );
      });

      return conflictos.length > 0;
    },
    [horarios]
  );

  // Convertir hora (formato HH:MM) a minutos para facilitar las comparaciones
  const convertirHoraAMinutos = (hora) => {
    const [horas, minutos] = hora.split(":");
    return parseInt(horas) * 60 + parseInt(minutos);
  };

  // Guardar nuevo docente
  const handleGuardarDocente = () => {
    // Validaciones
    if (!newDocente.nombre || !newDocente.apellido) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    // Crear nuevo docente
    const id = Date.now().toString();
    const nuevoDocente = { ...newDocente, id };
    setDocentes([...docentes, nuevoDocente]);

    // Resetear estado y cerrar modal
    setNewDocente({
      nombre: "",
      apellido: "",
    });
    setDocenteModalVisible(false);
  };

  // Guardar nuevo horario
  const handleGuardarHorario = () => {
    // Validaciones
    if (
      !newHorario.docenteId ||
      !newHorario.materiaId ||
      !newHorario.salonId ||
      !newHorario.dia ||
      !newHorario.horaInicio ||
      !newHorario.horaFin
    ) {
      Alert.alert("Error", "Todos los campos son obligatorios");
      return;
    }

    // Validar que hora de inicio sea menor que hora de fin
    const inicioMinutos = convertirHoraAMinutos(newHorario.horaInicio);
    const finMinutos = convertirHoraAMinutos(newHorario.horaFin);
    if (inicioMinutos >= finMinutos) {
      Alert.alert(
        "Error",
        "La hora de inicio debe ser anterior a la hora de fin"
      );
      return;
    }

    // Verificar conflictos
    if (verificarConflictos(newHorario, editingHorario?.id)) {
      Alert.alert(
        "Conflicto de Horario",
        "Ya existe una clase programada para este docente o salón en el mismo horario"
      );
      return;
    }

    // Guardar horario
    if (editingHorario) {
      // Editar horario existente
      setHorarios(
        horarios.map((h) =>
          h.id === editingHorario.id ? { ...newHorario, id: h.id } : h
        )
      );
    } else {
      // Crear nuevo horario
      const id = Date.now().toString();
      setHorarios([...horarios, { ...newHorario, id }]);
    }

    // Resetear estado y cerrar modal
    setNewHorario({
      docenteId: "",
      dia: "Lunes",
      horaInicio: "07:00",
      horaFin: "08:00",
      materiaId: "",
      salonId: "",
    });
    setEditingHorario(null);
    setModalVisible(false);
  };

  // Editar horario existente
  const handleEditarHorario = (horario) => {
    setEditingHorario(horario);
    setNewHorario({
      docenteId: horario.docenteId,
      dia: horario.dia,
      horaInicio: horario.horaInicio,
      horaFin: horario.horaFin,
      materiaId: horario.materiaId,
      salonId: horario.salonId,
    });
    setModalVisible(true);
  };

  // Eliminar horario
  const handleEliminarHorario = (id) => {
    Alert.alert(
      "Eliminar Horario",
      "¿Estás seguro que deseas eliminar este horario?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          onPress: () => {
            setHorarios(horarios.filter((h) => h.id !== id));
          },
          style: "destructive",
        },
      ]
    );
  };

  // Seleccionar docente para ver su horario
  const handleSeleccionarDocente = (docente) => {
    setSelectedDocente(docente);
    setCurrentView("schedule");
  };

  // Obtener los horarios del docente seleccionado
  const horariosDocente = useMemo(() => {
    if (!selectedDocente) return [];
    return horarios.filter((h) => h.docenteId === selectedDocente.id);
  }, [selectedDocente, horarios]);

  // Renderizar item de docente
  const renderDocenteItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => handleSeleccionarDocente(item)}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>
          {item.nombre} {item.apellido}
        </Text>
        <Text style={styles.cardSubtitle}>
          {horarios.filter((h) => h.docenteId === item.id).length} clases
          programadas
        </Text>
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.viewButton}
          onPress={() => handleSeleccionarDocente(item)}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Ver Horario</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  // Renderizar celda de horario
  const renderHorarioCell = (dia, hora) => {
    // Filtrar las clases que coinciden con este día y hora
    const clases = horariosDocente.filter((horario) => {
      const inicioClase = convertirHoraAMinutos(horario.horaInicio);
      const finClase = convertirHoraAMinutos(horario.horaFin);
      const horaActual = convertirHoraAMinutos(hora);
      return (
        horario.dia === dia &&
        horaActual >= inicioClase &&
        horaActual < finClase
      );
    });

    if (clases.length === 0) {
      return <View style={styles.emptyCell} />;
    }

    // Si hay clases, mostrar la información
    const clase = clases[0]; // Tomamos la primera clase encontrada
    return (
      <TouchableOpacity
        style={styles.classCell}
        onPress={() => handleEditarHorario(clase)}
      >
        <Text style={styles.classCellTitle} numberOfLines={1}>
          {getMateriaNombre(clase.materiaId)}
        </Text>
        <Text style={styles.classCellSubtitle} numberOfLines={1}>
          {getSalonNombre(clase.salonId)}
        </Text>
        <Text style={styles.classCellTime}>
          {clase.horaInicio} - {clase.horaFin}
        </Text>
      </TouchableOpacity>
    );
  };

  // Renderizar formulario para crear docente
  const renderDocenteForm = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Nuevo Docente</Text>

        <Text style={styles.inputLabel}>Nombre</Text>
        <TextInput
          style={styles.textInput}
          value={newDocente.nombre}
          onChangeText={(text) =>
            setNewDocente({ ...newDocente, nombre: text })
          }
          placeholder="Ingrese nombre"
        />

        <Text style={styles.inputLabel}>Apellido</Text>
        <TextInput
          style={styles.textInput}
          value={newDocente.apellido}
          onChangeText={(text) =>
            setNewDocente({ ...newDocente, apellido: text })
          }
          placeholder="Ingrese apellido"
        />

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setDocenteModalVisible(false);
              setNewDocente({
                nombre: "",
                apellido: "",
              });
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={handleGuardarDocente}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Renderizar formulario para crear/editar horario
  const renderHorarioForm = () => (
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>
          {editingHorario ? "Editar Horario" : "Nuevo Horario"}
        </Text>

        <Text style={styles.inputLabel}>Docente</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={newHorario.docenteId}
            style={styles.picker}
            onValueChange={(itemValue) =>
              setNewHorario({ ...newHorario, docenteId: itemValue })
            }
          >
            <Picker.Item label="Seleccionar docente" value="" />
            {docentes.map((docente) => (
              <Picker.Item
                key={docente.id}
                label={`${docente.nombre} ${docente.apellido}`}
                value={docente.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Materia</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={newHorario.materiaId}
            style={styles.picker}
            onValueChange={(itemValue) =>
              setNewHorario({ ...newHorario, materiaId: itemValue })
            }
          >
            <Picker.Item label="Seleccionar materia" value="" />
            {materias.map((materia) => (
              <Picker.Item
                key={materia.id}
                label={`${materia.nombre} (${materia.codigo})`}
                value={materia.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Salón</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={newHorario.salonId}
            style={styles.picker}
            onValueChange={(itemValue) =>
              setNewHorario({ ...newHorario, salonId: itemValue })
            }
          >
            <Picker.Item label="Seleccionar salón" value="" />
            {salones.map((salon) => (
              <Picker.Item
                key={salon.id}
                label={salon.nombre}
                value={salon.id}
              />
            ))}
          </Picker>
        </View>

        <Text style={styles.inputLabel}>Día</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={newHorario.dia}
            style={styles.picker}
            onValueChange={(itemValue) =>
              setNewHorario({ ...newHorario, dia: itemValue })
            }
          >
            {diasSemana.map((dia) => (
              <Picker.Item key={dia} label={dia} value={dia} />
            ))}
          </Picker>
        </View>

        <View style={styles.timeContainer}>
          <View style={styles.timeField}>
            <Text style={styles.inputLabel}>Hora Inicio</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newHorario.horaInicio}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setNewHorario({ ...newHorario, horaInicio: itemValue })
                }
              >
                {horasDisponibles.map((hora) => (
                  <Picker.Item
                    key={`inicio-${hora}`}
                    label={hora}
                    value={hora}
                  />
                ))}
              </Picker>
            </View>
          </View>

          <View style={styles.timeField}>
            <Text style={styles.inputLabel}>Hora Fin</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={newHorario.horaFin}
                style={styles.picker}
                onValueChange={(itemValue) =>
                  setNewHorario({ ...newHorario, horaFin: itemValue })
                }
              >
                {horasDisponibles.map((hora) => (
                  <Picker.Item key={`fin-${hora}`} label={hora} value={hora} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setModalVisible(false);
              setEditingHorario(null);
              setNewHorario({
                docenteId: "",
                dia: "Lunes",
                horaInicio: "07:00",
                horaFin: "08:00",
                materiaId: "",
                salonId: "",
              });
            }}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={handleGuardarHorario}
          >
            <Text style={styles.saveButtonText}>
              {editingHorario ? "Actualizar" : "Guardar"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  // Renderizar vista de lista de docentes
  const renderListView = () => (
    <>
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#999"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar docente..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          clearButtonMode="while-editing"
        />
      </View>

      <FlatList
        data={filteredDocentes}
        renderItem={renderDocenteItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="person-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No hay docentes</Text>
            <Text style={styles.emptySubText}>
              {searchQuery
                ? "Intenta con otra búsqueda"
                : "Agrega docentes usando el botón + de abajo"}
            </Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fab}
        onPress={() => {
          setDocenteModalVisible(true);
        }}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </>
  );

  // Renderizar vista de horario
  const renderScheduleView = () => {
    if (!selectedDocente) return null;

    return (
      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setCurrentView("list");
              setSelectedDocente(null);
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#007BFF" />
          </TouchableOpacity>
          <Text style={styles.scheduleTitle}>
            Horario: {selectedDocente.nombre} {selectedDocente.apellido}
          </Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setNewHorario({
                ...newHorario,
                docenteId: selectedDocente.id,
              });
              setEditingHorario(null);
              setModalVisible(true);
            }}
          >
            <Ionicons name="add" size={24} color="#007BFF" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scheduleScrollContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.scheduleTable}>
              {/* Encabezados de columnas (días) */}
              <View style={styles.tableRow}>
                <View style={styles.timeCell}>
                  <Text style={styles.timeCellText}>Hora</Text>
                </View>
                {diasSemana.map((dia) => (
                  <View key={dia} style={styles.dayHeaderCell}>
                    <Text style={styles.dayHeaderText}>{dia}</Text>
                  </View>
                ))}
              </View>

              {/* Filas de horarios */}
              {horasDisponibles.map((hora, index) => {
                if (index === horasDisponibles.length - 1) return null; // No mostrar la última hora como inicio
                const horaFin = horasDisponibles[index + 1];
                return (
                  <View key={hora} style={styles.tableRow}>
                    <View style={styles.timeCell}>
                      <Text style={styles.timeCellText}>
                        {hora} - {horaFin}
                      </Text>
                    </View>
                    {diasSemana.map((dia) => (
                      <View key={`${dia}-${hora}`} style={styles.tableCell}>
                        {renderHorarioCell(dia, hora)}
                      </View>
                    ))}
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </ScrollView>

        {/* Leyenda */}
        {horariosDocente.length > 0 && (
          <ScrollView style={styles.legendScrollContainer}>
            <View style={styles.legendContainer}>
              <Text style={styles.legendTitle}>Clases Programadas:</Text>
              {horariosDocente.map((horario) => (
                <View key={horario.id} style={styles.legendItem}>
                  <View style={styles.legendColor} />
                  <View style={styles.legendInfo}>
                    <Text style={styles.legendText}>
                      {getMateriaNombre(horario.materiaId)} -{" "}
                      {getSalonNombre(horario.salonId)}
                    </Text>
                    <Text style={styles.legendSubtext}>
                      {horario.dia}, {horario.horaInicio} - {horario.horaFin}
                    </Text>
                  </View>
                  <View style={styles.legendActions}>
                    <TouchableOpacity
                      style={styles.legendButton}
                      onPress={() => handleEditarHorario(horario)}
                    >
                      <Ionicons
                        name="create-outline"
                        size={20}
                        color="#007BFF"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.legendButton}
                      onPress={() => handleEliminarHorario(horario.id)}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={20}
                        color="#FF3B30"
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {currentView === "list" ? renderListView() : renderScheduleView()}

      {/* Modal para crear docente */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={docenteModalVisible}
        onRequestClose={() => {
          setDocenteModalVisible(false);
        }}
      >
        {renderDocenteForm()}
      </Modal>

      {/* Modal para crear/editar horario */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          setEditingHorario(null);
        }}
      >
        {renderHorarioForm()}
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    margin: 10,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 16,
  },
  list: {
    padding: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  cardActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  viewButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#555",
    marginTop: 12,
  },
  emptySubText: {
    fontSize: 14,
    color: "#888",
    marginTop: 8,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#007BFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
    textAlign: "center",
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#555",
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    padding: 10,
    fontSize: 16,
    marginBottom: 12,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
  },
  timeContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  timeField: {
    width: "48%",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 6,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 5,
  },
  saveButton: {
    backgroundColor: "#007BFF",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#f2f2f2",
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "600",
    fontSize: 16,
  },
  scheduleContainer: {
    flex: 1,
  },
  scheduleHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    padding: 5,
  },
  scheduleTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
    marginLeft: 10,
  },
  addButton: {
    padding: 5,
  },
  scheduleScrollContainer: {
    flex: 1,
  },
  scheduleTable: {
    margin: 10,
  },
  tableRow: {
    flexDirection: "row",
  },
  timeCell: {
    width: 80,
    height: 60,
    padding: 5,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  timeCellText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  dayHeaderCell: {
    width: 120,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#007BFF",
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  dayHeaderText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#fff",
  },
  tableCell: {
    width: 120,
    height: 60,
    padding: 2,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  emptyCell: {
    flex: 1,
    backgroundColor: "#fff",
  },
  classCell: {
    flex: 1,
    backgroundColor: "#E3F2FD",
    borderRadius: 4,
    padding: 4,
    justifyContent: "center",
  },
  classCellTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#1565C0",
  },
  classCellSubtitle: {
    fontSize: 10,
    color: "#5C6BC0",
  },
  classCellTime: {
    fontSize: 9,
    color: "#5C6BC0",
    marginTop: 2,
  },
  legendScrollContainer: {
    maxHeight: 200,
    backgroundColor: "#fff",
  },
  legendContainer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  legendTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#333",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingBottom: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#E3F2FD",
    marginRight: 8,
  },
  legendInfo: {
    flex: 1,
  },
  legendText: {
    fontSize: 14,
    color: "#333",
  },
  legendSubtext: {
    fontSize: 12,
    color: "#666",
  },
  legendActions: {
    flexDirection: "row",
  },
  legendButton: {
    padding: 5,
    marginLeft: 5,
  },
});

export default HorariosScreen;
