import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import type {Product} from '../App';
import {useWishlist} from '../App';

// ============================================================
// CONFIGURATION
// ============================================================

const BACKEND_URL = 'http://10.0.2.2:5000';

const USER_ID_KEY = '@user_id';

// ============================================================
// TYPES
// ============================================================

export type ProductDetailsScreenProps = {
  route: any;
  navigation: any;
  addToCart?: (product: Product, quantity?: number) => void;
};

// ============================================================
// COMPONENT
// ============================================================

function ProductDetailsScreen({
  route,
  navigation,
}: ProductDetailsScreenProps) {
  const insets = useSafeAreaInsets();

  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);

  // ==========================================================
  // WISHLIST CONTEXT
  // ==========================================================

  let wishlistCtx: Partial<ReturnType<typeof useWishlist>> = {};

  try {
    wishlistCtx = useWishlist();
  } catch {}

  const toggleWishlist =
    wishlistCtx.toggleWishlist ?? (() => {});

  const isWishlistedFn =
    wishlistCtx.isWishlisted ?? (() => false);

  // ==========================================================
  // VALIDATE PRODUCT
  // ==========================================================

  if (!route?.params?.product) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons
          name="alert-circle-outline"
          size={54}
          color="#ff3b30"
        />

        <Text style={styles.errorTitle}>
          Product Not Found
        </Text>

        <Text style={styles.errorText}>
          The product you are trying to view is
          unavailable or does not exist.
        </Text>

        <Pressable
          style={styles.errorButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  const product: Product =
    route.params.product;

  const isWishlisted =
    isWishlistedFn(product.id);

  // ==========================================================
  // QUANTITY
  // ==========================================================

  const increaseQuantity = () => {
    setQuantity(previous => previous + 1);
  };

  const decreaseQuantity = () => {
    setQuantity(previous =>
      previous > 1 ? previous - 1 : 1,
    );
  };

  const unitPrice =
    Number(product.price || 0);

  const totalPrice =
    unitPrice * quantity;

  // ==========================================================
  // ADD TO POSTGRESQL CART
  // ==========================================================

  const addProductToBackendCart =
    async (): Promise<boolean> => {
      try {
        const userId =
          await AsyncStorage.getItem(
            USER_ID_KEY,
          );

        // ----------------------------------------------------
        // USER MUST BE LOGGED IN
        // ----------------------------------------------------

        if (!userId) {
          Alert.alert(
            'Login Required',
            'Please sign in before adding products to your cart.',
            [
              {
                text: 'Cancel',
                style: 'cancel',
              },
              {
                text: 'Sign In',
                onPress: () =>
                  navigation.replace(
                    'Login',
                  ),
              },
            ],
          );

          return false;
        }

        // ----------------------------------------------------
        // API REQUEST
        // ----------------------------------------------------

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
                userId: Number(userId),
                productId: Number(
                  product.id,
                ),
                quantity,
              }),
            },
          );

        const data =
          await response.json();

        console.log(
          'Add to cart API response:',
          data,
        );

        // ----------------------------------------------------
        // API ERROR
        // ----------------------------------------------------

        if (
          !response.ok ||
          !data.success
        ) {
          Alert.alert(
            'Cart Error',
            data.message ||
              'Unable to add product to cart.',
          );

          return false;
        }

        return true;
      } catch (error) {
        console.error(
          'Add to cart API error:',
          error,
        );

        Alert.alert(
          'Connection Error',
          'Unable to connect to the server. Make sure the backend server is running.',
        );

        return false;
      }
    };

  // ==========================================================
  // ADD TO CART
  // ==========================================================

  const handleAddToCart =
    async () => {
      if (addingToCart || buyingNow) {
        return;
      }

      try {
        setAddingToCart(true);

        const success =
          await addProductToBackendCart();

        if (!success) {
          return;
        }

        Alert.alert(
          'Added to Cart',
          `${quantity} × ${product.name} has been added to your shopping cart.`,
          [
            {
              text: 'Keep Browsing',
              style: 'cancel',
            },
            {
              text: 'Go to Cart',
              onPress: () =>
                navigation.navigate(
                  'MainTabs',
                  {
                    screen: 'Cart',
                  },
                ),
            },
          ],
        );
      } finally {
        setAddingToCart(false);
      }
    };

  // ==========================================================
  // BUY NOW
  // ==========================================================

  const handleBuyNow =
    async () => {
      if (addingToCart || buyingNow) {
        return;
      }

      try {
        setBuyingNow(true);

        const success =
          await addProductToBackendCart();

        if (!success) {
          return;
        }

        navigation.navigate(
          'MainTabs',
          {
            screen: 'Cart',
          },
        );
      } finally {
        setBuyingNow(false);
      }
    };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <View style={styles.container}>

      {/* ====================================================
          HEADER
      ==================================================== */}

      <View
        style={[
          styles.header,
          {
            paddingTop:
              Math.max(
                insets.top,
                10,
              ),
          },
        ]}>

        <Pressable
          style={({pressed}) => [
            styles.iconBtn,
            pressed &&
              styles.pressed,
          ]}
          hitSlop={8}
          onPress={() =>
            navigation.goBack()
          }>

          <Ionicons
            name="arrow-back"
            size={22}
            color="#18181b"
          />

        </Pressable>

        <Text
          style={styles.headerTitle}
          numberOfLines={1}>
          Details
        </Text>

        <Pressable
          style={({pressed}) => [
            styles.iconBtn,
            pressed &&
              styles.pressed,
          ]}
          hitSlop={8}
          onPress={() =>
            toggleWishlist(product)
          }>

          <Ionicons
            name={
              isWishlisted
                ? 'heart'
                : 'heart-outline'
            }
            size={22}
            color={
              isWishlisted
                ? '#ff3b30'
                : '#18181b'
            }
          />

        </Pressable>

      </View>

      {/* ====================================================
          PRODUCT DETAILS
      ==================================================== */}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingBottom:
              insets.bottom + 90,
          },
        ]}>

        {/* PRODUCT IMAGE */}

        <View
          style={
            styles.imageContainer
          }>

          <Image
            source={{
              uri: product.image,
            }}
            style={styles.image}
            resizeMode="contain"
          />

          {product.category ? (
            <View
              style={
                styles.categoryBadge
              }>

              <Text
                style={
                  styles.categoryBadgeText
                }>
                {product.category}
              </Text>

            </View>
          ) : null}

        </View>

        {/* DETAILS CARD */}

        <View
          style={
            styles.detailsCard
          }>

          <Text
            style={
              styles.productName
            }>
            {product.name}
          </Text>

          {/* RATING */}

          <View
            style={
              styles.ratingRow
            }>

            <View
              style={
                styles.starsContainer
              }>

              <Ionicons
                name="star"
                size={16}
                color="#eab308"
              />

              <Ionicons
                name="star"
                size={16}
                color="#eab308"
              />

              <Ionicons
                name="star"
                size={16}
                color="#eab308"
              />

              <Ionicons
                name="star"
                size={16}
                color="#eab308"
              />

              <Ionicons
                name="star-half"
                size={16}
                color="#eab308"
              />

            </View>

            <Text
              style={
                styles.ratingScore
              }>
              4.8
            </Text>

            <Text
              style={
                styles.reviewCount
              }>
              (124 reviews)
            </Text>

            <View
              style={
                styles.inStockBadge
              }>

              <Text
                style={
                  styles.inStockText
                }>
                In Stock
              </Text>

            </View>

          </View>

          {/* PRICE */}

          <View
            style={
              styles.priceRow
            }>

            <Text
              style={
                styles.priceLabel
              }>
              Price:
            </Text>

            <Text
              style={
                styles.productPrice
              }>
              Rs.{' '}
              {unitPrice.toLocaleString(
                'en-IN',
                {
                  minimumFractionDigits: 2,
                },
              )}
            </Text>

          </View>

          <View
            style={
              styles.divider
            }
          />

          {/* QUANTITY */}

          <View
            style={
              styles.quantitySection
            }>

            <Text
              style={
                styles.sectionLabel
              }>
              Quantity
            </Text>

            <View
              style={
                styles.stepperWrapper
              }>

              <Pressable
                style={({pressed}) => [
                  styles.stepperBtn,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={
                  decreaseQuantity
                }
                disabled={
                  addingToCart ||
                  buyingNow
                }>

                <Ionicons
                  name="remove"
                  size={18}
                  color="#18181b"
                />

              </Pressable>

              <Text
                style={
                  styles.stepperValue
                }>
                {quantity}
              </Text>

              <Pressable
                style={({pressed}) => [
                  styles.stepperBtn,
                  pressed &&
                    styles.pressed,
                ]}
                onPress={
                  increaseQuantity
                }
                disabled={
                  addingToCart ||
                  buyingNow
                }>

                <Ionicons
                  name="add"
                  size={18}
                  color="#18181b"
                />

              </Pressable>

            </View>

          </View>

          <View
            style={
              styles.divider
            }
          />

          {/* DESCRIPTION */}

          <View
            style={
              styles.descriptionSection
            }>

            <Text
              style={
                styles.sectionLabel
              }>
              Description
            </Text>

            <Text
              style={
                styles.descriptionText
              }>
              {product.description ||
                'Experience premium build quality and performance designed to elevate your everyday tech experience.'}
            </Text>

          </View>

          {/* HIGHLIGHTS */}

          <View
            style={
              styles.highlightsContainer
            }>

            <View
              style={
                styles.highlightItem
              }>

              <Ionicons
                name="shield-checkmark-outline"
                size={20}
                color="#ff6b00"
              />

              <Text
                style={
                  styles.highlightText
                }>
                1 Year Warranty
              </Text>

            </View>

            <View
              style={
                styles.highlightItem
              }>

              <Ionicons
                name="cube-outline"
                size={20}
                color="#ff6b00"
              />

              <Text
                style={
                  styles.highlightText
                }>
                Fast Shipping
              </Text>

            </View>

            <View
              style={
                styles.highlightItem
              }>

              <Ionicons
                name="refresh-outline"
                size={20}
                color="#ff6b00"
              />

              <Text
                style={
                  styles.highlightText
                }>
                7-Day Replacement
              </Text>

            </View>

          </View>

        </View>

      </ScrollView>

      {/* ====================================================
          STICKY BOTTOM ACTIONS
      ==================================================== */}

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom:
              Math.max(
                insets.bottom,
                12,
              ),
          },
        ]}>

        {/* TOTAL */}

        <View
          style={
            styles.bottomPriceContainer
          }>

          <Text
            style={
              styles.totalPriceLabel
            }>
            Total Amount
          </Text>

          <Text
            style={
              styles.totalPriceValue
            }>
            Rs.{' '}
            {totalPrice.toLocaleString(
              'en-IN',
              {
                minimumFractionDigits: 2,
              },
            )}
          </Text>

        </View>

        {/* BUTTONS */}

        <View
          style={
            styles.bottomButtons
          }>

          {/* ADD TO CART */}

          <Pressable
            style={({pressed}) => [
              styles.addToCartBtn,
              pressed &&
                styles.pressed,
              addingToCart &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleAddToCart
            }
            disabled={
              addingToCart ||
              buyingNow
            }>

            {addingToCart ? (
              <ActivityIndicator
                size="small"
                color="#ff6b00"
              />
            ) : (
              <Ionicons
                name="cart-outline"
                size={18}
                color="#ff6b00"
              />
            )}

            <Text
              style={
                styles.addToCartText
              }>
              {addingToCart
                ? 'Adding...'
                : 'Add to Cart'}
            </Text>

          </Pressable>

          {/* BUY NOW */}

          <Pressable
            style={({pressed}) => [
              styles.buyNowBtn,
              pressed &&
                styles.pressed,
              buyingNow &&
                styles.buttonDisabled,
            ]}
            onPress={
              handleBuyNow
            }
            disabled={
              addingToCart ||
              buyingNow
            }>

            {buyingNow ? (
              <ActivityIndicator
                size="small"
                color="#ffffff"
              />
            ) : (
              <Text
                style={
                  styles.buyNowText
                }>
                Buy Now
              </Text>
            )}

          </Pressable>

        </View>

      </View>

    </View>
  );
}

