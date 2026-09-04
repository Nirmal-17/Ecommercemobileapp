import React from 'react';
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {Product} from '../App';
import {useCart, useWishlist} from '../App';

export type WishlistScreenProps = {
  navigation: any;
  wishlist?: Product[];
  wishlistItems?: Product[];
  toggleWishlist?: (product: Product) => void;
  addToCart?: (product: Product, quantity?: number) => void;
};

function WishlistScreen({
  navigation,
  wishlist: propWishlist,
  wishlistItems: propWishlistItems,
  toggleWishlist: propToggleWishlist,
  addToCart: propAddToCart,
}: WishlistScreenProps) {
  const insets = useSafeAreaInsets();

  // Safely consume contexts with fallback to props
  let wishlistCtx: Partial<ReturnType<typeof useWishlist>> = {};
  let cartCtx: Partial<ReturnType<typeof useCart>> = {};
  try {
    wishlistCtx = useWishlist();
  } catch {}
  try {
    cartCtx = useCart();
  } catch {}

  const items: Product[] =
    propWishlist ?? propWishlistItems ?? wishlistCtx.wishlist ?? [];
  const toggleWishlist =
    propToggleWishlist ?? wishlistCtx.toggleWishlist ?? (() => {});
  const addToCart = propAddToCart ?? cartCtx.addToCart ?? (() => {});

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    Alert.alert('Added to Cart', `${product.name} has been added to your cart.`);
  };

  const handleAddAllToCart = () => {
    if (items.length === 0) return;
    items.forEach(item => addToCart(item, 1));
    Alert.alert(
      'All Items Added',
      `${items.length} ${
        items.length === 1 ? 'item has' : 'items have'
      } been added to your shopping cart.`,
      [
        {text: 'Keep Browsing', style: 'cancel'},
        {
          text: 'View Cart',
          onPress: () => navigation.navigate('Cart'),
        },
      ],
    );
  };

  return (
    <View style={[styles.container, {paddingTop: Math.max(insets.top, 12)}]}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          items.length === 0 && styles.emptyList,
          {paddingBottom: insets.bottom + 20},
        ]}
        ListHeaderComponent={
          items.length > 0 ? (
            <View style={styles.header}>
              <View>
                <Text style={styles.title}>My Wishlist</Text>
                <Text style={styles.subtitle}>
                  {items.length} saved {items.length === 1 ? 'item' : 'items'}
                </Text>
              </View>

              <Pressable
                style={({pressed}) => [
                  styles.addAllButton,
                  pressed && styles.pressed,
                ]}
                onPress={handleAddAllToCart}>
                <Ionicons
                  name="cart-outline"
                  size={16}
                  color="#ff6b00"
                  style={styles.addAllIcon}
                />
                <Text style={styles.addAllText}>Add All to Cart</Text>
              </Pressable>
            </View>
          ) : undefined
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="heart-outline" size={60} color="#ff3b30" />
            </View>
            <Text style={styles.emptyTitle}>Your Wishlist is Empty</Text>
            <Text style={styles.emptyText}>
              Explore our store and tap the heart icon on items you'd love to
              save for later!
            </Text>

            <Pressable
              style={({pressed}) => [
                styles.shopButton,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate('Home')}>
              <Ionicons
                name="bag-handle-outline"
                size={20}
                color="#ffffff"
                style={styles.buttonIcon}
              />
              <Text style={styles.shopButtonText}>Explore Products</Text>
            </Pressable>
          </View>
        }
        renderItem={({item}) => {
          const formattedPrice = Number(item.price || 0).toLocaleString(
            'en-IN',
            {
              minimumFractionDigits: 2,
            },
          );

          return (
            <View style={styles.card}>
              <Pressable
                onPress={() =>
                  navigation.navigate('ProductDetails', {product: item})
                }
                style={styles.imageWrapper}>
                <Image source={{uri: item.image}} style={styles.image} />
                <Pressable
                  style={({pressed}) => [
                    styles.removeHeartBtn,
                    pressed && styles.pressed,
                  ]}
                  hitSlop={8}
                  onPress={() => toggleWishlist(item)}>
                  <Ionicons name="heart" size={20} color="#ff3b30" />
                </Pressable>
              </Pressable>

              <View style={styles.info}>
                <Pressable
                  onPress={() =>
                    navigation.navigate('ProductDetails', {product: item})
                  }>
                  <Text style={styles.name} numberOfLines={2}>
                    {item.name}
                  </Text>
                </Pressable>

                <Text style={styles.price}>Rs. {formattedPrice}</Text>

                <View style={styles.actionRow}>
                  <Pressable
                    style={({pressed}) => [
                      styles.cartButton,
                      pressed && styles.pressed,
                    ]}
                    onPress={() => handleAddToCart(item)}>
                    <Ionicons
                      name="cart-outline"
                      size={18}
                      color="#ffffff"
                      style={styles.buttonIcon}
                    />
                    <Text style={styles.cartButtonText}>Add to Cart</Text>
                  </Pressable>

                  <Pressable
                    style={({pressed}) => [
                      styles.removeButton,
                      pressed && styles.pressed,
                    ]}
                    hitSlop={8}
                    onPress={() => toggleWishlist(item)}>
                    <Ionicons name="trash-outline" size={18} color="#71717a" />
                  </Pressable>
                </View>
              </View>
            </View>
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
  listContent: {
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingVertical: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 2,
    fontWeight: '500',
  },
  addAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff4eb',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  addAllIcon: {
    marginRight: 6,
  },
  addAllText: {
    color: '#ff6b00',
    fontSize: 13,
    fontWeight: '700',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  imageWrapper: {
    position: 'relative',
    backgroundColor: '#f4f4f5',
  },
  image: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  removeHeartBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
  },
  info: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    marginBottom: 6,
    lineHeight: 22,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
    color: '#ff6b00',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartButton: {
    flex: 1,
    height: 44,
    backgroundColor: '#ff6b00',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 2,
    shadowColor: '#ff6b00',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  removeButton: {
    width: 44,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  buttonIcon: {
    marginRight: 6,
  },
  pressed: {
    opacity: 0.75,
  },
  emptyList: {
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fee2e2',
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
  shopButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
});

export default WishlistScreen;