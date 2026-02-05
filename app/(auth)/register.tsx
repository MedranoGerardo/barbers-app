import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { useRouter } from 'expo-router';

// Función para validar fortaleza de contraseña
const getPasswordStrength = (password: string) => {
  if (password.length === 0) return { strength: 'none', color: Colors.textSecondary };
  if (password.length < 6) return { strength: 'Débil', color: '#ff4444' };
  
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  const conditionsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;
  
  if (conditionsMet >= 3 && password.length >= 8) {
    return { strength: 'Segura', color: '#00C851' };
  } else if (conditionsMet >= 2 && password.length >= 6) {
    return { strength: 'Buena', color: '#ffbb33' };
  }
  
  return { strength: 'Débil', color: '#ff4444' };
};

// Función para generar iniciales
const getInitials = (firstName: string, lastName: string) => {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

export default function RegisterScreen() {
  const router = useRouter();
  
  // Estados para los campos del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Estados para validaciones
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [correoError, setCorreoError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Validar si las contraseñas coinciden
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;
  
  // Obtener fortaleza de la contraseña
  const passwordStrength = getPasswordStrength(password);
  
  // Validar formato de correo
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  
  // Verificar si el correo ya existe (simulación)
  const checkEmailExists = async (email: string): Promise<boolean> => {
    // En una implementación real, harías una llamada a tu API
    // Por ahora simulamos una respuesta
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simulación: correo ya existe
    const existingEmails = ['test@example.com', 'usuario@dominio.com'];
    return existingEmails.includes(email);
  };
  
  // Validar correo en tiempo real
  const handleEmailChange = async (email: string) => {
    setCorreo(email);
    
    if (email.length === 0) {
      setCorreoError('');
      return;
    }
    
    if (!validateEmail(email)) {
      setCorreoError('Formato de correo inválido');
      return;
    }
    
    setCorreoError('Verificando...');
    const exists = await checkEmailExists(email);
    
    if (exists) {
      setCorreoError('Este correo ya está registrado');
    } else {
      setCorreoError('');
    }
  };
  
  // Validar formulario completo
  const validateForm = () => {
    let isValid = true;
    
    if (!nombre.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu nombre');
      isValid = false;
    }
    
    if (!apellido.trim()) {
      Alert.alert('Error', 'Por favor ingresa tu apellido');
      isValid = false;
    }
    
    if (!validateEmail(correo)) {
      Alert.alert('Error', 'Por favor ingresa un correo válido');
      isValid = false;
    }
    
    if (correoError) {
      Alert.alert('Error', 'El correo ya está registrado');
      isValid = false;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      isValid = false;
    }
    
    if (!passwordsMatch) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      isValid = false;
    }
    
    return isValid;
  };
  
  // Enviar formulario
  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Aquí iría tu llamada a la API para registrar el usuario
      const userData = {
        nombre,
        apellido,
        correo,
        password,
        rol: 'cliente',
        estado: 'activo',
        // foto_perfil puede ser opcional, puedes enviar null o un valor por defecto
      };
      
      // Simulación de registro exitoso
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        '¡Registro Exitoso!',
        'Tu cuenta ha sido creada correctamente',
        [
          {
            text: 'Continuar',
            onPress: () => router.push('../index')
          }
        ]
      );
      
    } catch (error) {
      Alert.alert('Error', 'Hubo un problema al crear tu cuenta');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Encabezado con flecha de regreso */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Crear Cuenta</Text>
          <View style={{ width: 40 }} /> {/* Espacio para centrar el título */}
        </View>
        
        {/* Avatar con iniciales */}
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
                <Ionicons name="person" size={40} color={Colors.textSecondary} />
              </View>
            )}
          </View>

        </View>
        
        {/* Formulario */}
        <View style={styles.form}>
          {/* Nombre */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu nombre"
                value={nombre}
                onChangeText={setNombre}
                autoCapitalize="words"
              />
            </View>
          </View>
          
          {/* Apellido */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Apellido *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Ingresa tu apellido"
                value={apellido}
                onChangeText={setApellido}
                autoCapitalize="words"
              />
            </View>
          </View>
          
          {/* Correo */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Correo Electrónico *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
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
              <Text style={[
                styles.errorText,
                { color: correoError === 'Verificando...' ? Colors.accent : '#ff4444' }
              ]}>
                {correoError}
              </Text>
            ) : correo && validateEmail(correo) ? (
              <Text style={styles.successText}>✓ Correo disponible</Text>
            ) : null}
          </View>
          
          {/* Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
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
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Indicador de fortaleza */}
            {password.length > 0 && (
              <View style={styles.passwordStrength}>
                <View style={styles.strengthIndicator}>
                  <View 
                    style={[
                      styles.strengthBar,
                      { 
                        width: passwordStrength.strength === 'Débil' ? '33%' :
                               passwordStrength.strength === 'Buena' ? '66%' : '100%',
                        backgroundColor: passwordStrength.color
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.strength}
                </Text>
              </View>
            )}
            
            {/* Requisitos de contraseña */}
            <View style={styles.passwordRequirements}>
              <Text style={styles.requirementsTitle}>La contraseña debe contener:</Text>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={password.length >= 6 ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={14} 
                  color={password.length >= 6 ? '#00C851' : Colors.textSecondary} 
                />
                <Text style={styles.requirementText}>Mínimo 6 caracteres</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/[A-Z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={14} 
                  color={/[A-Z]/.test(password) ? '#00C851' : Colors.textSecondary} 
                />
                <Text style={styles.requirementText}>Una mayúscula</Text>
              </View>
              <View style={styles.requirementItem}>
                <Ionicons 
                  name={/\d/.test(password) ? 'checkmark-circle' : 'ellipse-outline'} 
                  size={14} 
                  color={/\d/.test(password) ? '#00C851' : Colors.textSecondary} 
                />
                <Text style={styles.requirementText}>Un número</Text>
              </View>
            </View>
          </View>
          
          {/* Confirmar Contraseña */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmar Contraseña *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.textSecondary} style={styles.inputIcon} />
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
                  name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            
            {/* Indicador de coincidencia */}
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons
                  name={passwordsMatch ? 'checkmark-circle' : 'close-circle'}
                  size={16}
                  color={passwordsMatch ? '#00C851' : '#ff4444'}
                />
                <Text style={[
                  styles.matchText,
                  { color: passwordsMatch ? '#00C851' : '#ff4444' }
                ]}>
                  {passwordsMatch ? 'Las contraseñas coinciden' : 'Las contraseñas no coinciden'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Botón de registro */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!nombre || !apellido || !validateEmail(correo) || correoError || password.length < 6 || !passwordsMatch) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={loading || !nombre || !apellido || !validateEmail(correo) || !!correoError || password.length < 6 || !passwordsMatch}
          >
            {loading ? (
              <ActivityIndicator color={Colors.textPrimary} />
            ) : (
              <>
                <Text style={styles.submitButtonText}>Crear Cuenta Gratis</Text>
                <Ionicons name="arrow-forward" size={20} color={Colors.textPrimary} />
              </>
            )}
          </TouchableOpacity>
          
          {/* Enlace a términos y condiciones */}
          <Text style={styles.termsText}>
            Al registrarte, aceptas nuestros{' '}
            <Text style={styles.termsLink}>Términos de Servicio</Text> y{' '}
            <Text style={styles.termsLink}>Política de Privacidad</Text>
          </Text>
          
          {/* Ya tienes cuenta */}
          <TouchableOpacity
            style={styles.loginLink}
            onPress={() => router.push('/(auth)/login')}
          >
            <Text style={styles.loginText}>
              ¿Ya tienes una cuenta? <Text style={styles.loginLinkText}>Inicia sesión</Text>
            </Text>
          </TouchableOpacity>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: Colors.textPrimary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: Colors.textPrimary,
    fontSize: 32,
    fontWeight: 'bold',
  },
  avatarHint: {
    color: Colors.textSecondary,
    fontSize: 14,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    color: Colors.textPrimary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputIcon: {
    marginLeft: 15,
  },
  input: {
    flex: 1,
    color: Colors.textPrimary,
    fontSize: 16,
    paddingVertical: 15,
    paddingHorizontal: 12,
  },
  eyeButton: {
    padding: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 5,
  },
  successText: {
    color: '#00C851',
    fontSize: 12,
    marginTop: 5,
  },
  passwordStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  strengthIndicator: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginRight: 10,
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
  },
  passwordRequirements: {
    marginTop: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 12,
  },
  requirementsTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginBottom: 8,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  requirementText: {
    color: Colors.textSecondary,
    fontSize: 12,
    marginLeft: 8,
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  matchText: {
    fontSize: 12,
    marginLeft: 6,
  },
  submitButton: {
    backgroundColor: Colors.accent,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 14,
    marginTop: 10,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: Colors.textPrimary,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 10,
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: Colors.accent,
    textDecorationLine: 'underline',
  },
  loginLink: {
    marginTop: 25,
    alignItems: 'center',
  },
  loginText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
  loginLinkText: {
    color: Colors.accent,
    fontWeight: '600',
  },
});