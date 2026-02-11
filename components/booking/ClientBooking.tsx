import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/colors";

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
}

export default function ClientBooking({ appointments }: ClientBookingProps) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">(
    "upcoming",
  );

  const upcomingAppointments = appointments.filter(
    (apt) => apt.status === "upcoming",
  );
  const historyAppointments = appointments.filter(
    (apt) => apt.status === "completed" || apt.status === "cancelled",
  );

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
            upcomingAppointments.map((appointment) => (
              <AppointmentCard
                key={appointment.id}
                appointment={appointment}
                isUpcoming={true}
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
          historyAppointments.map((appointment) => (
            <AppointmentCard
              key={appointment.id}
              appointment={appointment}
              isUpcoming={false}
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

/* COMPONENTES */
function AppointmentCard({ appointment, isUpcoming }: any) {
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

      {isUpcoming && (
        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.actionBtnSecondary}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color={Colors.accent} />
            <Text style={styles.actionBtnSecondaryText}>Reprogramar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.8}>
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color={Colors.textPrimary}
            />
            <Text style={styles.actionBtnPrimaryText}>Contactar</Text>
          </TouchableOpacity>
        </View>
      )}

      {appointment.status === "completed" && (
        <TouchableOpacity style={styles.rateBtn} activeOpacity={0.8}>
          <Ionicons name="star-outline" size={18} color={Colors.accent} />
          <Text style={styles.rateBtnText}>Calificar Servicio</Text>
        </TouchableOpacity>
      )}
    </View>
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
  },
  barberInfo: {
    flexDirection: "row",
    flex: 1,
  },
  barberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  barberDetails: {
    marginLeft: 12,
    flex: 1,
  },
  barberName: {
    fontSize: 17,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  barbershopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  barbershopName: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
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
});
