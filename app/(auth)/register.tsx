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

const API_URL = "http://192.168.0.3:3000";

const getPasswordStrength = (password: string) => {
  if (password.length === 0)
    return { strength: "none", color: Colors.textSecondary };
  if (password.length < 6) return { strength: "Débil", color: "#ff4444" };

  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const conditionsMet = [
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar,
  ].filter(Boolean).length;

  if (conditionsMet >= 3 && password.length >= 8) {
    return { strength: "Segura", color: "#00C851" };
  } else if (conditionsMet >= 2 && password.length >= 6) {
    return { strength: "Buena", color: "#ffbb33" };
  }

  return { strength: "Débil", color: "#ff4444" };
};

const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export default function RegisterScreen() {
  const router = useRouter();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ✅ ROL por defecto: cliente
  const [rol, setRol] = useState<"cliente" | "barbero">("cliente");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [correoError, setCorreoError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordsMatch =
    password === confirmPassword && confirmPassword.length > 0;
  const passwordStrength = getPasswordStrength(password);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/api/auth/check-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo: email }),
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      return false;
    }
  };

  const handleEmailChange = async (email: string) => {
    setCorreo(email);

    if (email.length === 0) {
      setCorreoError("");
      return;
    }
    if (!validateEmail(email)) {
      setCorreoError("Formato de correo inválido");
      return;
    }

    setCorreoError("Verificando...");
    const exists = await checkEmailExists(email);
    setCorreoError(exists ? "Este correo ya está registrado" : "");
  };

  const validateForm = () => {
    if (!nombre.trim()) {
      Alert.alert("Error", "Por favor ingresa tu nombre");
      return false;
    }
    if (!apellido.trim()) {
      Alert.alert("Error", "Por favor ingresa tu apellido");
      return false;
    }
    if (!validateEmail(correo)) {
      Alert.alert("Error", "Por favor ingresa un correo válido");
      return false;
    }
    if (correoError && correoError !== "Verificando...") {
      Alert.alert("Error", "El correo ya está registrado");
      return false;
    }
    if (password.length < 6) {
      Alert.alert("Error", "La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    if (!passwordsMatch) {
      Alert.alert("Error", "Las contraseñas no coinciden");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, apellido, correo, password, rol }), // ✅ rol dinámico
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Error", data.error || "Error al crear la cuenta");
        return;
      }

      await AsyncStorage.setItem("token", data.token);
      await AsyncStorage.setItem("user", JSON.stringify(data.user));

      Alert.alert(
        "¡Registro Exitoso!",
        `Bienvenido${rol === "barbero" ? ", barbero" : ""}! Tu cuenta ha sido creada.`,
        [{ text: "Continuar", onPress: () => router.replace("/") }],
      );
    } catch (error) {
      Alert.alert("Error de conexión", "No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
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
        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* AVATAR */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {nombre && apellido ? (
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {getInitials(nombre, apellido)}
                </Text>
              </View>
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons
                  name="person"
                  size={40}
                  color={Colors.textSecondary}
                />
              </View>
            )}
          </View>
        </View>

        <View style={styles.form}>
          {/* ✅ SELECTOR DE ROL */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Cómo quieres registrarte? *</Text>
            <View style={styles.rolSelector}>
              <TouchableOpacity
                style={[
                  styles.rolOption,
                  rol === "cliente" && styles.rolOptionActive,
                ]}
                onPress={() => setRol("cliente")}
                activeOpacity={0.8}
              >
                {rol === "cliente" && (
                  <View style={styles.rolCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.accent}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.rolIconContainer,
                    rol === "cliente" && styles.rolIconActive,
                  ]}
                >
                  <Ionicons
                    name="person"
                    size={28}
                    color={
                      rol === "cliente"
                        ? Colors.background
                        : Colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.rolTitle,
                    rol === "cliente" && styles.rolTitleActive,
                  ]}
                >
                  Cliente
                </Text>
                <Text style={styles.rolDesc}>Quiero reservar citas</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.rolOption,
                  rol === "barbero" && styles.rolOptionActive,
                ]}
                onPress={() => setRol("barbero")}
                activeOpacity={0.8}
              >
                {rol === "barbero" && (
                  <View style={styles.rolCheck}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={Colors.accent}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.rolIconContainer,
                    rol === "barbero" && styles.rolIconActive,
                  ]}
                >
                  <Ionicons
                    name="cut"
                    size={28}
                    color={
                      rol === "barbero"
                        ? Colors.background
                        : Colors.textSecondary
                    }
                  />
                </View>
                <Text
                  style={[
                    styles.rolTitle,
                    rol === "barbero" && styles.rolTitleActive,
                  ]}
                >
                  Barbero
                </Text>
                <Text style={styles.rolDesc}>Quiero ofrecer servicios</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* NOMBRE */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* APELLIDO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="person-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu apellido"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
              />
            </View>
          </View>

          {/* CORREO */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="mail-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="ejemplo@correo.com"
                value={correo}
                onChangeText={handleEmailChange}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            {correoError ? (
              <Text
                style={[
                  styles.errorText,
                  {
                    color:
                      correoError === "Verificando..."
                        ? Colors.accent
                        : "#ff4444",
                  },
                ]}
              >
                {correoError}
              </Text>
            ) : correo && validateEmail(correo) ? (
              <Text style={styles.successText}>✓ Correo disponible</Text>
            ) : null}
          </View>

          {/* CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthIndicator}>
                  <View
                    style={[
                      styles.strengthBar,
                      {
                        width:
                          passwordStrength.strength === "Débil"
                            ? "33%"
                            : passwordStrength.strength === "Buena"
                              ? "66%"
                              : "100%",
                        backgroundColor: passwordStrength.color,
                      },
                    ]}
                  />
                </View>
                <Text
                  style={[
                    styles.strengthText,
                    { color: passwordStrength.color },
                  ]}
                >
                  {passwordStrength.strength}
                </Text>
              </View>
            )}

            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>
                La contraseña debe contener:
              </Text>
              {[
                { test: password.length >= 6, label: "Mínimo 6 caracteres" },
                { test: /[A-Z]/.test(password), label: "Una mayúscula" },
                { test: /\d/.test(password), label: "Un número" },
              ].map((req, i) => (
                <View key={i} style={styles.requirementItem}>
                  <Ionicons
                    name={req.test ? "checkmark-circle" : "ellipse-outline"}
                    size={14}
                    color={req.test ? "#00C851" : Colors.textSecondary}
                  />
                  <Text style={styles.requirementText}>{req.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* CONFIRMAR CONTRASEÑA */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons
                name="lock-closed-outline"
                size={20}
                color={Colors.textSecondary}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons
                  name={passwordsMatch ? "checkmark-circle" : "close-circle"}
                  size={16}
                  color={passwordsMatch ? "#00C851" : "#ff4444"}
                />
                <Text
                  style={[
                    styles.matchText,
                    { color: passwordsMatch ? "#00C851" : "#ff4444" },
                  ]}
                >
                  {passwordsMatch
                    ? "Las contraseñas coinciden"
                    : "Las contraseñas no coinciden"}
                </Text>
              </View>
            )}
          </View>

          {/* BOTÓN */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!nombre ||
                !apellido ||
                !validateEmail(correo) ||
                !!correoError ||
                password.length < 6 ||
                !passwordsMatch) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={
              loading ||
              !nombre ||
              !apellido ||
              !validateEmail(correo) ||
              !!correoError ||
              password.length < 6 ||
              !passwordsMatch
            }
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Crear Cuenta Gratis</Text>
                <Ionicons
                  name="arrow-forward"
                  size={20}
                  color={Colors.textPrimary}
                />
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros{" "}
            <Text style={styles.termsLink}>Términos de Servicio</Text> y{" "}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>

          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes una cuenta?{" "}
              <Text style={styles.loginLinkText}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  scrollContent: { paddingBottom: 40 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
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
  avatarSection: { alignItems: "center", marginBottom: 30 },
  avatarContainer: { marginBottom: 10 },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(212, 175, 55, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: Colors.textPrimary, fontSize: 32, fontWeight: "bold" },
  form: { paddingHorizontal: 20 },
  inputGroup: { marginBottom: 20 },
  label: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  // ✅ SELECTOR DE ROL
  rolSelector: { flexDirection: "row", gap: 12 },
  rolOption: {
    flex: 1,
    alignItems: "center",
    padding: 18,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
    position: "relative",
  },
  rolOptionActive: {
    borderColor: Colors.accent,
    backgroundColor: "rgba(212, 175, 55, 0.08)",
  },
  rolCheck: { position: "absolute", top: 8, right: 8 },
  rolIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  rolIconActive: { backgroundColor: Colors.accent },
  rolTitle: {
    color: Colors.textSecondary,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  rolTitleActive: { color: Colors.textPrimary },
  rolDesc: { color: Colors.textSecondary, fontSize: 11, textAlign: "center" },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  inputIcon: { marginLeft: 15 },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  eyeButton: { padding: 15 },
  errorText: { fontSize: 12, marginTop: 5 },
  successText: { color: "#00C851", fontSize: 12, marginTop: 5 },
  passwordStrength: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  strengthIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 2,
    overflow: "hidden",
    marginRight: 10,
  },
  strengthBar: { height: "100%", borderRadius: 2 },
  strengthText: { fontSize: 12, fontWeight: "600" },
  passwordRequirements: {
    marginTop: 15,
    backgroundColor: "rgba(255,255,255,0.05)",
    padding: 15,
    borderRadius: 12,
  },
  requirementsTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  requirementItem: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  requirementText: { color: Colors.textSecondary, fontSize: 12, marginLeft: 8 },
  matchIndicator: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  matchText: { fontSize: 12, marginLeft: 6 },
  submitButton: {
    backgroundColor: Colors.accent,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
  },
  submitButtonDisabled: { opacity: 0.5 },
  submitButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
    marginRight: 10,
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: { color: Colors.accent, textDecorationLine: "underline" },
  loginLink: { marginTop: 25, alignItems: "center" },
  loginText: { color: Colors.textSecondary, fontSize: 14 },
  loginLinkText: { color: Colors.accent, fontWeight: "600" },
});
