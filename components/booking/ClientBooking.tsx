import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
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
interface Appointment {
  id: string;
  barberName: string;
  barberAvatar: string;
  barbershop: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: "upcoming" | "completed" | "cancelled";
  barbero_id?: number;
}

interface Barber {
  id: number;
  nombre: string;
  apellido: string;
  foto_perfil: string | null;
  nombre_barberia: string | null;
  rating_promedio: number | null;
  total_cortes: number;
}

interface Servicio {
  id: number;
  nombre: string;
  precio: number;
  duracion_minutos: number;
}

interface Ubicacion {
  direccion: string;
  ciudad: string;
  departamento: string | null;
  referencia: string | null;
  latitud: number | null;
  longitud: number | null;
  maps_url: string | null;
}

interface ClientBookingProps {
  appointments: Appointment[];
  onRefresh?: () => void;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const getNext30Days = () => {
  const days = [];
  const today = new Date();
  const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const MONTH_NAMES = [
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
  for (let i = 1; i <= 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push({
      value: d.toISOString().split("T")[0],
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      month: MONTH_NAMES[d.getMonth()],
    });
  }
  return days;
};

const getToken = async () => await AsyncStorage.getItem("token");

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function ClientBooking({
  appointments,
  onRefresh,
}: ClientBookingProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );
  const [showNewBooking, setShowNewBooking] = useState(false);
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);

  const upcomingAppointments = appointments.filter(
    (a) => a.status === "upcoming",
  );
  const historyAppointments = appointments.filter(
    (a) => a.status === "completed" || a.status === "cancelled",
  );

