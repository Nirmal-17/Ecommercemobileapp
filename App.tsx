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
// CONFIGURATION
// ============================================================================

const BACKEND_URL = 'http://10.0.2.2:5000';
const LOGIN_STATUS_KEY = '@login_status';
const USER_ID_KEY = '@user_id';

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

  ProductDetails: {
    product: Product;
  };

  Checkout:
    | {
        cartItems?: CartItem[];
        clearCart?: () => void;
      }
    | undefined;

  OrderSuccess: undefined;

  Orders: undefined;

  OrderDetails:
    | {
        orderId?: string;
      }
    | undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Wishlist: undefined;
  Cart: undefined;
  Profile: undefined;
};

// ============================================================================
// CART CONTEXT
// ============================================================================

export type CartContextType = {
  cartItems: CartItem[];
  cartCount: number;

  addToCart: (product: Product, quantity?: number) => Promise<void>;

  increaseQuantity: (productId: string) => Promise<void>;

  decreaseQuantity: (productId: string) => Promise<void>;

  removeFromCart: (productId: string) => Promise<void>;

  clearCart: () => Promise<void>;

  refreshCart: () => Promise<void>;
};

export const CartContext = createContext<
  CartContextType | undefined
>(undefined);

export function useCart(): CartContextType {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      'useCart must be used within CartContext.Provider',
    );
  }

  return context;
}

// ============================================================================
// WISHLIST CONTEXT
// ============================================================================

export type WishlistContextType = {
  wishlist: Product[];
  wishlistCount: number;

  toggleWishlist: (product: Product) => Promise<void>;

  isWishlisted: (productId: string) => boolean;

  refreshWishlist: () => Promise<void>;
};

export const WishlistContext = createContext<
  WishlistContextType | undefined
>(undefined);

export function useWishlist(): WishlistContextType {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error(
      'useWishlist must be used within WishlistContext.Provider',
    );
  }

  return context;
}

// ============================================================================
// NAVIGATION
// ============================================================================

const Stack =
  createNativeStackNavigator<RootStackParamList>();

const Tab =
  createBottomTabNavigator<MainTabParamList>();

// ============================================================================
// HOME WRAPPER
// ============================================================================

function HomeScreenWrapper(props: any) {
  const {wishlist, toggleWishlist} =
    useWishlist();

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

// ============================================================================
// WISHLIST WRAPPER
// ============================================================================

function WishlistScreenWrapper(props: any) {
  return <WishlistScreen {...props} />;
}

// ============================================================================
// CART WRAPPER
// ============================================================================

function CartScreenWrapper(props: any) {
  return <CartScreen {...props} />;
}

// ============================================================================
// PRODUCT DETAILS WRAPPER
// ============================================================================

function ProductDetailsScreenWrapper(props: any) {
  const {addToCart} = useCart();

  return (
    <ProductDetailsScreen
      {...props}
      addToCart={addToCart}
    />
  );
}

// ============================================================================
// CHECKOUT WRAPPER
// ============================================================================

function CheckoutScreenWrapper(props: any) {
  const {cartItems, clearCart} =
    useCart();

  return (
    <CheckoutScreen
      {...props}
      cartItems={cartItems}
      clearCart={clearCart}
    />
  );
}

// ============================================================================
// TAB ICON
// ============================================================================

function getTabIcon(
  routeName: keyof MainTabParamList,
  focused: boolean,
): any {
  switch (routeName) {
    case 'Home':
      return focused
        ? 'home'
        : 'home-outline';

    case 'Wishlist':
      return focused
        ? 'heart'
        : 'heart-outline';

    case 'Cart':
      return focused
        ? 'cart'
        : 'cart-outline';

    case 'Profile':
      return focused
        ? 'person'
        : 'person-outline';

    default:
      return 'ellipse-outline';
  }
}

// ============================================================================
// MAIN TABS
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

        tabBarIcon: ({
          focused,
          color,
          size,
        }) => (
          <Ionicons
            name={getTabIcon(
              route.name,
              focused,
            )}
            size={size}
            color={color}
          />
        ),
      })}>
      
      <Tab.Screen
        name="Home"
        component={HomeScreenWrapper}
        options={{
          tabBarLabel: 'Home',
        }}
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

          tabBarBadgeStyle:
            styles.badgeStyle,
        }}
      />

      <Tab.Screen
        name="Cart"
        component={CartScreenWrapper}
        options={{
          tabBarLabel: 'Cart',

          tabBarBadge:
            cartCount > 0
              ? cartCount > 99
                ? '99+'
                : cartCount
              : undefined,

          tabBarBadgeStyle:
            styles.badgeStyle,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
        }}
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
      <ActivityIndicator
        size="large"
        color="#ff6b00"
      />

      <Text style={styles.loadingText}>
        Loading store...
      </Text>
    </View>
  );
}

