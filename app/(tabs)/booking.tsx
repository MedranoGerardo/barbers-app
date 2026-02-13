import { View } from "react-native";
import BarberBooking from "../../components/booking/BarberBooking";
import ClientBooking from "../../components/booking/ClientBooking";
import Colors from "../../constants/colors";

// DATOS MOCK - REEMPLAZAR CON TU API/CONTEXTO
const mockClientAppointments = [
  {
    id: "1",
    barberName: "Juan Pérez",
    barberAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    barbershop: "BarberShop Elite",
    service: "Corte Clásico + Barba",
    date: "15 feb, 2024",
    time: "10:00 AM",
    price: 15,
    status: "upcoming" as const,
  },
  {
    id: "2",
    barberName: "Miguel Torres",
    barberAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    barbershop: "Style Masters",
    service: "Fade Moderno",
    date: "20 feb, 2024",
    time: "3:00 PM",
    price: 12,
    status: "upcoming" as const,
  },
  {
    id: "3",
    barberName: "Carlos Méndez",
    barberAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    barbershop: "Premium Cuts",
    service: "Corte + Diseño",
    date: "10 feb, 2024",
    time: "2:00 PM",
    price: 18,
    status: "completed" as const,
  },
  {
    id: "4",
    barberName: "Luis García",
    barberAvatar:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400",
    barbershop: "Urban Barbers",
    service: "Corte Simple",
    date: "5 feb, 2024",
    time: "11:00 AM",
    price: 10,
    status: "cancelled" as const,
  },
];

const mockBarberAppointments = [
  {
    id: "1",
    clientName: "Roberto Martínez",
    clientAvatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400",
    clientPhone: "+503 7777-1111",
    service: "Corte Fade + Barba",
    date: new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: "9:00 AM",
    price: 15,
    status: "confirmed" as const,
    isNewClient: false,
  },
  {
    id: "2",
    clientName: "Andrés López",
    clientAvatar:
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400",
    clientPhone: "+503 7777-2222",
    service: "Corte Clásico",
    date: new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: "11:00 AM",
    price: 12,
    status: "pending" as const,
    isNewClient: true,
  },
  {
    id: "3",
    clientName: "Fernando Ramírez",
    clientAvatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    clientPhone: "+503 7777-3333",
    service: "Corte + Diseño",
    date: new Date().toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    time: "2:00 PM",
    price: 18,
    status: "confirmed" as const,
    isNewClient: false,
  },
  {
    id: "4",
    clientName: "Diego Hernández",
    clientAvatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400",
    clientPhone: "+503 7777-4444",
    service: "Arreglo de Barba",
    date: "15 feb, 2024",
    time: "10:00 AM",
    price: 8,
    status: "confirmed" as const,
    isNewClient: false,
  },
  {
    id: "5",
    clientName: "Carlos Gómez",
    clientAvatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400",
    clientPhone: "+503 7777-5555",
    service: "Corte Ejecutivo",
    date: "10 feb, 2024",
    time: "4:00 PM",
    price: 20,
    status: "completed" as const,
    isNewClient: false,
  },
];

// SIMULA EL ROL DEL USUARIO - CAMBIA ESTO SEGÚN TU LÓGICA
const userRole: "client" | "barber" = "client"; // Cambia a 'barber' para probar
/*const userRole: "client" | "barber" = "barber"; // Cambia a 'barber' para probar*/

export default function BookingScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {userRole === "client" ? (
        <ClientBooking appointments={mockClientAppointments} />
      ) : (
        <BarberBooking appointments={mockBarberAppointments} />
      )}
    </View>
  );
}
