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

interface ClientHomeProps {
  userData: any;
}

export default function ClientHome({ userData }: ClientHomeProps) {
  const router = useRouter();
  const scrollX = useRef(new Animated.Value(0)).current;
  const carouselRef = useRef<ScrollView>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const carouselData = [
    {
      id: 1,
      title: "Barbería Premium",
      subtitle: "Estilo • Precisión • Experiencia",
      image:
        "https://images.unsplash.com/photo-1599351431613-18ef1fdd27e1?q=80&w=1000",
    },
    {
      id: 2,
      title: "Estilo Único",
      subtitle: "Diseños personalizados para ti",
      image:
        "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=1000",
    },
    {
      id: 3,
      title: "Cuidado Profesional",
      subtitle: "Productos de alta calidad",
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

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header con bienvenida personalizada */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcomeText}>¡Hola,</Text>
          <Text style={styles.userName}>
            {userData?.nombre} {userData?.apellido}!
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

      {/* SERVICIOS */}
      <Section
        title="Nuestros servicios"
        description="Servicios profesionales pensados para tu estilo."
      >
        <ServiceCard title="Cabello" />
        <ServiceCard title="Barba" />
        <ServiceCard title="Cejas" />
        <ServiceCard title="Tratamientos" />
      </Section>

      {/* DESTACADOS */}
      <Section
        title="Cortes destacados"
        description="Los estilos más solicitados por nuestros clientes."
      >
        <HighlightCard
          title="Fade clásico"
          description="Estilo limpio y moderno"
        />
        <HighlightCard
          title="Perfilado premium"
          description="Diseño preciso de barba"
        />
        <HighlightCard
          title="Degradado texturizado"
          description="Volumen y definición"
        />
      </Section>

      {/* PRODUCTOS */}
      <Section
        title="Productos recomendados"
        description="Cuidado profesional para tu día a día."
      >
        <ProductCard title="Cera para cabello" />
        <ProductCard title="Aceite para barba" />
        <ProductCard title="Shampoo revitalizante" />
        <ProductCard title="Crema de afeitar" />
      </Section>

      {/* NUESTRO EQUIPO */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Conoce a nuestro equipo</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>Ver todo</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionDesc}>
          Barberos certificados con años de experiencia en el arte del corte.
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.teamScroll}
        >
          <TeamCard name="Carlos Méndez" specialty="Estilista Senior" />
          <TeamCard name="Miguel Torres" specialty="Especialista en Barba" />
          <TeamCard name="Javier López" specialty="Cortes Modernos" />
        </ScrollView>
      </View>

      {/* EXPERIENCIA PREMIUM */}
      <View style={styles.experienceBox}>
        <View style={styles.experienceHeader}>
          <Ionicons name="diamond" size={28} color={Colors.accent} />
          <Text style={styles.experienceTitle}>Experiencia Premium</Text>
        </View>

        <Text style={styles.experienceText}>
          Barbers con certificación internacional, técnicas avanzadas y
          productos premium para un estilo que destaque.
        </Text>

        <TouchableOpacity
          style={styles.experienceBtn}
          onPress={() => router.push("/(tabs)/booking")}
        >
          <Text style={styles.experienceBtnText}>Reserva tu cita</Text>
          <Ionicons name="calendar" size={18} color={Colors.textPrimary} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// COMPONENTES REUTILIZABLES
function Section({ title, description, children }: any) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <TouchableOpacity>
          <Text style={styles.seeAllText}>Ver todo</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.sectionDesc}>{description}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sectionScroll}
      >
        {children}
      </ScrollView>
    </View>
  );
}

function ServiceCard({ title }: any) {
  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.9}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=500",
        }}
        style={styles.cardImage}
      />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{title}</Text>
        <TouchableOpacity style={styles.cardBtn} activeOpacity={0.8}>
          <Text style={styles.cardBtnText}>Ver más</Text>
          <Ionicons
            name="chevron-forward"
            size={16}
            color={Colors.textPrimary}
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function HighlightCard({ title, description }: any) {
  return (
    <TouchableOpacity style={styles.highlightCard} activeOpacity={0.9}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?q=80&w=500",
        }}
        style={styles.highlightImage}
      />
      <View style={styles.highlightContent}>
        <Text style={styles.highlightTitle}>{title}</Text>
        <Text style={styles.highlightDesc}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

