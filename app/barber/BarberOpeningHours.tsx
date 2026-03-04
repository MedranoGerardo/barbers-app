import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";
import { API_URL } from "../../constants/config";

// ─── INTERFACES ───────────────────────────────────────────────────────────────
interface HorarioDia {
  id?: number;
  dia_semana: number; // 0=Dom … 6=Sáb
  hora_inicio: string; // "HH:MM"
  hora_fin: string;
  activo: boolean;
}

interface DiaDescanso {
  id: number;
  fecha: string; // "YYYY-MM-DD"
  motivo: string | null;
}

interface Bloqueo {
  id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  motivo: string | null;
}

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const DIAS_FULL = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

const HORAS = Array.from({ length: 29 }, (_, i) => {
  const totalMin = 6 * 60 + i * 30; // desde 06:00 hasta 20:00
  const h = String(Math.floor(totalMin / 60)).padStart(2, "0");
  const m = String(totalMin % 60).padStart(2, "0");
  return `${h}:${m}`;
});

const DEFAULT_HORARIO: HorarioDia[] = DIAS.map((_, i) => ({
  dia_semana: i,
  hora_inicio: "08:00",
  hora_fin: "18:00",
  activo: i >= 1 && i <= 6, // Lun-Sáb activos por defecto
}));

const getToken = async () => await AsyncStorage.getItem("token");
const getUserId = async () => {
  const u = await AsyncStorage.getItem("user");
  return u ? JSON.parse(u).id : null;
};

const formatFecha = (iso: string) => {
  const [y, m, d] = iso.split("-");
  const meses = [
    "Ene",
    "Feb",
    "Mar",
    "Abr",
    "May",
    "Jun",
    "Jul",
    "Ago",
    "Sep",
    "Oct",
    "Nov",
    "Dic",
  ];
  return `${d} ${meses[parseInt(m, 10) - 1]} ${y}`;
};

const hoy = () => new Date().toISOString().split("T")[0];

