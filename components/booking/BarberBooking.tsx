import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";

interface Appointment {
  id: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  service: string;
  date: string;
  time: string;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  isNewClient: boolean;
}

interface BarberBookingProps {
  appointments: Appointment[];
  onCreateAppointment?: (appointment: Omit<Appointment, "id">) => void;
  onRescheduleAppointment?: (
    id: string,
    newDate: string,
    newTime: string,
  ) => void;
  onAcceptAppointment?: (id: string) => void;
  onRejectAppointment?: (id: string) => void;
  onCompleteAppointment?: (id: string) => void;
}

export default function BarberBooking({
  appointments,
  onCreateAppointment,
  onRescheduleAppointment,
  onAcceptAppointment,
  onRejectAppointment,
  onCompleteAppointment,
}: BarberBookingProps) {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "history">(
    "today",
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const today = new Date().toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const todayAppointments = appointments.filter(
    (apt) =>
      apt.date === today &&
      (apt.status === "pending" || apt.status === "confirmed"),
  );

  const upcomingAppointments = appointments.filter(
    (apt) =>
      apt.date !== today &&
      (apt.status === "pending" || apt.status === "confirmed"),
  );

  const historyAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled",
  );

  const handleAccept = (id: string) => {
    if (onAcceptAppointment) {
      onAcceptAppointment(id);
    }
  };

  const handleReject = (id: string) => {
    Alert.alert(
      "Rechazar Cita",
      "¿Estás seguro de que deseas rechazar esta cita?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Rechazar",
          style: "destructive",
          onPress: () => onRejectAppointment && onRejectAppointment(id),
        },
      ],
    );
  };

  const handleComplete = (id: string) => {
    Alert.alert("Completar Cita", "¿Marcar esta cita como completada?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Completar",
        onPress: () => onCompleteAppointment && onCompleteAppointment(id),
      },
    ]);
  };

  const handleReschedule = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setShowRescheduleModal(true);
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mi Agenda</Text>
          <Text style={styles.headerSubtitle}>
            {todayAppointments.length} citas hoy
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.calendarBtn}>
            <Ionicons name="calendar" size={24} color={Colors.accent} />
          </TouchableOpacity>
        </View>
      </View>

      {/* RESUMEN DEL DÍA */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "rgba(212, 175, 55, 0.15)" },
            ]}
          >
            <Ionicons name="calendar" size={20} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.summaryValue}>{todayAppointments.length}</Text>
            <Text style={styles.summaryLabel}>Hoy</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "rgba(255, 149, 0, 0.15)" },
            ]}
          >
            <Ionicons name="time-outline" size={20} color="#FF9500" />
          </View>
          <View>
            <Text style={styles.summaryValue}>
              {upcomingAppointments.length}
            </Text>
            <Text style={styles.summaryLabel}>Próximas</Text>
          </View>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <View
            style={[
              styles.summaryIconContainer,
              { backgroundColor: "rgba(52, 199, 89, 0.15)" },
            ]}
          >
            <Ionicons name="checkmark-circle" size={20} color="#34C759" />
          </View>
          <View>
            <Text style={styles.summaryValue}>
              {
                historyAppointments.filter((a) => a.status === "completed")
                  .length
              }
            </Text>
            <Text style={styles.summaryLabel}>Completadas</Text>
          </View>
        </View>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "today" && styles.activeTab]}
          onPress={() => setActiveTab("today")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "today" && styles.activeTabText,
            ]}
          >
            Hoy
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "upcoming" && styles.activeTab]}
          onPress={() => setActiveTab("upcoming")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "upcoming" && styles.activeTabText,
            ]}
          >
            Próximas
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "history" && styles.activeTab]}
          onPress={() => setActiveTab("history")}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "history" && styles.activeTabText,
            ]}
          >
            Historial
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "today" &&
          (todayAppointments.length > 0 ? (
            todayAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                type="active"
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onReschedule={handleReschedule}
              />
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="Sin citas para hoy"
              description="Disfruta tu día libre o configura tu disponibilidad"
            />
          ))}

        {activeTab === "upcoming" &&
          (upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                type="active"
                onAccept={handleAccept}
                onReject={handleReject}
                onComplete={handleComplete}
                onReschedule={handleReschedule}
              />
            ))
          ) : (
            <EmptyState
              icon="time-outline"
              title="Sin citas próximas"
              description="Las nuevas reservas aparecerán aquí"
            />
          ))}

        {activeTab === "history" &&
          (historyAppointments.length > 0 ? (
            historyAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                type="history"
              />
            ))
          ) : (
            <EmptyState
              icon="document-text-outline"
              title="Sin historial"
              description="Aquí aparecerán tus citas completadas"
            />
          ))}
      </ScrollView>

      {/* MODAL CREAR CITA */}
      <CreateAppointmentModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={onCreateAppointment}
      />

      {/* MODAL REAGENDAR */}
      <RescheduleModal
        visible={showRescheduleModal}
        appointment={selectedAppointment}
        onClose={() => {
          setShowRescheduleModal(false);
          setSelectedAppointment(null);
        }}
        onSubmit={onRescheduleAppointment}
      />
    </View>
  );
}