function ProductCard({ title }: any) {
  return (
    <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=500",
        }}
        style={styles.productImage}
      />
      <View style={styles.productContent}>
        <Text style={styles.productTitle}>{title}</Text>
        <Text style={styles.productTag}>Disponible</Text>
        <TouchableOpacity style={styles.productBtn} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={16} color={Colors.textPrimary} />
          <Text style={styles.productBtnText}>Ver producto</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function TeamCard({ name, specialty }: any) {
  return (
    <View style={styles.teamCard}>
      <Image
        source={{
          uri: "https://images.unsplash.com/photo-1562788869-4ed32648eb72?q=80&w=500",
        }}
        style={styles.teamImage}
      />
      <View style={styles.teamInfo}>
        <Text style={styles.teamName}>{name}</Text>
        <Text style={styles.teamSpecialty}>{specialty}</Text>
        <View style={styles.teamStars}>
          {[...Array(5)].map((_, i) => (
            <Ionicons key={i} name="star" size={14} color={Colors.accent} />
          ))}
        </View>
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
  userName: {
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
  carouselContainer: {
    height: 280,
    position: "relative",
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
    bottom: 40,
    left: 25,
    right: 25,
  },
  carouselTitle: {
    color: Colors.textPrimary,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  carouselSubtitle: {
    color: Colors.textSecondary,
    fontSize: 16,
  },
  carouselIndicators: {
    flexDirection: "row",
    position: "absolute",
    bottom: 15,
    alignSelf: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.4)",
    marginHorizontal: 4,
  },
  indicatorActive: {
    backgroundColor: Colors.accent,
    width: 24,
  },
  section: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    color: Colors.textPrimary,
    fontSize: 22,
    fontWeight: "bold",
  },
  seeAllText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "600",
  },
  sectionDesc: {
    color: Colors.textSecondary,
    fontSize: 15,
    marginBottom: 18,
    lineHeight: 22,
  },
  sectionScroll: {
    paddingRight: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    width: 190,
    marginRight: 15,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardImage: {
    height: 130,
    width: "100%",
  },
  cardContent: {
    padding: 15,
  },
  cardTitle: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 12,
  },
  cardBtn: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 10,
    borderRadius: 10,
  },
  cardBtnText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 14,
    marginRight: 6,
  },
  highlightCard: {
    width: 220,
    marginRight: 15,
  },
  highlightImage: {
    height: 140,
    width: "100%",
    borderRadius: 16,
  },
  highlightContent: {
    paddingTop: 12,
  },
  highlightTitle: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  highlightDesc: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  productCard: {
    width: 170,
    marginRight: 15,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  productImage: {
    height: 120,
    width: "100%",
  },
  productContent: {
    padding: 15,
  },
  productTitle: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 6,
  },
  productTag: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
  },
  productBtn: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
    borderRadius: 8,
  },
  productBtnText: {
    color: Colors.textPrimary,
    fontWeight: "600",
    fontSize: 13,
    marginLeft: 6,
  },
  teamScroll: {
    paddingRight: 20,
  },
  teamCard: {
    width: 160,
    marginRight: 15,
    backgroundColor: Colors.card,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.1)",
  },
  teamImage: {
    height: 140,
    width: "100%",
  },
  teamInfo: {
    padding: 15,
  },
  teamName: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  teamSpecialty: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginBottom: 8,
  },
  teamStars: {
    flexDirection: "row",
  },
  experienceBox: {
    margin: 20,
    marginTop: 35,
    padding: 25,
    backgroundColor: Colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(212, 175, 55, 0.15)",
  },
  experienceHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  experienceTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 12,
  },
  experienceText: {
    color: Colors.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: "center",
  },
  experienceBtn: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  experienceBtnText: {
    color: Colors.textPrimary,
    fontWeight: "bold",
    fontSize: 15,
    marginRight: 10,
  },
});
