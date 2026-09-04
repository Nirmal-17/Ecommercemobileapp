import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type OrderSuccessScreenProps = {
  navigation: any;
  route: any;
};

function OrderSuccessScreen({navigation, route}: OrderSuccessScreenProps) {
  const insets = useSafeAreaInsets();
  const {orderId, total, paymentMethod} = route.params || {};

  const formattedTotal = Number(total || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  });

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top + 20, 40),
          paddingBottom: Math.max(insets.bottom + 20, 30),
        },
      ]}>
      <View style={styles.content}>
        {/* SUCCESS ICON */}
        <View style={styles.successCircle}>
          <Ionicons name="checkmark-circle" size={80} color="#16a34a" />
        </View>

        {/* TITLE & MESSAGE */}
        <Text style={styles.title}>Order Confirmed!</Text>
        <Text style={styles.message}>
          Thank you for your purchase. We've received your order and are getting
          it ready for delivery.
        </Text>

        {/* ORDER SUMMARY CARD */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.label}>Order ID</Text>
            <Text style={styles.value} numberOfLines={1}>
              {orderId || 'ORD-RECENT'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>
              {paymentMethod || 'Cash on Delivery'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>Rs. {formattedTotal}</Text>
          </View>
        </View>

        {/* DELIVERY ESTIMATE BADGE */}
        <View style={styles.estimateBadge}>
          <Ionicons name="time-outline" size={18} color="#ff6b00" />
          <Text style={styles.estimateText}>
            Estimated Delivery: 2-3 Business Days
          </Text>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <View style={styles.buttonContainer}>
        <Pressable
          style={({pressed}) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('Orders')}>
          <Ionicons
            name="receipt-outline"
            size={18}
            color="#ffffff"
            style={styles.btnIcon}
          />
          <Text style={styles.primaryText}>View My Orders</Text>
        </Pressable>

        <Pressable
          style={({pressed}) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('MainTabs', {screen: 'Home'})}>
          <Ionicons
            name="bag-handle-outline"
            size={18}
            color="#18181b"
            style={styles.btnIcon}
          />
          <Text style={styles.secondaryText}>Continue Shopping</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  content: {
    alignItems: 'center',
    paddingTop: 20,
  },
  successCircle: {
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#16a34a',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 8,
  },
  message: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    paddingHorizontal: 12,
  },
  card: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: 14,
    color: '#71717a',
  },
  value: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    maxWidth: '60%',
    textAlign: 'right',
  },
  divider: {
    height: 1,
    backgroundColor: '#e4e4e7',
    marginVertical: 6,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff6b00',
  },
  estimateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4eb',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
    gap: 8,
  },
  estimateText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#9a3412',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  primaryButton: {
    width: '100%',
    height: 52,
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#f8f9fa',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryText: {
    color: '#18181b',
    fontSize: 15,
    fontWeight: '700',
  },
  btnIcon: {
    marginRight: 8,
  },
  pressed: {
    opacity: 0.75,
  },
});

export default OrderSuccessScreen;
