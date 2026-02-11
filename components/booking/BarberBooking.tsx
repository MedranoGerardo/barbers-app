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
}

export default function BarberBooking({ appointments }: BarberBookingProps) {
  const [activeTab, setActiveTab] = useState<"today" | "upcoming" | "history">(
    "today",
  );

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
        <TouchableOpacity style={styles.calendarBtn}>
          <Ionicons name="calendar" size={24} color={Colors.accent} />
        </TouchableOpacity>
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
    </View>
  );
}

/* COMPONENTES */
function AppointmentCard({ appointment, type }: any) {
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
      </View>

      {/* STATUS BADGE EN SU PROPIA FILA */}
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
          <TouchableOpacity style={styles.actionBtnReject} activeOpacity={0.8}>
            <Ionicons name="close" size={18} color="#FF3B30" />
            <Text style={styles.actionBtnRejectText}>Rechazar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtnAccept} activeOpacity={0.8}>
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
          <TouchableOpacity style={styles.actionBtnPrimary} activeOpacity={0.8}>
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
});
