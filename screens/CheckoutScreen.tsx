import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';


function CheckoutScreen({
  navigation,
  route,
}: any) {

  const {
    cartItems = [],
  } = route.params || {};


  // =================================
  // CUSTOMER DETAILS
  // =================================

  const [name, setName] =
    useState('');

  const [phone, setPhone] =
    useState('');

  const [address, setAddress] =
    useState('');

  const [city, setCity] =
    useState('');


  // =================================
  // TOTAL
  // =================================

  const subtotal =
    cartItems.reduce(
      (
        total: number,
        item: any,
      ) =>
        total +
        item.price *
          item.quantity,
      0,
    );


  const deliveryFee =
    cartItems.length > 0
      ? 5
      : 0;


  const total =
    subtotal +
    deliveryFee;


  // =================================
  // PLACE ORDER
  // =================================

  const handlePlaceOrder =
    () => {

      const cleanName =
        name.trim();

      const cleanPhone =
        phone.trim();

      const cleanAddress =
        address.trim();

      const cleanCity =
        city.trim();


      // NAME

      if (cleanName === '') {

        Alert.alert(
          'Missing Information',
          'Please enter your name.',
        );

        return;
      }


      // PHONE

      if (cleanPhone === '') {

        Alert.alert(
          'Missing Information',
          'Please enter your phone number.',
        );

        return;
      }


      if (cleanPhone.length < 7) {

        Alert.alert(
          'Invalid Phone',
          'Please enter a valid phone number.',
        );

        return;
      }


      // ADDRESS

      if (cleanAddress === '') {

        Alert.alert(
          'Missing Information',
          'Please enter your address.',
        );

        return;
      }


      // CITY

      if (cleanCity === '') {

        Alert.alert(
          'Missing Information',
          'Please enter your city.',
        );

        return;
      }


      // SUCCESS

      Alert.alert(
        'Order Placed',
        'Your order has been placed successfully!',
        [
          {
            text: 'Continue Shopping',

            onPress: () => {

              navigation.navigate(
                'MainTabs',
                {
                  screen: 'Home',
                },
              );

            },
          },
        ],
      );

    };


  return (

    <ScrollView
      style={styles.container}

      contentContainerStyle={
        styles.content
      }

      showsVerticalScrollIndicator={
        false
      }
    >

      {/* ================================= */}
      {/* DELIVERY INFORMATION */}
      {/* ================================= */}

      <Text
        style={styles.sectionTitle}
      >
        Delivery Information
      </Text>


      {/* NAME */}

      <Text
        style={styles.label}
      >
        Full Name
      </Text>

      <TextInput
        style={styles.input}

        placeholder="Enter your full name"

        value={name}

        onChangeText={setName}

        autoCapitalize="words"
      />


      {/* PHONE */}

      <Text
        style={styles.label}
      >
        Phone Number
      </Text>

      <TextInput
        style={styles.input}

        placeholder="Enter your phone number"

        value={phone}

        onChangeText={setPhone}

        keyboardType="phone-pad"
      />


      {/* ADDRESS */}

      <Text
        style={styles.label}
      >
        Address
      </Text>

      <TextInput
        style={[
          styles.input,
          styles.addressInput,
        ]}

        placeholder="Enter your delivery address"

        value={address}

        onChangeText={setAddress}

        multiline
      />


      {/* CITY */}

      <Text
        style={styles.label}
      >
        City
      </Text>

      <TextInput
        style={styles.input}

        placeholder="Enter your city"

        value={city}

        onChangeText={setCity}

        autoCapitalize="words"
      />


      {/* ================================= */}
      {/* ORDER SUMMARY */}
      {/* ================================= */}

      <Text
        style={[
          styles.sectionTitle,
          styles.summaryHeading,
        ]}
      >
        Order Summary
      </Text>


      <View
        style={styles.summaryCard}
      >

        {/* PRODUCTS */}

        {cartItems.map(
          (item: any) => (

            <View
              key={item.id}
              style={styles.productRow}
            >

              <View
                style={styles.productInfo}
              >

                <Text
                  style={
                    styles.productName
                  }

                  numberOfLines={1}
                >
                  {item.name}
                </Text>


                <Text
                  style={
                    styles.quantityText
                  }
                >
                  Quantity: {item.quantity}
                </Text>

              </View>


              <Text
                style={
                  styles.productTotal
                }
              >
                $
                {(
                  item.price *
                  item.quantity
                ).toFixed(2)}
              </Text>

            </View>

          ),
        )}


        <View
          style={styles.divider}
        />


        {/* SUBTOTAL */}

        <View
          style={styles.summaryRow}
        >

          <Text
            style={styles.summaryLabel}
          >
            Subtotal
          </Text>

          <Text
            style={styles.summaryValue}
          >
            ${subtotal.toFixed(2)}
          </Text>

        </View>


        {/* DELIVERY */}

        <View
          style={styles.summaryRow}
        >

          <Text
            style={styles.summaryLabel}
          >
            Delivery
          </Text>

          <Text
            style={styles.summaryValue}
          >
            ${deliveryFee.toFixed(2)}
          </Text>

        </View>


        <View
          style={styles.divider}
        />


        {/* TOTAL */}

        <View
          style={styles.totalRow}
        >

          <Text
            style={styles.totalLabel}
          >
            Total
          </Text>

          <Text
            style={styles.totalValue}
          >
            ${total.toFixed(2)}
          </Text>

        </View>

      </View>


      {/* ================================= */}
      {/* PLACE ORDER */}
      {/* ================================= */}

      <Pressable

        style={({pressed}) => [
          styles.placeOrderButton,

          pressed &&
            styles.pressed,
        ]}

        onPress={
          handlePlaceOrder
        }
      >

        <Text
          style={
            styles.placeOrderText
          }
        >
          Place Order
        </Text>

      </Pressable>

    </ScrollView>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor:
      '#f5f5f5',
  },


  content: {
    padding: 20,

    paddingBottom: 40,
  },


  sectionTitle: {
    fontSize: 22,

    fontWeight: 'bold',

    marginBottom: 18,
  },


  label: {
    fontSize: 15,

    fontWeight: '600',

    marginBottom: 7,
  },


  input: {
    height: 52,

    backgroundColor:
      '#ffffff',

    borderWidth: 1,

    borderColor:
      '#dddddd',

    borderRadius: 9,

    paddingHorizontal: 15,

    fontSize: 16,

    marginBottom: 18,
  },


  addressInput: {
    height: 90,

    paddingTop: 15,

    textAlignVertical:
      'top',
  },


  summaryHeading: {
    marginTop: 10,
  },


  summaryCard: {
    backgroundColor:
      '#ffffff',

    borderRadius: 12,

    padding: 17,

    elevation: 2,
  },


  productRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginBottom: 14,
  },


  productInfo: {
    flex: 1,

    paddingRight: 15,
  },


  productName: {
    fontSize: 15,

    fontWeight: '600',

    marginBottom: 4,
  },


  quantityText: {
    fontSize: 13,

    color: '#777',
  },


  productTotal: {
    fontSize: 15,

    fontWeight: 'bold',
  },


  divider: {
    height: 1,

    backgroundColor:
      '#eeeeee',

    marginVertical: 10,
  },


  summaryRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    marginBottom: 10,
  },


  summaryLabel: {
    fontSize: 15,

    color: '#666',
  },


  summaryValue: {
    fontSize: 15,

    fontWeight: '600',
  },


  totalRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',
  },


  totalLabel: {
    fontSize: 20,

    fontWeight: 'bold',
  },


  totalValue: {
    fontSize: 22,

    fontWeight: 'bold',
  },


  placeOrderButton: {
    height: 55,

    backgroundColor:
      '#007AFF',

    borderRadius: 10,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginTop: 20,
  },


  placeOrderText: {
    color: '#ffffff',

    fontSize: 18,

    fontWeight: 'bold',
  },


  pressed: {
    opacity: 0.7,
  },

});


export default CheckoutScreen;
