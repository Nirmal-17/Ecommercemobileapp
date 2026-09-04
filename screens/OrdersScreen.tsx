import React, {useCallback, useState} from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useFocusEffect} from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ORDERS_KEY = '@orders';

export type OrdersScreenProps = {
  navigation: any;
};

function OrdersScreen({navigation}: OrdersScreenProps) {
  const insets = useSafeAreaInsets();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const savedOrders = await AsyncStorage.getItem(ORDERS_KEY);
      if (savedOrders) {
        const parsedOrders = JSON.parse(savedOrders);
        setOrders(Array.isArray(parsedOrders) ? parsedOrders : []);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadOrders();
  };

  const deleteOrder = (orderId: string) => {
    Alert.alert(
      'Delete Order',
      'Are you sure you want to remove this order from your history?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedOrders = orders.filter(
                order => order.id !== orderId,
              );
              await AsyncStorage.setItem(
                ORDERS_KEY,
                JSON.stringify(updatedOrders),
              );
              setOrders(updatedOrders);
            } catch (error) {
              Alert.alert('Error', 'Unable to delete the order.');
            }
          },
        },
      ],
    );
  };

  const formatDate = (order: any) => {
    const rawDate = order.date || order.createdAt;
    if (!rawDate) return 'Recent';
    const date = new Date(rawDate);
    return Number.isNaN(date.getTime())
      ? 'Recent'
      : date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
        return {bg: '#dcfce7', text: '#16a34a'};
      case 'processing':
        return {bg: '#eff6ff', text: '#2563eb'};
      case 'cancelled':
        return {bg: '#fee2e2', text: '#dc2626'};
      default:
        return {bg: '#fff4eb', text: '#ff6b00'};
    }
  };

  if (!loading && orders.length === 0) {
    return (
      <View
        style={[
          styles.emptyContainer,
          {paddingBottom: insets.bottom + 20},
        ]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="receipt-outline" size={60} color="#ff6b00" />
        </View>
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>
          When you place an order, it will appear here so you can track its status
          and review receipts.
        </Text>
        <Pressable
          style={({pressed}) => [styles.shopButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('MainTabs', {screen: 'Home'})}>
          <Ionicons
            name="bag-handle-outline"
            size={20}
            color="#ffffff"
            style={styles.btnIcon}
          />
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, {paddingTop: Math.max(insets.top, 12)}]}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable
          style={({pressed}) => [styles.backBtn, pressed && styles.pressed]}
          hitSlop={8}
          onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={22} color="#18181b" />
        </Pressable>

        <Text style={styles.title}>My Orders</Text>
        <View style={{width: 40}} />
      </View>

      <FlatList
        data={orders}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 20},
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#ff6b00']}
            tintColor="#ff6b00"
          />
        }
        renderItem={({item}) => {
          const itemCount = Array.isArray(item.items)
            ? item.items.reduce(
                (sum: number, p: any) => sum + Number(p.quantity || 0),
                0,
              )
            : 0;

          const displayStatus =
            item.status ||
            (item.paymentStatus === 'Completed' ? 'Processing' : 'Ordered');

          const statusColors = getStatusColor(displayStatus);

          const formattedTotal = Number(item.total || 0).toLocaleString(
            'en-IN',
            {
              minimumFractionDigits: 2,
            },
          );

          return (
            <Pressable
              style={({pressed}) => [
                styles.orderCard,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('OrderDetails', {order: item})}>
              {/* TOP ROW: ID & STATUS */}
              <View style={styles.orderTopRow}>
                <View>
                  <Text style={styles.orderId}>{item.id}</Text>
                  <Text style={styles.orderDate}>{formatDate(item)}</Text>
                </View>

                <View
                  style={[
                    styles.statusPill,
                    {backgroundColor: statusColors.bg},
                  ]}>
                  <Text
                    style={[
                      styles.statusText,
                      {color: statusColors.text},
                    ]}>
                    {displayStatus}
                  </Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* MIDDLE ROW: ITEMS PREVIEW */}
              <View style={styles.orderMiddleRow}>
                <View style={styles.itemsSummary}>
                  <Text style={styles.itemsCount}>
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </Text>
                  <Text style={styles.paymentMethod}>
                    Payment: {item.paymentMethod || 'Cash on Delivery'}
                  </Text>
                </View>

                <View style={styles.totalSection}>
                  <Text style={styles.totalLabel}>Total</Text>
                  <Text style={styles.totalAmount}>Rs. {formattedTotal}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              {/* BOTTOM ACTIONS */}
              <View style={styles.orderBottomRow}>
                <Pressable
                  style={styles.deleteBtn}
                  hitSlop={8}
                  onPress={() => deleteOrder(item.id)}>
                  <Ionicons name="trash-outline" size={16} color="#ff3b30" />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>

                <View style={styles.viewDetailsRow}>
                  <Text style={styles.viewDetailsText}>View Receipt</Text>
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color="#ff6b00"
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingVertical: 4,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
  },
  listContent: {
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
  },
  orderDate: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 12,
  },
  orderMiddleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemsSummary: {
    flex: 1,
  },
  itemsCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 3,
  },
  totalSection: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff6b00',
  },
  orderBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#fff1f2',
    gap: 4,
  },
  deleteText: {
    color: '#ff3b30',
    fontSize: 12,
    fontWeight: '600',
  },
  viewDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    color: '#ff6b00',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    backgroundColor: '#f8f9fa',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff4eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: '#ff6b00',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    height: 48,
    borderRadius: 12,
    elevation: 3,
  },
  btnIcon: {
    marginRight: 8,
  },
  shopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default OrdersScreen;