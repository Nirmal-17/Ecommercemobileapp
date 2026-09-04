import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ActivityIndicator,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

// SCREENS
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import WishlistScreen from './screens/WishlistScreen';
import CartScreen from './screens/CartScreen';
import ProfileScreen from './screens/ProfileScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import OrdersScreen from './screens/OrdersScreen';
import OrderSuccessScreen from './screens/OrderSuccessScreen';
import OrderDetailsScreen from './screens/OrderDetailsScreen';

// ============================================================================
// TYPES
// ============================================================================
export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category?: string;
  description?: string;
};

export type CartItem = Product & {
  quantity: number;
};

export type RootStackParamList = {
  Login: undefined;
  MainTabs: undefined;
  ProductDetails: {product: Product};
  Checkout: {cartItems?: CartItem[]; clearCart?: () => void} | undefined;
  OrderSuccess: undefined;
  Orders: undefined;
  OrderDetails: {orderId?: string} | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wishlist: undefined;
  Cart: undefined;
  Profile: undefined;
};

// ============================================================================
// CONTEXT DEFINITIONS
// ============================================================================
export type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;
  addToCart: (product: Product, quantity?: number) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => Promise<void>;
};

export type WishlistContextType = {
  wishlist: Product[];
  wishlistCount: number;
  toggleWishlist: (product: Product) => void;
  isWishlisted: (productId: string) => boolean;
};

export const CartContext = createContext<CartContextType | undefined>(undefined);
export const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartContext.Provider');
  }
  return context;
}

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistContext.Provider');
  }
  return context;
}

// STORAGE KEYS
const CART_STORAGE_KEY = '@cart_items';
const WISHLIST_STORAGE_KEY = '@wishlist_items';
const LOGIN_STATUS_KEY = '@login_status';

// NAVIGATION CREATORS
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// ============================================================================
// SCREEN WRAPPERS
// (Maintains stable component identities so React Navigation does not
//  destroy and remount screens on state changes)
// ============================================================================
function HomeScreenWrapper(props: any) {
  const {wishlist, toggleWishlist} = useWishlist();
  const {addToCart} = useCart();
  return (
    <HomeScreen
      {...props}
      wishlist={wishlist}
      toggleWishlist={toggleWishlist}
      addToCart={addToCart}
    />
  );
}

function WishlistScreenWrapper(props: any) {
  const {wishlist, toggleWishlist} = useWishlist();
  const {addToCart} = useCart();
  return (
    <WishlistScreen
      {...props}
      wishlist={wishlist}
      wishlistItems={wishlist}
      toggleWishlist={toggleWishlist}
      addToCart={addToCart}
    />
  );
}

function CartScreenWrapper(props: any) {
  const {
    cartItems,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
  } = useCart();
  return (
    <CartScreen
      {...props}
      cartItems={cartItems}
      increaseQuantity={increaseQuantity}
      decreaseQuantity={decreaseQuantity}
      removeFromCart={removeFromCart}
      clearCart={clearCart}
    />
  );
}

function ProductDetailsScreenWrapper(props: any) {
  const {addToCart} = useCart();
  return <ProductDetailsScreen {...props} addToCart={addToCart} />;
}

function CheckoutScreenWrapper(props: any) {
  const {cartItems, clearCart} = useCart();
  return (
    <CheckoutScreen
      {...props}
      cartItems={cartItems}
      clearCart={clearCart}
    />
  );
}

// ============================================================================
// TAB ICON HELPER
// ============================================================================
function getTabIcon(routeName: keyof MainTabParamList, focused: boolean): any {
  switch (routeName) {
    case 'Home':
      return focused ? 'home' : 'home-outline';
    case 'Wishlist':
      return focused ? 'heart' : 'heart-outline';
    case 'Cart':
      return focused ? 'cart' : 'cart-outline';
    case 'Profile':
      return focused ? 'person' : 'person-outline';
    default:
      return 'ellipse-outline';
  }
}

// ============================================================================
// BOTTOM TABS NAVIGATOR
// ============================================================================
function MainTabsNavigator() {
  const {cartCount} = useCart();
  const {wishlistCount} = useWishlist();

  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarActiveTintColor: '#ff6b00',
        tabBarInactiveTintColor: '#8e8e93',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({focused, color, size}) => (
          <Ionicons
            name={getTabIcon(route.name, focused)}
            size={size}
            color={color}
          />
        ),
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{tabBarLabel: 'Home'}}
      />
      <Tab.Screen
        name="Wishlist"
        component={WishlistScreenWrapper}
        options={{
          tabBarLabel: 'Wishlist',
          tabBarBadge:
            wishlistCount > 0
              ? wishlistCount > 99
                ? '99+'
                : wishlistCount
              : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
        }}
      />
      <Tab.Screen
        name="Cart"
        component={CartScreenWrapper}
        options={{
          tabBarLabel: 'Cart',
          tabBarBadge:
            cartCount > 0 ? (cartCount > 99 ? '99+' : cartCount) : undefined,
          tabBarBadgeStyle: styles.badgeStyle,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{tabBarLabel: 'Profile'}}
      />
    </Tab.Navigator>
  );
}

