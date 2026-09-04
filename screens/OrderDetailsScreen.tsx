import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';

export type OrderDetailsScreenProps = {
  route: any;
  navigation: any;
};

function OrderDetailsScreen({route, navigation}: OrderDetailsScreenProps) {
  const insets = useSafeAreaInsets();
  const {order} = route.params || {};

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={54} color="#ff3b30" />
        <Text style={styles.errorTitle}>Order Not Found</Text>
        <Text style={styles.errorText}>
          The order details could not be loaded.
        </Text>
        <Pressable
          style={styles.errorButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const rawDate = order.date || order.createdAt;
  const orderDate = rawDate ? new Date(rawDate) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const displayStatus =
    order.status ||
    (order.paymentStatus === 'Completed' ? 'Processing' : 'Ordered');

  // Status tracker helper
  const steps = ['Ordered', 'Processing', 'Shipped', 'Delivered'];
  const getStepIndex = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'processing':
        return 1;
      case 'shipped':
        return 2;
      case 'delivered':
      case 'completed':
        return 3;
      default:
        return 0;
    }
  };
  const currentStep = getStepIndex(displayStatus);

  return (
    <View style={styles.container}>
      {/* TOP HEADER */}
      <View style={[styles.header, {paddingTop: Math.max(insets.top, 12)}]}>
        <Pressable
          style={({pressed}) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#18181b" />
        </Pressable>

        <Text style={styles.headerTitle}>Order Details</Text>
        <View style={{width: 40}} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {paddingBottom: insets.bottom + 30},
        ]}>
        {/* STATUS PROGRESS TRACKER */}
        <View style={styles.trackerCard}>
          <Text style={styles.cardHeaderTitle}>Order Status</Text>
          <View style={styles.progressRow}>
            {steps.map((step, index) => {
              const isDone = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <View key={step} style={styles.stepWrapper}>
                  <View
                    style={[
                      styles.stepCircle,
                      isDone && styles.stepCircleDone,
                      isCurrent && styles.stepCircleCurrent,
                    ]}>
                    <Ionicons
                      name={isDone ? 'checkmark' : 'ellipse'}
                      size={14}
                      color={isDone ? '#ffffff' : '#a1a1aa'}
                    />
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      isDone && styles.stepLabelDone,
                    ]}>
                    {step}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* ORDER INFO CARD */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Order Summary</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Order Number</Text>
            <Text style={styles.valueBold}>{order.id}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Date Placed</Text>
            <Text style={styles.value}>{formattedDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Method</Text>
            <Text style={styles.value}>{order.paymentMethod || 'Cash'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Payment Status</Text>
            <View
              style={[
                styles.miniStatusBadge,
                {
                  backgroundColor:
                    order.paymentStatus === 'Completed'
                      ? '#dcfce7'
                      : '#fff4eb',
                },
              ]}>
              <Text
                style={[
                  styles.miniStatusText,
                  {
                    color:
                      order.paymentStatus === 'Completed'
                        ? '#16a34a'
                        : '#ff6b00',
                  },
                ]}>
                {order.paymentStatus || 'Pending'}
              </Text>
            </View>
          </View>
          {order.transactionId ? (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Transaction ID</Text>
              <Text style={styles.value}>{order.transactionId}</Text>
            </View>
          ) : null}
        </View>

        {/* CUSTOMER & DELIVERY ADDRESS */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Shipping Details</Text>
          <View style={styles.addressBox}>
            <Ionicons
              name="location-outline"
              size={20}
              color="#ff6b00"
              style={styles.addressIcon}
            />
            <View style={styles.addressInfo}>
              <Text style={styles.customerName}>
                {order.customer?.name || 'Customer'}
              </Text>
              <Text style={styles.addressText}>
                {order.customer?.address || 'Street Address'}
              </Text>
              <Text style={styles.addressText}>
                {order.customer?.city || 'City'}
              </Text>
              <Text style={styles.phoneText}>
                Phone: {order.customer?.phone || 'N/A'}
              </Text>
            </View>
          </View>
        </View>

        {/* ITEMS PURCHASED */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Items ({order.items?.length || 0})
          </Text>
          {order.items?.map((item: any, index: number) => {
            const itemPrice = Number(item.price || 0);
            const itemQuantity = Number(item.quantity || 1);
            const itemTotal = itemPrice * itemQuantity;

            return (
              <View
                key={`${item.id}-${index}`}
                style={[
                  styles.productItem,
                  index === (order.items?.length || 1) - 1 &&
                    styles.lastProductItem,
                ]}>
                {item.image ? (
                  <Image
                    source={{uri: item.image}}
                    style={styles.productImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="cube-outline" size={24} color="#a1a1aa" />
                  </View>
                )}

                <View style={styles.productDetails}>
                  <Text style={styles.productName} numberOfLines={2}>
                    {item.name}
                  </Text>
                  <Text style={styles.productQuantity}>
                    Qty: {itemQuantity} × Rs. {itemPrice.toFixed(2)}
                  </Text>
                </View>

                <Text style={styles.productTotal}>
                  Rs. {itemTotal.toFixed(2)}
                </Text>
              </View>
            );
          })}
        </View>

        {/* PRICE BREAKDOWN */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Breakdown</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              Rs. {Number(order.subtotal || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Delivery Fee</Text>
            <Text style={styles.priceValue}>
              Rs. {Number(order.deliveryFee || 0).toFixed(2)}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Paid</Text>
            <Text style={styles.totalValue}>
              Rs. {Number(order.total || 0).toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backBtn: {
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
  scrollContent: {
    padding: 16,
  },
  trackerCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeaderTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 16,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
    borderWidth: 2,
    borderColor: '#e4e4e7',
  },
  stepCircleDone: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
  },
  stepCircleCurrent: {
    borderColor: '#ff6b00',
    borderWidth: 2.5,
  },
  stepLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a1a1aa',
    textAlign: 'center',
  },
  stepLabelDone: {
    color: '#18181b',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  label: {
    fontSize: 14,
    color: '#71717a',
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  valueBold: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
  },
  miniStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  miniStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  addressIcon: {
    marginRight: 10,
    marginTop: 2,
  },
  addressInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 14,
    color: '#52525b',
    lineHeight: 20,
  },
  phoneText: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 4,
  },
  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f4f4f5',
  },
  lastProductItem: {
    borderBottomWidth: 0,
  },
  productImage: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
  },
  imagePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  productQuantity: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 2,
  },
  productTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b00',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  priceLabel: {
    fontSize: 14,
    color: '#71717a',
  },
  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
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
  pressed: {
    opacity: 0.75,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#18181b',
    marginTop: 12,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: '#71717a',
    marginBottom: 20,
  },
  errorButton: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  errorButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default OrderDetailsScreen;