import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ScrollView,
  ActivityIndicator


} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { router } from 'expo-router';
import { authService } from '../services/authService';
import { validatePassword, validatePasswordMatch, isDisposableEmail } from '../utils/validation';

WebBrowser.maybeCompleteAuthSession();



export default function AuthScreen() {
  const { user, isLoading, login, register, logout, setSession } = useAuth();
  // Screen state: 'login' (default) | 'register'
  const [currentScreen, setCurrentScreen] = useState<'login' | 'register'>('login');

  // Login Form State
  const [loginCorreo, setLoginCorreo] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register Form State
  const [regNombre, setRegNombre] = useState('');
  const [regCorreo, setRegCorreo] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);

  // Feedback Messages
  const [feedback, setFeedback] = useState<{ text: string; type: 'error' | 'success' } | null>(null);

  // Validación de la contraseña en tiempo real para Registro
  const passValidation = validatePassword(regPassword);
  const passMatches = validatePasswordMatch(regPassword, regConfirmPassword);

  

 const [request, response, promptAsync] = Google.useAuthRequest({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || 'mock-google-client-id.apps.googleusercontent.com',
  responseType: 'id_token',
  scopes: ['openid', 'profile', 'email'],
});
  useEffect(() => {
  const handleGoogleResponse = async () => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken ?? response.params?.id_token;
      if (!idToken) {
        setFeedback({ text: 'No se pudo obtener el token de Google.', type: 'error' });
        return;
      }
      const res = await authService.googleLogin(idToken);
      if (res.success && res.user) {
        setSession(res.user);
      } else {
        setFeedback({ text: res.message || 'Error al iniciar sesión con Google.', type: 'error' });
      }
    } else if (response?.type === 'error') {
      setFeedback({ text: 'Google canceló o rechazó la autenticación.', type: 'error' });
    }
  };
  handleGoogleResponse();
}, [response, setSession]);
  

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

    const res = await login(loginCorreo, loginPassword);
    if (!res.success) {
      setFeedback({ text: res.message || 'Error al iniciar sesión', type: 'error' });
    } else {
      setFeedback({ text: res.message || '¡Sesión iniciada correctamente!', type: 'success' });
    }
  };

  const handleRegister = async () => {
    setFeedback(null);
    if (!regNombre || !regCorreo || !regPassword || !regConfirmPassword) {
      setFeedback({ text: 'Por favor completa todos los campos del formulario.', type: 'error' });
      return;
    }

    if (!passValidation.isValid) {
      setFeedback({ text: 'La contraseña no cumple con los requisitos de seguridad.', type: 'error' });
      return;
    }

    if (!passMatches) {
      setFeedback({ text: 'Las contraseñas ingresadas no coinciden.', type: 'error' });
      return;
    }

    const res = await register(regNombre, regCorreo, regPassword, regConfirmPassword);
    if (!res.success) {
      setFeedback({ text: res.message || 'Error al registrar la cuenta.', type: 'error' });
    } else {
      setFeedback({ text: res.message || '¡Cuenta creada y JWT almacenado exitosamente!', type: 'success' });
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
            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#C59427" />
                <Text style={styles.loadingText}>Verificando sesión JWT...</Text>
              </View>
            )}

            {/* Banner de Feedback Error/Éxito */}
            {feedback && !isLoading && (
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

            {/* ================= USUARIO AUTENTICADO (SESIÓN ACTIVA CON JWT) ================= */}
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

                <View style={styles.authBadge}>
                  <Ionicons name="shield-checkmark" size={16} color="#10B981" />
                  <Text style={styles.authBadgeText}>SESIÓN AUTENTICADA CON JWT</Text>
                </View>

                <Text style={styles.cardTitleLight}>¡BIENVENIDO/A!</Text>
                <Text style={styles.userNameText}>{user.nombre}</Text>
                <Text style={styles.userEmailText}>{user.correo}</Text>

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

                    {/* Correo / Matrícula */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelLight}>Correo Institucional / Matrícula</Text>
                      <View style={styles.borderedInputWrapper}>
                        <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.borderedInput}
                          placeholder="vtorres@formacionsena.edu.co"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={loginCorreo}
                          onChangeText={setLoginCorreo}
                        />
                      </View>
                    </View>

                    {/* Contraseña */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelLight}>Contraseña</Text>
                      <View style={styles.borderedInputWrapper}>
                        <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.borderedInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showLoginPassword}
                          value={loginPassword}
                          onChangeText={setLoginPassword}
                        />
                        <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)}>
                          <Ionicons name={showLoginPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                        </TouchableOpacity>
                      </View>
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
                      <TouchableOpacity onPress={() => { setFeedback(null); setCurrentScreen('register'); }}>
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
                          placeholder="Valentina Torres"
                          placeholderTextColor="#94A3B8"
                          value={regNombre}
                          onChangeText={setRegNombre}
                        />
                      </View>
                    </View>

                    {/* Correo Institucional */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Correo Institucional</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.whiteInput}
                          placeholder="vtorres@formacionsena.edu.co"
                          placeholderTextColor="#94A3B8"
                          keyboardType="email-address"
                          autoCapitalize="none"
                          value={regCorreo}
                          onChangeText={setRegCorreo}
                        />
                      </View>
                      {regCorreo.length > 0 && isDisposableEmail(regCorreo) && (
                        <Text style={[styles.matchText, styles.matchError]}>
                          ⚠️ No se permiten correos temporales/desechables (ej. yopmail, mailinator)
                        </Text>
                      )}
                    </View>


                    {/* Contraseña */}
                    <View style={styles.fieldGroup}>
                      <Text style={styles.labelDark}>Contraseña</Text>
                      <View style={styles.whiteInputWrapper}>
                        <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                        <TextInput
                          style={styles.whiteInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showRegPassword}
                          value={regPassword}
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
                          style={styles.whiteInput}
                          placeholder="••••••••••••"
                          placeholderTextColor="#94A3B8"
                          secureTextEntry={!showRegConfirmPassword}
                          value={regConfirmPassword}
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

                    {/* Submit Register Button */}
                    <TouchableOpacity style={styles.goldButton} activeOpacity={0.85} onPress={handleRegister}>
                      <Text style={styles.goldButtonText}>CREAR CUENTA →</Text>
                    </TouchableOpacity>

                    {/* Switch back to Login */}
                    <View style={styles.switchContainer}>
                      <Text style={styles.switchTextDark}>¿Ya tienes una cuenta? </Text>
                      <TouchableOpacity onPress={() => { setFeedback(null); setCurrentScreen('login'); }}>
                        <Text style={styles.goldLink}>Inicia Sesión</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </>
            )}
{false && (
  <>
    <View style={styles.lightCard}>
                <Text style={styles.cardTitleLight}>INICIO DE SESIÓN</Text>

                {/* Correo / Matrícula */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelLight}>Correo Institucional / Matrícula</Text>
                  <View style={styles.borderedInputWrapper}>
                    <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.borderedInput}
                      placeholder="vtorres@formacionsena.edu.co"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={loginCorreo}
                      onChangeText={setLoginCorreo}
                    />
                  </View>
                </View>

                {/* Contraseña */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelLight}>Contraseña</Text>
                  <View style={styles.borderedInputWrapper}>
                    <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.borderedInput}
                      placeholder="••••••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showLoginPassword}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                    />
                    <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)}>
                      <Ionicons name={showLoginPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
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
                  <TouchableOpacity style={styles.socialButton} activeOpacity={0.8}>
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
                  <TouchableOpacity onPress={() => setCurrentScreen('register')}>
                    <Text style={styles.goldLink}>Regístrate</Text>
                  </TouchableOpacity>
                </View>
              </View>

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

                <Text style={styles.cardTitleDark}>REGISTRO</Text>

                {/* Nombre Completo */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelDark}>Nombre Completo</Text>
                  <View style={styles.whiteInputWrapper}>
                    <Ionicons name="person" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.whiteInput}
                      placeholder="Valentina Torres"
                      placeholderTextColor="#94A3B8"
                      value={regNombre}
                      onChangeText={setRegNombre}
                    />
                  </View>
                </View>

                {/* Correo Institucional */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelDark}>Correo Institucional</Text>
                  <View style={styles.whiteInputWrapper}>
                    <Ionicons name="mail" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.whiteInput}
                      placeholder="vtorres@formacionsena.edu.co"
                      placeholderTextColor="#94A3B8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={regCorreo}
                      onChangeText={setRegCorreo}
                    />
                  </View>
                </View>

                {/* Contraseña */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelDark}>Contraseña</Text>
                  <View style={styles.whiteInputWrapper}>
                    <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.whiteInput}
                      placeholder="••••••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showRegPassword}
                      value={regPassword}
                      onChangeText={setRegPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegPassword(!showRegPassword)}>
                      <Ionicons name={showRegPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirmar Contraseña */}
                <View style={styles.fieldGroup}>
                  <Text style={styles.labelDark}>Confirmar Contraseña</Text>
                  <View style={styles.whiteInputWrapper}>
                    <Ionicons name="lock-closed" size={18} color="#475569" style={styles.fieldIcon} />
                    <TextInput
                      style={styles.whiteInput}
                      placeholder="••••••••••••"
                      placeholderTextColor="#94A3B8"
                      secureTextEntry={!showRegConfirmPassword}
                      value={regConfirmPassword}
                      onChangeText={setRegConfirmPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegConfirmPassword(!showRegConfirmPassword)}>
                      <Ionicons name={showRegConfirmPassword ? "eye-off-outline" : "eye-outline"} size={18} color="#64748B" />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Submit Register Button */}
                <TouchableOpacity style={styles.goldButton} activeOpacity={0.85} onPress={handleRegister}>
                  <Text style={styles.goldButtonText}>CREAR CUENTA →</Text>
                </TouchableOpacity>

                {/* Switch back to Login */}
                <View style={styles.switchContainer}>
                  <Text style={styles.switchTextDark}>¿Ya tienes una cuenta? </Text>
                  <TouchableOpacity onPress={() => setCurrentScreen('login')}>
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
  outerContainer: {
    flex: 1,
    backgroundColor: '#020308',
  },
  safeArea: {
    flex: 1,
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
});
