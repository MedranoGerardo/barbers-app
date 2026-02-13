import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { StyleSheet, View } from "react-native";
import Colors from "../../constants/colors";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "600",
          marginBottom: 4,
          letterSpacing: 0.3,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: "#8E8E93",
        tabBarStyle: {
          backgroundColor: "#000000",
          borderTopWidth: 0,
          height: 82,
          paddingTop: 8,
          paddingBottom: 20,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,

          shadowColor: "#000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 10,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Inicio",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Feather
                name="home"
                size={focused ? 24 : 22}
                color={focused ? "#000" : "#8E8E93"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="booking"
        options={{
          title: "Reservar",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <MaterialCommunityIcons
                name={focused ? "calendar-check" : "calendar-blank-outline"}
                size={focused ? 26 : 24}
                color={focused ? "#000" : "#8E8E93"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="products"
        options={{
          title: "Tienda",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Feather
                name="shopping-bag"
                size={focused ? 24 : 22}
                color={focused ? "#000" : "#8E8E93"}
              />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ focused }) => (
            <View
              style={[styles.iconWrapper, focused && styles.iconWrapperActive]}
            >
              <Feather
                name="user"
                size={focused ? 24 : 22}
                color={focused ? "#000" : "#8E8E93"}
              />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  iconWrapperActive: {
    backgroundColor: Colors.accent,
    marginTop: -14,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
});
