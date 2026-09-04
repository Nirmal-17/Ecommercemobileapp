import React, {useCallback, useState} from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {useCart, useWishlist} from '../App';

const USER_NAME_KEY = '@user_name';
const USER_EMAIL_KEY = '@user_email';
const LOGIN_STATUS_KEY = '@login_status';

export type ProfileScreenProps = {
  navigation: any;
};

function ProfileScreen({navigation}: ProfileScreenProps) {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  let cartCtx: Partial<ReturnType<typeof useCart>> = {};
  let wishlistCtx: Partial<ReturnType<typeof useWishlist>> = {};
  try {
    cartCtx = useCart();
  } catch {}
  try {
    wishlistCtx = useWishlist();
  } catch {}

  const cartCount = cartCtx.cartCount ?? 0;
  const wishlistCount = wishlistCtx.wishlistCount ?? 0;

  const loadUserData = async () => {
    try {
      const [savedName, savedEmail, loginStatus] = await Promise.all([
        AsyncStorage.getItem(USER_NAME_KEY),
        AsyncStorage.getItem(USER_EMAIL_KEY),
        AsyncStorage.getItem(LOGIN_STATUS_KEY),
      ]);

      if (savedName) setName(savedName);
      if (savedEmail) setEmail(savedEmail);
      setLoggedIn(loginStatus === 'true');
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserData();
    }, []),
  );

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out of your account?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          try {
            await Promise.all([
              AsyncStorage.removeItem(USER_NAME_KEY),
              AsyncStorage.removeItem(USER_EMAIL_KEY),
              AsyncStorage.removeItem(LOGIN_STATUS_KEY),
            ]);
            navigation.getParent()?.replace('Login');
          } catch (error) {
            console.error('Error during logout:', error);
            Alert.alert('Error', 'Failed to log out. Please try again.');
          }
        },
      },
    ]);
  };

  const getInitials = (displayName: string) => {
    if (!displayName) return 'U';
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        {
          paddingTop: Math.max(insets.top + 16, 24),
          paddingBottom: insets.bottom + 30,
        },
      ]}
      showsVerticalScrollIndicator={false}>
      {/* PROFILE HEADER AVATAR */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>

        <Text style={styles.userName}>{name || 'Valued Shopper'}</Text>
        <Text style={styles.userEmail}>{email || 'user@example.com'}</Text>

        <View style={styles.statusBadge}>
          <View
            style={[
              styles.statusDot,
              {backgroundColor: loggedIn ? '#16a34a' : '#a1a1aa'},
            ]}
          />
          <Text style={styles.statusText}>
            {loggedIn ? 'Active Account' : 'Guest Mode'}
          </Text>
        </View>
      </View>

      {/* QUICK STATS ROW */}
      <View style={styles.statsCard}>
        <Pressable
          style={styles.statItem}
          onPress={() => navigation.navigate('Orders')}>
          <Ionicons name="receipt-outline" size={22} color="#ff6b00" />
          <Text style={styles.statLabel}>Orders</Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          style={styles.statItem}
          onPress={() => navigation.navigate('Wishlist')}>
          <Ionicons name="heart-outline" size={22} color="#ff3b30" />
          <Text style={styles.statLabel}>
            Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ''}
          </Text>
        </Pressable>

        <View style={styles.statDivider} />

        <Pressable
          style={styles.statItem}
          onPress={() => navigation.navigate('Cart')}>
          <Ionicons name="cart-outline" size={22} color="#ff6b00" />
          <Text style={styles.statLabel}>
            Cart {cartCount > 0 ? `(${cartCount})` : ''}
          </Text>
        </Pressable>
      </View>

      {/* MAIN MENU SECTION */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Activity & Orders</Text>

        {/* MY ORDERS */}
        <Pressable
          style={({pressed}) => [styles.menuItem, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Orders')}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#fff4eb'}]}>
              <Ionicons name="receipt-outline" size={20} color="#ff6b00" />
            </View>
            <Text style={styles.menuLabel}>My Orders</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
        </Pressable>

        {/* WISHLIST */}
        <Pressable
          style={({pressed}) => [styles.menuItem, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Wishlist')}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#fee2e2'}]}>
              <Ionicons name="heart-outline" size={20} color="#ff3b30" />
            </View>
            <Text style={styles.menuLabel}>My Wishlist</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
        </Pressable>

        {/* SHOPPING CART */}
        <Pressable
          style={({pressed}) => [
            styles.menuItem,
            styles.lastMenuItem,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('Cart')}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#f4f4f5'}]}>
              <Ionicons name="cart-outline" size={20} color="#18181b" />
            </View>
            <Text style={styles.menuLabel}>Shopping Cart</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
        </Pressable>
      </View>

      {/* SETTINGS & SUPPORT */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionHeader}>Support & Info</Text>

        <Pressable
          style={({pressed}) => [styles.menuItem, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert('Customer Support', 'Contact us at support@storeapp.com')
          }>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#eff6ff'}]}>
              <Ionicons
                name="help-circle-outline"
                size={20}
                color="#2563eb"
              />
            </View>
            <Text style={styles.menuLabel}>Help & Support</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
        </Pressable>

        <Pressable
          style={({pressed}) => [styles.menuItem, pressed && styles.pressed]}
          onPress={() =>
            Alert.alert(
              'Privacy & Terms',
              'Your privacy is guaranteed. All payments are secured with end-to-end encryption.',
            )
          }>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#f0fdf4'}]}>
              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#16a34a"
              />
            </View>
            <Text style={styles.menuLabel}>Privacy & Terms</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#a1a1aa" />
        </Pressable>

        <View style={[styles.menuItem, styles.lastMenuItem]}>
          <View style={styles.menuLeft}>
            <View style={[styles.menuIconBox, {backgroundColor: '#f4f4f5'}]}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color="#71717a"
              />
            </View>
            <Text style={styles.menuLabel}>App Version</Text>
          </View>
          <Text style={styles.versionText}>v1.0.0</Text>
        </View>
      </View>

      {/* LOGOUT BUTTON */}
      <Pressable
        style={({pressed}) => [
          styles.logoutButton,
          pressed && styles.pressed,
        ]}
        onPress={handleLogout}>
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#ff3b30"
          style={styles.logoutIcon}
        />
        <Text style={styles.logoutText}>Log Out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    paddingHorizontal: 16,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#ff6b00',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
  },
  userName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#52525b',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#52525b',
  },
  statDivider: {
    width: 1,
    height: '60%',
    alignSelf: 'center',
    backgroundColor: '#f4f4f5',
  },
  sectionCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
  },
  versionText: {
    fontSize: 13,
    color: '#a1a1aa',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#fff1f2',
    height: 52,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecdd3',
    marginTop: 4,
  },
  logoutIcon: {
    marginRight: 8,
  },
  logoutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default ProfileScreen;