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

const USER_NAME_KEY = '@user_name';
const USER_EMAIL_KEY = '@user_email';
const LOGIN_STATUS_KEY = '@login_status';

export type LoginScreenProps = {
  navigation: any;
};

function LoginScreen({navigation}: LoginScreenProps) {
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPassword = password.trim();

    if (!cleanEmail && !cleanPassword) {
      Alert.alert('Login Error', 'Please enter your email and password.');
      return;
    }

    if (!cleanEmail) {
      Alert.alert('Login Error', 'Please enter your email.');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(cleanEmail)) {
      Alert.alert('Login Error', 'Please enter a valid email address.');
      return;
    }

    if (!cleanPassword) {
      Alert.alert('Login Error', 'Please enter your password.');
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert('Login Error', 'Password must be at least 6 characters long.');
      return;
    }

    try {
      setLoading(true);
      const displayName = name.trim() || cleanEmail.split('@')[0];

      await AsyncStorage.setItem(USER_NAME_KEY, displayName);
      await AsyncStorage.setItem(USER_EMAIL_KEY, cleanEmail);
      await AsyncStorage.setItem(LOGIN_STATUS_KEY, 'true');

      navigation.replace('MainTabs');
    } catch (error) {
      console.error('Error saving login:', error);
      Alert.alert('Error', 'Unable to save login session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestContinue = async () => {
    try {
      await AsyncStorage.setItem(USER_NAME_KEY, 'Guest User');
      await AsyncStorage.setItem(USER_EMAIL_KEY, 'guest@store.com');
      await AsyncStorage.setItem(LOGIN_STATUS_KEY, 'true');
      navigation.replace('MainTabs');
    } catch (e) {
      navigation.replace('MainTabs');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top + 20, 40),
            paddingBottom: Math.max(insets.bottom + 20, 30),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {/* LOGO / BRAND ICON */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="bag-handle" size={40} color="#ff6b00" />
          </View>
          <Text style={styles.appName}>StoreApp</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>
        </View>

        {/* INPUT FORM */}
        <View style={styles.formContainer}>
          {/* OPTIONAL NAME FIELD */}
          <Text style={styles.inputLabel}>Full Name (Optional)</Text>
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
            />
          </View>

          {/* EMAIL FIELD */}
          <Text style={styles.inputLabel}>Email Address</Text>
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
            />
          </View>

          {/* PASSWORD FIELD */}
          <Text style={styles.inputLabel}>Password</Text>
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
            />
            <Pressable
              onPress={() => setShowPassword(prev => !prev)}
              hitSlop={8}
              style={styles.eyeButton}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#71717a"
              />
            </Pressable>
          </View>

          {/* SUBMIT BUTTON */}
          <Pressable
            style={({pressed}) => [
              styles.submitButton,
              pressed && styles.pressed,
              loading && styles.buttonDisabled,
            ]}
            disabled={loading}
            onPress={handleLogin}>
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.submitButtonText}>Sign In</Text>
            )}
          </Pressable>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* GUEST BUTTON */}
          <Pressable
            style={({pressed}) => [
              styles.guestButton,
              pressed && styles.pressed,
            ]}
            onPress={handleGuestContinue}>
            <Text style={styles.guestButtonText}>Continue as Guest</Text>
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
    shadowOffset: {width: 0, height: 2},
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
    shadowOffset: {width: 0, height: 4},
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