// ============================================================
// STYLES
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#18181b',
  },

  scrollContent: {
    paddingBottom: 20,
  },

  imageContainer: {
    width: '100%',
    height: 300,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  image: {
    width: '85%',
    height: '85%',
  },

  categoryBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor:
      'rgba(24, 24, 27, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },

  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  detailsCard: {
    padding: 20,
  },

  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    lineHeight: 28,
    marginBottom: 8,
  },

  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },

  starsContainer: {
    flexDirection: 'row',
    marginRight: 6,
  },

  ratingScore: {
    fontSize: 14,
    fontWeight: '700',
    color: '#18181b',
    marginRight: 4,
  },

  reviewCount: {
    fontSize: 13,
    color: '#71717a',
    marginRight: 12,
  },

  inStockBadge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },

  inStockText: {
    color: '#16a34a',
    fontSize: 11,
    fontWeight: '700',
  },

  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },

  priceLabel: {
    fontSize: 15,
    color: '#71717a',
    marginRight: 8,
    fontWeight: '500',
  },

  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: '#ff6b00',
  },

  divider: {
    height: 1,
    backgroundColor: '#f4f4f5',
    marginVertical: 14,
  },

  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 6,
  },

  stepperWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },

  stepperBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },

  stepperValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#18181b',
    paddingHorizontal: 12,
    minWidth: 32,
    textAlign: 'center',
  },

  descriptionSection: {
    marginBottom: 16,
  },

  descriptionText: {
    fontSize: 14,
    color: '#52525b',
    lineHeight: 22,
  },

  highlightsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#fff4eb',
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },

  highlightItem: {
    alignItems: 'center',
    flex: 1,
  },

  highlightText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9a3412',
    marginTop: 4,
    textAlign: 'center',
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
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },

  bottomPriceContainer: {
    marginRight: 12,
  },

  totalPriceLabel: {
    fontSize: 11,
    color: '#71717a',
    fontWeight: '500',
  },

  totalPriceValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ff6b00',
  },

  bottomButtons: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },

  addToCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    height: 46,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#ff6b00',
    backgroundColor: '#ffffff',
    gap: 6,
  },

  addToCartText: {
    color: '#ff6b00',
    fontSize: 14,
    fontWeight: '700',
  },

  buyNowBtn: {
    backgroundColor: '#ff6b00',
    height: 46,
    paddingHorizontal: 18,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#ff6b00',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },

  buyNowText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  buttonDisabled: {
    opacity: 0.65,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#18181b',
    marginTop: 12,
    marginBottom: 6,
  },

  errorText: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },

  errorButton: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },

  errorButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default ProductDetailsScreen;