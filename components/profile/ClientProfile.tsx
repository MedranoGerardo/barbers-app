import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";

const API_URL = "http://192.168.0.3:3000";

export default function ClientProfile() {
  const router = useRouter();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // ✅ Cargar perfil desde la API
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/login");
        return;
      }

      const response = await fetch(`${API_URL}/api/usuarios/perfil`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        await AsyncStorage.clear();
        router.replace("/(auth)/login");
        return;
      }

      const data = await response.json();
      setUser(data);
    } catch (error) {
      Alert.alert("Error", "No se pudo cargar el perfil");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cerrar sesión con confirmación
  const handleLogout = () => {
    Alert.alert("Cerrar Sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Cerrar Sesión",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("token");
          await AsyncStorage.removeItem("user");
          router.replace("/(auth)/login");
        },
      },
    ]);
  };

  // Formatear fecha de registro
  const formatMemberSince = (fecha: string) => {
    if (!fecha) return "Recientemente";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accent} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  if (!user) return null;

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
            <Image
              source={{
                uri:
                  user.foto_perfil ||
                  `https://ui-avatars.com/api/?name=${user.nombre}+${user.apellido}&background=D4AF37&color=1A1A1A&size=200`,
              }}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="camera" size={20} color={Colors.textPrimary} />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user.nombre} {user.apellido}
            </Text>
            <Text style={styles.userEmail}>{user.correo}</Text>

            <View style={styles.memberBadge}>
              <Ionicons
                name="time-outline"
                size={14}
                color={Colors.textSecondary}
              />
              <Text style={styles.memberText}>
                Miembro desde {formatMemberSince(user.fecha_registro)}
              </Text>
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

      {/* MENÚ PARA CLIENTES */}
      <MenuSection title="Mis Servicios">
        <MenuItem
          icon="calendar-outline"
          title="Mis Citas"
          description="Ver y gestionar reservas"
          onPress={() => console.log("Mis citas")}
        />
        <MenuItem
          icon="heart-outline"
          title="Barberos Favoritos"
          description="Tus profesionales preferidos"
          onPress={() => console.log("Favoritos")}
        />
        <MenuItem
          icon="time-outline"
          title="Historial"
          description="Todos tus cortes anteriores"
          onPress={() => console.log("Historial")}
        />
      </MenuSection>

      <MenuSection title="Pagos y Promociones">
        <MenuItem
          icon="card-outline"
          title="Métodos de Pago"
          description="Gestionar tarjetas"
          onPress={() => console.log("Pagos")}
        />
        <MenuItem
          icon="gift-outline"
          title="Cupones"
          description="Descuentos disponibles"
          badge="2 nuevos"
          onPress={() => console.log("Cupones")}
        />
      </MenuSection>

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
        onPress={handleLogout}
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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
  },
  loadingText: {
    color: Colors.textSecondary,
    marginTop: 10,
    fontSize: 14,
  },
  scrollContent: { paddingBottom: 20 },
  header: { position: "relative", paddingBottom: 20 },
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
  avatarWrapper: { position: "relative", marginBottom: 15 },
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
  userInfo: { alignItems: "center", marginBottom: 15 },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.textPrimary,
    marginBottom: 5,
  },
  userEmail: { fontSize: 15, color: Colors.textSecondary, marginBottom: 8 },
  memberBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
  },
  memberText: { fontSize: 13, color: Colors.textSecondary, marginLeft: 6 },
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
  menuSection: { paddingHorizontal: 20, marginTop: 25 },
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
  menuItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuItemContent: { flex: 1 },
  menuItemTitleRow: { flexDirection: "row", alignItems: "center" },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  menuItemDesc: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  badge: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: 8,
  },
  badgeText: { fontSize: 11, fontWeight: "bold", color: Colors.textPrimary },
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
