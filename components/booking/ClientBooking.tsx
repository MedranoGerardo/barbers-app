import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

const API_URL = "http://192.168.0.3:3000";

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
}

interface ClientBookingProps {
  appointments: Appointment[];
  onRefresh?: () => void;
}

export default function ClientBooking({
  appointments,
  onRefresh,
}: ClientBookingProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "upcoming",
  );
  const historyAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled",
  );

  const getToken = async () => await AsyncStorage.getItem("token");

  // ✅ Cancelar cita
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
              const response = await fetch(
                `${API_URL}/api/citas/${id}/status`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({ status: "cancelled" }),
                },
              );
              if (response.ok) {
                Alert.alert("Cita cancelada");
                onRefresh && onRefresh();
              }
            } catch {
              Alert.alert("Error", "No se pudo cancelar la cita");
            }
          },
        },
      ],
    );
  };

  // ✅ Calificar servicio
  const handleRate = async (
    citaId: string,
    puntuacion: number,
    comentario: string,
  ) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/api/calificaciones`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ cita_id: citaId, puntuacion, comentario }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("⭐ ¡Gracias por tu calificación!");
        onRefresh && onRefresh();
      } else {
        Alert.alert("Error", data.error || "No se pudo enviar la calificación");
      }
    } catch {
      Alert.alert("Error", "No se pudo conectar con el servidor");
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Citas</Text>
        <TouchableOpacity style={styles.newBookingBtn}>
          <Ionicons name="add-circle" size={24} color={Colors.accent} />
          <Text style={styles.newBookingText}>Nueva Cita</Text>
        </TouchableOpacity>
      </View>

      {/* TABS */}
      <View style={styles.tabsContainer}>
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
            Próximas ({upcomingAppointments.length})
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
            Historial ({historyAppointments.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* CONTENIDO */}
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
              />
            ))
          ) : (
            <EmptyState
              icon="calendar-outline"
              title="No tienes citas próximas"
              description="Reserva tu próximo corte con tu barbero favorito"
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
    </View>
  );
}

/* CARD DE CITA */
function AppointmentCard({ appointment, isUpcoming, onCancel, onRate }: any) {
  const [showRateModal, setShowRateModal] = useState(false);

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
                name="location"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.barbershopName}>
                {appointment.barbershop}
              </Text>
            </View>
          </View>
        </View>

        {appointment.status === "completed" && (
          <View style={[styles.statusBadge, styles.completedBadge]}>
            <Ionicons name="checkmark-circle" size={16} color="#34C759" />
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

      {/* Botones citas próximas */}
      {isUpcoming && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnCancel}
            onPress={() => onCancel(appointment.id)}
          >
            <Ionicons name="close-circle-outline" size={18} color="#FF3B30" />
            <Text style={styles.actionBtnCancelText}>Cancelar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary}>
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={Colors.textPrimary}
            />
            <Text style={styles.actionBtnPrimaryText}>Contactar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Botón calificar */}
      {appointment.status === "completed" && (
        <TouchableOpacity
          style={styles.rateBtn}
          onPress={() => setShowRateModal(true)}
        >
          <Ionicons name="star-outline" size={18} color={Colors.accent} />
          <Text style={styles.rateBtnText}>Calificar Servicio</Text>
        </TouchableOpacity>
      )}

      {/* Modal calificación */}
      <RateModal
        visible={showRateModal}
        onClose={() => setShowRateModal(false)}
        onSubmit={(puntuacion: number, comentario: string) => {
          setShowRateModal(false);
          onRate(appointment.id, puntuacion, comentario);
        }}
      />
    </View>
  );
}

/* MODAL DE CALIFICACIÓN */
function RateModal({ visible, onClose, onSubmit }: any) {
  const [puntuacion, setPuntuacion] = useState(5);
  const [comentario, setComentario] = useState("");

  const labels = ["", "Malo", "Regular", "Bueno", "Muy bueno", "Excelente"];

  const handleSubmit = () => {
    onSubmit(puntuacion, comentario);
    setPuntuacion(5);
    setComentario("");
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Calificar Servicio</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.rateLabel}>¿Cómo fue tu experiencia?</Text>

          {/* ESTRELLAS */}
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

          {/* COMENTARIO */}
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
              onPress={handleSubmit}
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
    borderColor: "rgba(212, 175, 55, 0.2)",
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
    borderColor: "rgba(255, 255, 255, 0.05)",
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
  completedBadge: { backgroundColor: "rgba(52, 199, 89, 0.15)" },
  completedText: {
    color: "#34C759",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  cancelledBadge: { backgroundColor: "rgba(255, 59, 48, 0.15)" },
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
  cardDetails: { gap: 10 },
  detailRow: { flexDirection: "row", alignItems: "center" },
  detailText: { fontSize: 15, color: Colors.textPrimary, marginLeft: 12 },
  cardActions: { flexDirection: "row", marginTop: 15, gap: 10 },
  actionBtnCancel: {
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
  actionBtnCancelText: {
    color: "#FF3B30",
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
  rateBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.3)",
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: "bold", color: Colors.textPrimary },
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
