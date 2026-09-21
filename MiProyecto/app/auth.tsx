import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { RecaptchaWidget } from '../components/RecaptchaWidget';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator,
  Modal, 
  FlatList, 
  TouchableWithoutFeedback 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { fichasService, type Ficha } from '../services/fichasService';
import { validatePassword, validatePasswordMatch, isDisposableEmail } from '../utils/validation';
import { saveRememberedAuth, getRememberedAuth, removeRememberedAuth } from '../utils/storage';

WebBrowser.maybeCompleteAuthSession();



export default function AuthScreen() {
  const { user, isLoading, login, register, logout, setSession } = useAuth();
  // reCAPTCHA v2 State & Ref
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const recaptchaRef = useRef<any>(null);

  // Screen state: 'login' (default) | 'register'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginCorreo, setLoginCorreo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isCapsLockOn, setIsCapsLockOn] = useState(false);

  // Register Form State
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regTipoDocumento, setRegTipoDocumento] = useState('');
  const [regDocumento, setRegDocumento] = useState('');
  const [regFicha, setRegFicha] = useState('');
  const [regPrograma, setRegPrograma] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Feedback Messages
  const [feedback, setFeedback] = useState<{ text: string; type: 'error' | 'success' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos académicos para Aprendices
  const [regFichaNumero, setRegFichaNumero] = useState('');
  const [regSede, setRegSede] = useState('');
  const [regTrimestre, setRegTrimestre] = useState('');
  const [fichaEncontrada, setFichaEncontrada] = useState<Ficha | null>(null);
  const [buscandoFicha, setBuscandoFicha] = useState(false);
  const [fichasDisponibles, setFichasDisponibles] = useState<Ficha[]>([]);
  const [mostrarSelectorFicha, setMostrarSelectorFicha] = useState(false);

  // Detección automática del rol a partir del dominio del correo
  const regDomain = regCorreo.trim().split('@')[1]?.toLowerCase() || '';
  const isInstructor = regDomain === 'sena.edu.co';
  const isAprendiz = regDomain === 'soy.sena.edu.co' || regDomain === 'misena.edu.co' || regDomain === 'gmail.com' || regDomain === 'formacionsena.edu.co';
  const esAprendiz = !isInstructor;

  const buscarFichas = useCallback(async (texto: string = '') => {
    setBuscandoFicha(true);
    try {
      const fichas = await fichasService.getFichas({ search: texto.trim() });
      setFichasDisponibles(fichas);
      if (texto.trim().length >= 3) {
        const exacta = fichas.find((f) => 
          f.numero.toLowerCase() === texto.trim().toLowerCase() ||
          f.numero.includes(texto.trim())
        );
        if (exacta) {
          setFichaEncontrada(exacta);
          setRegPrograma(exacta.programaNombre || '');
          setRegFicha(exacta.numero);
        } else {
          setFichaEncontrada(null);
        }
      } else if (!texto.trim()) {
        setFichaEncontrada(null);
      }
    } catch {
      setFichasDisponibles([]);
    } finally {
      setBuscandoFicha(false);
    }
  }, []);

  useEffect(() => {
    if (!esAprendiz) {
      setRegFichaNumero('');
      setRegSede('');
      setRegTrimestre('');
      setFichaEncontrada(null);
    }
  }, [esAprendiz]);

  // Cargar credenciales guardadas si 'Recordar mis datos' estaba activo
  useEffect(() => {
    const loadRememberedAuth = async () => {
      try {
        const saved = await getRememberedAuth();
        if (saved && saved.remember) {
          if (saved.correo) setLoginCorreo(saved.correo.trim().toLowerCase());
          if (saved.contrasenia) setLoginPassword(saved.contrasenia);
          setRememberMe(true);
        }
      } catch (err) {
        console.error('Error al cargar datos recordados:', err);
      }
    };
    loadRememberedAuth();
  }, []);

  // Validación de la contraseña en tiempo real para Registro
  const passValidation = validatePassword(regPassword);
  const passMatches = validatePasswordMatch(regPassword, regConfirmPassword);

  const hasAllowedEmailDomain = (email: string, role: 'INSTRUCTOR' | 'APRENDIZ') => {
    const normalizedEmail = email.trim().toLowerCase();
    return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(normalizedEmail);
  };

  

 const [request, response, promptAsync] = Google.useAuthRequest({
    webClientId:
      process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
      '801203695881-vjkbm79n28utn02fkiei3tmrieqmkd37.apps.googleusercontent.com',
    androidClientId:
      process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ||
      '801203695881-gv5vvikcfpbjkpvthpqd1babkk512b4h.apps.googleusercontent.com',
    iosClientId:
      process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ||
      '801203695881-vjkbm79n28utn02fkiei3tmrieqmkd37.apps.googleusercontent.com',
    responseType: 'id_token',
    scopes: ['openid', 'profile', 'email'],
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'miproyecto',
      preferLocalhost: true,
    }),
  });
