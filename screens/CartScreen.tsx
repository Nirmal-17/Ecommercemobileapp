import React, {useMemo} from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {CartItem, Product} from '../App';
import {useCart} from '../App';

export type CartScreenProps = {
  navigation: any;
  cartItems?: CartItem[];
  increaseQuantity?: (id: string) => void;
  decreaseQuantity?: (id: string) => void;
  removeFromCart?: (id: string) => void;
  clearCart?: () => Promise<void> | void;
};

function CartScreen({
  navigation,
  cartItems: propCartItems,
  increaseQuantity: propIncreaseQuantity,
  decreaseQuantity: propDecreaseQuantity,
  removeFromCart: propRemoveFromCart,
  clearCart: propClearCart,
}: CartScreenProps) {
  const insets = useSafeAreaInsets();

  // Consume from CartContext if available; gracefully fallback to props
  let contextValues: Partial<ReturnType<typeof useCart>> = {};
  try {
    contextValues = useCart();
  } catch {
    // Rendered outside of CartContext provider (e.g., in unit tests)
  }

  const cartItems: CartItem[] =
    propCartItems ?? contextValues.cartItems ?? [];
  const increaseQuantity =
    propIncreaseQuantity ?? contextValues.increaseQuantity ?? (() => {});
  const decreaseQuantity =
    propDecreaseQuantity ?? contextValues.decreaseQuantity ?? (() => {});
  const removeFromCart =
    propRemoveFromCart ?? contextValues.removeFromCart ?? (() => {});
  const clearCart =
    propClearCart ?? contextValues.clearCart ?? (() => {});

  // ==========================================================================
  // CALCULATIONS
  // ==========================================================================
  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (acc: number, item: any) =>
          acc + Number(item.price || 0) * Number(item.quantity || 1),
        0,
      ),
    [cartItems],
  );

  const totalItemCount = useMemo(
    () =>
      cartItems.reduce(
        (total: number, item: any) => total + Number(item.quantity || 0),
        0,
      ),
    [cartItems],
  );

  const deliveryFee = cartItems.length > 0 ? 5 : 0;
  const total = subtotal + deliveryFee;

  // ==========================================================================
  // ACTIONS & HANDLERS
  // ==========================================================================
  const handleClearCart = () => {
    if (!clearCart) return;

    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from your cart?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: () => clearCart(),
        },
      ],
    );
  };

  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      'Remove Item',
      `Remove "${item.name}" from your cart?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromCart(item.id),
        },
      ],
    );
  };

  const handleDecreaseQuantity = (item: CartItem) => {
    if (Number(item.quantity || 1) <= 1) {
      handleRemoveItem(item);
    } else {
      decreaseQuantity(item.id);
    }
  };

  const handleNavigateToProduct = (item: CartItem) => {
    navigation.navigate('ProductDetails', {
      product: {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        description: item.description,
      } as Product,
    });
  };

  const handleProceedToCheckout = () => {
    navigation.navigate('Checkout', {
      cartItems: cartItems,
    });
  };

  // ==========================================================================
  // EMPTY CART VIEW
  // ==========================================================================
  if (cartItems.length === 0) {
    return (
      <View style={[styles.emptyContainer, {paddingBottom: insets.bottom + 20}]}>
        <View style={styles.emptyIconCircle}>
          <Ionicons name="cart-outline" size={60} color="#ff6b00" />
        </View>

        <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven't added anything to your cart yet. Explore our
          catalog and find great deals!
        </Text>

        <Pressable
          style={({pressed}) => [
            styles.startShoppingButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('Home')}>
          <Ionicons
            name="bag-handle-outline"
            size={20}
            color="#ffffff"
            style={styles.buttonIconLeft}
          />
          <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
        </Pressable>
      </View>
    );
  }

  // ==========================================================================
  // RENDER CART ITEM
  // ==========================================================================
  const renderCartItem = ({item}: {item: CartItem}) => {
    const itemPrice = Number(item.price || 0);
    const itemQuantity = Number(item.quantity || 1);
    const itemTotal = itemPrice * itemQuantity;

    return (
      <View style={styles.cartCard}>
        {/* PRODUCT IMAGE (Tappable) */}
        <Pressable
          onPress={() => handleNavigateToProduct(item)}
          style={styles.imageWrapper}>
          <Image
            source={{uri: item.image}}
            style={styles.productImage}
            resizeMode="cover"
          />
        </Pressable>

        {/* DETAILS */}
        <View style={styles.itemDetails}>
          <Pressable onPress={() => handleNavigateToProduct(item)}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
          </Pressable>

          {item.category ? (
            <Text style={styles.categoryBadge}>{item.category}</Text>
          ) : null}

          <Text style={styles.unitPrice}>
            Rs. {itemPrice.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </Text>

          {/* QUANTITY STEPPER */}
          <View style={styles.stepperContainer}>
            <Pressable
              style={({pressed}) => [
                styles.stepperButton,
                pressed && styles.stepperPressed,
              ]}
              hitSlop={6}
              onPress={() => handleDecreaseQuantity(item)}>
              <Ionicons
                name={itemQuantity <= 1 ? 'trash-outline' : 'remove'}
                size={16}
                color={itemQuantity <= 1 ? '#ff3b30' : '#333333'}
              />
            </Pressable>

            <Text style={styles.stepperValue}>{itemQuantity}</Text>

            <Pressable
              style={({pressed}) => [
                styles.stepperButton,
                pressed && styles.stepperPressed,
              ]}
              hitSlop={6}
              onPress={() => increaseQuantity(item.id)}>
              <Ionicons name="add" size={16} color="#333333" />
            </Pressable>
          </View>
        </View>

        {/* RIGHT COLUMN: ITEM TOTAL & REMOVE */}
        <View style={styles.rightColumn}>
          <Text style={styles.itemTotalPrice}>
            Rs. {itemTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </Text>

          <Pressable
            style={({pressed}) => [
              styles.deleteButton,
              pressed && styles.pressed,
            ]}
            hitSlop={8}
            onPress={() => handleRemoveItem(item)}>
            <Ionicons name="trash-outline" size={18} color="#ff3b30" />
          </Pressable>
        </View>
      </View>
    );
  };

  // ==========================================================================
  // MAIN COMPONENT RENDER
  // ==========================================================================
  return (
    <View style={styles.mainContainer}>
      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        renderItem={renderCartItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          {paddingBottom: insets.bottom + 110},
        ]}
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <View>
              <Text style={styles.headerTitle}>Shopping Cart</Text>
              <Text style={styles.headerSubtitle}>
                {totalItemCount} {totalItemCount === 1 ? 'item' : 'items'} in
                your cart
              </Text>
            </View>

            {cartItems.length > 0 ? (
              <Pressable
                onPress={handleClearCart}
                style={({pressed}) => [
                  styles.clearAllBtn,
                  pressed && styles.pressed,
                ]}
                hitSlop={8}>
                <Ionicons
                  name="trash-bin-outline"
                  size={15}
                  color="#ff3b30"
                  style={styles.clearAllIcon}
                />
                <Text style={styles.clearAllText}>Clear All</Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListFooterComponent={
          <View style={styles.footerContainer}>
            {/* ORDER BREAKDOWN CARD */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>

              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  Rs.{' '}
                  {subtotal.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <View style={styles.deliveryLabelRow}>
                  <Text style={styles.summaryLabel}>Estimated Delivery</Text>
                </View>
                <Text style={styles.summaryValue}>
                  Rs.{' '}
                  {deliveryFee.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Grand Total</Text>
                <Text style={styles.totalValue}>
                  Rs.{' '}
                  {total.toLocaleString('en-IN', {
                    minimumFractionDigits: 2,
                  })}
                </Text>
              </View>
            </View>

            {/* SECURITY ASSURANCE */}
            <View style={styles.securityRow}>
              <Ionicons
                name="shield-checkmark-outline"
                size={16}
                color="#34C759"
              />
              <Text style={styles.securityText}>
                Safe & Secure Checkout Guaranteed
              </Text>
            </View>
          </View>
        }
      />

      {/* STICKY BOTTOM BAR */}
      <View
        style={[
          styles.bottomBar,
          {paddingBottom: Math.max(insets.bottom, 12)},
        ]}>
        <View style={styles.bottomBarInfo}>
          <Text style={styles.bottomBarTotalLabel}>Total Payable</Text>
          <Text style={styles.bottomBarTotalAmount}>
            Rs. {total.toLocaleString('en-IN', {minimumFractionDigits: 2})}
          </Text>
        </View>

        <Pressable
          style={({pressed}) => [
            styles.checkoutButton,
            pressed && styles.pressed,
          ]}
          onPress={handleProceedToCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <Ionicons
            name="arrow-forward"
            size={18}
            color="#ffffff"
            style={styles.checkoutArrow}
          />
        </Pressable>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#1a1a1a',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
    fontWeight: '500',
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#fee2e2',
    borderRadius: 8,
  },
  clearAllIcon: {
    marginRight: 4,
  },
  clearAllText: {
    color: '#ff3b30',
    fontSize: 13,
    fontWeight: '600',
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageWrapper: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  productImage: {
    width: 90,
    height: 96,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#18181b',
    lineHeight: 20,
  },
  categoryBadge: {
    fontSize: 11,
    color: '#ff6b00',
    backgroundColor: '#fff4eb',
    alignSelf: 'flex-start',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 3,
    fontWeight: '500',
  },
  unitPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  stepperButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperPressed: {
    backgroundColor: '#e4e4e7',
  },
  stepperValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    paddingHorizontal: 10,
    minWidth: 28,
    textAlign: 'center',
  },
  rightColumn: {
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingVertical: 2,
  },
  itemTotalPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ff6b00',
  },
  deleteButton: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: '#fff1f2',
  },
  footerContainer: {
    marginTop: 8,
  },
  summaryCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 14,
    color: '#18181b',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  deliveryLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#71717a',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#18181b',
  },
  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 10,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181b',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff6b00',
  },
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  securityText: {
    fontSize: 12,
    color: '#71717a',
    marginLeft: 6,
    fontWeight: '500',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e4e4e7',
    paddingHorizontal: 16,
    paddingTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 12,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: -3},
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  bottomBarInfo: {
    flex: 1,
    marginRight: 16,
  },
  bottomBarTotalLabel: {
    fontSize: 12,
    color: '#71717a',
    fontWeight: '500',
  },
  bottomBarTotalAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff6b00',
  },
  checkoutButton: {
    backgroundColor: '#ff6b00',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 22,
    elevation: 3,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  checkoutButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutArrow: {
    marginLeft: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
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
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  startShoppingButton: {
    backgroundColor: '#ff6b00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  buttonIconLeft: {
    marginRight: 8,
  },
  startShoppingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default CartScreen;