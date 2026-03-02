import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Colors from "../../constants/colors";

const { width } = Dimensions.get("window");

interface BarberHomeProps {
  userData: any;
}

export default function BarberHome({ userData }: BarberHomeProps) {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselData = [
    {
      id: 1,
      title: "Panel de Control",
      subtitle: "Gestiona tus citas y servicios",
      image:
        "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=1000",
    },
    {
      id: 2,
      title: "Clientes Nuevos",
      subtitle: "Conecta con más personas",
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000",
    },
    {
      id: 3,
      title: "Crece tu Negocio",
      subtitle: "Herramientas profesionales",
      image:
        "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=1000",
    },
  ];

  // AUTO-SCROLL DEL CARRUSEL
  useEffect(() => {
    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % carouselData.length;
      setCurrentIndex(nextIndex);

      if (carouselRef.current) {
        carouselRef.current.scrollTo({
          x: nextIndex * width,
          animated: true,
        });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [currentIndex]);

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: false },
  );

  const handleScrollEnd = (event: any) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(contentOffsetX / width);
    setCurrentIndex(newIndex);
  };

  // Stats del barbero
  const stats = [
    { label: "Citas hoy", value: "8", icon: "calendar", color: Colors.accent },
    {
      label: "Clientes nuevos",
      value: "3",
      icon: "person-add",
      color: "#4CAF50",
    },
    { label: "Ingresos hoy", value: "$180", icon: "cash", color: "#FF9800" },
  ];

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header con bienvenida */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>Bienvenido,</Text>
          <Text style={styles.barberName}>
            {userData?.nombre} {userData?.apellido}
          </Text>
        </View>
        <TouchableOpacity style={styles.profileBtn}>
          <Image
            source={{
              uri:
                userData?.avatar ||
                `https://ui-avatars.com/api/?name=${userData?.nombre}+${userData?.apellido}&background=D4AF37&color=1A1A1A`,
            }}
            style={styles.profileImage}
          />
        </TouchableOpacity>
      </View>

      {/* Stats rápidas */}
      <View style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statCard}>
            <View
              style={[styles.statIcon, { backgroundColor: stat.color + "20" }]}
            >
              <Ionicons name={stat.icon as any} size={20} color={stat.color} />
            </View>
            <Text style={styles.statValue}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* CARRUSEL CON AUTO-SCROLL */}
      <View style={styles.carouselContainer}>
        <ScrollView
          ref={carouselRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          onMomentumScrollEnd={handleScrollEnd}
        >
          {carouselData.map((item) => (
            <View key={item.id} style={styles.carouselItem}>
              <Image
                source={{ uri: item.image }}
                style={styles.carouselImage}
                resizeMode="cover"
              />
              <View style={styles.carouselOverlay} />
              <View style={styles.carouselTextBox}>
                <Text style={styles.carouselTitle}>{item.title}</Text>
                <Text style={styles.carouselSubtitle}>{item.subtitle}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* INDICADORES DEL CARRUSEL */}
        <View style={styles.carouselIndicators}>
          {carouselData.map((_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => {
                setCurrentIndex(index);
                carouselRef.current?.scrollTo({
                  x: index * width,
                  animated: true,
                });
              }}
            >
              <Animated.View
                style={[
                  styles.indicator,
                  currentIndex === index && styles.indicatorActive,
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Acciones rápidas */}
      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Acciones rápidas</Text>
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push("/(tabs)/booking")}
          >
            <Ionicons name="calendar" size={24} color={Colors.accent} />
            <Text style={styles.actionText}>Ver citas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="time" size={24} color={Colors.accent} />
            <Text style={styles.actionText}>Disponibilidad</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="stats-chart" size={24} color={Colors.accent} />
            <Text style={styles.actionText}>Estadísticas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionCard}>
            <Ionicons name="settings" size={24} color={Colors.accent} />
            <Text style={styles.actionText}>Configurar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Próximas citas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Próximas citas</Text>
          <TouchableOpacity onPress={() => router.push("/(tabs)/booking")}>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentsList}>
          <AppointmentCard
            client="Juan Pérez"
            service="Corte de cabello"
            time="10:30 AM"
            status="pending"
          />
          <AppointmentCard
            client="Carlos López"
            service="Corte + Barba"
            time="11:45 AM"
            status="confirmed"
          />
          <AppointmentCard
            client="Miguel Ángel"
            service="Perfilado"
            time="1:00 PM"
            status="pending"
          />
        </View>
      </View>

      {/* Servicios más solicitados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Servicios populares</Text>
        <View style={styles.servicesList}>
          <PopularService name="Corte de cabello" count={45} percentage={40} />
          <PopularService name="Corte + Barba" count={32} percentage={28} />
          <PopularService
            name="Perfilado de barba"
            count={28}
            percentage={25}
          />
        </View>
      </View>

      {/* Tips para barberos */}
      <View style={styles.tipsSection}>
        <View style={styles.tipsHeader}>
          <Ionicons name="bulb" size={24} color={Colors.accent} />
          <Text style={styles.tipsTitle}>Tip del día</Text>
        </View>
        <Text style={styles.tipsText}>
          Recuerda confirmar tus citas 1 hora antes para reducir las ausencias.
        </Text>
      </View>
    </ScrollView>
  );
}

// Componentes específicos para barberos
function AppointmentCard({ client, service, time, status }: any) {
  const statusColors = {
    pending: "#FF9800",
    confirmed: "#4CAF50",
    completed: Colors.accent,
  };

  return (
    <View style={styles.appointmentCard}>
      <View style={styles.appointmentInfo}>
        <Text style={styles.clientName}>{client}</Text>
        <Text style={styles.serviceName}>{service}</Text>
        <View style={styles.appointmentMeta}>
          <Ionicons name="time" size={14} color={Colors.textSecondary} />
          <Text style={styles.appointmentTime}>{time}</Text>
        </View>
      </View>
      <View
        style={[
          styles.statusBadge,
          {
            backgroundColor:
              statusColors[status as keyof typeof statusColors] + "20",
          },
        ]}
      >
        <Text
          style={[
            styles.statusText,
            { color: statusColors[status as keyof typeof statusColors] },
          ]}
        >
          {status === "pending" ? "Pendiente" : "Confirmada"}
        </Text>
      </View>
    </View>
  );
}

function PopularService({ name, count, percentage }: any) {
  return (
    <View style={styles.popularService}>
      <View style={styles.popularServiceHeader}>
        <Text style={styles.popularServiceName}>{name}</Text>
        <Text style={styles.popularServiceCount}>{count} citas</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, { width: `${percentage}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  welcomeSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  welcomeText: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  barberName: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
  },
  profileBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  profileImage: {
    width: "100%",
    height: "100%",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 15,
    marginHorizontal: 5,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statValue: {
    color: Colors.textPrimary,
    fontSize: 18,
    fontWeight: "bold",
  },
  statLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
  },
  carouselContainer: {
    height: 200,
    position: "relative",
    marginBottom: 20,
  },
  carouselItem: {
    width: width,
    height: "100%",
    position: "relative",
  },
  carouselImage: {
    width: "100%",
    height: "100%",
  },
  carouselOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  carouselTextBox: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
  },
  carouselTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 4,
  },
  carouselSubtitle: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  carouselIndicators: {
    flexDirection: "row",
    position: "absolute",
    bottom: 10,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 3,
  },
  indicatorActive: {
    backgroundColor: Colors.accent,
    width: 18,
  },
  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  actionCard: {
    width: "25%",
    alignItems: "center",
    padding: 10,
  },
  actionText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginTop: 8,
    textAlign: "center",
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  seeAllText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  appointmentsList: {
    marginTop: 5,
  },
  appointmentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  appointmentInfo: {
    flex: 1,
  },
  clientName: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  serviceName: {
    color: Colors.textSecondary,
    fontSize: 14,
    marginBottom: 6,
  },
  appointmentMeta: {
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentTime: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
  },
  servicesList: {
    marginTop: 5,
  },
  popularService: {
    marginBottom: 15,
  },
  popularServiceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  popularServiceName: {
    color: Colors.textPrimary,
    fontSize: 14,
  },
  popularServiceCount: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: Colors.accent,
    borderRadius: 3,
  },
  tipsSection: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.2)",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  tipsTitle: {
    color: Colors.accent,
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  tipsText: {
    color: Colors.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
});