useEffect(() => {
  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      const token =
        response.authentication?.idToken ??
        response.params?.id_token ??
        response.authentication?.accessToken ??
        response.params?.access_token;

      if (!token) {
        setFeedback({
          text: 'No se pudo obtener el token de Google.',
          type: 'error',
        });
        return;
      }

      const res = await authService.googleLogin(token);

      if (res.success && res.user) {
        setSession(res.user);
      } else {
        setFeedback({
          text: res.message || 'Error al iniciar sesión con Google.',
          type: 'error',
        });
      }
    } else if (response?.type === 'error') {
      setFeedback({
        text: 'Google canceló o rechazó la autenticación.',
        type: 'error',
      });
    }
  };

  handleGoogleResponse();
}, [response, setSession]);

  useEffect(() => {
    if (user) {
      const destination =
        user.role === 'INSTRUCTOR'
          ? '/instructor/inicio'
          : user.role === 'ADMIN' || user.role === 'SUPERADMIN'
          ? '/admin'
          : '/aprendiz';
      router.replace(destination as any);
    }
  }, [user]);

  const handleMagicLink = async () => {
  if (!loginCorreo) {
    setFeedback({ text: 'Ingresa tu correo primero para recibir el enlace.', type: 'error' });
    return;
  }
  const res = await authService.sendMagicLink(loginCorreo);
  setFeedback({ text: res.message || '', type: res.success ? 'success' : 'error' });
};

  const handleLogin = async () => {
    setFeedback(null);
    if (!loginCorreo || !loginPassword) {
      setFeedback({ text: 'Por favor completa todos los campos.', type: 'error' });
      return;
    }

    if (!hasAllowedEmailDomain(loginCorreo, 'APRENDIZ')) {
      setFeedback({
        text: 'Por favor ingresa un correo electrónico válido.',
        type: 'error',
      });
      return;
    }

    // reCAPTCHA v2 Checkbox Obligatorio en Web
    if (Platform.OS === 'web' && !captchaToken) {
      setFeedback({ text: 'Por favor marca la casilla "No soy un robot" para continuar.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const res = await login({
      correo: loginCorreo.trim().toLowerCase(),
      contrasenia: loginPassword,
    });
    setIsSubmitting(false);

    if (!res.success) {
      setFeedback({ text: res.message || 'Error al iniciar sesión', type: 'error' });
    } else {
      // Guardar o eliminar credenciales según estado de Recordar mis datos
      if (rememberMe) {
        await saveRememberedAuth({
          correo: loginCorreo.trim().toLowerCase(),
          contrasenia: loginPassword,
          remember: true,
        });
      } else {
        await removeRememberedAuth();
      }
      setFeedback({ text: res.message || '¡Sesión iniciada correctamente!', type: 'success' });
    }
  };

  // Web security: ensure password plain-text is never exposed as a DOM content attribute in DevTools inspector
  const secureInputRef = (node: any) => {
    if (Platform.OS === 'web' && node) {
      try {
        const el = (typeof node.focus === 'function' && typeof node.removeAttribute === 'function')
          ? node
          : (node?.target || null);
        if (el && typeof el.removeAttribute === 'function') {
          el.removeAttribute('value');
          if (!el._aims_observer && typeof MutationObserver !== 'undefined') {
            const obs = new MutationObserver(() => {
              if (el.hasAttribute('value')) {
                el.removeAttribute('value');
              }
            });
            obs.observe(el, { attributes: true, attributeFilter: ['value'] });
            el._aims_observer = obs;
          }
        }
      } catch {}
    }
  };

  const handleRegister = async () => {
    setFeedback(null);

    // reCAPTCHA v2 Checkbox Obligatorio en Web
    if (Platform.OS === 'web' && !captchaToken) {
      setFeedback({ text: 'Por favor marca la casilla "No soy un robot" para continuar.', type: 'error' });
      return;
    }

    if (!regNombre.trim() || !regCorreo.trim() || !regPassword || !regConfirmPassword) {
      setFeedback({ text: 'Por favor completa todos los campos del formulario.', type: 'error' });
      return;
    }

    const domain = regCorreo.trim().split('@')[1]?.toLowerCase();
    const isInstructorDomain = domain === 'sena.edu.co';
    const isAprendizDomain = domain === 'soy.sena.edu.co' || domain === 'misena.edu.co' || domain === 'gmail.com' || domain === 'formacionsena.edu.co';

    if (!isInstructorDomain && !isAprendizDomain) {
      setFeedback({
        text: 'Dominio de correo no permitido. Usa @sena.edu.co para Instructor, o @soy.sena.edu.co / @gmail.com para Aprendiz.',
        type: 'error',
      });
      return;
    }

    const role: 'INSTRUCTOR' | 'APRENDIZ' = isInstructorDomain ? 'INSTRUCTOR' : 'APRENDIZ';

    if (role === 'APRENDIZ' && (!regTipoDocumento || !regDocumento.trim())) {
      setFeedback({ text: 'Por favor completa tus datos de documento (Tipo y Número de documento).', type: 'error' });
      return;
    }

    if (!passValidation.isValid) {
      setFeedback({ text: 'La contraseña no cumple con los requisitos de seguridad: ' + passValidation.errors.join(', '), type: 'error' });
      return;
    }

    if (!passMatches) {
      setFeedback({ text: 'Las contraseñas ingresadas no coinciden.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    const resolvedFichaNumero = (regFichaNumero.trim() || regFicha.trim());
    const res = await register({
      nombre: regNombre.trim(),
      correo: regCorreo.trim(),
      contrasenia: regPassword,
      confirmContrasenia: regConfirmPassword,
      role: role,
      tipoDocumento: role === 'APRENDIZ' ? regTipoDocumento : undefined,
      documento: role === 'APRENDIZ' ? regDocumento.trim() : undefined,
      ficha: role === 'APRENDIZ' ? (resolvedFichaNumero || undefined) : undefined,
      programa: role === 'APRENDIZ' ? (regPrograma.trim() || fichaEncontrada?.programaNombre || undefined) : undefined,
      academicData: role === 'APRENDIZ' ? {
        fichaId: fichaEncontrada?.id || undefined,
        fichaNumero: resolvedFichaNumero || undefined,
        sede: regSede.trim() || undefined,
        trimestre: regTrimestre ? Number(regTrimestre) : undefined,
      } : undefined,
    });

    if (!res.success) {
      setIsSubmitting(false);
      setFeedback({ text: res.message || 'Error al registrar la cuenta.', type: 'error' });
    } else {
      setFeedback({ text: '¡Cuenta creada con éxito! Entrando al sistema...', type: 'success' });
      const loginRes = await login({
        correo: regCorreo.trim(),
        contrasenia: regPassword,
      });
      setIsSubmitting(false);
      if (!loginRes.success) {
        setLoginCorreo(regCorreo.trim());
        setFeedback({ text: '¡Cuenta creada! Ya puedes iniciar sesión con tus credenciales.', type: 'success' });
        setCurrentScreen('login');
      }
    }
  };
  return (
    <View style={styles.outerContainer}>
      {/* Dark Academia Deep Midnight Navy Gradient */}
      <LinearGradient
        colors={['#020308', '#070C20', '#0E1738', '#141E47', '#050816']}
        locations={[0, 0.25, 0.55, 0.8, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Dark Academia Satin Gold & Sapphire Ambient Glow Orbs */}
      <View style={[styles.glowOrb, styles.goldSatinSpotlight]} />
      <View style={[styles.glowOrb, styles.sapphireGlowCenter]} />
      <View style={[styles.glowOrb, styles.amberGoldGlowBottom]} />
      <View style={[styles.glowOrb, styles.radialCenterHalo]} />

      {/* Academic Constellation Star Dust Dots */}
      <View style={[styles.constellationDot, { top: '12%', left: '18%' }]} />
      <View style={[styles.constellationDot, { top: '28%', right: '15%' }]} />
      <View style={[styles.constellationDot, { top: '55%', left: '10%' }]} />
      <View style={[styles.constellationDot, { top: '78%', right: '22%' }]} />
      <View style={[styles.constellationDot, { top: '85%', left: '30%' }]} />

      {/* Floating Academic & Tech Constellation Seals */}
      <View style={[styles.techNode, styles.techNodeGold, { top: '14%', right: '7%' }]}>
        <Ionicons name="book-outline" size={20} color="#D4AF37" />
      </View>
      <View style={[styles.techNode, styles.techNodeBlue, { top: '38%', right: '4%' }]}>
        <Ionicons name="git-network-outline" size={22} color="#60A5FA" />
      </View>
      <View style={[styles.techNode, styles.techNodeGold, { top: '72%', right: '8%' }]}>
        <Ionicons name="school-outline" size={20} color="#E5C158" />
      </View>
      <View style={[styles.techNode, styles.techNodeBlue, { top: '20%', left: '5%' }]}>
        <Ionicons name="hardware-chip-outline" size={20} color="#60A5FA" />
      </View>
      <View style={[styles.techNode, styles.techNodeGold, { top: '66%', left: '6%' }]}>
        <Ionicons name="code-slash-outline" size={20} color="#D4AF37" />
      </View>

      <SafeAreaView style={styles.safeArea}>
        {/* Top Header Bar */}
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Image 
              source={require('../assets/images/logo.jpeg')} 
              style={styles.headerLogo} 
              resizeMode="contain" 
            />
            <View style={styles.headerTextGroup}>
              <Text style={styles.headerTitle}>ACADEMIC INTELLIGENT</Text>
              <Text style={styles.headerSubtitle}>MANAGEMENT SYSTEM</Text>
            </View>
          </View>
          <Text style={styles.headerRightText}>AIMS</Text>
        </View>

        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flexContainer}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Loading Indicator */}
            {(isLoading || isSubmitting) && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C59427" />
                <Text style={styles.loadingText}>
                  {isLoading ? 'Verificando sesión...' : 'Procesando solicitud...'}
                </Text>
              </View>
            )}

            {/* Banner de Feedback Error/Éxito */}
            {feedback && !isLoading && !isSubmitting && (
              <View style={[styles.feedbackBanner, feedback.type === 'error' ? styles.feedbackError : styles.feedbackSuccess]}>
                <Ionicons 
                  name={feedback.type === 'error' ? 'alert-circle-outline' : 'checkmark-circle-outline'} 
                  size={20} 
                  color={feedback.type === 'error' ? '#EF4444' : '#10B981'} 
                />
                <Text style={[styles.feedbackText, feedback.type === 'error' ? styles.feedbackTextError : styles.feedbackTextSuccess]}>
                  {feedback.text}
                </Text>
              </View>
            )}

            {/* ================= USUARIO AUTENTICADO ================= */}
            {user ? (
              <View style={styles.lightCard}>
                <View style={styles.lightLogoContainer}>
                  <Image 
                    source={require('../assets/images/logo.jpeg')} 
                    style={styles.lightLogoImg} 
                    resizeMode="contain" 
                  />
                  <Text style={styles.lightLogoText}>AIMS</Text>
                </View>

                <Text style={styles.cardTitleLight}>¡Bienvenido/a!</Text>
                <Text style={styles.userNameText}>{user.nombre}</Text>
                <Text style={styles.userEmailText}>{user.correo}</Text>

                <TouchableOpacity 
                  style={styles.primaryActionButton} 
                  activeOpacity={0.85} 
                  onPress={() => {
                    const destination =
                      user.role === 'INSTRUCTOR'
                        ? '/instructor/inicio'
                        : user.role === 'ADMIN'
                        ? '/admin'
                        : '/aprendiz';
                    router.replace(destination as any);
                  }}
                >
                  <Ionicons name="enter-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.primaryActionText}>INGRESAR AL SISTEMA</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.logoutButton} activeOpacity={0.85} onPress={logout}>
                  <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.logoutButtonText}>CERRAR SESIÓN</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {/* ================= INICIO DE SESIÓN (DEFAULT) ================= */}
                {currentScreen === 'login' && (
                  <View style={styles.lightCard}>
                    <View style={styles.lightLogoContainer}>
                      <Image 
                        source={require('../assets/images/logo.jpeg')} 
                        style={styles.lightLogoImg} 
                        resizeMode="contain" 
                      />
                      <Text style={styles.lightLogoText}>AIMS</Text>
                    </View>

                    <Text style={styles.cardTitleLight}>INICIO DE SESIÓN</Text>

                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelLight}>Correo Electrónico</Text>
                      <View style={styles.borderedInputWrapper}>
                        <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.borderedInput}
                          placeholder="usuario@correo.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          autoCorrect={false}
                          value={loginCorreo}
                          onChangeText={(val) => setLoginCorreo(val.trim().toLowerCase())}
                          onBlur={() => setLoginCorreo((prev) => prev.trim().toLowerCase())}
                        />
                      </View>
                    </View>

                    {/* Contraseña */}
                    <View style={styles.fieldGroup}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={styles.labelLight}>Contraseña</Text>
                        <Text style={{ fontSize: 11, color: '#64748B' }}>Distingue mayúsculas (A ≠ a)</Text>
                      </View>
                      <View style={[
                        styles.borderedInputWrapper,
                        feedback?.type === 'error' && (feedback.text.toLowerCase().includes('contraseña') || feedback.text.toLowerCase().includes('mayúscula')) ? { borderColor: '#EF4444', borderWidth: 1.5, backgroundColor: '#FEF2F2' } : null
                      ]}>
                        <Ionicons 
                          name="lock-closed" 
                          size={18} 
                          color={feedback?.type === 'error' && (feedback.text.toLowerCase().includes('contraseña') || feedback.text.toLowerCase().includes('mayúscula')) ? '#EF4444' : '#475569'} 
                          style={styles.fieldIcon} 
                        />
                        <TextInput
                          ref={secureInputRef}
                          style={styles.borderedInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showLoginPassword}
                          value={loginPassword}
                          autoComplete="current-password"
                          textContentType="password"
                          autoCorrect={false}
                          spellCheck={false}
                          onChangeText={(val) => {
                            setLoginPassword(val);
                            if (feedback?.type === 'error') setFeedback(null);
                          }}
                          // @ts-ignore
                          onKeyPress={(e: any) => {
                            if (Platform.OS === 'web' && e?.nativeEvent) {
                              const caps = e.nativeEvent.getModifierState?.('CapsLock');
                              if (typeof caps === 'boolean') setIsCapsLockOn(caps);
                            }
                          }}
                        />
                        <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)}>
                          <Ionicons name={showLoginPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                      {isCapsLockOn && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, backgroundColor: '#FEF9C3', padding: 8, borderRadius: 8 }}>
                          <Ionicons name="warning-outline" size={14} color="#CA8A04" />
                          <Text style={{ fontSize: 12, color: '#A16207', fontWeight: '600' }}>
                            Bloq Mayús (Caps Lock) está activado en tu teclado
                          </Text>
                        </View>
                      )}
                      {feedback?.type === 'error' && feedback.text.toLowerCase().includes('mayúscula') && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 6, backgroundColor: '#FEF2F2', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#FECACA' }}>
                          <Ionicons name="alert-circle" size={15} color="#DC2626" />
                          <Text style={{ fontSize: 11, color: '#DC2626', fontWeight: '600', flex: 1 }}>
                            {feedback.text}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Options Row: Checkbox & Forgot Password */}
                    <View style={styles.optionsRow}>
                      <TouchableOpacity 
                        style={styles.checkboxRow} 
                        activeOpacity={0.7}
                        onPress={() => setRememberMe(!rememberMe)}
                      >
                        <Ionicons 
                          name={rememberMe ? "checkbox" : "square-outline"} 
                          size={18} 
                          color={rememberMe ? "#C59427" : "#64748B"} 
                        />
                        <Text style={styles.rememberText}>Recordar mis datos</Text>
                      </TouchableOpacity>

                     <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('../forgot-password')}>
  <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
