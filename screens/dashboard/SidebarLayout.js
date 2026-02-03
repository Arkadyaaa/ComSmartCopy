import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import supabase from '../../services/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { House, BookText, ChartBar, PcCase, CircleUser, CircleQuestionMark, Bell, LogOut } from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', route: 'Dashboard', icon: House },
  { label: 'Learning Materials', route: 'LearningMaterials', icon: BookText },
  { label: 'Assessment', route: 'Assessment', icon: ChartBar },
  { label: 'PC Recommendation', route: 'PCRecommendation', icon: PcCase },
];

const BOTTOM_ITEMS = [
  { label: 'User Account', route: 'UserAccount', icon: CircleUser },
  { label: 'Help', route: 'Help', icon: CircleQuestionMark },
  { label: 'Notification', route: 'Notification', icon: Bell },
];

export default function SidebarLayout({ activeTab, children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [active, setActive] = useState(activeTab || 'Dashboard');
  // Get user from navigation params
  const user = route.params?.user;

  const sidebarWidth = Dimensions.get('window').width > 600 ? 260 : 90;

  const handleNav = (item) => {
    setActive(item.label);
    navigation.navigate(item.route, { user });
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      await AsyncStorage.removeItem('noAuth');
      await AsyncStorage.removeItem('role');
      try {
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('noAuth');
          localStorage.removeItem('role');
        }
      } catch (_) {}
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error logging out. Please try again.');
    }
  };

  return (
    <View style={styles.wrapper}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { width: sidebarWidth }]}>

        {/* Logo and Title */}
        <View style={styles.logoRow}>
          <LinearGradient
            colors={['#22D3EE', '#3C83F6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[StyleSheet.absoluteFill]}
          />

          <Image source={require('../../assets/cosmart_logo_white.png')} style={styles.logo} />
          {sidebarWidth > 120 && <Text style={styles.title}>CO-SMART</Text>}
        </View>

        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userImagePlaceholder}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.userImage} />
            ) : (
              <Text style={styles.userInitial}>{user?.username?.[0]?.toUpperCase() || '?'}</Text>
            )}
          </View>
          {sidebarWidth > 120 && user && (
            <>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userRole}>{user.userType ? `(${user.userType})` : ''}</Text>
            </>
          )}
        </View>

        {/* Navigation */}
        <View style={styles.navSection}>
          {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.label}
              onPress={() => handleNav(item)}
              style={({ pressed }) => [
                styles.navItem,
                active === item.label && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Icon size={20} color="#22D3EE" style={{ marginRight: 12 }} /> 
              {sidebarWidth > 120 && <Text style={styles.navLabel}>{item.label}</Text>}
            </Pressable>
          )})}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {BOTTOM_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Pressable
              key={item.label}
              onPress={() => handleNav(item)}
              style={({ pressed }) => [
                styles.navItem,
                active === item.label && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Icon size={20} color="#22D3EE" style={{ marginRight: 12 }} />
              {sidebarWidth > 120 && <Text style={styles.navLabel}>{item.label}</Text>}
            </Pressable>
          )})}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
              { marginTop: 16, borderTopWidth: 1, borderTopColor: '#444' }
            ]}
          >
            <LogOut size={20} color="#22D3EE" style={{ marginRight: 12 }}/>
            {sidebarWidth > 120 && <Text style={styles.navLabel}>Log Out</Text>}
          </Pressable>
        </View>
      </View>
      
      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentInner}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ededed',
  },
  sidebar: {
    backgroundColor: '#222',
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#38598b',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  logo: {
    width: 44,
    height: 44,
    resizeMode: 'contain',
    marginLeft: '14px',
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  userImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInitial: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userRole: {
    color: '#ccc',
    fontSize: 12,
  },
  navSection: {
    marginTop: 16,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#5585b581',
  },
  navItemPressed: {
    backgroundColor: '#5585b5c9',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#fff',
  },
  navLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#ededed',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden', 
    height: '100vh', 
  },
  contentInner: {
    flexGrow: 1,
    height: '100%', 
    overflow: 'auto', 
  },
});
