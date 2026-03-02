import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BarberHome from "../../components/home/BarberHome";
import ClientHome from "../../components/home/ClientHome";
import Colors from "../../constants/colors";

export default function HomeScreen() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    checkAuthAndRedirect();
  }, []);

  const checkAuthAndRedirect = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      // 🔴 Si NO hay token o usuario → REDIRIGIR AL LOGIN
      if (!userStr || !token) {
        router.replace("/(auth)/login");
        return;
      }

      // ✅ Si HAY token y usuario → CARGAR DATOS
      const user = JSON.parse(userStr);
      setRol(user.rol);
      setUserData(user);
    } catch (error) {
      console.error("Error verificando autenticación:", error);
      router.replace("/(auth)/login");
    } finally {
      setLoading(false);
    }
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
        <ClientHome userData={userData} />
      ) : (
        <BarberHome userData={userData} />
      )}
    </View>
  );
}