// ─── PANTALLA PRINCIPAL ───────────────────────────────────────────────────────
export default function BarberOpeningHours() {
  const [activeTab, setActiveTab] = useState<
    "horario" | "descansos" | "bloqueos"
  >("horario");
  const [horario, setHorario] = useState<HorarioDia[]>(DEFAULT_HORARIO);
  const [descansos, setDescansos] = useState<DiaDescanso[]>([]);
  const [bloqueos, setBloqueos] = useState<Bloqueo[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingHorario, setSavingHorario] = useState(false);

  // Modales
  const [showDescansosModal, setShowDescansosModal] = useState(false);
  const [showBloqueoModal, setShowBloqueoModal] = useState(false);
  const [showHoraModal, setShowHoraModal] = useState<{
    dia: number;
    tipo: "inicio" | "fin";
  } | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const userId = await getUserId();
      if (!userId) return;

      const [hRes, dRes, bRes] = await Promise.all([
        fetch(`${API_URL}/api/horarios/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/horarios/${userId}/descansos?desde=${hoy()}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${API_URL}/api/horarios/${userId}/bloqueos`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const hData = await hRes.json();
      const dData = await dRes.json();
      const bData = await bRes.json();

      // Mezclar datos de la API con los defaults (por si algún día no está en BD)
      if (Array.isArray(hData) && hData.length > 0) {
        const merged = DEFAULT_HORARIO.map((def) => {
          const found = hData.find((h: any) => h.dia_semana === def.dia_semana);
          return found
            ? {
                ...def,
                ...found,
                activo: found.activo === 1 || found.activo === true,
              }
            : def;
        });
        setHorario(merged);
      }

      setDescansos(Array.isArray(dData) ? dData : []);
      setBloqueos(Array.isArray(bData) ? bData : []);
    } catch {
      Alert.alert("Error", "No se pudo cargar el horario");
    } finally {
      setLoading(false);
    }
  };

  // ── Guardar horario semanal ───────────────────────────────────────────────
  const guardarHorario = async () => {
    setSavingHorario(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/horarios`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ horarios: horario }),
      });
      const data = await res.json();
      if (res.ok)
        Alert.alert("✅ Guardado", "Tu horario se actualizó correctamente");
      else Alert.alert("Error", data.error || "No se pudo guardar");
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setSavingHorario(false);
    }
  };

  // ── Toggle día activo ─────────────────────────────────────────────────────
  const toggleDia = (idx: number) => {
    setHorario((prev) =>
      prev.map((h) => (h.dia_semana === idx ? { ...h, activo: !h.activo } : h)),
    );
  };

  // ── Cambiar hora ──────────────────────────────────────────────────────────
  const setHora = (dia: number, tipo: "inicio" | "fin", hora: string) => {
    setHorario((prev) =>
      prev.map((h) =>
        h.dia_semana === dia
          ? tipo === "inicio"
            ? { ...h, hora_inicio: hora }
            : { ...h, hora_fin: hora }
          : h,
      ),
    );
    setShowHoraModal(null);
  };

  // ── Eliminar descanso ─────────────────────────────────────────────────────
  const eliminarDescanso = async (id: number) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/horarios/descansos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDescansos((prev) => prev.filter((d) => d.id !== id));
    } catch {
      Alert.alert("Error", "No se pudo eliminar");
    }
  };

  // ── Eliminar bloqueo ──────────────────────────────────────────────────────
  const eliminarBloqueo = async (id: number) => {
    try {
      const token = await getToken();
      await fetch(`${API_URL}/api/horarios/bloqueos/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setBloqueos((prev) => prev.filter((b) => b.id !== id));
    } catch {
      Alert.alert("Error", "No se pudo eliminar");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Cargando horario...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Horario de Atención</Text>
        <Text style={styles.headerSub}>Configura tu disponibilidad</Text>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        {(
          [
            { key: "horario", label: "Semanal", icon: "calendar-outline" },
            { key: "descansos", label: "Asuetos", icon: "moon-outline" },
            { key: "bloqueos", label: "Bloqueos", icon: "ban-outline" },
          ] as const
        ).map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
            activeOpacity={0.8}
          >
            <Ionicons
              name={tab.icon}
              size={16}
              color={
                activeTab === tab.key ? Colors.accent : Colors.textSecondary
              }
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ── TAB HORARIO SEMANAL ──────────────────────────────────────────── */}
        {activeTab === "horario" && (
          <>
            <View style={styles.infoBox}>
              <Ionicons
                name="information-circle-outline"
                size={16}
                color={Colors.accent}
              />
              <Text style={styles.infoText}>
                Activa los días que atiendes y define tu horario. Los clientes
                solo podrán reservar en estos horarios.
              </Text>
            </View>

            {horario.map((dia) => (
              <DiaRow
                key={dia.dia_semana}
                dia={dia}
                onToggle={() => toggleDia(dia.dia_semana)}
                onPressHora={(tipo) =>
                  setShowHoraModal({ dia: dia.dia_semana, tipo })
                }
              />
            ))}

            <TouchableOpacity
              style={[styles.saveBtn, savingHorario && { opacity: 0.5 }]}
              onPress={guardarHorario}
              disabled={savingHorario}
            >
              {savingHorario ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.saveBtnText}>Guardar Horario</Text>
                </>
              )}
            </TouchableOpacity>
          </>
        )}

        {/* ── TAB DÍAS DE DESCANSO ─────────────────────────────────────────── */}
        {activeTab === "descansos" && (
          <>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setShowDescansosModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={Colors.accent} />
              <Text style={styles.addItemBtnText}>Agregar día de descanso</Text>
            </TouchableOpacity>

            {descansos.length === 0 ? (
              <EmptyTab
                icon="moon-outline"
                title="Sin días de descanso"
                desc="Agrega fechas específicas en las que no atenderás: feriados, vacaciones, etc."
              />
            ) : (
              descansos.map((d) => (
                <View key={d.id} style={styles.itemCard}>
                  <View style={styles.itemIconBox}>
                    <Ionicons name="moon" size={20} color={Colors.accent} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{formatFecha(d.fecha)}</Text>
                    {d.motivo ? (
                      <Text style={styles.itemSub}>{d.motivo}</Text>
                    ) : null}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() =>
                      Alert.alert("Eliminar", "¿Quitar este día de descanso?", [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarDescanso(d.id),
                        },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {/* ── TAB BLOQUEOS ─────────────────────────────────────────────────── */}
        {activeTab === "bloqueos" && (
          <>
            <TouchableOpacity
              style={styles.addItemBtn}
              onPress={() => setShowBloqueoModal(true)}
            >
              <Ionicons name="add-circle" size={20} color={Colors.accent} />
              <Text style={styles.addItemBtnText}>
                Agregar bloqueo de horario
              </Text>
            </TouchableOpacity>

            {bloqueos.length === 0 ? (
              <EmptyTab
                icon="ban-outline"
                title="Sin bloqueos"
                desc="Bloquea tramos de hora específicos: almuerzo, reuniones, compromisos personales."
              />
            ) : (
              bloqueos.map((b) => (
                <View key={b.id} style={styles.itemCard}>
                  <View
                    style={[
                      styles.itemIconBox,
                      { backgroundColor: "rgba(255,149,0,0.1)" },
                    ]}
                  >
                    <Ionicons name="ban" size={20} color="#FF9500" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.itemTitle}>{formatFecha(b.fecha)}</Text>
                    <Text style={styles.itemSub}>
                      {b.hora_inicio} – {b.hora_fin}
                      {b.motivo ? `  ·  ${b.motivo}` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() =>
                      Alert.alert("Eliminar", "¿Quitar este bloqueo?", [
                        { text: "Cancelar", style: "cancel" },
                        {
                          text: "Eliminar",
                          style: "destructive",
                          onPress: () => eliminarBloqueo(b.id),
                        },
                      ])
                    }
                  >
                    <Ionicons name="trash-outline" size={18} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* MODAL SELECTOR DE HORA */}
      {showHoraModal && (
        <HoraPickerModal
          visible={!!showHoraModal}
          titulo={
            showHoraModal.tipo === "inicio"
              ? "Hora de inicio"
              : "Hora de cierre"
          }
          valorActual={
            showHoraModal.tipo === "inicio"
              ? horario[showHoraModal.dia].hora_inicio
              : horario[showHoraModal.dia].hora_fin
          }
          onClose={() => setShowHoraModal(null)}
          onSelect={(hora) =>
            setHora(showHoraModal.dia, showHoraModal.tipo, hora)
          }
        />
      )}

      {/* MODAL AGREGAR DESCANSOS */}
      <AgregarDescansosModal
        visible={showDescansosModal}
        onClose={() => setShowDescansosModal(false)}
        onSuccess={() => {
          setShowDescansosModal(false);
          fetchAll();
        }}
      />

      {/* MODAL AGREGAR BLOQUEO */}
      <AgregarBloqueoModal
        visible={showBloqueoModal}
        onClose={() => setShowBloqueoModal(false)}
        onSuccess={() => {
          setShowBloqueoModal(false);
          fetchAll();
        }}
      />
    </View>
  );
}

// ─── FILA DE DÍA ─────────────────────────────────────────────────────────────
function DiaRow({
  dia,
  onToggle,
  onPressHora,
}: {
  dia: HorarioDia;
  onToggle: () => void;
  onPressHora: (tipo: "inicio" | "fin") => void;
}) {
  return (
    <View style={[styles.diaCard, !dia.activo && styles.diaCardInactivo]}>
      {/* Nombre + toggle */}
      <View style={styles.diaTop}>
        <View style={styles.diaBadge}>
          <Text style={styles.diaBadgeText}>{DIAS[dia.dia_semana]}</Text>
        </View>
        <Text style={styles.diaNombre}>{DIAS_FULL[dia.dia_semana]}</Text>
        <Switch
          value={dia.activo}
          onValueChange={onToggle}
          trackColor={{ false: "#3A3A3C", true: Colors.accent }}
          thumbColor="#FFFFFF"
        />
      </View>

      {/* Selector de horas — solo si está activo */}
      {dia.activo && (
        <View style={styles.diaHoras}>
          <TouchableOpacity
            style={styles.horaBtn}
            onPress={() => onPressHora("inicio")}
          >
            <Ionicons name="play-outline" size={14} color={Colors.accent} />
            <Text style={styles.horaBtnLabel}>Inicio</Text>
            <Text style={styles.horaBtnVal}>{dia.hora_inicio}</Text>
          </TouchableOpacity>

          <View style={styles.horaLinea} />

          <TouchableOpacity
            style={styles.horaBtn}
            onPress={() => onPressHora("fin")}
          >
            <Ionicons name="stop-outline" size={14} color={Colors.accent} />
            <Text style={styles.horaBtnLabel}>Cierre</Text>
            <Text style={styles.horaBtnVal}>{dia.hora_fin}</Text>
          </TouchableOpacity>

          <View style={styles.horaDuracion}>
            <Text style={styles.horaDuracionText}>
              {(() => {
                const [h1, m1] = dia.hora_inicio.split(":").map(Number);
                const [h2, m2] = dia.hora_fin.split(":").map(Number);
                const mins = h2 * 60 + m2 - (h1 * 60 + m1);
                return mins > 0
                  ? `${Math.floor(mins / 60)}h ${mins % 60 > 0 ? `${mins % 60}m` : ""}`.trim()
                  : "--";
              })()}
            </Text>
          </View>
        </View>
      )}

      {!dia.activo && (
        <View style={styles.diaInactivoLabel}>
          <Text style={styles.diaInactivoText}>Cerrado este día</Text>
        </View>
      )}
    </View>
  );
}

// ─── MODAL SELECTOR DE HORA ───────────────────────────────────────────────────
function HoraPickerModal({
  visible,
  titulo,
  valorActual,
  onClose,
  onSelect,
}: {
  visible: boolean;
  titulo: string;
  valorActual: string;
  onClose: () => void;
  onSelect: (h: string) => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalSheet, { maxHeight: "60%" }]}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{titulo}</Text>
            <View style={{ width: 26 }} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {HORAS.map((h) => (
              <TouchableOpacity
                key={h}
                style={[
                  styles.horaOption,
                  h === valorActual && styles.horaOptionActive,
                ]}
                onPress={() => onSelect(h)}
              >
                <Text
                  style={[
                    styles.horaOptionText,
                    h === valorActual && styles.horaOptionTextActive,
                  ]}
                >
                  {h}
                </Text>
                {h === valorActual && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={Colors.textPrimary}
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

// ─── MODAL AGREGAR DESCANSOS ──────────────────────────────────────────────────
function AgregarDescansosModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fecha, setFecha] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (visible) {
      setFecha("");
      setMotivo("");
    }
  }, [visible]);

  const handleGuardar = async () => {
    if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Error", "Ingresa la fecha en formato YYYY-MM-DD");
      return;
    }
    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/horarios/descansos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fechas: [fecha],
          motivo: motivo.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Guardado", "Día de descanso registrado");
        onSuccess();
      } else Alert.alert("Error", data.error || "No se pudo guardar");
    } catch {
      Alert.alert("Error", "No se pudo conectar");
    } finally {
      setSaving(false);
    }
  };

  // Preview de fecha en español
  const previewFecha = () => {
    if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) return null;
    try {
      return formatFecha(fecha);
    } catch {
      return null;
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
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Día de Descanso</Text>
            <View style={{ width: 26 }} />
          </View>

          <Text style={styles.label}>Fecha (YYYY-MM-DD) *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: 2025-12-25"
            placeholderTextColor={Colors.textSecondary}
            value={fecha}
            onChangeText={setFecha}
            keyboardType="numeric"
            maxLength={10}
          />
          {previewFecha() && (
            <View style={styles.previewFecha}>
              <Ionicons name="calendar" size={14} color={Colors.accent} />
              <Text style={styles.previewFechaText}>{previewFecha()}</Text>
            </View>
          )}

          <Text style={styles.label}>Motivo (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej: Navidad, Vacaciones, Cita médica..."
            placeholderTextColor={Colors.textSecondary}
            value={motivo}
            onChangeText={setMotivo}
          />

          <View style={[styles.modalFooter, { marginTop: 24 }]}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="moon" size={18} color={Colors.textPrimary} />
                  <Text style={styles.saveBtnText}>Agregar descanso</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── MODAL AGREGAR BLOQUEO ────────────────────────────────────────────────────
function AgregarBloqueoModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [fecha, setFecha] = useState("");
  const [horaInicio, setHoraInicio] = useState("");
  const [horaFin, setHoraFin] = useState("");
  const [motivo, setMotivo] = useState("");
  const [saving, setSaving] = useState(false);
  const [showPickerInicio, setShowPickerInicio] = useState(false);
  const [showPickerFin, setShowPickerFin] = useState(false);

  useEffect(() => {
    if (visible) {
      setFecha("");
      setHoraInicio("");
      setHoraFin("");
      setMotivo("");
    }
  }, [visible]);

  const handleGuardar = async () => {
    if (!fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
      Alert.alert("Error", "Fecha inválida (YYYY-MM-DD)");
      return;
    }
    if (!horaInicio || !horaFin) {
      Alert.alert("Error", "Selecciona hora de inicio y fin");
      return;
    }
    if (horaFin <= horaInicio) {
      Alert.alert("Error", "La hora de fin debe ser mayor que la de inicio");
      return;
    }

    setSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/horarios/bloqueos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fecha,
          hora_inicio: horaInicio,
          hora_fin: horaFin,
          motivo: motivo.trim() || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("✅ Guardado", "Bloqueo registrado");
        onSuccess();
      } else Alert.alert("Error", data.error || "No se pudo guardar");
    } catch {
      Alert.alert("Error", "No se pudo conectar");
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
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={26} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Bloquear Horario</Text>
            <View style={{ width: 26 }} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={styles.label}>Fecha (YYYY-MM-DD) *</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: 2025-06-10"
              placeholderTextColor={Colors.textSecondary}
              value={fecha}
              onChangeText={setFecha}
              keyboardType="numeric"
              maxLength={10}
            />

            <Text style={styles.label}>Hora de inicio *</Text>
            <TouchableOpacity
              style={styles.horaSelector}
              onPress={() => setShowPickerInicio(true)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.accent} />
              <Text
                style={[
                  styles.horaSelectorText,
                  !horaInicio && { color: Colors.textSecondary },
                ]}
              >
                {horaInicio || "Seleccionar hora"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.label}>Hora de fin *</Text>
            <TouchableOpacity
              style={styles.horaSelector}
              onPress={() => setShowPickerFin(true)}
            >
              <Ionicons name="time-outline" size={18} color={Colors.accent} />
              <Text
                style={[
                  styles.horaSelectorText,
                  !horaFin && { color: Colors.textSecondary },
                ]}
              >
                {horaFin || "Seleccionar hora"}
              </Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={Colors.textSecondary}
              />
            </TouchableOpacity>

            <Text style={styles.label}>Motivo (opcional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Almuerzo, Reunión..."
              placeholderTextColor={Colors.textSecondary}
              value={motivo}
              onChangeText={setMotivo}
            />
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleGuardar}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons name="ban" size={18} color={Colors.textPrimary} />
                  <Text style={styles.saveBtnText}>Agregar bloqueo</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Pickers de hora anidados */}
      <HoraPickerModal
        visible={showPickerInicio}
        titulo="Hora de inicio"
        valorActual={horaInicio}
        onClose={() => setShowPickerInicio(false)}
        onSelect={(h) => {
          setHoraInicio(h);
          setShowPickerInicio(false);
        }}
      />
      <HoraPickerModal
        visible={showPickerFin}
        titulo="Hora de fin"
        valorActual={horaFin}
        onClose={() => setShowPickerFin(false)}
        onSelect={(h) => {
          setHoraFin(h);
          setShowPickerFin(false);
        }}
      />
    </Modal>
  );
}

// ─── EMPTY TAB ────────────────────────────────────────────────────────────────
function EmptyTab({
  icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <View style={styles.emptyTab}>
      <View style={styles.emptyTabIcon}>
        <Ionicons name={icon} size={44} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTabTitle}>{title}</Text>
      <Text style={styles.emptyTabDesc}>{desc}</Text>
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

  header: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10 },
  headerTitle: { fontSize: 26, fontWeight: "bold", color: Colors.textPrimary },
  headerSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 3 },

  // Tabs
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 6,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  tabActive: {
    backgroundColor: "rgba(212,175,55,0.12)",
    borderColor: "rgba(212,175,55,0.35)",
  },
  tabText: { fontSize: 13, fontWeight: "600", color: Colors.textSecondary },
  tabTextActive: { color: Colors.accent },

  scrollContent: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20 },

  // Info box
  infoBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(212,175,55,0.08)",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },

  // Día card
  diaCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  diaCardInactivo: { opacity: 0.55 },
  diaTop: { flexDirection: "row", alignItems: "center" },
  diaBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  diaBadgeText: { fontSize: 13, fontWeight: "700", color: Colors.accent },
  diaNombre: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  diaHoras: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 14,
    gap: 8,
  },
  horaBtn: {
    flex: 1,
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
    gap: 3,
  },
  horaBtnLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "600",
  },
  horaBtnVal: { fontSize: 18, fontWeight: "bold", color: Colors.accent },
  horaLinea: {
    width: 16,
    height: 2,
    backgroundColor: "rgba(212,175,55,0.4)",
    borderRadius: 2,
  },
  horaDuracion: {
    backgroundColor: "rgba(212,175,55,0.1)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  horaDuracionText: { fontSize: 12, fontWeight: "700", color: Colors.accent },

  diaInactivoLabel: { marginTop: 10 },
  diaInactivoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic",
  },

  // Save btn
  saveBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  saveBtnText: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },

  // Add item btn
  addItemBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212,175,55,0.08)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  addItemBtnText: { fontSize: 15, fontWeight: "600", color: Colors.accent },

  // Item card (descansos y bloqueos)
  itemCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
    gap: 12,
  },
  itemIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  itemTitle: { fontSize: 15, fontWeight: "600", color: Colors.textPrimary },
  itemSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  deleteBtn: { padding: 8 },

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
    maxHeight: "85%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
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

  // Preview fecha
  previewFecha: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 4,
  },
  previewFechaText: { fontSize: 13, color: Colors.accent, fontWeight: "600" },

  // Hora selector
  horaSelector: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  horaSelectorText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textPrimary,
  },

  // Hora picker option
  horaOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.04)",
  },
  horaOptionActive: { backgroundColor: "rgba(212,175,55,0.1)" },
  horaOptionText: { fontSize: 16, color: Colors.textPrimary },
  horaOptionTextActive: { color: Colors.accent, fontWeight: "bold" },

  // Empty tab
  emptyTab: {
    alignItems: "center",
    paddingTop: 50,
    paddingHorizontal: 30,
    gap: 10,
  },
  emptyTabIcon: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyTabTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  emptyTabDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
