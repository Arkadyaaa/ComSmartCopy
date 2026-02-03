import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, StyleSheet, Platform, Image, Button } from 'react-native';
import { getRecords } from '../services/apiRecords';
import AsyncStorage from '@react-native-async-storage/async-storage';  // store user data in asyncstorage NOT DB
import supabase from '../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import GradientText from '../screens/components/GradientText';

export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    checkExistingSession();
  }, []);

  const getNoAuthUser = async () => {
    try {
      if (typeof localStorage !== 'undefined') {
        const noAuth = localStorage.getItem('noAuth');
        const role = localStorage.getItem('role');
        if (noAuth === 'true' && role) {
          return { role };
        }
      }
      const noAuth = await AsyncStorage.getItem('noAuth');
      const role = await AsyncStorage.getItem('role');
      if (noAuth === 'true' && role) {
        return { role };
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const checkExistingSession = async () => {
    try {
      const noAuthInfo = await getNoAuthUser();
      if (noAuthInfo?.role) {
        const roleUser = {
          username: noAuthInfo.role === 'tutor' ? 'Tutor User' : 'Student User',
          emailAddress: `${noAuthInfo.role}@noauth.local`,
          userType: noAuthInfo.role === 'tutor' ? 'tutor' : 'participant',
          id: `noauth-${noAuthInfo.role}`,
        };
        await AsyncStorage.setItem('userData', JSON.stringify(roleUser));
        navigation.navigate('Dashboard', { user: roleUser });
        return;
      }

      const userData = await AsyncStorage.getItem('userData');
      if (userData) {
        navigation.navigate('Dashboard', { user: JSON.parse(userData) });
      }
    } catch (error) {
      console.error('Error checking session:', error);
    }
  };

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password.trim(),
      });

      if (error) {
        alert(error.message);
        setIsLoading(false);
        return;
      }

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('User')
          .select('*')
          .eq('emailAddress', email.trim())
          .single();

        if (userError) {
          alert(userError.message);
          setIsLoading(false);
          return;
        }
        
        await AsyncStorage.setItem('userData', JSON.stringify(userData));

        navigation.navigate('Dashboard',{ user: userData });
      }
    } catch (error) {
      console.error('Error during login:', error);
      alert(error.message);
      setIsLoading(false);
    }
  };

  const handleLoginDebug = async () => {
    const debugUser = {
      username: 'debug_user',
      password: '',
      userType: 'facilitator',
      id: 'debug-id-123',
    };

    navigation.navigate('Dashboard', { user: debugUser });
  }

  return (
    <View style={[styles.container, { backgroundColor: COLORS.bg }]}>
      {Platform.OS === 'web' && (
        <View
          style={{
            ...StyleSheet.absoluteFillObject,
            opacity: 0.08,
            backgroundImage: `
              linear-gradient(rgba(0,0,0,0.25) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,0,0,0.25) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
      )}

      <View style={styles.logoSection}>
        <View style={styles.iconWrapper}>
          <Image source={require('../assets/cosmart_logo_blue_black.png')} style={styles.logo}/>
        </View>
        <GradientText text="CO-SMART" style={styles.header} gradient={GRADIENTS.accent}/>
        <Text style={styles.subHeader}>Enhance your computing experience</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.loginTop}>
          <Text style={styles.loginTitle}>Welcome Back</Text>
          <Text style={styles.loginSubtitle}>Sign in to access Co-Smart</Text>
        </View>
        <View style={styles.form}>
          
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputGroup}>
            <Mail size={20} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={COLORS.textSecondary}
              value={email}
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputGroup}>
            <Lock size={20} style={styles.icon} />
            <TextInput
              style={[styles.input, { paddingRight: 40 }]}
              placeholder="Password"
              placeholderTextColor={COLORS.textSecondary}
              secureTextEntry={!showPassword}
              value={password}
              autoCapitalize="none"
              onChangeText={setPassword}
            />
          
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20}/>
              ) : (
                <Eye size={20}/>
              )}
            </TouchableOpacity>
          </View>

          {/* Forgot password */}
          <TouchableOpacity style={styles.forgot}>
            <Text style={styles.forgotText}>Forgot password?</Text>
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: COLORS.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.loginButtonText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {__DEV__ && (
            <View style={styles.debugLogin}>
              <Button title="No Auth Login" onPress={handleLoginDebug} />
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

export const GRADIENTS = {
  accent: {
    colors: ['#3C83F6', '#22D3EE'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

const COLORS = {
  bg: '#F7F8FA',
  card: '#FFFFFF',
  textPrimary: '#1A1A1A',
  textSecondary: '#6B7280',
  primary: '#3B82F6',
  primaryTranslucent: '#3b83f61a',
  primaryHover: '#2563EB',
  primarySoft: '#DBEAFE',
  danger: '#EF4444',
  dangerHover: '#c02d2dff',
  dangerSoft: '#FEE2E2',
  success: '#22C55E',
  successHover: '#16a349ff',
  border: '#E5E7EB',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subHeader: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 128,
    height: 128,
    resizeMode: 'contain',
    marginBottom: '25px',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: '32px',
  },
  iconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gradientText: {
    fontSize: 28,
    fontWeight: '500',
    color: 'hsl(217, 91%, 60%)',
    marginBottom: 10,
    textAlign: 'center',
  },
  loginTop: {
    marginBottom: '24px',
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.textPrimary,
    textAlign: 'center',
    justifyContent: 'center',
  },
  loginSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 10,
    textAlign: 'center',
    justifyContent: 'center',
  },
  card: {
    width: 420,
    padding: 24,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: 'hsla(220,13%,91%,0.3)',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 30,
  },
  form: {
    width: '100%',
  },
  inputGroup: {
    marginBottom: 16,
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    top: 15,
    left: 12,
    color: COLORS.textSecondary
  },
  eyeButton: {
    position: 'absolute',
    top: 15,
    right: 12,
    color: COLORS.textSecondary
  },
  input: {
    width: '100%',
    height: 48,
    paddingLeft: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderWidth: 1,
    borderColor: '#6b72805d',
    fontSize: 14,
    color: COLORS.textPrimary,
    marginBottom: '10px',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
    color: 'hsl(0,0%,100%)',
    fontSize: 16,
    fontWeight: '600',
  },
  forgot: {
    alignSelf: 'flex-end',
    marginBottom: 12,
  },
  forgotText: {
    color: 'hsl(217, 91%, 60%)',
    fontSize: 14,
    fontWeight: '500',
  },
  registerLink: {
    marginTop: 16,
    alignSelf: 'center',
  },
  debugLogin: {
    marginTop: 20,
  },
  link: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    letterSpacing: 0.4,
    textAlign: 'center',
  },
});
