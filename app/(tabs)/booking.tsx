import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BarberBooking from "../../components/booking/BarberBooking";
import ClientBooking from "../../components/booking/ClientBooking";
import Colors from "../../constants/colors";
import { API_URL } from "../../constants/config";

export default function BookingScreen() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!userStr || !token) {
        router.replace("/(auth)/login");
        return;
      }

      const user = JSON.parse(userStr);
      setRol(user.rol);

      // ✅ Cargar citas reales desde la API
      const response = await fetch(`${API_URL}/api/citas`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        router.replace("/(auth)/login");
        return;
      }

      const data = await response.json();
      setCitas(data);
    } catch (error) {
      console.error("Error cargando citas:", error);
    } finally {
      setLoading(false);
    }
  };

  // Formatear citas para ClientBooking
  const formatClientAppointments = () => {
    return citas.map((c) => ({
      id: String(c.id),
      barberName: `${c.barbero_nombre} ${c.barbero_apellido}`,
      barberAvatar:
        c.barbero_avatar ||
        `https://ui-avatars.com/api/?name=${c.barbero_nombre}&background=D4AF37&color=1A1A1A`,
      barbershop: c.nombre_barberia || "Barbería",
      service: c.servicio_nombre,
      date: new Date(c.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: c.hora.slice(0, 5),
      price: Number(c.precio),
      status: mapStatus(c.status),
    }));
  };

  // Formatear citas para BarberBooking
  const formatBarberAppointments = () => {
    return citas.map((c) => ({
      id: String(c.id),
      clientName: `${c.cliente_nombre} ${c.cliente_apellido}`,
      clientAvatar:
        c.cliente_avatar ||
        `https://ui-avatars.com/api/?name=${c.cliente_nombre}&background=D4AF37&color=1A1A1A`,
      clientPhone: c.cliente_telefono || "Sin teléfono",
      service: c.servicio_nombre,
      date: new Date(c.fecha).toLocaleDateString("es-ES", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      time: c.hora.slice(0, 5),
      price: Number(c.precio),
      status: mapStatus(c.status),
      isNewClient: Boolean(c.es_cliente_nuevo),
    }));
  };

  // Mapear status de la BD al formato del componente
  const mapStatus = (status: string) => {
    const map: any = {
      pending: "pending",
      confirmed: "upcoming",
      completed: "completed",
      cancelled: "cancelled",
    };
    return map[status] || "pending";
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.accent} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {rol === "cliente" ? (
        <ClientBooking
          appointments={formatClientAppointments()}
          onRefresh={loadData}
        />
      ) : (
        <BarberBooking
          appointments={formatBarberAppointments()}
          onRefresh={loadData}
        />
      )}
    </View>
  );
}
