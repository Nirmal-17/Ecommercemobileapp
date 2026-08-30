import React, {useState} from 'react';

import {
  View,
  Text,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import Ionicons from '@react-native-vector-icons/ionicons';

import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import CartScreen from './screens/CartScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function ProfileScreen() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{fontSize: 25}}>
        User Profile
      </Text>
    </View>
  );
}

function MainTabs({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}: any) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: 'gray',
      }}
    >

      {/* HOME */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Home',
          tabBarLabel: 'Home',

          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="home-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* PRODUCTS */}
      <Tab.Screen
        name="Products"
        component={HomeScreen}
        options={{
          title: 'Products',
          tabBarLabel: 'Products',

          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="grid-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      {/* CART */}
      <Tab.Screen
        name="Cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',

          tabBarBadge:
            cartItems.length > 0
              ? cartItems.reduce(
                  (total: number, item: any) =>
                    total + item.quantity,
                  0,
                )
              : undefined,

          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="cart-outline"
              color={color}
              size={size}
            />
          ),
        }}
      >
        {props => (
          <CartScreen
            {...props}
            cartItems={cartItems}
            increaseQuantity={increaseQuantity}
            decreaseQuantity={decreaseQuantity}
            removeFromCart={removeFromCart}
          />
        )}
      </Tab.Screen>

      {/* PROFILE */}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',

          tabBarIcon: ({color, size}) => (
            <Ionicons
              name="person-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

    </Tab.Navigator>
  );
}

function App() {
  const [cartItems, setCartItems] = useState<any[]>([]);

  // ADD PRODUCT TO CART
  const addToCart = (product: any) => {
    setCartItems(currentItems => {
      const existingItem = currentItems.find(
        item => item.id === product.id,
      );

      if (existingItem) {
        return currentItems.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...currentItems,
        {
          ...product,
          quantity: 1,
        },
      ];
    });
  };

  // INCREASE QUANTITY
  const increaseQuantity = (productId: string) => {
    setCartItems(currentItems =>
      currentItems.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item,
      ),
    );
  };

  // DECREASE QUANTITY
  const decreaseQuantity = (productId: string) => {
    setCartItems(currentItems =>
      currentItems
        .map(item =>
          item.id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item,
        )
        .filter(item => item.quantity > 0),
    );
  };

  // REMOVE PRODUCT
  const removeFromCart = (productId: string) => {
    setCartItems(currentItems =>
      currentItems.filter(
        item => item.id !== productId,
      ),
    );
  };

  return (
    <NavigationContainer>

      <Stack.Navigator>

        {/* LOGIN */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            headerShown: false,
          }}
        />

        {/* MAIN BOTTOM NAVIGATION */}
        <Stack.Screen
          name="MainTabs"
          options={{
            headerShown: false,
          }}
        >
          {props => (
            <MainTabs
              {...props}
              cartItems={cartItems}
              increaseQuantity={increaseQuantity}
              decreaseQuantity={decreaseQuantity}
              removeFromCart={removeFromCart}
            />
          )}
        </Stack.Screen>

        {/* PRODUCT DETAILS */}
        <Stack.Screen
          name="ProductDetails"
          options={{
            title: 'Product Details',
          }}
        >
          {props => (
            <ProductDetailsScreen
              {...props}
              addToCart={addToCart}
            />
          )}
        </Stack.Screen>

      </Stack.Navigator>

    </NavigationContainer>
  );
}

export default App;
