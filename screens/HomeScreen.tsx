import React, {useCallback, useMemo, useState} from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ProductCard from '../components/ProductCard';
import type {Product} from '../App';
import {useCart, useWishlist} from '../App';

// ============================================================================
// PRODUCT DATA
// ============================================================================
export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Headphones',
    price: 50,
    category: 'Audio',
    description:
      'High-fidelity wireless headphones with active noise cancellation and 30-hour battery life.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  },
  {
    id: '2',
    name: 'Mechanical Keyboard',
    price: 80,
    category: 'Keyboards',
    description:
      'Custom mechanical gaming keyboard with RGB backlighting and responsive tactile switches.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
  },
  {
    id: '3',
    name: 'Gaming Mouse',
    price: 35,
    category: 'Gaming',
    description:
      'Ergonomic gaming mouse with precision optical sensor up to 16,000 DPI and programmable buttons.',
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db',
  },
  {
    id: '4',
    name: 'USB-C Fast Charger',
    price: 25,
    category: 'Accessories',
    description:
      'Ultra-compact 65W GaN dual-port USB-C power adapter for phones, tablets, and laptops.',
    image:
      'https://www.4xem.com/cdn/shop/files/4X25WCHARGEKIT_main_42346726-05ee-4943-a08d-1874c698609c_535x.jpg?v=1695146056',
  },
  {
    id: '5',
    name: 'Gaming Monitor 27"',
    price: 250,
    category: 'Displays',
    description:
      '27-inch 144Hz curved gaming monitor with 1ms response time, AMD FreeSync, and HDR support.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
  },
  {
    id: '6',
    name: 'Webcam HD Pro',
    price: 70,
    category: 'Accessories',
    description:
      '1080p full HD streaming webcam with dual noise-reducing microphones and auto light correction.',
    image: 'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
  },
];

const CATEGORIES = ['All', 'Audio', 'Keyboards', 'Gaming', 'Displays', 'Accessories'];

// ============================================================================
// COMPONENT PROPS
// ============================================================================
export type HomeScreenProps = {
  navigation: any;
  wishlist?: Product[];
  toggleWishlist?: (product: Product) => void;
  addToCart?: (product: Product, quantity?: number) => void;
};

function HomeScreen({
  navigation,
  wishlist: propWishlist,
  toggleWishlist: propToggleWishlist,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  // Safely consume contexts with graceful fallback to props
  let wishlistCtx: Partial<ReturnType<typeof useWishlist>> = {};
  let cartCtx: Partial<ReturnType<typeof useCart>> = {};
  try {
    wishlistCtx = useWishlist();
  } catch {}
  try {
    cartCtx = useCart();
  } catch {}

  const wishlist = propWishlist ?? wishlistCtx.wishlist ?? [];
  const toggleWishlist =
    propToggleWishlist ?? wishlistCtx.toggleWishlist ?? (() => {});
  const isWishlisted =
    wishlistCtx.isWishlisted ??
    ((id: string) => wishlist.some(item => item.id === id));
  const cartCount = cartCtx.cartCount ?? 0;

  // Local state
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [refreshing, setRefreshing] = useState(false);

  // Pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 600);
  }, []);

  // Filter products by search query and active category
  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return PRODUCTS.filter(product => {
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query));
      const matchesCategory =
        selectedCategory === 'All' || product.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [search, selectedCategory]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  return (
    <View style={[styles.container, {paddingTop: Math.max(insets.top, 12)}]}>
      {/* HEADER ROW */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back 👋</Text>
          <Text style={styles.title}>E-Shopee</Text>
        </View>

        {/* CART QUICK ACCESS BUTTON */}
        <Pressable
          style={({pressed}) => [styles.cartButton, pressed && styles.pressed]}
          onPress={() => navigation.navigate('Cart')}
          hitSlop={8}>
          <Ionicons name="cart-outline" size={24} color="#ed8312" />
          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* SEARCH BAR */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search-outline"
          size={20}
          color="#40565f"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Search headphones, keyboards, mice..."
          placeholderTextColor="#8e8e93"
          value={search}
          onChangeText={setSearch}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
        {search.length > 0 ? (
          <Pressable
            onPress={() => setSearch('')}
            hitSlop={8}
            style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color="#8e8e93" />
          </Pressable>
        ) : null}
      </View>

      {/* CATEGORY PILLS */}
      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(category => {
            const isSelected = selectedCategory === category;
            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={({pressed}) => [
                  styles.categoryPill,
                  isSelected && styles.categoryPillActive,
                  pressed && styles.pressed,
                ]}>
                <Text
                  style={[
                    styles.categoryText,
                    isSelected && styles.categoryTextActive,
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* PROMO HERO BANNER */}
      {search === '' && selectedCategory === 'All' ? (
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>
            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>LIMITED OFFER ⚡</Text>
            </View>
            <Text style={styles.bannerTitle}>Up to 30% OFF</Text>
            <Text style={styles.bannerSubtitle}>
              On selected gaming & audio accessories
            </Text>
          </View>
        </View>
      ) : null}

      {/* PRODUCT LIST */}
      <FlatList
        data={filteredProducts}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ProductCard
            product={item}
            onPress={() =>
              navigation.navigate('ProductDetails', {
                product: item,
              })
            }
            isWishlisted={isWishlisted(item.id)}
            onWishlistPress={() => toggleWishlist(item)}
          />
        )}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="search-outline" size={38} color="#8e8e93" />
            </View>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptySubtitle}>
              No items match "{search}" in {selectedCategory}. Try searching for
              another term or resetting filters.
            </Text>
            <Pressable
              style={({pressed}) => [
                styles.resetBtn,
                pressed && styles.pressed,
              ]}
              onPress={handleResetFilters}>
              <Text style={styles.resetBtnText}>Reset All Filters</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 6,
  },
  greeting: {
    fontSize: 13,
    fontWeight: '500',
    color: '#71717a',
    letterSpacing: 0.2,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#18181b',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cartBadge: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: '#ff3b30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: '#18181b',
    paddingVertical: 0,
  },
  clearSearchBtn: {
    padding: 4,
  },
  categorySection: {
    marginBottom: 12,
  },
  categoryScroll: {
    paddingRight: 16,
    gap: 8,
  },
  categoryPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  categoryPillActive: {
    backgroundColor: '#ff6b00',
    borderColor: '#ff6b00',
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#52525b',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  bannerCard: {
    backgroundColor: '#18181b',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerTag: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  bannerTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 4,
  },
  bannerSubtitle: {
    color: '#a1a1aa',
    fontSize: 13,
    fontWeight: '500',
  },
  listContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f4f4f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  resetBtn: {
    backgroundColor: '#ff6b00',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.75,
  },
});

export default HomeScreen;
