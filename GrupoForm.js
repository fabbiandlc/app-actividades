import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

const GrupoForm = ({
  setModalVisible,
  editIndex,
  setEditIndex,
  grupos,
  setGrupos,
  docentes,
  materias,
}) => {
  const [formData, setFormData] = useState({
    id: Date.now(),
    nombre: "",
    grado: "",
    turno: "Matutino",
    estudiantes: "",
    materias: [],
    tutor: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  // Cargar datos si está en modo edición
  useEffect(() => {
    if (editIndex !== null && grupos[editIndex]) {
      setFormData({
        ...grupos[editIndex],
        updatedAt: new Date().toISOString(),
      });
    }
  }, [editIndex, grupos]);

  // Manejar el guardado del formulario
  const handleSave = () => {
    // Validación básica
    if (!formData.nombre.trim() || !formData.grado.trim()) {
      alert("Por favor completa los campos obligatorios: Nombre y Grado");
      return;
    }

    let updatedGrupos = [...grupos];

    if (editIndex !== null) {
      // Actualizar grupo existente
      updatedGrupos[editIndex] = formData;
    } else {
      // Agregar nuevo grupo
      updatedGrupos.push({
        ...formData,
        id: Date.now(), // Generar un nuevo ID
      });
    }

    setGrupos(updatedGrupos);
    setModalVisible(false);
    setEditIndex(null);
  };

  // Alternar el turno
  const toggleTurno = () => {
    setFormData({
      ...formData,
      turno: formData.turno === "Matutino" ? "Vespertino" : "Matutino",
    });
  };

  // Cerrar el modal
  const handleClose = () => {
    setModalVisible(false);
    setEditIndex(null);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.centeredView}
    >
      <View style={styles.modalView}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>
            {editIndex !== null ? "Editar Grupo" : "Nuevo Grupo"}
          </Text>
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Ionicons name="close" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.formContainer}>
          <Text style={styles.label}>Nombre *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            placeholder="Ej. 1°A, 2°B, etc."
          />

          <View style={styles.switchContainer}>
            <Text style={styles.label}>Turno</Text>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Matutino</Text>
              <Switch
                value={formData.turno === "Vespertino"}
                onValueChange={toggleTurno}
                trackColor={{ false: "#007BFF", true: "#007BFF" }}
                thumbColor="#fff"
              />
              <Text style={styles.switchLabel}>Vespertino</Text>
            </View>
          </View>

          <Text style={styles.label}>Tutor</Text>
          <TextInput
            style={styles.input}
            value={formData.tutor}
            onChangeText={(text) => setFormData({ ...formData, tutor: text })}
            placeholder="Nombre del tutor del grupo"
          />

          <View style={styles.formFooter}>
            <Text style={styles.requiredText}>* Campos obligatorios</Text>
          </View>
        </ScrollView>

        <View style={styles.modalFooter}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleClose}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 5,
  },
  formContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  switchContainer: {
    marginBottom: 16,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginTop: 5,
  },
  switchLabel: {
    fontSize: 14,
    marginHorizontal: 10,
    color: "#333",
  },
  formFooter: {
    marginTop: 10,
    marginBottom: 20,
  },
  requiredText: {
    color: "#666",
    fontSize: 14,
    fontStyle: "italic",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    minWidth: 100,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#f1f1f1",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#666",
    fontWeight: "500",
  },
  saveButton: {
    backgroundColor: "#007BFF",
  },
  saveButtonText: {
    color: "white",
    fontWeight: "500",
  },
});

export default GrupoForm;
