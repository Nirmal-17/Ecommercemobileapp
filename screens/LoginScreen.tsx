import React, {useState} from 'react';

import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// ============================================================
// ASYNC STORAGE KEYS
// ============================================================

const USER_ID_KEY = '@user_id';
const USER_NAME_KEY = '@user_name';
const USER_EMAIL_KEY = '@user_email';
const LOGIN_STATUS_KEY = '@login_status';

// ============================================================
// BACKEND URL
// Android Emulator → 10.0.2.2 points to your computer's localhost
// ============================================================

const BACKEND_URL = 'http://10.0.2.2:5000';

// ============================================================
// TYPES
// ============================================================

export type LoginScreenProps = {
  navigation: any;
};

// ============================================================
// LOGIN SCREEN
// ============================================================

function LoginScreen({navigation}: LoginScreenProps) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (!cleanEmail && !cleanPassword) {
      Alert.alert(
        'Login Error',
        'Please enter your email and password.',
      );
      return;
    }

    if (!cleanEmail) {
      Alert.alert(
        'Login Error',
        'Please enter your email.',
      );
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(cleanEmail)) {
      Alert.alert(
        'Login Error',
        'Please enter a valid email address.',
      );
      return;
    }

    if (!cleanPassword) {
      Alert.alert(
        'Login Error',
        'Please enter your password.',
      );
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert(
        'Login Error',
        'Password must be at least 6 characters long.',
      );
      return;
    }

    // --------------------------------------------------------
    // CALL BACKEND LOGIN API
    // --------------------------------------------------------

    try {
      setLoading(true);

      console.log('Attempting login...');
      console.log('Email:', cleanEmail);

      const response = await fetch(
        `${BACKEND_URL}/api/users/login`,
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            email: cleanEmail,
            password: cleanPassword,
          }),
        },
      );

      // ------------------------------------------------------
      // READ RESPONSE
      // ------------------------------------------------------

      const data = await response.json();

      console.log('Login API response:', data);

      // ------------------------------------------------------
      // HANDLE LOGIN FAILURE
      // ------------------------------------------------------

      if (!response.ok || !data.success) {
        Alert.alert(
          'Login Failed',
          data.message || 'Invalid email or password.',
        );

        return;
      }

      // ------------------------------------------------------
      // USER DATA FROM DATABASE
      // ------------------------------------------------------

      const user = data.user;

      if (!user || !user.id) {
        Alert.alert(
          'Login Error',
          'The server returned invalid user information.',
        );

        return;
      }

      // ------------------------------------------------------
      // USER NAME
      // ------------------------------------------------------

      const displayName =
        user.name ||
        name.trim() ||
        cleanEmail.split('@')[0];

      // ------------------------------------------------------
      // SAVE USER INFORMATION
      // ------------------------------------------------------

      await AsyncStorage.setItem(
        USER_ID_KEY,
        String(user.id),
      );

      await AsyncStorage.setItem(
        USER_NAME_KEY,
        displayName,
      );

      await AsyncStorage.setItem(
        USER_EMAIL_KEY,
        user.email || cleanEmail,
      );

      await AsyncStorage.setItem(
        LOGIN_STATUS_KEY,
        'true',
      );

      console.log(
        'Login successful. User ID:',
        user.id,
      );

      // ------------------------------------------------------
      // NAVIGATE TO MAIN APP
      // ------------------------------------------------------

      navigation.replace('MainTabs');
    } catch (error) {
      console.error(
        'Login API error:',
        error,
      );

      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Make sure the backend server is running.',
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // GUEST LOGIN
  // ==========================================================

  const handleGuestContinue = async () => {
    try {
      // Guest is not a PostgreSQL user.
      // Therefore remove any previous database user ID.

      await AsyncStorage.removeItem(
        USER_ID_KEY,
      );

      await AsyncStorage.setItem(
        USER_NAME_KEY,
        'Guest User',
      );

      await AsyncStorage.setItem(
        USER_EMAIL_KEY,
        'guest@store.com',
      );

      await AsyncStorage.setItem(
        LOGIN_STATUS_KEY,
        'true',
      );

      navigation.replace('MainTabs');
    } catch (error) {
      console.error(
        'Guest login error:',
        error,
      );

      navigation.replace('MainTabs');
    }
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : undefined
      }>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(
              insets.top + 20,
              40,
            ),

            paddingBottom: Math.max(
              insets.bottom + 20,
              30,
            ),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ==================================================
            LOGO / BRAND
        ================================================== */}

        <View style={styles.brandContainer}>

          <View style={styles.logoBadge}>
            <Ionicons
              name="bag-handle"
              size={40}
              color="#ff6b00"
            />
          </View>

          <Text style={styles.appName}>
            StoreApp
          </Text>

          <Text style={styles.subtitle}>
            Sign in to your account
          </Text>

        </View>

        {/* ==================================================
            FORM
        ================================================== */}

        <View style={styles.formContainer}>

          {/* =================================================
              FULL NAME
          ================================================= */}

          <Text style={styles.inputLabel}>
            Full Name (Optional)
          </Text>

          <View style={styles.inputWrapper}>

            <Ionicons
              name="person-outline"
              size={20}
              color="#71717a"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.inputField}
              placeholder="e.g. Alex Sharma"
              placeholderTextColor="#a1a1aa"
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              editable={!loading}
            />

          </View>

          {/* =================================================
              EMAIL
          ================================================= */}

          <Text style={styles.inputLabel}>
            Email Address
          </Text>

          <View style={styles.inputWrapper}>

            <Ionicons
              name="mail-outline"
              size={20}
              color="#71717a"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.inputField}
              placeholder="alex@example.com"
              placeholderTextColor="#a1a1aa"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

          </View>

          {/* =================================================
              PASSWORD
          ================================================= */}

          <Text style={styles.inputLabel}>
            Password
          </Text>

          <View style={styles.inputWrapper}>

            <Ionicons
              name="lock-closed-outline"
              size={20}
              color="#71717a"
              style={styles.inputIcon}
            />

            <TextInput
              style={styles.inputField}
              placeholder="At least 6 characters"
              placeholderTextColor="#a1a1aa"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              editable={!loading}
            />

            <Pressable
              onPress={() =>
                setShowPassword(
                  previous => !previous,
                )
              }
              hitSlop={8}
              style={styles.eyeButton}
              disabled={loading}>

              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={20}
                color="#71717a"
              />

            </Pressable>

          </View>

          {/* =================================================
              SIGN IN BUTTON
          ================================================= */}

          <Pressable
            style={({pressed}) => [
              styles.submitButton,

              pressed &&
                styles.pressed,

              loading &&
                styles.buttonDisabled,
            ]}
            disabled={loading}
            onPress={handleLogin}>

            {loading ? (
              <View style={styles.loadingContent}>

                <ActivityIndicator
                  color="#ffffff"
                  size="small"
                />

                <Text
                  style={
                    styles.loadingText
                  }>
                  Signing in...
                </Text>

              </View>
            ) : (
              <Text
                style={
                  styles.submitButtonText
                }>
                Sign In
              </Text>
            )}

          </Pressable>

          {/* =================================================
              DIVIDER
          ================================================= */}

          <View style={styles.dividerRow}>

            <View
              style={
                styles.dividerLine
              }
            />

            <Text
              style={
                styles.dividerText
              }>
              or
            </Text>

            <View
              style={
                styles.dividerLine
              }
            />

          </View>

          {/* =================================================
              GUEST BUTTON
          ================================================= */}

          <Pressable
            style={({pressed}) => [
              styles.guestButton,
              pressed &&
                styles.pressed,
            ]}
            onPress={
              handleGuestContinue
            }
            disabled={loading}>

            <Text
              style={
                styles.guestButtonText
              }>
              Continue as Guest
            </Text>

            <Ionicons
              name="arrow-forward"
              size={18}
              color="#18181b"
              style={styles.guestArrow}
            />

          </Pressable>

        </View>

      </ScrollView>

    </KeyboardAvoidingView>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({

  keyboardContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },

  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff4eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,

    elevation: 3,

    shadowColor: '#ff6b00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
  },

  subtitle: {
    fontSize: 15,
    color: '#71717a',
    marginTop: 4,
  },

  formContainer: {
    width: '100%',
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 6,
    marginTop: 10,
  },

  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 52,
  },

  inputIcon: {
    marginRight: 10,
  },

  inputField: {
    flex: 1,
    fontSize: 15,
    color: '#18181b',
    height: '100%',
  },

  eyeButton: {
    padding: 6,
  },

  submitButton: {
    backgroundColor: '#ff6b00',
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,

    elevation: 3,

    shadowColor: '#ff6b00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },

  buttonDisabled: {
    opacity: 0.7,
  },

  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },

  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 10,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e4e4e7',
  },

  dividerText: {
    marginHorizontal: 12,
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },

  guestButton: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },

  guestButtonText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '600',
  },

  guestArrow: {
    marginLeft: 6,
  },

  pressed: {
    opacity: 0.75,
  },

});

export default LoginScreen;