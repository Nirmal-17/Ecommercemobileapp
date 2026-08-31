import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

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
import WishlistScreen from './screens/WishlistScreen';
import CheckoutScreen from './screens/CheckoutScreen';


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


// =====================================
// BOTTOM TAB NAVIGATION
// =====================================

function MainTabs({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,

  wishlist,
  toggleWishlist,

  addToCart,
}: any) {

  return (

    <Tab.Navigator

      screenOptions={{
        headerShown: true,

        tabBarActiveTintColor:
          '#5a81aa',

        tabBarInactiveTintColor:
          'gray',
      }}
    >

      {/* ================================= */}
      {/* HOME */}
      {/* ================================= */}

      <Tab.Screen
        name="Home"

        options={{
          title: 'Home',

          tabBarLabel: 'Home',

          tabBarIcon: ({
            color,
            size,
          }) => (

            <Ionicons
              name="home-outline"
              color={color}
              size={size}
            />

          ),
        }}
      >

        {props => (

          <HomeScreen
            {...props}

            wishlist={
              wishlist
            }

            toggleWishlist={
              toggleWishlist
            }
          />

        )}

      </Tab.Screen>


      {/* ================================= */}
      {/* PRODUCTS */}
      {/* ================================= */}

      <Tab.Screen
        name="Products"

        options={{
          title: 'Products',

          tabBarLabel: 'Products',

          tabBarIcon: ({
            color,
            size,
          }) => (

            <Ionicons
              name="grid-outline"
              color={color}
              size={size}
            />

          ),
        }}
      >

        {props => (

          <HomeScreen
            {...props}

            wishlist={
              wishlist
            }

            toggleWishlist={
              toggleWishlist
            }
          />

        )}

      </Tab.Screen>


      {/* ================================= */}
      {/* WISHLIST */}
      {/* ================================= */}

      <Tab.Screen
        name="Wishlist"

        options={{
          title: 'Wishlist',

          tabBarLabel: 'Wishlist',

          tabBarBadge:
            wishlist.length > 0
              ? wishlist.length
              : undefined,

          tabBarIcon: ({
            color,
            size,
          }) => (

            <Ionicons
              name="heart-outline"
              color={color}
              size={size}
            />

          ),
        }}
      >

        {props => (

          <WishlistScreen
            {...props}

            wishlist={
              wishlist
            }

            toggleWishlist={
              toggleWishlist
            }

            addToCart={
              addToCart
            }

          />

        )}

      </Tab.Screen>


      {/* ================================= */}
      {/* CART */}
      {/* ================================= */}

      <Tab.Screen
        name="Cart"

        options={{
          title: 'Cart',

          tabBarLabel: 'Cart',

          tabBarBadge:
            cartItems.length > 0
              ? cartItems.reduce(
                  (
                    total: number,
                    item: any,
                  ) =>
                    total +
                    item.quantity,
                  0,
                )
              : undefined,

          tabBarIcon: ({
            color,
            size,
          }) => (

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

            cartItems={
              cartItems
            }

            increaseQuantity={
              increaseQuantity
            }

            decreaseQuantity={
              decreaseQuantity
            }

            removeFromCart={
              removeFromCart
            }

          />

        )}

      </Tab.Screen>


      {/* ================================= */}
      {/* PROFILE */}
      {/* ================================= */}

      <Tab.Screen
        name="Profile"

        component={
          ProfileScreen
        }

        options={{
          title: 'Profile',

          tabBarLabel: 'Profile',

          tabBarIcon: ({
            color,
            size,
          }) => (

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


// =====================================
// MAIN APP
// =====================================

function App() {


  // ===================================
  // CART STATE
  // ===================================

  const [
    cartItems,
    setCartItems,
  ] = useState<any[]>([]);


  // ===================================
  // WISHLIST STATE
  // ===================================

  const [
    wishlist,
    setWishlist,
  ] = useState<any[]>([]);


  // ===================================
  // LOAD WISHLIST
  // ===================================

  useEffect(() => {

    const loadWishlist =
      async () => {

        try {

          const savedWishlist =
            await AsyncStorage.getItem(
              'wishlist',
            );

          if (savedWishlist) {

            setWishlist(
              JSON.parse(
                savedWishlist,
              ),
            );

          }

        } catch (error) {

          console.log(
            'Error loading wishlist:',
            error,
          );

        }

      };


    loadWishlist();

  }, []);


  // ===================================
  // SAVE WISHLIST
  // ===================================

  useEffect(() => {

    const saveWishlist =
      async () => {

        try {

          await AsyncStorage.setItem(
            'wishlist',

            JSON.stringify(
              wishlist,
            ),
          );

        } catch (error) {

          console.log(
            'Error saving wishlist:',
            error,
          );

        }

      };


    saveWishlist();

  }, [wishlist]);


  // ===================================
  // TOGGLE WISHLIST
  // ===================================

  const toggleWishlist = (
    product: any,
  ) => {

    setWishlist(
      currentWishlist => {

        const exists =
          currentWishlist.some(
            item =>
              item.id ===
              product.id,
          );


        if (exists) {

          return currentWishlist.filter(
            item =>
              item.id !==
              product.id,
          );

        }


        return [
          ...currentWishlist,
          product,
        ];

      },
    );

  };


  // ===================================
  // ADD TO CART
  // ===================================

  const addToCart = (
    product: any,
  ) => {

    setCartItems(
      currentItems => {

        const existingItem =
          currentItems.find(
            item =>
              item.id ===
              product.id,
          );


        if (existingItem) {

          return currentItems.map(
            item =>

              item.id ===
              product.id

                ? {
                    ...item,

                    quantity:
                      item.quantity +
                      1,
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

      },
    );

  };


  // ===================================
  // INCREASE QUANTITY
  // ===================================

  const increaseQuantity = (
    productId: string,
  ) => {

    setCartItems(
      currentItems =>

        currentItems.map(
          item =>

            item.id ===
            productId

              ? {
                  ...item,

                  quantity:
                    item.quantity +
                    1,
                }

              : item,
        ),

    );

  };


  // ===================================
  // DECREASE QUANTITY
  // ===================================

  const decreaseQuantity = (
    productId: string,
  ) => {

    setCartItems(
      currentItems =>

        currentItems

          .map(
            item =>

              item.id ===
              productId

                ? {
                    ...item,

                    quantity:
                      item.quantity -
                      1,
                  }

                : item,
          )

          .filter(
            item =>
              item.quantity >
              0,
          ),

    );

  };


  // ===================================
  // REMOVE FROM CART
  // ===================================

  const removeFromCart = (
    productId: string,
  ) => {

    setCartItems(
      currentItems =>

        currentItems.filter(
          item =>
            item.id !==
            productId,
        ),

    );

  };


  // ===================================
  // NAVIGATION
  // ===================================

  return (

    <NavigationContainer>

      <Stack.Navigator>


        {/* ================================= */}
        {/* LOGIN */}
        {/* ================================= */}

        <Stack.Screen
          name="Login"

          component={
            LoginScreen
          }

          options={{
            headerShown:
              false,
          }}
        />


        {/* ================================= */}
        {/* MAIN TABS */}
        {/* ================================= */}

        <Stack.Screen
          name="MainTabs"

          options={{
            headerShown:
              false,
          }}
        >

          {props => (

            <MainTabs
              {...props}

              cartItems={
                cartItems
              }

              increaseQuantity={
                increaseQuantity
              }

              decreaseQuantity={
                decreaseQuantity
              }

              removeFromCart={
                removeFromCart
              }

              wishlist={
                wishlist
              }

              toggleWishlist={
                toggleWishlist
              }

              addToCart={
                addToCart
              }

            />

          )}

        </Stack.Screen>


        {/* ================================= */}
        {/* PRODUCT DETAILS */}
        {/* ================================= */}

        <Stack.Screen
          name="ProductDetails"

          options={{
            title:
              'Product Details',
          }}
        >

          {props => (

            <ProductDetailsScreen
              {...props}

              addToCart={
                addToCart
              }

            />

          )}

        </Stack.Screen>


        {/* ================================= */}
        {/* CHECKOUT */}
        {/* ================================= */}

        <Stack.Screen
          name="Checkout"

          component={
            CheckoutScreen
          }

          options={{
            title:
              'Checkout',
          }}

        />

      </Stack.Navigator>

    </NavigationContainer>

  );
}


export default App;