// ============================================================================
// LOADING SCREEN
// ============================================================================
function AppLoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#ff6b00" />
      <Text style={styles.loadingText}>Loading store...</Text>
    </View>
  );
}

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
export default function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);

  // Load Saved Cart, Wishlist & Auth Status
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const [savedCart, savedWishlist, savedLoginStatus] = await Promise.all([
          AsyncStorage.getItem(CART_STORAGE_KEY),
          AsyncStorage.getItem(WISHLIST_STORAGE_KEY),
          AsyncStorage.getItem(LOGIN_STATUS_KEY),
        ]);

        if (isMounted) {
          if (savedCart) {
            try {
              const parsed = JSON.parse(savedCart);
              if (Array.isArray(parsed)) {
                setCartItems(parsed);
              }
            } catch (err) {
              console.warn('Failed to parse saved cart data:', err);
            }
          }

          if (savedWishlist) {
            try {
              const parsed = JSON.parse(savedWishlist);
              if (Array.isArray(parsed)) {
                setWishlist(parsed);
              }
            } catch (err) {
              console.warn('Failed to parse saved wishlist data:', err);
            }
          }

          if (savedLoginStatus === 'true') {
            setIsLoggedIn(true);
          }
        }
      } catch (error) {
        console.error('Error loading initial app data:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Save Cart Changes
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems)).catch(
        error => console.error('Error saving cart to storage:', error),
      );
    }
  }, [cartItems, loading]);

  // Save Wishlist Changes
  useEffect(() => {
    if (!loading) {
      AsyncStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist)).catch(
        error => console.error('Error saving wishlist to storage:', error),
      );
    }
  }, [wishlist, loading]);

  // Cart Operations
  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(item => item.id === product.id);
      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? {...item, quantity: Number(item.quantity || 0) + quantity}
            : item,
        );
      }
      return [...currentItems, {...product, quantity}];
    });
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? {...item, quantity: Number(item.quantity || 0) + 1}
          : item,
      ),
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setCartItems(currentItems =>
      currentItems
        .map(item =>
          item.id === productId
            ? {...item, quantity: Number(item.quantity || 0) - 1}
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCartItems(currentItems =>
      currentItems.filter(item => item.id !== productId),
    );
  }, []);

  const clearCart = useCallback(async () => {
    setCartItems([]);
    try {
      await AsyncStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    } catch (error) {
      console.error('Error clearing cart storage:', error);
    }
  }, []);

  // Wishlist Operations
  const toggleWishlist = useCallback((product: Product) => {
    setWishlist(currentWishlist => {
      const exists = currentWishlist.some(item => item.id === product.id);
      if (exists) {
        return currentWishlist.filter(item => item.id !== product.id);
      }
      return [...currentWishlist, product];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => wishlist.some(item => item.id === productId),
    [wishlist],
  );

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  const wishlistCount = wishlist.length;

  // Memoized Context Values
  const cartContextValue = useMemo(
    () => ({
      cartItems,
      cartCount,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    }),
    [
      cartItems,
      cartCount,
      addToCart,
      increaseQuantity,
      decreaseQuantity,
      removeFromCart,
      clearCart,
    ],
  );

  const wishlistContextValue = useMemo(
    () => ({
      wishlist,
      wishlistCount,
      toggleWishlist,
      isWishlisted,
    }),
    [wishlist, wishlistCount, toggleWishlist, isWishlisted],
  );

  if (loading) {
    return <AppLoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" />
      <CartContext.Provider value={cartContextValue}>
        <WishlistContext.Provider value={wishlistContextValue}>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={isLoggedIn ? 'MainTabs' : 'Login'}
              screenOptions={{headerShown: false}}>
              {/* LOGIN */}
              <Stack.Screen name="Login" component={LoginScreen} />

              {/* MAIN TABS */}
              <Stack.Screen name="MainTabs" component={MainTabsNavigator} />

              {/* PRODUCT DETAILS */}
              <Stack.Screen
                name="ProductDetails"
                component={ProductDetailsScreenWrapper}
              />

              {/* CHECKOUT */}
              <Stack.Screen
                name="Checkout"
                component={CheckoutScreenWrapper}
              />

              {/* ORDER SUCCESS */}
              <Stack.Screen
                name="OrderSuccess"
                component={OrderSuccessScreen}
              />

              {/* ORDERS LIST */}
              <Stack.Screen name="Orders" component={OrdersScreen} />

              {/* ORDER DETAILS */}
              <Stack.Screen
                name="OrderDetails"
                component={OrderDetailsScreen}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </WishlistContext.Provider>
      </CartContext.Provider>
    </SafeAreaProvider>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '500',
    color: '#666666',
  },
  tabBar: {
    height: 65,
    paddingBottom: 8,
    paddingTop: 6,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  badgeStyle: {
    backgroundColor: '#ff3b30',
    fontSize: 10,
    fontWeight: 'bold',
  },
});