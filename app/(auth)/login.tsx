import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Colors from "../../constants/colors";

// 👇 CAMBIA ESTA IP POR LA IP DE TU PC EN LA RED LOCAL
// En Windows: abre CMD y escribe "ipconfig", busca "IPv4 Address"
const API_URL = "http://192.168.0.5:3000";

export default function LoginScreen() {
  const router = useRouter();

  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ LOGIN CONECTADO A LA API
  const handleLogin = async () => {
    if (!correo.trim()) {
      Alert.alert("Error", "Por favor ingresa tu correo electrónico");
      return;
    }
    if (!validateEmail(correo)) {
      Alert.alert("Error", "Por favor ingresa un correo electrónico válido");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Error", "Por favor ingresa tu contraseña");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // El servidor respondió con error (401, 403, 500, etc.)
        Alert.alert("Error", data.error || "Error al iniciar sesión");
        return;
      }

      // Guardar token y datos del usuario en AsyncStorage
      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      // Si "recordarme" está activo, guardar el correo
      if (rememberMe) {
        await AsyncStorage.setItem("rememberedEmail", correo);
      } else {
        await AsyncStorage.removeItem("rememberedEmail");
      }

      // Navegar al home
      router.replace("/");
    } catch (error) {
      // Error de red (sin conexión, IP incorrecta, etc.)
      Alert.alert(
        "Error de conexión",
        "No se pudo conectar con el servidor. Verifica tu conexión.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Recuperar Contraseña",
      "Se enviará un enlace a tu correo para restablecer tu contraseña.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Enviar",
          onPress: () => {
            Alert.alert(
              "Éxito",
              "Se ha enviado un correo con las instrucciones",
            );
          },
        },
      ],
    );
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Iniciar Sesión</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Ionicons name="cut" size={50} color={Colors.accent} />
          </View>
          <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
          <Text style={styles.subtitleText}>
            Ingresa tus credenciales para acceder a tu cuenta
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico</Text>
            <View
              style={[
                styles.inputContainer,
                correo && !validateEmail(correo) && styles.inputError,
              ]}
            >
              <Ionicons
                name="mail-outline"
                size={22}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="tu@correo.com"
                value={correo}
                onChangeText={setCorreo}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
              />
              {correo && (
                <TouchableOpacity
                  onPress={() => setCorreo("")}
                  style={styles.clearButton}
                >
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={Colors.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {correo && !validateEmail(correo) && (
              <Text style={styles.errorText}>Formato de correo inválido</Text>
            )}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoComplete="password"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.rememberMe}
              onPress={() => setRememberMe(!rememberMe)}
              activeOpacity={0.7}
            >
              <View style={styles.checkbox}>
                {rememberMe && (
                  <Ionicons
                    name="checkmark"
                    size={16}
                    color={Colors.textPrimary}
                  />
                )}
              </View>
              <Text style={styles.rememberMeText}>Recordarme</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleForgotPassword}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordText}>
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[
              styles.loginButton,
              (!correo || !password || !validateEmail(correo)) &&
                styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={loading || !correo || !password || !validateEmail(correo)}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.loginButtonText}>Iniciar Sesión</Text>
                <Ionicons
                  name="log-in-outline"
                  size={20}
                  color={Colors.textPrimary}
                />
              </>
            )}
          </TouchableOpacity>

          <View style={styles.separator}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>O continúa con</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.socialButtons}>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-google" size={20} color="#DB4437" />
              <Text style={styles.socialButtonText}>Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.socialButton}>
              <Ionicons name="logo-facebook" size={20} color="#4267B2" />
              <Text style={styles.socialButtonText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.registerLink}>
            <Text style={styles.registerText}>¿No tienes una cuenta? </Text>
            <TouchableOpacity
              onPress={() => router.push("/(auth)/register")}
              activeOpacity={0.7}
            >
              <Text style={styles.registerLinkText}>Regístrate aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    paddingBottom: 40,
    minHeight: "100%",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  logoSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  welcomeText: {
    color: Colors.textPrimary,
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitleText: {
    color: Colors.textSecondary,
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  form: {
    paddingHorizontal: 25,
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 5,
  },
  inputError: {
    borderColor: "#ff4444",
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  clearButton: {
    padding: 10,
  },
  eyeButton: {
    padding: 15,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 5,
    marginLeft: 5,
  },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 25,
  },
  rememberMe: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  rememberMeText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  forgotPasswordText: {
    color: Colors.accent,
    fontSize: 14,
    fontWeight: "500",
  },
  loginButton: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    shadowColor: Colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  loginButtonDisabled: {
    opacity: 0.5,
  },
  loginButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  separator: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 25,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  separatorText: {
    color: Colors.textSecondary,
    fontSize: 13,
    marginHorizontal: 15,
  },
  socialButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 15,
  },
  socialButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.card,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  socialButtonText: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 10,
  },
  registerLink: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 30,
    paddingVertical: 10,
  },
  registerText: {
    color: Colors.textSecondary,
    fontSize: 15,
  },
  registerLinkText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: "bold",
    textDecorationLine: "underline",
  },
});
