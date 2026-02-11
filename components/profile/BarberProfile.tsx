import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import Colors from "../../constants/colors";

interface BarberProfileProps {
  user: {
    name: string;
    email: string;
    phone: string;
    avatar: string;
    barbershop: string;
    rating: number;
    totalCuts: number;
    thisWeekAppointments: number;
    monthlyEarnings: number;
    totalClients: number;
  };
}

export default function BarberProfile({ user }: BarberProfileProps) {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* HEADER CON AVATAR */}
      <View style={styles.header}>
        <View style={styles.headerBackground}>
          <View style={styles.headerOverlay} />
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user.name}</Text>
            <Text style={styles.userEmail}>{user.email}</Text>

            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>{user.rating}</Text>
              <Text style={styles.ratingCount}>• {user.totalCuts} cortes</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.editProfileBtn} activeOpacity={0.9}>
            <Ionicons
              name="create-outline"
              size={18}
              color={Colors.textPrimary}
            />
            <Text style={styles.editProfileText}>Editar Perfil</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ESTADÍSTICAS PARA BARBEROS */}
      <View style={styles.statsSection}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Resumen de esta semana</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver más</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            icon="calendar"
            value={user.thisWeekAppointments}
            label="Citas"
            color={Colors.accent}
          />
          <StatCard
            icon="cash-outline"
            value={`$${user.monthlyEarnings}`}
            label="Ganancias"
            color="#34C759"
          />
          <StatCard
            icon="people-outline"
            value={user.totalClients}
            label="Clientes"
            color="#FF9500"
          />
        </View>
      </View>

      {/* MENÚ PARA BARBEROS */}
      <MenuSection title="Mi Negocio">
        <MenuItem
          icon="calendar"
          title="Mi Agenda"
          description="Citas programadas"
          onPress={() => console.log("Agenda")}
        />
        <MenuItem
          icon="cut-outline"
          title="Mis Servicios"
          description="Catálogo y precios"
          onPress={() => console.log("Servicios")}
        />
        <MenuItem
          icon="time-outline"
          title="Horario de Atención"
          description="Configura tu disponibilidad"
          onPress={() => console.log("Horario")}
        />
      </MenuSection>

      <MenuSection title="Finanzas">
        <MenuItem
          icon="bar-chart-outline"
          title="Estadísticas"
          description="Análisis de rendimiento"
          onPress={() => console.log("Estadísticas")}
        />
        <MenuItem
          icon="wallet-outline"
          title="Ganancias"
          description="Historial de ingresos"
          onPress={() => console.log("Ganancias")}
        />
      </MenuSection>

      {/* CONFIGURACIÓN GENERAL */}
      <MenuSection title="Configuración">
        <MenuItem
          icon="notifications-outline"
          title="Notificaciones"
          description="Alertas y recordatorios"
          rightElement={
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: "#3A3A3C", true: Colors.accent }}
              thumbColor="#FFFFFF"
            />
          }
        />
        <MenuItem
          icon="language-outline"
          title="Idioma"
          description="Español"
          onPress={() => console.log("Idioma")}
        />
        <MenuItem
          icon="shield-checkmark-outline"
          title="Privacidad y Seguridad"
          description="Gestiona tu información"
          onPress={() => console.log("Privacidad")}
        />
        <MenuItem
          icon="help-circle-outline"
          title="Ayuda y Soporte"
          description="¿Necesitas ayuda?"
          onPress={() => console.log("Ayuda")}
        />
      </MenuSection>

      {/* INFORMACIÓN */}
      <MenuSection title="Información">
        <MenuItem
          icon="document-text-outline"
          title="Términos y Condiciones"
          onPress={() => console.log("Términos")}
        />
        <MenuItem
          icon="information-circle-outline"
          title="Acerca de Barbers-App"
          description="Versión 1.0.0"
          onPress={() => console.log("Acerca de")}
        />
      </MenuSection>

      {/* CERRAR SESIÓN */}
      <TouchableOpacity
        style={styles.logoutBtn}
        onPress={() => {
          console.log("Cerrar sesión");
          router.push("/(auth)/login");
        }}
        activeOpacity={0.9}
      >
        <Ionicons name="log-out-outline" size={24} color="#FF3B30" />
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

/* COMPONENTES */
function MenuSection({ title, children }: any) {
  return (
    <View style={styles.menuSection}>
      <Text style={styles.menuSectionTitle}>{title}</Text>
      <View style={styles.menuCard}>{children}</View>
    </View>
  );
}

function MenuItem({
  icon,
  title,
  description,
  badge,
  onPress,
  rightElement,
}: any) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconContainer}>
          <Ionicons name={icon} size={22} color={Colors.accent} />
        </View>
        <View style={styles.menuItemContent}>
          <View style={styles.menuItemTitleRow}>
            <Text style={styles.menuItemTitle}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          {description && (
            <Text style={styles.menuItemDesc}>{description}</Text>
          )}
        </View>
      </View>

      {rightElement ||
        (onPress && (
          <Ionicons
            name="chevron-forward"
            size={20}
            color={Colors.textSecondary}
          />
        ))}
    </TouchableOpacity>
  );
}

function StatCard({ icon, value, label, color }: any) {
  return (
    <View style={styles.statCard}>
      <View
        style={[styles.statIconContainer, { backgroundColor: color + "20" }]}
      >
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

/* ESTILOS */
const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    position: "relative",
    paddingBottom: 20,
  },
  headerBackground: {
    height: 150,
    backgroundColor: Colors.card,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
  },
  avatarSection: {
    alignItems: "center",
    marginTop: -60,
    paddingHorizontal: 20,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 15,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: Colors.accent,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.accent,
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.background,
  },
  userInfo: {
    alignItems: "center",
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255, 215, 0, 0.2)",
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginLeft: 5,
  },
  ratingCount: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 5,
  },
  editProfileBtn: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  editProfileText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 15,
    marginLeft: 8,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  seeAllText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    alignItems: "center",
    padding: 18,
    marginHorizontal: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  menuSection: {
    paddingHorizontal: 20,
    marginTop: 25,
  },
  menuSectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  menuCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.05)",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.03)",
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuItemDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "bold",
    color: Colors.textPrimary,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 30,
    paddingVertical: 16,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 59, 48, 0.2)",
  },
  logoutText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
});