  const handleCancel = (id: string) => {
    Alert.alert(
      "Cancelar Cita",
      "¿Estás seguro de que deseas cancelar esta cita?",
      [
        { text: "No", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await getToken();
              const res = await fetch(`${API_URL}/api/citas/${id}/status`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ status: "cancelled" }),
              });
              if (res.ok) {
                Alert.alert("Cita cancelada");
                onRefresh?.();
              } else Alert.alert("Error", "No se pudo cancelar la cita");
            } catch {
              Alert.alert("Error", "No se pudo conectar con el servidor");
            }
          },
        },
      ],
    );
  };

  const handleRate = async (
    citaId: string,
    puntuacion: number,
    comentario: string,
  ) => {
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/calificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cita_id: citaId, puntuacion, comentario }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert("⭐ ¡Gracias por tu calificación!");
        onRefresh?.();
      } else
        Alert.alert("Error", data.error || "No se pudo enviar la calificación");
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Citas</Text>
        <TouchableOpacity
          style={styles.newBookingBtn}
          onPress={() => setShowNewBooking(true)}
        >
          <Ionicons name="add-circle" size={24} color={Colors.accent} />
          <Text style={styles.newBookingText}>Nueva Cita</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        {(["upcoming", "history"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === tab && styles.activeTabText,
              ]}
            >
              {tab === "upcoming"
                ? `Próximas (${upcomingAppointments.length})`
                : `Historial (${historyAppointments.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* LISTA */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "upcoming" ? (
          upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((apt) => (
              <AppointmentCard
                key={apt.id}
                appointment={apt}
                isUpcoming={true}
                onCancel={handleCancel}
                onRate={handleRate}
                onReschedule={() => setRescheduleApt(apt)}
              />
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No tienes citas próximas"
              description="Toca 'Nueva Cita' para reservar con tu barbero favorito"
            />
          )
        ) : historyAppointments.length > 0 ? (
          historyAppointments.map((apt) => (
            <AppointmentCard
              key={apt.id}
              appointment={apt}
              isUpcoming={false}
              onCancel={handleCancel}
              onRate={handleRate}
              onReschedule={() => {}}
            />
          ))
        ) : (
          <EmptyState
            icon="time-outline"
            title="Sin historial de citas"
            description="Aquí aparecerán tus citas anteriores"
          />
        )}
      </ScrollView>

      {/* MODALES */}
      <NewBookingModal
        visible={showNewBooking}
        onClose={() => setShowNewBooking(false)}
        onSuccess={() => {
          setShowNewBooking(false);
          onRefresh?.();
        }}
      />
      <RescheduleModal
        appointment={rescheduleApt}
        onClose={() => setRescheduleApt(null)}
        onSuccess={() => {
          setRescheduleApt(null);
          onRefresh?.();
        }}
      />
    </View>
  );
}

// ─── MODAL NUEVA CITA — 3 PASOS ───────────────────────────────────────────────
function NewBookingModal({
  visible,
  onClose,
  onSuccess,
}: {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [barberos, setBarberos] = useState<Barber[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [slots, setSlots] = useState<string[]>([]); // ← horas reales de la API
  const [loadingBarberos, setLoadingBarberos] = useState(false);
  const [loadingServicios, setLoadingServicios] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false); // ← loading de disponibilidad
  const [submitting, setSubmitting] = useState(false);

  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(
    null,
  );
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [nota, setNota] = useState("");

  const days = getNext30Days();

  useEffect(() => {
    if (visible) {
      setStep(1);
      setSelectedBarber(null);
      setSelectedServicio(null);
      setSelectedDate("");
      setSelectedHour("");
      setSlots([]);
      setNota("");
      fetchBarberos();
    }
  }, [visible]);

  useEffect(() => {
    if (selectedBarber) fetchServicios(selectedBarber.id);
  }, [selectedBarber]);

  // ── Cuando cambia fecha O servicio, recalcular disponibilidad ─────────────
  useEffect(() => {
    if (selectedBarber && selectedDate && selectedServicio) {
      fetchDisponibilidad(
        selectedBarber.id,
        selectedDate,
        selectedServicio.duracion_minutos,
      );
    } else {
      setSlots([]);
      setSelectedHour("");
    }
  }, [selectedDate, selectedServicio, selectedBarber]);

  const fetchBarberos = async () => {
    setLoadingBarberos(true);
    try {
      const token = await getToken();
      // ✅ BUG FIX: URL corregida — era /usuarios/barberos (faltaba /api/)
      const res = await fetch(`${API_URL}/api/usuarios/barberos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setBarberos(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los barberos");
    } finally {
      setLoadingBarberos(false);
    }
  };

  const fetchServicios = async (barberoId: number) => {
    setLoadingServicios(true);
    setServicios([]);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/servicios/${barberoId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setServicios(Array.isArray(data) ? data : []);
    } catch {
      Alert.alert("Error", "No se pudieron cargar los servicios");
    } finally {
      setLoadingServicios(false);
    }
  };

  // ── NUEVO: disponibilidad real desde la API ───────────────────────────────
  const fetchDisponibilidad = async (
    barberoId: number,
    fecha: string,
    duracion: number,
  ) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedHour("");
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/horarios/${barberoId}/disponibilidad?fecha=${fecha}&duracion=${duracion}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok && data.disponible) {
        setSlots(data.slots);
      } else {
        // disponible: false → día de descanso o no trabaja ese día
        setSlots([]);
        Alert.alert(
          "Sin disponibilidad",
          data.motivo || "El barbero no tiene horario disponible este día",
        );
      }
    } catch {
      Alert.alert("Error", "No se pudo verificar la disponibilidad");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleConfirmar = async () => {
    if (!selectedBarber || !selectedServicio || !selectedDate || !selectedHour)
      return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_URL}/api/citas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          barbero_id: selectedBarber.id,
          servicio_id: selectedServicio.id,
          fecha: selectedDate,
          hora: selectedHour,
          nota_cliente: nota || null,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "✅ ¡Cita reservada!",
          `${selectedServicio.nombre} con ${selectedBarber.nombre}\n${selectedDate} a las ${selectedHour}`,
        );
        onSuccess();
      } else {
        Alert.alert("Error", data.error || "No se pudo crear la cita");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Elige tu barbero",
    2: "Elige el servicio",
    3: "Fecha y hora",
  };

  const canContinue =
    (step === 1 && !!selectedBarber) ||
    (step === 2 && !!selectedServicio) ||
    (step === 3 && !!selectedDate && !!selectedHour);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          {/* CABECERA */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={step > 1 ? () => setStep((step - 1) as any) : onClose}
            >
              <Ionicons
                name={step > 1 ? "arrow-back" : "close"}
                size={28}
                color={Colors.textPrimary}
              />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{stepTitles[step]}</Text>
            <View style={{ width: 28 }} />
          </View>

          {/* INDICADOR DE PASOS */}
          <View style={styles.stepsRow}>
            {[1, 2, 3].map((s) => (
              <View
                key={s}
                style={{ flexDirection: "row", alignItems: "center" }}
              >
                <View
                  style={[styles.stepDot, step >= s && styles.stepDotActive]}
                >
                  {step > s ? (
                    <Ionicons
                      name="checkmark"
                      size={13}
                      color={Colors.textPrimary}
                    />
                  ) : (
                    <Text
                      style={[
                        styles.stepDotText,
                        step >= s && { color: Colors.textPrimary },
                      ]}
                    >
                      {s}
                    </Text>
                  )}
                </View>
                {s < 3 && (
                  <View
                    style={[styles.stepLine, step > s && styles.stepLineActive]}
                  />
                )}
              </View>
            ))}
          </View>

          {/* ── PASO 1: BARBEROS ─────────────────────────────────────────────── */}
          {step === 1 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {loadingBarberos ? (
                <ActivityIndicator
                  color={Colors.accent}
                  style={{ marginTop: 40 }}
                />
              ) : barberos.length === 0 ? (
                <EmptyState
                  icon="person-outline"
                  title="Sin barberos disponibles"
                  description="No hay barberos activos por el momento"
                />
              ) : (
                barberos.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[
                      styles.selectCard,
                      selectedBarber?.id === b.id && styles.selectCardActive,
                    ]}
                    onPress={() => {
                      setSelectedBarber(b);
                      setSelectedServicio(null);
                      setSelectedDate("");
                      setSelectedHour("");
                      setSlots([]);
                    }}
                    activeOpacity={0.8}
                  >
                    <Image
                      source={{
                        uri:
                          b.foto_perfil ||
                          `https://ui-avatars.com/api/?name=${b.nombre}+${b.apellido}&background=D4AF37&color=1A1A1A&size=100`,
                      }}
                      style={styles.selectAvatar}
                    />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.selectName}>
                        {b.nombre} {b.apellido}
                      </Text>
                      {b.nombre_barberia ? (
                        <View style={styles.selectRow}>
                          <Ionicons
                            name="storefront-outline"
                            size={13}
                            color={Colors.textSecondary}
                          />
                          <Text style={styles.selectSub}>
                            {b.nombre_barberia}
                          </Text>
                        </View>
                      ) : null}
                      <View style={styles.selectRow}>
                        <Ionicons name="star" size={13} color="#FFD700" />
                        <Text style={styles.selectSub}>
                          {b.rating_promedio
                            ? Number(b.rating_promedio).toFixed(1)
                            : "Nuevo"}
                          {"  ·  "}
                          {b.total_cortes} cortes
                        </Text>
                      </View>
                    </View>
                    {selectedBarber?.id === b.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={Colors.accent}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {/* ── PASO 2: SERVICIOS ────────────────────────────────────────────── */}
          {step === 2 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {loadingServicios ? (
                <ActivityIndicator
                  color={Colors.accent}
                  style={{ marginTop: 40 }}
                />
              ) : servicios.length === 0 ? (
                <EmptyState
                  icon="cut-outline"
                  title="Sin servicios"
                  description="Este barbero aún no registró servicios"
                />
              ) : (
                servicios.map((s) => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.selectCard,
                      selectedServicio?.id === s.id && styles.selectCardActive,
                    ]}
                    onPress={() => {
                      setSelectedServicio(s);
                      setSelectedHour("");
                      setSlots([]);
                    }}
                    activeOpacity={0.8}
                  >
                    <View style={styles.serviceIconBox}>
                      <Ionicons name="cut" size={24} color={Colors.accent} />
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.selectName}>{s.nombre}</Text>
                      <View style={styles.selectRow}>
                        <Ionicons
                          name="time-outline"
                          size={13}
                          color={Colors.textSecondary}
                        />
                        <Text style={styles.selectSub}>
                          {s.duracion_minutos} min
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.servicePrice}>
                      ${Number(s.precio).toFixed(2)}
                    </Text>
                    {selectedServicio?.id === s.id && (
                      <Ionicons
                        name="checkmark-circle"
                        size={26}
                        color={Colors.accent}
                        style={{ marginLeft: 8 }}
                      />
                    )}
                  </TouchableOpacity>
                ))
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {/* ── PASO 3: FECHA Y HORA ─────────────────────────────────────────── */}
          {step === 3 && (
            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
            >
              {/* SELECTOR DE FECHA */}
              <Text style={styles.sectionLabel}>Selecciona una fecha</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 20 }}
              >
                <View
                  style={{ flexDirection: "row", gap: 8, paddingRight: 20 }}
                >
                  {days.map((day) => (
                    <TouchableOpacity
                      key={day.value}
                      style={[
                        styles.dayCard,
                        selectedDate === day.value && styles.dayCardActive,
                      ]}
                      onPress={() => setSelectedDate(day.value)}
                    >
                      <Text
                        style={[
                          styles.dayName,
                          selectedDate === day.value && styles.dayTextActive,
                        ]}
                      >
                        {day.dayName}
                      </Text>
                      <Text
                        style={[
                          styles.dayNum,
                          selectedDate === day.value && styles.dayTextActive,
                        ]}
                      >
                        {day.dayNum}
                      </Text>
                      <Text
                        style={[
                          styles.dayMonth,
                          selectedDate === day.value && styles.dayTextActive,
                        ]}
                      >
                        {day.month}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>

              {/* SELECTOR DE HORA — ahora con slots reales ─────────────────── */}
              <Text style={styles.sectionLabel}>
                Selecciona una hora{" "}
                {selectedDate && (
                  <Text style={styles.sectionLabelSub}>
                    {loadingSlots
                      ? "— cargando..."
                      : `— ${slots.length} disponibles`}
                  </Text>
                )}
              </Text>

              {!selectedDate ? (
                /* Todavía no eligió fecha */
                <View style={styles.noDateHint}>
                  <Ionicons
                    name="calendar-outline"
                    size={22}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.noDateHintText}>
                    Elige primero una fecha para ver los horarios disponibles
                  </Text>
                </View>
              ) : loadingSlots ? (
                <ActivityIndicator
                  color={Colors.accent}
                  style={{ marginVertical: 24 }}
                />
              ) : slots.length === 0 ? (
                /* Sin slots ese día */
                <View style={styles.noSlotsBox}>
                  <Ionicons
                    name="moon-outline"
                    size={32}
                    color={Colors.textSecondary}
                  />
                  <Text style={styles.noSlotsTitle}>
                    Sin horarios disponibles
                  </Text>
                  <Text style={styles.noSlotsDesc}>
                    El barbero no tiene horas libres este día. Prueba con otra
                    fecha.
                  </Text>
                </View>
              ) : (
                /* Grid de slots reales */
                <View style={styles.hoursGrid}>
                  {slots.map((h) => (
                    <TouchableOpacity
                      key={h}
                      style={[
                        styles.hourChip,
                        selectedHour === h && styles.hourChipActive,
                      ]}
                      onPress={() => setSelectedHour(h)}
                    >
                      <Text
                        style={[
                          styles.hourText,
                          selectedHour === h && styles.hourTextActive,
                        ]}
                      >
                        {h}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* NOTA */}
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>
                Nota para el barbero (opcional)
              </Text>
              <TextInput
                style={styles.notaInput}
                placeholder="Ej: quiero el fade bien bajo..."
                placeholderTextColor={Colors.textSecondary}
                value={nota}
                onChangeText={setNota}
                multiline
                numberOfLines={2}
              />

              {/* RESUMEN */}
              {selectedDate && selectedHour && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryTitle}>📋 Resumen de tu cita</Text>
                  {[
                    {
                      icon: "person-outline",
                      text: `${selectedBarber?.nombre} ${selectedBarber?.apellido}`,
                    },
                    {
                      icon: "storefront-outline",
                      text: selectedBarber?.nombre_barberia || "Barbería",
                    },
                    {
                      icon: "cut-outline",
                      text: `${selectedServicio?.nombre}`,
                    },
                    {
                      icon: "cash-outline",
                      text: `$${Number(selectedServicio?.precio).toFixed(2)}`,
                    },
                    { icon: "calendar-outline", text: selectedDate },
                    { icon: "time-outline", text: selectedHour },
                  ].map((item, i) => (
                    <View key={i} style={styles.summaryRow}>
                      <Ionicons
                        name={item.icon as any}
                        size={16}
                        color={Colors.accent}
                      />
                      <Text style={styles.summaryText}>{item.text}</Text>
                    </View>
                  ))}
                </View>
              )}
              <View style={{ height: 20 }} />
            </ScrollView>
          )}

          {/* BOTÓN CONTINUAR / CONFIRMAR */}
          <View style={styles.modalFooter}>
            {step < 3 ? (
              <TouchableOpacity
                style={[
                  styles.continueBtn,
                  !canContinue && styles.continueBtnDisabled,
                ]}
                disabled={!canContinue}
                onPress={() => setStep((step + 1) as any)}
              >
                <Text style={styles.continueBtnText}>Continuar</Text>
                <Ionicons
                  name="arrow-forward"
                  size={18}
                  color={Colors.textPrimary}
                />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[
                  styles.continueBtn,
                  (!canContinue || submitting) && styles.continueBtnDisabled,
                ]}
                disabled={!canContinue || submitting}
                onPress={handleConfirmar}
              >
                {submitting ? (
                  <ActivityIndicator color={Colors.textPrimary} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-circle"
                      size={18}
                      color={Colors.textPrimary}
                    />
                    <Text style={styles.continueBtnText}>Confirmar Cita</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── MODAL REPROGRAMAR ────────────────────────────────────────────────────────
function RescheduleModal({
  appointment,
  onClose,
  onSuccess,
}: {
  appointment: Appointment | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedHour, setSelectedHour] = useState("");
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const days = getNext30Days();

  useEffect(() => {
    if (appointment) {
      setSelectedDate("");
      setSelectedHour("");
      setSlots([]);
    }
  }, [appointment]);

  // Cargar disponibilidad cuando cambia la fecha (usa duracion 30 min por defecto
  // ya que en reagendar no tenemos el servicio; puedes pasarlo si lo tienes disponible)
  useEffect(() => {
    if (appointment?.barbero_id && selectedDate) {
      fetchDisponibilidad(appointment.barbero_id, selectedDate);
    }
  }, [selectedDate]);

  const fetchDisponibilidad = async (barberoId: number, fecha: string) => {
    setLoadingSlots(true);
    setSlots([]);
    setSelectedHour("");
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/horarios/${barberoId}/disponibilidad?fecha=${fecha}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = await res.json();
      if (res.ok && data.disponible) {
        setSlots(data.slots);
      } else {
        setSlots([]);
        Alert.alert(
          "Sin disponibilidad",
          data.motivo || "No hay horarios disponibles ese día",
        );
      }
    } catch {
      Alert.alert("Error", "No se pudo verificar la disponibilidad");
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedDate || !selectedHour) {
      Alert.alert("Error", "Selecciona fecha y hora");
      return;
    }
    setSubmitting(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/citas/${appointment!.id}/reagendar`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fecha: selectedDate, hora: selectedHour }),
        },
      );
      const data = await res.json();
      if (res.ok) {
        Alert.alert(
          "✅ Cita reprogramada",
          `Nueva fecha: ${selectedDate} a las ${selectedHour}`,
        );
        onSuccess();
      } else {
        Alert.alert("Error", data.error || "No se pudo reprogramar");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={!!appointment}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalSheet}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Reprogramar Cita</Text>
            <View style={{ width: 28 }} />
          </View>

          {appointment && (
            <View style={styles.rescheduleInfo}>
              <Ionicons
                name="information-circle-outline"
                size={18}
                color={Colors.accent}
              />
              <Text style={styles.rescheduleInfoText}>
                {appointment.service} · {appointment.barberName}
              </Text>
            </View>
          )}

          <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
            <Text style={styles.sectionLabel}>Nueva fecha</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginBottom: 20 }}
            >
              <View style={{ flexDirection: "row", gap: 8, paddingRight: 20 }}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day.value}
                    style={[
                      styles.dayCard,
                      selectedDate === day.value && styles.dayCardActive,
                    ]}
                    onPress={() => setSelectedDate(day.value)}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        selectedDate === day.value && styles.dayTextActive,
                      ]}
                    >
                      {day.dayName}
                    </Text>
                    <Text
                      style={[
                        styles.dayNum,
                        selectedDate === day.value && styles.dayTextActive,
                      ]}
                    >
                      {day.dayNum}
                    </Text>
                    <Text
                      style={[
                        styles.dayMonth,
                        selectedDate === day.value && styles.dayTextActive,
                      ]}
                    >
                      {day.month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text style={styles.sectionLabel}>
              Nueva hora{" "}
              {selectedDate && (
                <Text style={styles.sectionLabelSub}>
                  {loadingSlots
                    ? "— cargando..."
                    : `— ${slots.length} disponibles`}
                </Text>
              )}
            </Text>

            {!selectedDate ? (
              <View style={styles.noDateHint}>
                <Ionicons
                  name="calendar-outline"
                  size={22}
                  color={Colors.textSecondary}
                />
                <Text style={styles.noDateHintText}>
                  Elige primero una fecha
                </Text>
              </View>
            ) : loadingSlots ? (
              <ActivityIndicator
                color={Colors.accent}
                style={{ marginVertical: 24 }}
              />
            ) : slots.length === 0 ? (
              <View style={styles.noSlotsBox}>
                <Ionicons
                  name="moon-outline"
                  size={32}
                  color={Colors.textSecondary}
                />
                <Text style={styles.noSlotsTitle}>
                  Sin horarios disponibles
                </Text>
                <Text style={styles.noSlotsDesc}>Prueba con otra fecha.</Text>
              </View>
            ) : (
              <View style={styles.hoursGrid}>
                {slots.map((h) => (
                  <TouchableOpacity
                    key={h}
                    style={[
                      styles.hourChip,
                      selectedHour === h && styles.hourChipActive,
                    ]}
                    onPress={() => setSelectedHour(h)}
                  >
                    <Text
                      style={[
                        styles.hourText,
                        selectedHour === h && styles.hourTextActive,
                      ]}
                    >
                      {h}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            <View style={{ height: 20 }} />
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity
              style={[
                styles.continueBtn,
                (!selectedDate || !selectedHour || submitting) &&
                  styles.continueBtnDisabled,
              ]}
              disabled={!selectedDate || !selectedHour || submitting}
              onPress={handleSubmit}
            >
              {submitting ? (
                <ActivityIndicator color={Colors.textPrimary} />
              ) : (
                <>
                  <Ionicons
                    name="calendar"
                    size={18}
                    color={Colors.textPrimary}
                  />
                  <Text style={styles.continueBtnText}>Confirmar Cambio</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── CARD DE CITA — con ubicación ────────────────────────────────────────────
function AppointmentCard({
  appointment,
  isUpcoming,
  onCancel,
  onRate,
  onReschedule,
}: any) {
  const [showRateModal, setShowRateModal] = useState(false);
  const [ubicacion, setUbicacion] = useState<Ubicacion | null>(null);
  const [showUbicacion, setShowUbicacion] = useState(false);
  const [loadingUbicacion, setLoadingUbicacion] = useState(false);

  const fetchUbicacion = async () => {
    if (!appointment.barbero_id) return;
    if (ubicacion) {
      setShowUbicacion(true);
      return;
    } // ya la tenemos cacheada
    setLoadingUbicacion(true);
    try {
      const token = await getToken();
      const res = await fetch(
        `${API_URL}/api/ubicacion/${appointment.barbero_id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (res.ok) {
        setUbicacion(data);
        setShowUbicacion(true);
      } else
        Alert.alert(
          "Sin ubicación",
          "Este barbero no tiene ubicación registrada",
        );
    } catch {
      Alert.alert("Error", "No se pudo obtener la ubicación");
    } finally {
      setLoadingUbicacion(false);
    }
  };

  const abrirMaps = () => {
    if (!ubicacion) return;
    const url = ubicacion.maps_url
      ? ubicacion.maps_url
      : ubicacion.latitud && ubicacion.longitud
        ? `https://maps.google.com/?q=${ubicacion.latitud},${ubicacion.longitud}`
        : `https://maps.google.com/?q=${encodeURIComponent(ubicacion.direccion + ", " + ubicacion.ciudad)}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.barberInfo}>
          <Image
            source={{ uri: appointment.barberAvatar }}
            style={styles.barberAvatar}
          />
          <View style={styles.barberDetails}>
            <Text style={styles.barberName}>{appointment.barberName}</Text>
            <View style={styles.barbershopRow}>
              <Ionicons
                name="storefront-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.barbershopName}>
                {appointment.barbershop}
              </Text>
            </View>
          </View>
        </View>

        {appointment.status === "upcoming" && (
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: "rgba(212,175,55,0.15)" },
            ]}
          >
            <Ionicons name="time-outline" size={15} color={Colors.accent} />
            <Text style={[styles.statusText, { color: Colors.accent }]}>
              Próxima
            </Text>
          </View>
        )}
        {appointment.status === "completed" && (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Ionicons name="checkmark-circle" size={15} color="#34C759" />
            <Text style={[styles.statusText, { color: "#34C759" }]}>
              Completada
            </Text>
          </View>
        )}
        {appointment.status === "cancelled" && (
          <View style={[styles.statusBadge, styles.cancelledBadge]}>
            <Ionicons name="close-circle" size={15} color="#FF3B30" />
            <Text style={[styles.statusText, { color: "#FF3B30" }]}>
              Cancelada
            </Text>
          </View>
        )}
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        {[
          { icon: "cut-outline", text: appointment.service },
          { icon: "calendar-outline", text: appointment.date },
          { icon: "time-outline", text: appointment.time },
          { icon: "cash-outline", text: `$${appointment.price}` },
        ].map((item, i) => (
          <View key={i} style={styles.detailRow}>
            <Ionicons name={item.icon as any} size={18} color={Colors.accent} />
            <Text style={styles.detailText}>{item.text}</Text>
          </View>
        ))}
      </View>

      {/* ── BOTÓN VER UBICACIÓN ──────────────────────────────────────────────── */}
      <TouchableOpacity
        style={styles.ubicacionBtn}
        onPress={fetchUbicacion}
        disabled={loadingUbicacion}
      >
        {loadingUbicacion ? (
          <ActivityIndicator size="small" color={Colors.accent} />
        ) : (
          <>
            <Ionicons name="location-outline" size={16} color={Colors.accent} />
            <Text style={styles.ubicacionBtnText}>
              Ver ubicación de la barbería
            </Text>
            <Ionicons
              name={showUbicacion ? "chevron-up" : "chevron-down"}
              size={16}
              color={Colors.accent}
            />
          </>
        )}
      </TouchableOpacity>

      {/* ── PANEL DE UBICACIÓN ───────────────────────────────────────────────── */}
      {showUbicacion && ubicacion && (
        <View style={styles.ubicacionPanel}>
          <View style={styles.ubicacionRow}>
            <Ionicons name="navigate-outline" size={15} color={Colors.accent} />
            <Text style={styles.ubicacionText}>
              {ubicacion.direccion}, {ubicacion.ciudad}
            </Text>
          </View>
          {ubicacion.departamento ? (
            <View style={styles.ubicacionRow}>
              <Ionicons name="map-outline" size={15} color={Colors.accent} />
              <Text style={styles.ubicacionText}>{ubicacion.departamento}</Text>
            </View>
          ) : null}
          {ubicacion.referencia ? (
            <View style={styles.ubicacionRow}>
              <Ionicons
                name="information-circle-outline"
                size={15}
                color={Colors.accent}
              />
              <Text style={styles.ubicacionText}>{ubicacion.referencia}</Text>
            </View>
          ) : null}
          <TouchableOpacity style={styles.mapsBtn} onPress={abrirMaps}>
            <Ionicons name="map" size={16} color={Colors.textPrimary} />
            <Text style={styles.mapsBtnText}>Abrir en Google Maps</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ACCIONES */}
      {isUpcoming && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            onPress={() => onReschedule(appointment)}
          >
            <Ionicons name="create-outline" size={18} color={Colors.accent} />
            <Text style={styles.actionBtnSecondaryText}>Reprogramar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnCancel}
            onPress={() => onCancel(appointment.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#FF3B30" />
            <Text style={styles.actionBtnCancelText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === "completed" && (
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={() => setShowRateModal(true)}
        >
          <Ionicons name="star-outline" size={18} color={Colors.accent} />
          <Text style={styles.rateBtnText}>Calificar Servicio</Text>
        </TouchableOpacity>
      )}

      <RateModal
        visible={showRateModal}
        onClose={() => setShowRateModal(false)}
        onSubmit={(p: number, c: string) => {
          setShowRateModal(false);
          onRate(appointment.id, p, c);
        }}
      />
    </View>
  );
}

// ─── MODAL CALIFICACIÓN ───────────────────────────────────────────────────────
function RateModal({ visible, onClose, onSubmit }: any) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");
  const labels = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

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
            <Text style={styles.modalTitle}>Calificar Servicio</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.rateLabel}>¿Cómo fue tu experiencia?</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity
                key={star}
                onPress={() => setPuntuacion(star)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={star <= puntuacion ? "star" : "star-outline"}
                  size={42}
                  color={
                    star <= puntuacion ? Colors.accent : Colors.textSecondary
                  }
                />
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.rateValue}>{labels[puntuacion]}</Text>
          <Text style={styles.rateLabel}>Comentario (opcional)</Text>
          <TextInput
            style={styles.comentarioInput}
            multiline
            numberOfLines={3}
            placeholder="Cuéntanos tu experiencia..."
            placeholderTextColor={Colors.textSecondary}
            value={comentario}
            onChangeText={setComentario}
          />
          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.modalBtnCancel} onPress={onClose}>
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSubmit}
              onPress={() => {
                onSubmit(puntuacion, comentario);
                setPuntuacion(5);
                setComentario("");
              }}
            >
              <Ionicons name="star" size={16} color={Colors.textPrimary} />
              <Text style={styles.modalBtnSubmitText}>Enviar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

// ─── EMPTY STATE ──────────────────────────────────────────────────────────────
function EmptyState({ icon, title, description }: any) {
  return (
    <View style={styles.emptyState}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name={icon} size={64} color={Colors.textSecondary} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: { fontSize: 28, fontWeight: "bold", color: Colors.textPrimary },
  newBookingBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  newBookingText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: { borderBottomColor: Colors.accent },
  tabText: { fontSize: 15, fontWeight: "600", color: Colors.textSecondary },
  activeTabText: { color: Colors.accent },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },

  appointmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  barberInfo: { flexDirection: "row", flex: 1 },
  barberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  barberDetails: { marginLeft: 12, flex: 1 },
  barberName: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  barbershopRow: { flexDirection: "row", alignItems: "center" },
  barbershopName: { fontSize: 14, color: Colors.textSecondary, marginLeft: 4 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: { fontSize: 12, fontWeight: "600", marginLeft: 4 },
  completedBadge: { backgroundColor: "rgba(52,199,89,0.15)" },
  cancelledBadge: { backgroundColor: "rgba(255,59,48,0.15)" },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.05)",
    marginVertical: 14,
  },
  cardDetails: { gap: 10 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailText: { fontSize: 15, color: Colors.textPrimary, marginLeft: 12 },

  // Ubicación
  ubicacionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: "rgba(212,175,55,0.07)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  ubicacionBtnText: {
    flex: 1,
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  ubicacionPanel: {
    marginTop: 10,
    padding: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.15)",
    gap: 8,
  },
  ubicacionRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  ubicacionText: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    lineHeight: 19,
  },
  mapsBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.accent,
  },
  mapsBtnText: { color: Colors.textPrimary, fontSize: 14, fontWeight: "700" },

  cardActions: { flexDirection: "row", marginTop: 15, gap: 10 },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  actionBtnSecondaryText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  actionBtnCancel: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,59,48,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,59,48,0.3)",
  },
  actionBtnCancelText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: "rgba(212,175,55,0.1)",
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.3)",
  },
  rateBtnText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },

  emptyState: { alignItems: "center", paddingVertical: 60 },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 40,
  },

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
    maxHeight: "93%",
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: "bold", color: Colors.textPrimary },

  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },
  stepDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255,255,255,0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  stepDotActive: { backgroundColor: Colors.accent },
  stepDotText: {
    fontSize: 13,
    fontWeight: "bold",
    color: Colors.textSecondary,
  },
  stepLine: {
    width: 44,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.1)",
    marginHorizontal: 4,
  },
  stepLineActive: { backgroundColor: Colors.accent },

  selectCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  selectCardActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(212,175,55,0.08)",
  },
  selectAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  selectName: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 3,
  },
  selectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  selectSub: { fontSize: 13, color: Colors.textSecondary },
  serviceIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(212,175,55,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  servicePrice: { fontSize: 17, fontWeight: "bold", color: Colors.accent },

  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  sectionLabelSub: {
    fontSize: 13,
    fontWeight: "400",
    color: Colors.textSecondary,
  },

  dayCard: {
    width: 62,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  dayCardActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  dayName: { fontSize: 11, color: Colors.textSecondary, fontWeight: "600" },
  dayNum: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginVertical: 2,
  },
  dayMonth: { fontSize: 11, color: Colors.textSecondary },
  dayTextActive: { color: Colors.textPrimary },

  // Slots de hora
  hoursGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  hourChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  hourChipActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  hourText: { fontSize: 14, fontWeight: "600", color: Colors.textSecondary },
  hourTextActive: { color: Colors.textPrimary },

  // Sin fecha / sin slots
  noDateHint: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    marginBottom: 20,
  },
  noDateHintText: { flex: 1, fontSize: 13, color: Colors.textSecondary },
  noSlotsBox: {
    alignItems: "center",
    paddingVertical: 28,
    gap: 8,
    marginBottom: 20,
  },
  noSlotsTitle: { fontSize: 16, fontWeight: "bold", color: Colors.textPrimary },
  noSlotsDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    paddingHorizontal: 30,
  },

  notaInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: "top",
  },

  summaryCard: {
    backgroundColor: Colors.background,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.25)",
    marginBottom: 10,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 7,
  },
  summaryText: { fontSize: 14, color: Colors.textPrimary },

  modalFooter: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.05)",
  },
  continueBtn: {
    flexDirection: "row",
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  continueBtnDisabled: { opacity: 0.35 },
  continueBtnText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },

  rescheduleInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(212,175,55,0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(212,175,55,0.2)",
  },
  rescheduleInfoText: { fontSize: 14, color: Colors.accent, flex: 1 },

  rateLabel: { color: Colors.textSecondary, fontSize: 14, marginBottom: 12 },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginBottom: 10,
  },
  rateValue: {
    color: Colors.accent,
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  comentarioInput: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalActions: { flexDirection: "row", gap: 12 },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.1)",
    alignItems: "center",
  },
  modalBtnCancelText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalBtnSubmit: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    gap: 6,
  },
  modalBtnSubmitText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
});