/* COMPONENTE CARD DE CITA */
function AppointmentCard({
  appointment,
  type,
  onAccept,
  onReject,
  onComplete,
  onReschedule,
}: any) {
  return (
    <View style={styles.appointmentCard}>
      <View style={styles.cardHeader}>
        <View style={styles.clientInfo}>
          <Image
            source={{ uri: appointment.clientAvatar }}
            style={styles.clientAvatar}
          />
          <View style={styles.clientDetails}>
            <View style={styles.clientNameRow}>
              <Text style={styles.clientName}>{appointment.clientName}</Text>
              {appointment.isNewClient && (
                <View style={styles.newClientBadge}>
                  <Text style={styles.newClientText}>Nuevo</Text>
                </View>
              )}
            </View>
            <View style={styles.phoneRow}>
              <Ionicons name="call" size={14} color={Colors.textSecondary} />
              <Text style={styles.clientPhone}>{appointment.clientPhone}</Text>
            </View>
          </View>
        </View>

        {/* Botón de reagendar para citas activas */}
        {type === "active" && onReschedule && (
          <TouchableOpacity
            style={styles.rescheduleIconBtn}
            onPress={() => onReschedule(appointment)}
          >
            <Ionicons name="calendar-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        )}
      </View>

      {/* STATUS BADGE */}
      <View style={styles.statusRow}>
        {appointment.status === "pending" && (
          <View style={[styles.statusBadge, styles.pendingBadge]}>
            <Ionicons name="hourglass-outline" size={16} color="#FF9500" />
            <Text style={styles.pendingText}>Pendiente</Text>
          </View>
        )}
        {appointment.status === "confirmed" && (
          <View style={[styles.statusBadge, styles.confirmedBadge]}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.accent} />
            <Text style={styles.confirmedText}>Confirmada</Text>
          </View>
        )}
        {appointment.status === "completed" && (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Ionicons name="checkmark-done-circle" size={16} color="#34C759" />
            <Text style={styles.completedText}>Completada</Text>
          </View>
        )}
        {appointment.status === "cancelled" && (
          <View style={[styles.statusBadge, styles.cancelledBadge]}>
            <Ionicons name="close-circle" size={16} color="#FF3B30" />
            <Text style={styles.cancelledText}>Cancelada</Text>
          </View>
        )}
      </View>

      <View style={styles.cardDivider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="cut-outline" size={18} color={Colors.accent} />
          <Text style={styles.detailText}>{appointment.service}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={18} color={Colors.accent} />
          <Text style={styles.detailText}>{appointment.date}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={18} color={Colors.accent} />
          <Text style={styles.detailText}>{appointment.time}</Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="cash-outline" size={18} color={Colors.accent} />
          <Text style={styles.detailText}>${appointment.price}</Text>
        </View>
      </View>

      {type === "active" && appointment.status === "pending" && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnReject}
            activeOpacity={0.8}
            onPress={() => onReject && onReject(appointment.id)}
          >
            <Ionicons name="close" size={18} color="#FF3B30" />
            <Text style={styles.actionBtnRejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnAccept}
            activeOpacity={0.8}
            onPress={() => onAccept && onAccept(appointment.id)}
          >
            <Ionicons name="checkmark" size={18} color={Colors.textPrimary} />
            <Text style={styles.actionBtnAcceptText}>Aceptar</Text>
          </TouchableOpacity>
        </View>
      )}

      {type === "active" && appointment.status === "confirmed" && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            activeOpacity={0.8}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={Colors.accent}
            />
            <Text style={styles.actionBtnSecondaryText}>Contactar</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionBtnPrimary}
            activeOpacity={0.8}
            onPress={() => onComplete && onComplete(appointment.id)}
          >
            <Ionicons
              name="checkmark-circle"
              size={18}
              color={Colors.textPrimary}
            />
            <Text style={styles.actionBtnPrimaryText}>Completar</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

/* MODAL CREAR CITA */
function CreateAppointmentModal({ visible, onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    service: "",
    date: "",
    time: "",
    price: "",
  });

  const handleSubmit = () => {
    // Validación básica
    if (
      !formData.clientName ||
      !formData.clientPhone ||
      !formData.service ||
      !formData.date ||
      !formData.time ||
      !formData.price
    ) {
      Alert.alert("Error", "Por favor completa todos los campos");
      return;
    }

    const newAppointment = {
      clientName: formData.clientName,
      clientAvatar: `https://ui-avatars.com/api/?name=${formData.clientName}&background=D4AF37&color=1A1A1A`,
      clientPhone: formData.clientPhone,
      service: formData.service,
      date: formData.date,
      time: formData.time,
      price: parseFloat(formData.price),
      status: "confirmed" as const,
      isNewClient: false,
    };

    if (onSubmit) {
      onSubmit(newAppointment);
    }

    // Resetear formulario y cerrar
    setFormData({
      clientName: "",
      clientPhone: "",
      service: "",
      date: "",
      time: "",
      price: "",
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Nueva Cita</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Nombre del Cliente</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Juan Pérez"
                placeholderTextColor={Colors.textSecondary}
                value={formData.clientName}
                onChangeText={(text) =>
                  setFormData({ ...formData, clientName: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: +503 1234-5678"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="phone-pad"
                value={formData.clientPhone}
                onChangeText={(text) =>
                  setFormData({ ...formData, clientPhone: text })
                }
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Servicio</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Corte + Barba"
                placeholderTextColor={Colors.textSecondary}
                value={formData.service}
                onChangeText={(text) =>
                  setFormData({ ...formData, service: text })
                }
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.label}>Fecha</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.date}
                  onChangeText={(text) =>
                    setFormData({ ...formData, date: text })
                  }
                />
              </View>

              <View style={[styles.formGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.label}>Hora</Text>
                <TextInput
                  style={styles.input}
                  placeholder="HH:MM"
                  placeholderTextColor={Colors.textSecondary}
                  value={formData.time}
                  onChangeText={(text) =>
                    setFormData({ ...formData, time: text })
                  }
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Precio ($)</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: 15.00"
                placeholderTextColor={Colors.textSecondary}
                keyboardType="decimal-pad"
                value={formData.price}
                onChangeText={(text) =>
                  setFormData({ ...formData, price: text })
                }
              />
            </View>
          </ScrollView>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSubmit}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnSubmitText}>Crear Cita</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/* MODAL REAGENDAR */
function RescheduleModal({ visible, appointment, onClose, onSubmit }: any) {
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");

  const handleSubmit = () => {
    if (!newDate || !newTime) {
      Alert.alert("Error", "Por favor ingresa fecha y hora");
      return;
    }

    if (appointment && onSubmit) {
      onSubmit(appointment.id, newDate, newTime);
    }

    setNewDate("");
    setNewTime("");
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Reagendar Cita</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          {appointment && (
            <View style={styles.rescheduleInfo}>
              <Text style={styles.rescheduleClient}>
                Cliente: {appointment.clientName}
              </Text>
              <Text style={styles.rescheduleService}>
                Servicio: {appointment.service}
              </Text>
              <Text style={styles.rescheduleCurrent}>
                Fecha actual: {appointment.date} - {appointment.time}
              </Text>
            </View>
          )}

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nueva Fecha</Text>
            <TextInput
              style={styles.input}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={Colors.textSecondary}
              value={newDate}
              onChangeText={setNewDate}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Nueva Hora</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              placeholderTextColor={Colors.textSecondary}
              value={newTime}
              onChangeText={setNewTime}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={styles.modalBtnCancel}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnCancelText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalBtnSubmit}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.modalBtnSubmitText}>Reagendar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

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

/* ESTILOS */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    gap: 10,
  },
  addBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  summaryCard: {
    flexDirection: "row",
    backgroundColor: Colors.card,
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  summaryItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  summaryIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  summaryLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginHorizontal: 8,
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
  activeTab: {
    borderBottomColor: Colors.accent,
  },
  tabText: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  activeTabText: {
    color: Colors.accent,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  appointmentCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  clientInfo: {
    flexDirection: "row",
    flex: 1,
  },
  clientAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  clientDetails: {
    marginLeft: 12,
    flex: 1,
  },
  clientNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  clientName: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginRight: 6,
  },
  newClientBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  newClientText: {
    color: "#34C759",
    fontSize: 10,
    fontWeight: "600",
  },
  phoneRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clientPhone: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  rescheduleIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  statusRow: {
    flexDirection: "row",
    marginTop: 10,
    marginBottom: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  pendingBadge: {
    backgroundColor: "rgba(255, 149, 0, 0.15)",
  },
  pendingText: {
    color: "#FF9500",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  confirmedBadge: {
    backgroundColor: "rgba(212, 175, 55, 0.15)",
  },
  confirmedText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  completedBadge: {
    backgroundColor: "rgba(52, 199, 89, 0.15)",
  },
  completedText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cancelledBadge: {
    backgroundColor: "rgba(255, 59, 48, 0.15)",
  },
  cancelledText: {
    color: "#FF3B30",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    marginVertical: 14,
  },
  cardDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailText: {
    fontSize: 15,
    color: Colors.textPrimary,
    marginLeft: 12,
  },
  cardActions: {
    flexDirection: "row",
    marginTop: 15,
    gap: 10,
  },
  actionBtnReject: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  actionBtnRejectText: {
    color: "#FF3B30",
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  actionBtnAccept: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#34C759",
  },
  actionBtnAcceptText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
  },
  actionBtnSecondaryText: {
    color: Colors.accent,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  actionBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.accent,
  },
  actionBtnPrimaryText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.card,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
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
  // Estilos del Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalBtnCancel: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    alignItems: "center",
  },
  modalBtnCancelText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  modalBtnSubmit: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: "center",
  },
  modalBtnSubmitText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  rescheduleInfo: {
    backgroundColor: Colors.background,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  rescheduleClient: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  rescheduleService: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  rescheduleCurrent: {
    fontSize: 14,
    color: Colors.accent,
    fontWeight: "600",
  },
});
