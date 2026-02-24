import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import BarberProfile from "../../components/profile/BarberProfile";
import ClientProfile from "../../components/profile/ClientProfile";
import Colors from "../../constants/colors";

export default function ProfileScreen() {
  const router = useRouter();
  const [rol, setRol] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const userStr = await AsyncStorage.getItem("user");
      if (!userStr) {
        router.replace("/(auth)/login");
        return;
      }
      const user = JSON.parse(userStr);
      setRol(user.rol);
    } catch (error) {
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
      {rol === "cliente" ? <ClientProfile /> : <BarberProfile />}
    </View>
  );
}
