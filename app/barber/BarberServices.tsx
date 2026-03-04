import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { API_URL } from "../../constants/config";

// ─── INTERFACES ───────────────────────────────────────────────────────────────
interface Servicio {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  duracion_minutos: number;
  estado: "activo" | "inactivo";
}

interface FormData {
  nombre: string;
  descripcion: string;
  precio: string;
  duracion_minutos: string;
}

const EMPTY_FORM: FormData = {
  nombre: "",
  descripcion: "",
  precio: "",
  duracion_minutos: "30",
};

const DURACIONES = [15, 20, 30, 45, 60, 90, 120];

const getToken = async () => await AsyncStorage.getItem("token");
const getUserId = async () => {
  const u = await AsyncStorage.getItem("user");
  return u ? JSON.parse(u).id : null;
};

// ─── PANTALLA PRINCIPAL ───────────────────────────────────────────────────────
export default function BarberServices() {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editando, setEditando] = useState<Servicio | null>(null);

  useEffect(() => {
    fetchServicios();
  }, []);

  const fetchServicios = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const userId = await getUserId();
      if (!userId) return;

      const res = await fetch(`${API_URL}/api/servicios/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los servicios");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminar = (servicio: Servicio) => {
    Alert.alert("Eliminar Servicio", `¿Deseas eliminar "${servicio.nombre}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await getToken();
            await fetch(`${API_URL}/api/servicios/${servicio.id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });
            fetchServicios();
          } catch {
            Alert.alert("Error", "No se pudo eliminar el servicio");
          }
        },
      },
    ]);
  };

  const abrirEditar = (s: Servicio) => {
    setEditando(s);
    setShowModal(true);
  };

  const abrirNuevo = () => {
    setEditando(null);
    setShowModal(true);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Cargando servicios...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Servicios</Text>
          <Text style={styles.headerSub}>
            {servicios.length} servicio{servicios.length !== 1 ? "s" : ""}{" "}
            activo{servicios.length !== 1 ? "s" : ""}
          </Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={abrirNuevo}>
          <Ionicons name="add" size={22} color={Colors.textPrimary} />
          <Text style={styles.addBtnText}>Nuevo</Text>
        </TouchableOpacity>
      </View>

      {/* LISTA */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {servicios.length === 0 ? (
          <EmptyState onAdd={abrirNuevo} />
        ) : (
          servicios.map((s, idx) => (
            <ServicioCard
              key={s.id}
              servicio={s}
              isLast={idx === servicios.length - 1}
              onEdit={() => abrirEditar(s)}
              onDelete={() => handleEliminar(s)}
            />
          ))
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* MODAL CREAR / EDITAR */}
      <ServicioModal
        visible={showModal}
        editando={editando}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false);
          fetchServicios();
        }}
      />
    </View>
  );
}

// ─── CARD DE SERVICIO ─────────────────────────────────────────────────────────
function ServicioCard({
  servicio,
  isLast,
  onEdit,
  onDelete,
}: {
  servicio: Servicio;
  isLast: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <View style={[styles.card, isLast && { marginBottom: 0 }]}>
      {/* Franja izquierda decorativa */}
      <View style={styles.cardAccent} />

      <View style={styles.cardBody}>
        {/* Fila superior */}
        <View style={styles.cardTop}>
          <View style={styles.serviceIconBox}>
            <Ionicons name="cut" size={22} color={Colors.accent} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.cardNombre}>{servicio.nombre}</Text>
            {servicio.descripcion ? (
              <Text style={styles.cardDesc} numberOfLines={2}>
                {servicio.descripcion}
              </Text>
            ) : null}
          </View>
          <Text style={styles.cardPrecio}>
            ${Number(servicio.precio).toFixed(2)}
          </Text>
        </View>

        {/* Chips info */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Ionicons name="time-outline" size={13} color={Colors.accent} />
            <Text style={styles.chipText}>{servicio.duracion_minutos} min</Text>
          </View>
          <View
            style={[
              styles.chip,
              {
                backgroundColor: "rgba(52,199,89,0.1)",
                borderColor: "rgba(52,199,89,0.3)",
              },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={13}
              color="#34C759"
            />
            <Text style={[styles.chipText, { color: "#34C759" }]}>Activo</Text>
          </View>
        </View>

        {/* Acciones */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionEdit} onPress={onEdit}>
            <Ionicons name="create-outline" size={16} color={Colors.accent} />
            <Text style={styles.actionEditText}>Editar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionDelete} onPress={onDelete}>
            <Ionicons name="trash-outline" size={16} color="#FF3B30" />
            <Text style={styles.actionDeleteText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── MODAL CREAR / EDITAR ─────────────────────────────────────────────────────
function ServicioModal({
  visible,
  editando,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  editando: Servicio | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setForm(
        editando
          ? {
              nombre: editando.nombre,
              descripcion: editando.descripcion || "",
              precio: String(editando.precio),
              duracion_minutos: String(editando.duracion_minutos),
            }
          : EMPTY_FORM,
      );
    }
  }, [visible, editando]);

  const set = (key: keyof FormData, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }
    if (!form.precio || isNaN(Number(form.precio))) {
      Alert.alert("Error", "Ingresa un precio válido");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const body = {
        nombre: form.nombre.trim(),
        descripcion: form.descripcion.trim() || null,
        precio: parseFloat(form.precio),
        duracion_minutos: parseInt(form.duracion_minutos, 10),
        estado: "activo",
      };

      const url = editando
        ? `${API_URL}/api/servicios/${editando.id}`
        : `${API_URL}/api/servicios`;
      const method = editando ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "✅ ¡Listo!",
          editando ? "Servicio actualizado" : "Servicio creado exitosamente",
        );
        onSuccess();
      } else {
        Alert.alert("Error", data.error || "No se pudo guardar el servicio");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* HEADER */}
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editando ? "Editar Servicio" : "Nuevo Servicio"}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            {/* NOMBRE */}
            <Text style={styles.label}>Nombre del servicio *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Corte Clásico, Fade, Afeitado..."
              placeholderTextColor={Colors.textSecondary}
              value={form.nombre}
              onChangeText={(v) => set("nombre", v)}
            />

            {/* DESCRIPCIÓN */}
            <Text style={styles.label}>Descripción (opcional)</Text>
            <TextInput
              style={[styles.input, styles.inputMulti]}
              placeholder="Describe brevemente el servicio..."
              placeholderTextColor={Colors.textSecondary}
              value={form.descripcion}
              onChangeText={(v) => set("descripcion", v)}
              multiline
              numberOfLines={3}
            />

            {/* PRECIO */}
            <Text style={styles.label}>Precio ($) *</Text>
            <View style={styles.inputRow}>
              <View style={styles.inputPrefix}>
                <Text style={styles.inputPrefixText}>$</Text>
              </View>
              <TextInput
                style={[
                  styles.input,
                  {
                    flex: 1,
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    marginLeft: -1,
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={form.precio}
                onChangeText={(v) => set("precio", v)}
              />
            </View>

            {/* DURACIÓN */}
            <Text style={styles.label}>Duración</Text>
            <View style={styles.duracionGrid}>
              {DURACIONES.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.duracionChip,
                    form.duracion_minutos === String(d) &&
                      styles.duracionChipActive,
                  ]}
                  onPress={() => set("duracion_minutos", String(d))}
                >
                  <Text
                    style={[
                      styles.duracionText,
                      form.duracion_minutos === String(d) &&
                        styles.duracionTextActive,
                    ]}
                  >
                    {d} min
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 20 }} />
          </ScrollView>

          {/* BOTÓN GUARDAR */}
          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              disabled={saving}
              onPress={handleGuardar}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.saveBtnText}>
                    {editando ? "Guardar cambios" : "Crear servicio"}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconBox}>
        <Ionicons name="cut-outline" size={56} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>Sin servicios aún</Text>
      <Text style={styles.emptyDesc}>
        Agrega los servicios que ofreces para que tus clientes puedan reservar
        citas contigo.
      </Text>
      <TouchableOpacity style={styles.emptyBtn} onPress={onAdd}>
        <Ionicons name="add-circle" size={20} color={Colors.textPrimary} />
        <Text style={styles.emptyBtnText}>Agregar primer servicio</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: { color: Colors.textSecondary, marginTop: 10, fontSize: 14 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  addBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  addBtnText: { color: Colors.textPrimary, fontWeight: "700", fontSize: 14 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  // Card
  card: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    overflow: "hidden",
  },
  cardAccent: { width: 4, backgroundColor: Colors.accent },
  cardBody: { flex: 1, padding: 16 },
  cardTop: { flexDirection: "row", alignItems: "flex-start" },
  serviceIconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardNombre: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  cardDesc: { fontSize: 13, color: Colors.textSecondary, lineHeight: 18 },
  cardPrecio: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.accent,
    marginLeft: 8,
  },

  chipsRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
  },
  chipText: { fontSize: 12, fontWeight: "600", color: Colors.accent },

  cardActions: { flexDirection: "row", gap: 10, marginTop: 14 },
  actionEdit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    gap: 6,
  },
  actionEditText: { fontSize: 13, fontWeight: "600", color: Colors.accent },
  actionDelete: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "rgba(255,59,48,0.08)",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.25)",
    gap: 6,
  },
  actionDeleteText: { fontSize: 13, fontWeight: "600", color: "#FF3B30" },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "90%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary },
  modalFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },

  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  inputRow: { flexDirection: "row", alignItems: "center" },
  inputPrefix: {
    backgroundColor: "rgba(212,175,55,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: "center",
  },
  inputPrefixText: { color: Colors.accent, fontWeight: "bold", fontSize: 16 },

  duracionGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  duracionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  duracionChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  duracionText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  duracionTextActive: { color: Colors.textPrimary },

  saveBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  saveBtnText: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },

  // Empty
  emptyState: { alignItems: "center", paddingTop: 60, paddingHorizontal: 30 },
  emptyIconBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  emptyDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },
  emptyBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.accent,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  emptyBtnText: { color: Colors.textPrimary, fontWeight: "700", fontSize: 15 },
});
