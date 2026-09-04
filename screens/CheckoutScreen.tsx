import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import {WebView} from 'react-native-webview';
import type {CartItem} from '../App';
import {useCart} from '../App';

const ORDERS_KEY = '@orders';
const USER_NAME_KEY = '@user_name';
const USER_PHONE_KEY = '@user_phone';

// In Android Emulator, 10.0.2.2 points to computer's localhost.
// For physical device, replace with your machine's LAN IP (e.g., http://192.168.1.50:5000)
const BACKEND_URL = 'http://10.0.2.2:5000';
const ESEWA_GATEWAY_URL = 'https://rc-epay.esewa.com.np/api/epay/main/v2/form';

type PaymentMethod = 'Cash on Delivery' | 'eSewa';

export type CheckoutProps = {
  navigation: any;
  route: any;
  cartItems?: CartItem[];
  clearCart?: () => Promise<void> | void;
};

function CheckoutScreen({
  navigation,
  route,
  cartItems: propCartItems,
  clearCart: propClearCart,
}: CheckoutProps) {
  const insets = useSafeAreaInsets();

  let cartCtx: Partial<ReturnType<typeof useCart>> = {};
  try {
    cartCtx = useCart();
  } catch {}

  // Support cart items passed via props, context, or route params
  const cartItems: CartItem[] =
    propCartItems ??
    cartCtx.cartItems ??
    route?.params?.cartItems ??
    (Array.isArray(route?.params) ? route.params : []);

  const clearCart = propClearCart ?? cartCtx.clearCart ?? (() => {});

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>('Cash on Delivery');
  const [placingOrder, setPlacingOrder] = useState(false);

  // eSewa WebView State
  const [showEsewaModal, setShowEsewaModal] = useState(false);
  const [esewaPaymentData, setEsewaPaymentData] = useState<any>(null);
  const [verifyingEsewa, setVerifyingEsewa] = useState(false);

  // Auto-fill user information if saved
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const [savedName, savedPhone] = await Promise.all([
          AsyncStorage.getItem(USER_NAME_KEY),
          AsyncStorage.getItem(USER_PHONE_KEY),
        ]);
        if (savedName) setName(savedName);
        if (savedPhone) setPhone(savedPhone);
      } catch (err) {
        console.error('Error loading pre-filled customer details:', err);
      }
    };
    loadUserInfo();
  }, []);

  // Calculations
  const subtotal = cartItems.reduce(
    (acc: number, item: any) =>
      acc + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );
  const deliveryFee = cartItems.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  const validateDetails = () => {
    if (!cartItems.length) {
      Alert.alert('Empty Cart', 'Your cart is empty.');
      return false;
    }
    if (!name.trim()) {
      Alert.alert('Missing Information', 'Please enter your recipient name.');
      return false;
    }
    if (!phone.trim()) {
      Alert.alert('Missing Information', 'Please enter your contact phone number.');
      return false;
    }
    if (!address.trim()) {
      Alert.alert('Missing Information', 'Please enter your shipping address.');
      return false;
    }
    if (!city.trim()) {
      Alert.alert('Missing Information', 'Please enter your city.');
      return false;
    }
    return true;
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (e) {
      console.error('Error clearing cart:', e);
    }
  };

  // Save Order to AsyncStorage with consistent schema
  const saveOrder = async (
    method: PaymentMethod,
    paymentStatus: 'Pending' | 'Completed' | 'Failed',
    transactionId?: string,
  ) => {
    try {
      const existingOrders = await AsyncStorage.getItem(ORDERS_KEY);
      const orders = existingOrders ? JSON.parse(existingOrders) : [];
      const orderId = `ORD-${Date.now()}`;

      const order = {
        id: orderId,
        items: cartItems,
        customer: {name: name.trim(), phone: phone.trim(), address: address.trim(), city: city.trim()},
        subtotal,
        deliveryFee,
        discount: 0,
        total,
        paymentMethod: method,
        paymentStatus,
        status: paymentStatus === 'Completed' ? 'Processing' : 'Ordered',
        transactionId: transactionId || null,
        deliveryMethod: 'Standard',
        date: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };

      orders.unshift(order);
      await AsyncStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      await AsyncStorage.setItem(USER_PHONE_KEY, phone.trim());
      await handleClearCart();

      return order;
    } catch (error) {
      console.error('Save order error:', error);
      throw error;
    }
  };

  // Cash on Delivery
  const handleCashOnDelivery = async () => {
    if (!validateDetails()) return;

    try {
      setPlacingOrder(true);
      const order = await saveOrder('Cash on Delivery', 'Pending');

      navigation.replace('OrderSuccess', {
        orderId: order.id,
        total: order.total,
        paymentMethod: 'Cash on Delivery',
      });
    } catch (error) {
      Alert.alert('Error', 'Could not place your order. Please try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  // eSewa Payment Request
  const handleEsewaPayment = async () => {
    if (!validateDetails()) return;

    try {
      setPlacingOrder(true);
      const transaction_uuid = `TXN-${Date.now()}`;

      const response = await fetch(`${BACKEND_URL}/api/esewa/create-payment`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          amount: subtotal,
          delivery_charge: deliveryFee,
          total_amount: total,
          transaction_uuid,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Failed to initialize eSewa payment');
      }

      setEsewaPaymentData(data.paymentData);
      setShowEsewaModal(true);
    } catch (error: any) {
      Alert.alert(
        'Payment Connection Notice',
        error?.message ||
          'Could not connect to payment backend server. Ensure backend/Server.js is running.',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Pay with COD Instead',
            onPress: () => {
              setPaymentMethod('Cash on Delivery');
            },
          },
        ],
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  // HTML Form that auto-submits POST payload to eSewa
  const generateEsewaFormHtml = () => {
    if (!esewaPaymentData) return '';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redirecting to eSewa...</title>
          <style>
            body { display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background-color: #f9f9f9; }
            .loader { text-align: center; color: #32a852; }
          </style>
        </head>
        <body onload="document.forms['esewaForm'].submit()">
          <div class="loader">
            <h2>Connecting to eSewa...</h2>
            <p>Please wait while we redirect you to the payment gateway.</p>
          </div>
          <form id="esewaForm" method="POST" action="${ESEWA_GATEWAY_URL}">
            <input type="hidden" name="amount" value="${esewaPaymentData.amount}" />
            <input type="hidden" name="tax_amount" value="${esewaPaymentData.tax_amount || 0}" />
            <input type="hidden" name="total_amount" value="${esewaPaymentData.total_amount}" />
            <input type="hidden" name="transaction_uuid" value="${esewaPaymentData.transaction_uuid}" />
            <input type="hidden" name="product_code" value="${esewaPaymentData.product_code}" />
            <input type="hidden" name="product_service_charge" value="${esewaPaymentData.product_service_charge || 0}" />
            <input type="hidden" name="product_delivery_charge" value="${esewaPaymentData.product_delivery_charge || 0}" />
            <input type="hidden" name="success_url" value="${esewaPaymentData.success_url}" />
            <input type="hidden" name="failure_url" value="${esewaPaymentData.failure_url}" />
            <input type="hidden" name="signed_field_names" value="${esewaPaymentData.signed_field_names}" />
            <input type="hidden" name="signature" value="${esewaPaymentData.signature}" />
          </form>
        </body>
      </html>
    `;
  };

  // Intercept Navigation in WebView for success or failure URLs
  const handleWebViewNavigationStateChange = async (navState: any) => {
    const {url} = navState;

    if (url.includes('/api/esewa/success') || url.includes('data=')) {
      if (verifyingEsewa) return;
      setVerifyingEsewa(true);

      try {
        let encodedData = '';
        const match = url.match(/[?&]data=([^&#]*)/);
        if (match && match[1]) {
          encodedData = decodeURIComponent(match[1]);
        }

        const verifyRes = await fetch(`${BACKEND_URL}/api/esewa/verify-payment`, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            encodedData,
            transaction_uuid: esewaPaymentData?.transaction_uuid,
            total_amount: total,
          }),
        });

        const verifyResult = await verifyRes.json();

        if (verifyResult.success) {
          setShowEsewaModal(false);
          const order = await saveOrder(
            'eSewa',
            'Completed',
            verifyResult.transactionId || esewaPaymentData?.transaction_uuid,
          );

          navigation.replace('OrderSuccess', {
            orderId: order.id,
            total: order.total,
            paymentMethod: 'eSewa',
          });
        } else {
          setShowEsewaModal(false);
          Alert.alert(
            'Payment Verification Failed',
            verifyResult.message || 'Payment could not be verified.',
          );
        }
      } catch (err: any) {
        setShowEsewaModal(false);
        Alert.alert('Error', 'Unable to verify payment with server.');
      } finally {
        setVerifyingEsewa(false);
      }
    }

    if (url.includes('/api/esewa/failure') || url.includes('failure')) {
      setShowEsewaModal(false);
      Alert.alert('Payment Cancelled', 'The eSewa transaction was cancelled or failed.');
    }
  };

  const handlePlaceOrder = () => {
    if (paymentMethod === 'Cash on Delivery') {
      handleCashOnDelivery();
    } else {
      handleEsewaPayment();
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 12)}]}>
        <Pressable
          onPress={() => navigation.goBack()}
          hitSlop={8}
          style={({pressed}) => [styles.backButton, pressed && styles.pressed]}>
          <Ionicons name="arrow-back" size={22} color="#18181b" />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.contentContainer,
          {paddingBottom: insets.bottom + 30},
        ]}
        keyboardShouldPersistTaps="handled">
        {/* SHIPPING DETAILS */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>

          <View style={styles.inputCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Recipient Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={setName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="98XXXXXXXX"
                placeholderTextColor="#a1a1aa"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Street / Area Address</Text>
              <TextInput
                style={styles.input}
                placeholder="House No., Street, Landmark"
                placeholderTextColor="#a1a1aa"
                value={address}
                onChangeText={setAddress}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="Kathmandu / Pokhara / etc."
                placeholderTextColor="#a1a1aa"
                value={city}
                onChangeText={setCity}
              />
            </View>
          </View>
        </View>

        {/* PAYMENT METHOD SELECTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>

          {/* COD OPTION */}
          <Pressable
            style={({pressed}) => [
              styles.paymentOption,
              paymentMethod === 'Cash on Delivery' && styles.selectedPayment,
              pressed && styles.pressed,
            ]}
            onPress={() => setPaymentMethod('Cash on Delivery')}>
            <View style={styles.radio}>
              {paymentMethod === 'Cash on Delivery' ? (
                <View style={styles.radioInner} />
              ) : null}
            </View>

            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>Cash on Delivery</Text>
              <Text style={styles.paymentSubtitle}>
                Pay in cash when your order arrives at your door
              </Text>
            </View>

            <Ionicons name="cash-outline" size={24} color="#ff6b00" />
          </Pressable>

          {/* ESEWA OPTION */}
          <Pressable
            style={({pressed}) => [
              styles.paymentOption,
              paymentMethod === 'eSewa' && styles.selectedEsewa,
              pressed && styles.pressed,
            ]}
            onPress={() => setPaymentMethod('eSewa')}>
            <View style={[styles.radio, styles.radioEsewa]}>
              {paymentMethod === 'eSewa' ? (
                <View style={styles.radioInnerEsewa} />
              ) : null}
            </View>

            <View style={styles.paymentText}>
              <Text style={styles.paymentTitle}>eSewa Digital Wallet</Text>
              <Text style={styles.paymentSubtitle}>
                Instant and secure payment via eSewa Portal
              </Text>
            </View>

            <View style={styles.esewaLogo}>
              <Text style={styles.esewaLogoText}>eSewa</Text>
            </View>
          </Pressable>
        </View>

        {/* ORDER SUMMARY BREAKDOWN */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Order Summary</Text>

          <View style={styles.row}>
            <Text style={styles.label}>
              Subtotal ({cartItems.length}{' '}
              {cartItems.length === 1 ? 'item' : 'items'})
            </Text>
            <Text style={styles.value}>
              Rs.{' '}
              {subtotal.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Delivery Fee</Text>
            <Text style={styles.value}>
              Rs.{' '}
              {deliveryFee.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Payable</Text>
            <Text style={styles.totalValue}>
              Rs.{' '}
              {total.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
              })}
            </Text>
          </View>
        </View>

        {/* PLACE ORDER BUTTON */}
        <Pressable
          style={({pressed}) => [
            styles.placeButton,
            paymentMethod === 'eSewa' && styles.esewaButton,
            placingOrder && styles.disabledButton,
            pressed && styles.pressed,
          ]}
          disabled={placingOrder}
          onPress={handlePlaceOrder}>
          {placingOrder ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Text style={styles.buttonText}>
                {paymentMethod === 'Cash on Delivery'
                  ? 'Confirm Order (COD)'
                  : 'Pay with eSewa'}
              </Text>
              <Ionicons name="arrow-forward" size={18} color="#ffffff" />
            </>
          )}
        </Pressable>
      </ScrollView>

      {/* ESEWA MODAL */}
      <Modal
        visible={showEsewaModal}
        animationType="slide"
        onRequestClose={() => setShowEsewaModal(false)}>
        <View
          style={[
            styles.modalHeader,
            {paddingTop: Math.max(insets.top, 12)},
          ]}>
          <Pressable
            onPress={() => setShowEsewaModal(false)}
            hitSlop={8}
            style={styles.modalCloseButton}>
            <Ionicons name="close" size={24} color="#18181b" />
          </Pressable>
          <Text style={styles.modalTitle}>eSewa Secure Checkout</Text>
          <View style={{width: 40}} />
        </View>

        {verifyingEsewa ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#32a852" />
            <Text style={styles.loadingText}>
              Verifying payment with eSewa server...
            </Text>
          </View>
        ) : (
          <WebView
            source={{html: generateEsewaFormHtml()}}
            onNavigationStateChange={handleWebViewNavigationStateChange}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#32a852" />
                <Text style={styles.loadingText}>Loading eSewa portal...</Text>
              </View>
            )}
          />
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#18181b',
  },
  contentContainer: {
    paddingTop: 14,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 10,
  },
  inputCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    gap: 12,
  },
  inputGroup: {
    gap: 4,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 48,
    fontSize: 15,
    color: '#18181b',
  },
  card: {
    backgroundColor: '#ffffff',
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 4,
  },
  label: {
    fontSize: 14,
    color: '#71717a',
  },
  value: {
    fontSize: 14,
    color: '#18181b',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff6b00',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  selectedPayment: {
    borderColor: '#ff6b00',
    backgroundColor: '#fff4eb',
  },
  selectedEsewa: {
    borderColor: '#16a34a',
    backgroundColor: '#f0fdf4',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#a1a1aa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  radioEsewa: {
    borderColor: '#16a34a',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ff6b00',
  },
  radioInnerEsewa: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#16a34a',
  },
  paymentText: {
    flex: 1,
    marginRight: 8,
  },
  paymentTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
  },
  paymentSubtitle: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  esewaLogo: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#16a34a',
  },
  esewaLogoText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  placeButton: {
    marginHorizontal: 16,
    height: 52,
    borderRadius: 12,
    backgroundColor: '#ff6b00',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    elevation: 3,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  esewaButton: {
    backgroundColor: '#16a34a',
    shadowColor: '#16a34a',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeader: {
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#52525b',
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default CheckoutScreen;