</TouchableOpacity>
                    </View>

                    {/* reCAPTCHA v2 Checkbox Widget */}
                    <RecaptchaWidget
                      ref={recaptchaRef}
                      theme="light"
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />

                    {/* Submit Login Button */}
                    <TouchableOpacity style={styles.goldButton} activeOpacity={0.85} onPress={handleLogin}>
                      <Text style={styles.goldButtonText}>INICIAR SESIÓN →</Text>
                    </TouchableOpacity>

                    {/* Social Login Separator */}
                    <View style={styles.dividerRow}>
                      <View style={styles.dividerLine} />
                      <Text style={styles.dividerText}>O inicia sesión con:</Text>
                      <View style={styles.dividerLine} />
                    </View>

                    {/* Social Buttons (Outlook & Google) */}
                    <View style={styles.socialRow}>
                    <TouchableOpacity style={styles.socialButton} activeOpacity={0.8} onPress={handleMagicLink}>
  <Ionicons name="mail" size={22} color="#0078D4" />
</TouchableOpacity>
                      
                      <TouchableOpacity
                        style={styles.socialButton}
                        activeOpacity={0.8}
                        disabled={!request}
                        onPress={() => promptAsync()}
                      >
                        <Ionicons name="logo-google" size={22} color="#EA4335" />
                      </TouchableOpacity>
                    </View>

                    {/* Switch to Register Button */}
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchTextLight}>¿No tienes una cuenta? </Text>
                      <TouchableOpacity onPress={() => { setFeedback(null); setCaptchaToken(null); setCurrentScreen('register'); }}>
                        <Text style={styles.goldLink}>Regístrate</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* ================= REGISTRO DE CUENTA ================= */}
                {currentScreen === 'register' && (
                  <View style={styles.darkCard}>
                    <View style={styles.cardHeaderLogo}>
                      <Image 
                        source={require('../assets/images/logo.jpeg')} 
                        style={styles.cardLogoImg} 
                        resizeMode="contain" 
                      />
                      <View>
                        <Text style={styles.cardLogoTitle}>ACADEMIC INTELLIGENT</Text>
                        <Text style={styles.cardLogoSubtitle}>MANAGEMENT SYSTEM</Text>
                      </View>
                    </View>

                    <Text style={styles.cardTitleDark}>REGISTRO DE CUENTA</Text>

                    {/* Nombre Completo */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Nombre Completo</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="person" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.whiteInput}
                          placeholder="Tu nombre y apellido"
                          placeholderTextColor="#94A3B8"
                          value={regNombre}
                          onChangeText={setRegNombre}
                        />
                      </View>
                    </View>

                    {/* Correo Electrónico */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Correo Electrónico</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.whiteInput}
                          placeholder="usuario@sena.edu.co o @gmail.com"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={regCorreo}
                          onChangeText={setRegCorreo}
                        />
                      </View>

                      {/* Badge / Indicador dinámico de rol */}
                      {isInstructor && (
                        <View style={[styles.domainHelperBox, { backgroundColor: 'rgba(34, 197, 94, 0.15)', borderColor: '#22C55E' }]}>
                          <Ionicons name="briefcase-outline" size={15} color="#22C55E" style={{ marginRight: 6 }} />
                          <Text style={[styles.domainHelperText, { color: '#86EFAC' }]}>
                            Rol asignado: <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Instructor SENA</Text>
                          </Text>
                        </View>
                      )}

                      {isAprendiz && regDomain.length > 0 && (
                        <View style={[styles.domainHelperBox, { backgroundColor: 'rgba(59, 130, 246, 0.15)', borderColor: '#3B82F6' }]}>
                          <Ionicons name="school-outline" size={15} color="#60A5FA" style={{ marginRight: 6 }} />
                          <Text style={[styles.domainHelperText, { color: '#93C5FD' }]}>
                            Rol asignado: <Text style={{ fontWeight: 'bold', color: '#FFFFFF' }}>Aprendiz SENA</Text>
                          </Text>
                        </View>
                      )}

                      {!isInstructor && (!isAprendiz || regDomain.length === 0) && (
                        <View style={styles.domainHelperBox}>
                          <Ionicons name="information-circle-outline" size={15} color="#C59427" style={{ marginRight: 6 }} />
                          <Text style={styles.domainHelperText}>
                            Instructor: <Text style={styles.boldDomain}>@sena.edu.co</Text> · Aprendiz: <Text style={styles.boldDomain}>@soy.sena.edu.co</Text> o <Text style={styles.boldDomain}>@gmail.com</Text>
                          </Text>
                        </View>
                      )}

                      {regCorreo.length > 0 && isDisposableEmail(regCorreo) && (
                        <Text style={[styles.matchText, styles.matchError]}>
                          No se permiten correos temporales ni desechables (ej. yopmail, mailinator)
                        </Text>
                      )}
                    </View>

                    {/* Campos adicionales para Aprendiz */}
                    {!isInstructor && (
                      <>
                        <View style={styles.fieldGroup}>
                          <Text style={styles.labelDark}>Tipo de documento</Text>
                          <View style={styles.whiteInputWrapper}>
                            <Ionicons name="card-outline" size={18} color="#475569" style={styles.fieldIcon} />
                            <TextInput
                              style={styles.whiteInput}
                              placeholder="CC, TI, CE..."
                              placeholderTextColor="#94A3B8"
                              value={regTipoDocumento}
                              onChangeText={setRegTipoDocumento}
                              autoCapitalize="characters"
                            />
                          </View>
                        </View>

                        <View style={styles.fieldGroup}>
                          <Text style={styles.labelDark}>Número de documento</Text>
                          <View style={styles.whiteInputWrapper}>
                            <Ionicons name="finger-print-outline" size={18} color="#475569" style={styles.fieldIcon} />
                            <TextInput
                              style={styles.whiteInput}
                              placeholder="Documento registrado en la ficha"
                              placeholderTextColor="#94A3B8"
                              keyboardType="numeric"
                              value={regDocumento}
                              onChangeText={setRegDocumento}
                            />
                          </View>
                        </View>

                        {/* Ficha de Formación con Buscador Integrado */}
                        <View style={styles.fieldGroup}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                            <Text style={styles.labelDark}>Ficha de formación</Text>
                            <TouchableOpacity
                              onPress={() => {
                                setMostrarSelectorFicha(true);
                                buscarFichas('');
                              }}
                            >
                              <Text style={{ fontSize: 12, color: '#C59427', fontWeight: '700' }}>
                                Seleccionar de la lista
                              </Text>
                            </TouchableOpacity>
                          </View>
                          <View style={styles.fichaInputRow}>
                            <View style={[styles.whiteInputWrapper, { flex: 1 }]}>
                              <Ionicons name="bookmark-outline" size={18} color="#475569" style={styles.fieldIcon} />
                              <TextInput
                                style={styles.whiteInput}
                                placeholder="Número de ficha (ej: 2670142)"
                                placeholderTextColor="#94A3B8"
                                keyboardType="number-pad"
                                value={regFichaNumero}
                                onChangeText={(t) => {
                                  setRegFichaNumero(t);
                                  setRegFicha(t);
                                  buscarFichas(t);
                                }}
                              />
                              {buscandoFicha && <ActivityIndicator size="small" color="#C59427" />}
                            </View>
                            <TouchableOpacity
                              style={styles.fichaSearchBtn}
                              onPress={() => {
                                setMostrarSelectorFicha(true);
                                buscarFichas('');
                              }}
                            >
                              <Ionicons name="search-outline" size={18} color="#FFF" />
                            </TouchableOpacity>
                          </View>

                          {fichaEncontrada && (
                            <View style={styles.fichaFoundBadge}>
                              <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                              <View style={{ flex: 1, marginLeft: 6 }}>
                                <Text style={styles.fichaFoundText}>
                                  Ficha {fichaEncontrada.numero} — {fichaEncontrada.programaNombre}
                                </Text>
                              </View>
                            </View>
                          )}

                          {regFichaNumero.length > 0 && !fichaEncontrada && !buscandoFicha && (
                            <Text style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>
                              ℹ Si tu ficha aún no está registrada, puedes continuar y el administrador te la asignará.
                            </Text>
                          )}
                        </View>
                      </>
                    )}


                    {/* Contraseña */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Contraseña</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          ref={secureInputRef}
                          style={styles.whiteInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showRegPassword}
                          value={regPassword}
                          autoComplete="new-password"
                          textContentType="password"
                          autoCorrect={false}
                          spellCheck={false}
                          onChangeText={setRegPassword}
                        />
                        <TouchableOpacity onPress={() => setShowRegPassword(!showRegPassword)}>
                          <Ionicons name={showRegPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* VALIDACIÓN DE CONTRASEÑA EN TIEMPO REAL */}
                    {regPassword.length > 0 && (
                      <View style={styles.passValidationBox}>
                        <View style={styles.passHeaderRow}>
                          <Text style={styles.passValidationTitle}>Fortaleza de Contraseña:</Text>
                          <Text style={[styles.passStrengthLabel, { color: passValidation.strengthColor }]}>
                            {passValidation.strengthText}
                          </Text>
                        </View>

                        {/* Barra de Progreso de Fortaleza */}
                        <View style={styles.strengthBarBackground}>
                          <View 
                            style={[
                              styles.strengthBarFill, 
                              { 
                                width: `${(passValidation.score / 5) * 100}%`, 
                                backgroundColor: passValidation.strengthColor 
                              }
                            ]} 
                          />
                        </View>

                        {/* Lista de Requisitos */}
                        <View style={styles.reqList}>
                          <View style={styles.reqItem}>
                            <Ionicons 
                              name={passValidation.requirements.minLength ? "checkmark-circle" : "ellipse-outline"} 
                              size={14} 
                              color={passValidation.requirements.minLength ? "#10B981" : "#94A3B8"} 
                            />
                            <Text style={[styles.reqText, passValidation.requirements.minLength && styles.reqTextSuccess]}>
                              Mínimo 8 caracteres
                            </Text>
                          </View>

                          <View style={styles.reqItem}>
                            <Ionicons 
                              name={passValidation.requirements.hasUppercase ? "checkmark-circle" : "ellipse-outline"} 
                              size={14} 
                              color={passValidation.requirements.hasUppercase ? "#10B981" : "#94A3B8"} 
                            />
                            <Text style={[styles.reqText, passValidation.requirements.hasUppercase && styles.reqTextSuccess]}>
                              Al menos una mayúscula (A-Z)
                            </Text>
                          </View>

                          <View style={styles.reqItem}>
                            <Ionicons 
                              name={passValidation.requirements.hasLowercase ? "checkmark-circle" : "ellipse-outline"} 
                              size={14} 
                              color={passValidation.requirements.hasLowercase ? "#10B981" : "#94A3B8"} 
                            />
                            <Text style={[styles.reqText, passValidation.requirements.hasLowercase && styles.reqTextSuccess]}>
                              Al menos una minúscula (a-z)
                            </Text>
                          </View>

                          <View style={styles.reqItem}>
                            <Ionicons 
                              name={passValidation.requirements.hasNumber ? "checkmark-circle" : "ellipse-outline"} 
                              size={14} 
                              color={passValidation.requirements.hasNumber ? "#10B981" : "#94A3B8"} 
                            />
                            <Text style={[styles.reqText, passValidation.requirements.hasNumber && styles.reqTextSuccess]}>
                              Al menos un número (0-9)
                            </Text>
                          </View>

                          <View style={styles.reqItem}>
                            <Ionicons 
                              name={passValidation.requirements.hasSpecialChar ? "checkmark-circle" : "ellipse-outline"} 
                              size={14} 
                              color={passValidation.requirements.hasSpecialChar ? "#10B981" : "#94A3B8"} 
                            />
                            <Text style={[styles.reqText, passValidation.requirements.hasSpecialChar && styles.reqTextSuccess]}>
                              Al menos un símbolo (!@#$%^&*)
                            </Text>
                          </View>
                        </View>
                      </View>
                    )}

                    {/* Confirmar Contraseña */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Confirmar Contraseña</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          ref={secureInputRef}
                          style={styles.whiteInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showRegConfirmPassword}
                          value={regConfirmPassword}
                          autoComplete="new-password"
                          textContentType="password"
                          autoCorrect={false}
                          spellCheck={false}
                          onChangeText={setRegConfirmPassword}
                        />
                        <TouchableOpacity onPress={() => setShowRegConfirmPassword(!showRegConfirmPassword)}>
                          <Ionicons name={showRegConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                      </View>
                      {regConfirmPassword.length > 0 && (
                        <Text style={[styles.matchText, passMatches ? styles.matchSuccess : styles.matchError]}>
                          {passMatches ? '✓ Las contraseñas coinciden' : '✗ Las contraseñas no coinciden'}
                        </Text>
                      )}
                    </View>

                    {/* ─── CAMPOS ACADÉMICOS (solo si el correo es APRENDIZ) ─── */}
                    {esAprendiz && (
                      <>
                        <View style={styles.academicSectionHeader}>
                          <Ionicons name="school-outline" size={16} color="#C59427" />
                          <Text style={styles.academicSectionTitle}>Datos Académicos (Opcional)</Text>
                        </View>

                        {/* Sede */}
                        <View style={styles.fieldGroup}>
                          <Text style={styles.labelDark}>Sede del Centro de Formación</Text>
                          <View style={styles.whiteInputWrapper}>
                            <Ionicons name="location-outline" size={18} color="#475569" style={styles.fieldIcon} />
                            <TextInput
                              style={styles.whiteInput}
                              placeholder="Ej: Sede Cazucá"
                              placeholderTextColor="#94A3B8"
                              value={regSede}
                              onChangeText={setRegSede}
                            />
                          </View>
                        </View>

                        {/* Trimestre */}
                        <View style={styles.fieldGroup}>
                          <Text style={styles.labelDark}>Trimestre Actual</Text>
                          <View style={styles.trimestreRow}>
                            {['1','2','3','4','5','6','7'].map((t) => (
                              <TouchableOpacity
                                key={t}
                                style={[
                                  styles.trimestreChip,
                                  regTrimestre === t && styles.trimestreChipActive,
                                ]}
                                onPress={() => setRegTrimestre(t)}
                              >
                                <Text style={[
                                  styles.trimestreChipText,
                                  regTrimestre === t && styles.trimestreChipTextActive,
                                ]}>
                                  {t}°
                                </Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </>
                    )}

                    {/* Modal Selector de Fichas */}
                    <Modal
                      visible={mostrarSelectorFicha}
                      transparent
                      animationType="slide"
                      onRequestClose={() => setMostrarSelectorFicha(false)}
                    >
                      <TouchableWithoutFeedback onPress={() => setMostrarSelectorFicha(false)}>
                        <View style={styles.modalOverlay}>
                          <TouchableWithoutFeedback>
                            <View style={styles.modalSheet}>
                              <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Seleccionar Ficha</Text>
                                <TouchableOpacity onPress={() => setMostrarSelectorFicha(false)}>
                                  <Ionicons name="close-circle" size={24} color="#64748B" />
                                </TouchableOpacity>
                              </View>
                              <View style={styles.modalSearchBox}>
                                <Ionicons name="search-outline" size={16} color="#94A3B8" />
                                <TextInput
                                  style={styles.modalSearchInput}
                                  placeholder="Buscar por número de ficha..."
                                  placeholderTextColor="#94A3B8"
                                  keyboardType="number-pad"
                                  onChangeText={(t) => buscarFichas(t)}
                                  autoFocus
                                />
                              </View>
                              {buscandoFicha && (
                                <ActivityIndicator color="#C59427" style={{ marginTop: 12 }} />
                              )}
                              <FlatList
                                data={fichasDisponibles}
                                keyExtractor={(item) => item.id}
                                ListEmptyComponent={!buscandoFicha ? (
                                  <Text style={styles.modalEmpty}>No se encontraron fichas activas con ese criterio</Text>
                                ) : null}
                                renderItem={({ item }) => (
                                  <TouchableOpacity
                                    style={styles.modalFichaItem}
                                    onPress={() => {
                                      setRegFichaNumero(item.numero);
                                      setRegFicha(item.numero);
                                      setRegPrograma(item.programaNombre || '');
                                      setFichaEncontrada(item);
                                      setMostrarSelectorFicha(false);
                                    }}
                                  >
                                    <Ionicons name="document-text-outline" size={18} color="#C59427" />
                                    <View style={{ flex: 1, marginLeft: 10 }}>
                                      <Text style={styles.modalFichaNumero}>Ficha {item.numero}</Text>
                                      <Text style={styles.modalFichaPrograma}>{item.programaNombre}</Text>
                                      {item.instructorNombre && (
                                        <Text style={styles.modalFichaInstructor}>{item.instructorNombre}</Text>
                                      )}
                                    </View>
                                    <View style={[
                                      styles.estadoBadge,
                                      { backgroundColor: item.estado === 'Activo' ? '#10B981' : '#94A3B8' }
                                    ]}>
                                      <Text style={styles.estadoBadgeText}>{item.estado || 'Activo'}</Text>
                                    </View>
                                  </TouchableOpacity>
                                )}
                              />
                            </View>
                          </TouchableWithoutFeedback>
                        </View>
                      </TouchableWithoutFeedback>
                    </Modal>

                    {/* reCAPTCHA v2 Checkbox Widget */}
                    <RecaptchaWidget
                      ref={recaptchaRef}
                      theme="dark"
                      onChange={(token) => setCaptchaToken(token)}
                      onExpired={() => setCaptchaToken(null)}
                    />

                    {/* Submit Register Button */}
                    <TouchableOpacity style={styles.goldButton} activeOpacity={0.85} onPress={handleRegister}>
                      <Text style={styles.goldButtonText}>CREAR CUENTA →</Text>
                    </TouchableOpacity>

                    {/* Switch back to Login */}
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchTextDark}>¿Ya tienes una cuenta? </Text>
                      <TouchableOpacity onPress={() => { setFeedback(null); setCaptchaToken(null); setCurrentScreen('login'); }}>
                        <Text style={styles.goldLink}>Inicia Sesión</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Footer Bar */}
        <View style={styles.footerBar}>
          <Text style={styles.footerText}>© 2026 AIMS - Academic Intelligent Management System</Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  /* ─── CAMPOS ACADÉMICOS ─── */
  academicSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    marginBottom: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(197,148,39,0.12)',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#C59427',
  },
  academicSectionTitle: {
    color: '#C59427',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  fichaInputRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  fichaSearchBtn: {
    backgroundColor: '#C59427',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fichaFoundBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(16,185,129,0.12)',
    borderRadius: 8,
  },
  fichaFoundText: {
    color: '#10B981',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  trimestreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  trimestreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  trimestreChipActive: {
    backgroundColor: '#C59427',
    borderColor: '#C59427',
  },
  trimestreChipText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },
  trimestreChipTextActive: {
    color: '#FFF',
  },
  /* ─── MODAL SELECTOR FICHAS ─── */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#0F172A',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 32,
    maxHeight: '70%',
    borderTopWidth: 3,
    borderTopColor: '#C59427',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  modalSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 10,
  },
  modalSearchInput: {
    flex: 1,
    color: '#FFF',
    fontSize: 14,
  },
  modalEmpty: {
    color: '#64748B',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 13,
  },
  modalFichaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(197,148,39,0.2)',
  },
  modalFichaNumero: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalFichaPrograma: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 2,
  },
  modalFichaInstructor: {
    color: '#C59427',
    fontSize: 11,
    marginTop: 2,
  },
  estadoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  estadoBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '700',
  },
  outerContainer: {
    flex: 1,
    backgroundColor: '#020308',
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  safeArea: {
    flex: 1,
    width: '100%',
    maxWidth: '100%',
    overflow: 'hidden',
  },
  /* AMBIENT GLOW ORBS (DARK ACADEMIA SATIN GOLD & SAPPHIRE) */
  glowOrb: {
    position: 'absolute',
    borderRadius: 999,
  },
  goldSatinSpotlight: {
    width: 500,
    height: 500,
    backgroundColor: '#D4AF37',
    opacity: 0.16,
    top: -160,
    left: '50%',
    transform: [{ translateX: -250 }],
  },
  sapphireGlowCenter: {
    width: 440,
    height: 440,
    backgroundColor: '#1E3A8A',
    opacity: 0.22,
    top: '30%',
    right: -110,
  },
  amberGoldGlowBottom: {
    width: 380,
    height: 380,
    backgroundColor: '#C59427',
    opacity: 0.18,
    bottom: -90,
    left: -70,
  },
  radialCenterHalo: {
    width: 320,
    height: 320,
    backgroundColor: '#60A5FA',
    opacity: 0.07,
    top: '35%',
    left: '20%',
  },

  /* CONSTELLATION STAR DUST DOTS */
  constellationDot: {
    position: 'absolute',
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
    opacity: 0.45,
    zIndex: 1,
  },

  /* FLOATING ACADEMIC & TECH NODES */
  techNode: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(10, 15, 36, 0.75)',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    elevation: 6,
    ...Platform.select({
      web: {
        backdropFilter: 'blur(10px)',
      },
    }),
  },
  techNodeGold: {
    borderColor: 'rgba(212, 175, 55, 0.45)',
    boxShadow: '0px 4px 10px rgba(212, 175, 55, 0.3)',
  },
  techNodeBlue: {
    borderColor: 'rgba(96, 165, 250, 0.45)',
    boxShadow: '0px 4px 10px rgba(59, 130, 246, 0.3)',
  },

  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 10,
    zIndex: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 38,
    height: 38,
    marginRight: 10,
  },
  headerTextGroup: {
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 8,
    letterSpacing: 1,
  },
  headerRightText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
  },
  flexContainer: {
    flex: 1,
    zIndex: 10,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  /* LIGHT CARD (INICIO DE SESIÓN) */
  lightCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 32,
    borderTopWidth: 4,
    borderTopColor: '#D4AF37',
    boxShadow: '0px 16px 28px rgba(2, 3, 8, 0.4)',
    elevation: 14,
  },
  lightLogoContainer: {
    alignItems: 'center',
    marginBottom: 12,
  },
  lightLogoImg: {
    width: 54,
    height: 54,
  },
  lightLogoText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 2,
    marginTop: 4,
  },
  cardTitleLight: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: 1.5,
  },
  labelLight: {
    color: '#1E293B',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleSelectorDark: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  roleOption: {
    flex: 1,
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
  },
  roleOptionActive: {
    backgroundColor: '#C59427',
    borderColor: '#C59427',
  },
  roleOptionText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  roleOptionTextActive: {
    color: '#FFFFFF',
  },
  borderedInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingHorizontal: 14,
    height: 48,
  },
  borderedInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    height: '100%',
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 20,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    color: '#475569',
    fontSize: 12,
    marginLeft: 6,
  },
  forgotText: {
    color: '#475569',
    fontSize: 12,
    textDecorationLine: 'underline',
  },

  /* DARK CARD (REGISTRO) */
  darkCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#0F142D',
    borderRadius: 22,
    padding: 32,
    boxShadow: '0px 16px 28px rgba(0, 0, 0, 0.5)',
    elevation: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderTopWidth: 4,
    borderTopColor: '#D4AF37',
  },
  cardHeaderLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardLogoImg: {
    width: 44,
    height: 44,
    marginRight: 10,
  },
  cardLogoTitle: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  cardLogoSubtitle: {
    color: '#94A3B8',
    fontSize: 8,
    letterSpacing: 0.8,
  },
  cardTitleDark: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 22,
    letterSpacing: 1.5,
  },
  fieldGroup: {
    marginBottom: 14,
  },
  labelDark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  whiteInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
  },
  fieldIcon: {
    marginRight: 10,
  },
  whiteInput: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    height: '100%',
  },

  /* BUTTONS & FOOTERS */
  goldButton: {
    backgroundColor: '#C59427',
    borderRadius: 24,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
    boxShadow: '0px 4px 8px rgba(197, 148, 39, 0.35)',
    elevation: 4,
  },
  goldButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 1,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  switchTextDark: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  switchTextLight: {
    color: '#475569',
    fontSize: 12,
  },
  goldLink: {
    color: '#C59427',
    fontSize: 12,
    fontWeight: '700',
  },

  /* SOCIAL SECTION */
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#64748B',
    fontSize: 11,
    marginHorizontal: 10,
  },
  socialRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 60,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },

  /* FOOTER */
  footerBar: {
    paddingVertical: 12,
    alignItems: 'center',
    zIndex: 10,
  },
  footerText: {
    color: '#64748B',
    fontSize: 11,
  },
  /* JWT & VALIDATION FEEDBACK STYLES */
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#D4AF37',
    fontSize: 12,
    marginTop: 8,
  },
  feedbackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  feedbackError: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  feedbackSuccess: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  feedbackText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  feedbackTextError: {
    color: '#991B1B',
  },
  feedbackTextSuccess: {
    color: '#065F46',
  },

  /* SESSION AUTHENTICATED PANEL */
  authBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'center',
    marginBottom: 14,
  },
  authBadgeText: {
    color: '#065F46',
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 6,
  },
  userNameText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    marginTop: 4,
  },
  userEmailText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 16,
  },
  tokenCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 20,
  },
  tokenLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  tokenValue: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#0F172A',
    backgroundColor: '#E2E8F0',
    padding: 6,
    borderRadius: 6,
  },
  primaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F2027',
    borderRadius: 24,
    height: 48,
    marginBottom: 12,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    borderRadius: 24,
    height: 48,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },

  /* LIVE PASSWORD VALIDATION STYLES */
  passValidationBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  passHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  passValidationTitle: {
    color: '#CBD5E1',
    fontSize: 11,
  },
  passStrengthLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  strengthBarBackground: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 10,
  },
  strengthBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  reqList: {
    gap: 4,
  },
  reqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reqText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  reqTextSuccess: {
    color: '#10B981',
    fontWeight: '600',
  },
  matchText: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  matchSuccess: {
    color: '#10B981',
  },
  matchError: {
    color: '#F87171',
  },
  domainHelperBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  domainHelperText: {
    fontSize: 11,
    color: '#CBD5E1',
    flex: 1,
    lineHeight: 15,
  },
  boldDomain: {
    fontWeight: '700',
    color: '#F1F5F9',
  },
});
