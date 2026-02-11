import { View } from "react-native";
import BarberProfile from "../../components/profile/BarberProfile";
import ClientProfile from "../../components/profile/ClientProfile";
import Colors from "../../constants/colors";

// ESTE DATO VENDRÍA DE TU ESTADO GLOBAL, CONTEXTO O API
// Por ahora lo simulamos aquí
const mockUser = {
  name: "Carlos Rodríguez",
  email: "carlos@example.com",
  phone: "+503 7777-7777",
  role: "client" as "client" | "barber", // CAMBIA ESTO PARA PROBAR: 'client' o 'barber'
  //role: "barber" as "client" | "barber", // Ahora verás el perfil de barbero
  avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
  memberSince: "Enero 2024",
  // Datos para barberos
  barbershop: "BarberShop Elite",
  rating: 4.9,
  totalCuts: 342,
  thisWeekAppointments: 18,
  monthlyEarnings: 1250,
  totalClients: 127,
};

export default function ProfileScreen() {
  // Aquí decides qué perfil mostrar según el rol del usuario
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {mockUser.role === "client" ? (
        <ClientProfile user={mockUser} />
      ) : (
        <BarberProfile user={mockUser} />
      )}
    </View>
  );
}