// ============================================================================
// MAIN APP
// ============================================================================

export default function App() {
  const [cartItems, setCartItems] =
    useState<CartItem[]>([]);

  const [wishlist, setWishlist] =
    useState<Product[]>([]);

  const [isLoggedIn, setIsLoggedIn] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  // ==========================================================================
  // LOAD LOGIN STATE
  // ==========================================================================

  useEffect(() => {
    let mounted = true;

    const initializeApp = async () => {
      try {
        const [
          loginStatus,
          userId,
        ] = await Promise.all([
          AsyncStorage.getItem(
            LOGIN_STATUS_KEY,
          ),
          AsyncStorage.getItem(
            USER_ID_KEY,
          ),
        ]);

        if (
          mounted &&
          loginStatus === 'true' &&
          userId
        ) {
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error(
          'Failed to initialize app:',
          error,
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeApp();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================================
  // LOAD CART FROM POSTGRESQL
  // ==========================================================================

  const refreshCart =
    useCallback(async () => {
      try {
        const userId =
          await AsyncStorage.getItem(
            USER_ID_KEY,
          );

        if (!userId) {
          setCartItems([]);
          return;
        }

        const response = await fetch(
          `${BACKEND_URL}/api/cart/${Number(
            userId,
          )}`,
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              'Failed to load cart',
          );
        }

        const backendCart: CartItem[] = (
          data.cart || []
        ).map((item: any) => ({
          id: String(item.id),
          name: item.name,
          price: Number(
            item.price || 0,
          ),
          image: item.image,
          description:
            item.description,
          category: item.category,
          quantity: Number(
            item.quantity || 1,
          ),
        }));

        setCartItems(backendCart);
      } catch (error) {
        console.error(
          'Failed to load cart:',
          error,
        );
      }
    }, []);

  // ==========================================================================
  // LOAD WISHLIST FROM POSTGRESQL
  // ==========================================================================

  const refreshWishlist =
    useCallback(async () => {
      try {
        const userId =
          await AsyncStorage.getItem(
            USER_ID_KEY,
          );

        if (!userId) {
          setWishlist([]);
          return;
        }

        const response = await fetch(
          `${BACKEND_URL}/api/wishlist/${Number(
            userId,
          )}`,
        );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              'Failed to load wishlist',
          );
        }

        const backendWishlist: Product[] = (
          data.wishlist || []
        ).map((item: any) => ({
          id: String(item.id),
          name: item.name,
          price: Number(
            item.price || 0,
          ),
          image: item.image,
          description:
            item.description,
          category: item.category,
        }));

        setWishlist(
          backendWishlist,
        );
      } catch (error) {
        console.error(
          'Failed to load wishlist:',
          error,
        );
      }
    }, []);

  // ==========================================================================
  // LOAD CART + WISHLIST AFTER LOGIN
  // ==========================================================================

  useEffect(() => {
    if (!isLoggedIn) {
      setCartItems([]);
      setWishlist([]);
      return;
    }

    refreshCart();
    refreshWishlist();
  }, [
    isLoggedIn,
    refreshCart,
    refreshWishlist,
  ]);

  // ==========================================================================
  // CART - ADD
  // ==========================================================================

  const addToCart =
    useCallback(
      async (
        product: Product,
        quantity: number = 1,
      ) => {
        try {
          const userId =
            await AsyncStorage.getItem(
              USER_ID_KEY,
            );

          if (!userId) {
            console.warn(
              'Please login first.',
            );
            return;
          }

          const response =
            await fetch(
              `${BACKEND_URL}/api/cart`,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body: JSON.stringify({
                  userId: Number(
                    userId,
                  ),

                  productId: Number(
                    product.id,
                  ),

                  quantity,
                }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to add to cart',
            );
          }

          await refreshCart();
        } catch (error) {
          console.error(
            'Add to cart error:',
            error,
          );
        }
      },
      [refreshCart],
    );

  // ==========================================================================
  // CART - INCREASE
  // ==========================================================================

  const increaseQuantity =
    useCallback(
      async (productId: string) => {
        try {
          const userId =
            await AsyncStorage.getItem(
              USER_ID_KEY,
            );

          if (!userId) return;

          const currentItem =
            cartItems.find(
              item =>
                item.id === productId,
            );

          if (!currentItem) return;

          const newQuantity =
            Number(
              currentItem.quantity,
            ) + 1;

          const response =
            await fetch(
              `${BACKEND_URL}/api/cart/${Number(
                userId,
              )}/${Number(
                productId,
              )}`,
              {
                method: 'PUT',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body: JSON.stringify({
                  quantity:
                    newQuantity,
                }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to update cart',
            );
          }

          await refreshCart();
        } catch (error) {
          console.error(
            'Increase quantity error:',
            error,
          );
        }
      },
      [cartItems, refreshCart],
    );

  // ==========================================================================
  // CART - DECREASE
  // ==========================================================================

  const decreaseQuantity =
    useCallback(
      async (productId: string) => {
        try {
          const userId =
            await AsyncStorage.getItem(
              USER_ID_KEY,
            );

          if (!userId) return;

          const currentItem =
            cartItems.find(
              item =>
                item.id === productId,
            );

          if (!currentItem) return;

          const newQuantity =
            Number(
              currentItem.quantity,
            ) - 1;

          if (newQuantity <= 0) {
            await removeFromCart(
              productId,
            );

            return;
          }

          const response =
            await fetch(
              `${BACKEND_URL}/api/cart/${Number(
                userId,
              )}/${Number(
                productId,
              )}`,
              {
                method: 'PUT',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body: JSON.stringify({
                  quantity:
                    newQuantity,
                }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to update cart',
            );
          }

          await refreshCart();
        } catch (error) {
          console.error(
            'Decrease quantity error:',
            error,
          );
        }
      },
      [cartItems, refreshCart],
    );

  // ==========================================================================
  // CART - REMOVE
  // ==========================================================================

  const removeFromCart =
    useCallback(
      async (productId: string) => {
        try {
          const userId =
            await AsyncStorage.getItem(
              USER_ID_KEY,
            );

          if (!userId) return;

          const response =
            await fetch(
              `${BACKEND_URL}/api/cart/${Number(
                userId,
              )}/${Number(
                productId,
              )}`,
              {
                method: 'DELETE',
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to remove cart item',
            );
          }

          await refreshCart();
        } catch (error) {
          console.error(
            'Remove cart error:',
            error,
          );
        }
      },
      [refreshCart],
    );

  // ==========================================================================
  // CART - CLEAR
  // ==========================================================================

  const clearCart =
    useCallback(async () => {
      try {
        const userId =
          await AsyncStorage.getItem(
            USER_ID_KEY,
          );

        if (!userId) {
          setCartItems([]);
          return;
        }

        const response =
          await fetch(
            `${BACKEND_URL}/api/cart/${Number(
              userId,
            )}`,
            {
              method: 'DELETE',
            },
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.message ||
              'Failed to clear cart',
          );
        }

        setCartItems([]);
      } catch (error) {
        console.error(
          'Clear cart error:',
          error,
        );
      }
    }, []);

  // ==========================================================================
  // WISHLIST - TOGGLE
  // ==========================================================================

  const toggleWishlist =
    useCallback(
      async (product: Product) => {
        try {
          const userId =
            await AsyncStorage.getItem(
              USER_ID_KEY,
            );

          if (!userId) {
            console.warn(
              'Please login first.',
            );
            return;
          }

          const numericUserId =
            Number(userId);

          const numericProductId =
            Number(product.id);

          const exists =
            wishlist.some(
              item =>
                item.id === product.id,
            );

          // --------------------------------------------------------------
          // REMOVE
          // --------------------------------------------------------------

          if (exists) {
            const response =
              await fetch(
                `${BACKEND_URL}/api/wishlist/${numericUserId}/${numericProductId}`,
                {
                  method: 'DELETE',
                },
              );

            const data =
              await response.json();

            if (
              !response.ok ||
              !data.success
            ) {
              throw new Error(
                data.message ||
                  'Failed to remove wishlist item',
              );
            }

            await refreshWishlist();

            return;
          }

          // --------------------------------------------------------------
          // ADD
          // --------------------------------------------------------------

          const response =
            await fetch(
              `${BACKEND_URL}/api/wishlist`,
              {
                method: 'POST',

                headers: {
                  'Content-Type':
                    'application/json',
                },

                body: JSON.stringify({
                  userId:
                    numericUserId,

                  productId:
                    numericProductId,
                }),
              },
            );

          const data =
            await response.json();

          if (
            !response.ok ||
            !data.success
          ) {
            throw new Error(
              data.message ||
                'Failed to add wishlist item',
            );
          }

          await refreshWishlist();
        } catch (error) {
          console.error(
            'Wishlist operation error:',
            error,
          );
        }
      },
      [wishlist, refreshWishlist],
    );

  // ==========================================================================
  // WISHLIST CHECK
  // ==========================================================================

  const isWishlisted =
    useCallback(
      (productId: string) => {
        return wishlist.some(
          item =>
            item.id === productId,
        );
      },
      [wishlist],
    );

  // ==========================================================================
  // COUNTS
  // ==========================================================================

  const cartCount =
    useMemo(() => {
      return cartItems.reduce(
        (total, item) =>
          total +
          Number(
            item.quantity || 0,
          ),
        0,
      );
    }, [cartItems]);

  const wishlistCount =
    wishlist.length;

  // ==========================================================================
  // CART CONTEXT
  // ==========================================================================

  const cartContextValue =
    useMemo(
      () => ({
        cartItems,
        cartCount,

        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,

        refreshCart,
      }),
      [
        cartItems,
        cartCount,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
      ],
    );

  // ==========================================================================
  // WISHLIST CONTEXT
  // ==========================================================================

  const wishlistContextValue =
    useMemo(
      () => ({
        wishlist,
        wishlistCount,

        toggleWishlist,
        isWishlisted,

        refreshWishlist,
      }),
      [
        wishlist,
        wishlistCount,
        toggleWishlist,
        isWishlisted,
        refreshWishlist,
      ],
    );

  // ==========================================================================
  // LOADING
  // ==========================================================================

  if (loading) {
    return <AppLoadingScreen />;
  }

  // ==========================================================================
  // APP
  // ==========================================================================

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle="dark-content"
      />

      <CartContext.Provider
        value={cartContextValue}>
        <WishlistContext.Provider
          value={
            wishlistContextValue
          }>
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName={
                isLoggedIn
                  ? 'MainTabs'
                  : 'Login'
              }
              screenOptions={{
                headerShown: false,
              }}>
              
              <Stack.Screen
                name="Login"
                component={
                  LoginScreen
                }
              />

              <Stack.Screen
                name="MainTabs"
                component={
                  MainTabsNavigator
                }
              />

              <Stack.Screen
                name="ProductDetails"
                component={
                  ProductDetailsScreenWrapper
                }
              />

              <Stack.Screen
                name="Checkout"
                component={
                  CheckoutScreenWrapper
                }
              />

              <Stack.Screen
                name="OrderSuccess"
                component={
                  OrderSuccessScreen
                }
              />

              <Stack.Screen
                name="Orders"
                component={
                  OrdersScreen
                }
              />

              <Stack.Screen
                name="OrderDetails"
                component={
                  OrderDetailsScreen
                }
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

const styles =
  StyleSheet.create({
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

      shadowOffset: {
        width: 0,
        height: -2,
      },

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