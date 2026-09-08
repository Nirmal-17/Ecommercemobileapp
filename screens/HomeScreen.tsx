import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  ActivityIndicator,
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
// BACKEND API
// ============================================================================

const BACKEND_URL = 'http://10.0.2.2:5000';

// ============================================================================
// COMPONENT PROPS
// ============================================================================

export type HomeScreenProps = {
  navigation: any;
  wishlist?: Product[];
  toggleWishlist?: (product: Product) => void;
  addToCart?: (product: Product, quantity?: number) => void;
};

// ============================================================================
// COMPONENT
// ============================================================================

function HomeScreen({
  navigation,
  wishlist: propWishlist,
  toggleWishlist: propToggleWishlist,
}: HomeScreenProps) {
  const insets = useSafeAreaInsets();

  // ========================================================================
  // CONTEXTS
  // ========================================================================

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

  // ========================================================================
  // STATE
  // ========================================================================

  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ========================================================================
  // FETCH PRODUCTS
  // ========================================================================

  const fetchProducts = useCallback(async () => {
    try {
      setError('');

      const response = await fetch(`${BACKEND_URL}/api/products`);

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.products || []);
    } catch (err) {
      console.error('Fetch products error:', err);

      setError(
        'Unable to load products. Make sure the backend server is running.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ========================================================================
  // INITIAL LOAD
  // ========================================================================

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ========================================================================
  // PULL TO REFRESH
  // ========================================================================

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // ========================================================================
  // CATEGORIES
  // ========================================================================

  const categories = useMemo(() => {
    const uniqueCategories = Array.from(
      new Set(
        products
          .map(product => product.category)
          .filter(
            (category): category is string =>
              typeof category === 'string' && category.length > 0,
          ),
      ),
    );

    return ['All', ...uniqueCategories];
  }, [products]);

  // ========================================================================
  // FILTER PRODUCTS
  // ========================================================================

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter(product => {
      const matchesSearch =
        query === '' ||
        product.name.toLowerCase().includes(query) ||
        (product.description &&
          product.description.toLowerCase().includes(query)) ||
        (product.category &&
          product.category.toLowerCase().includes(query));

      const matchesCategory =
        selectedCategory === 'All' ||
        product.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [products, search, selectedCategory]);

  // ========================================================================
  // RESET FILTERS
  // ========================================================================

  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
  };

  // ========================================================================
  // RETRY
  // ========================================================================

  const handleRetry = () => {
    setLoading(true);
    fetchProducts();
  };

  // ========================================================================
  // LOADING SCREEN
  // ========================================================================

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          styles.centerContent,
          {paddingTop: Math.max(insets.top, 12)},
        ]}>
        <ActivityIndicator size="large" color="#ff6b00" />

        <Text style={styles.loadingText}>
          Loading products...
        </Text>
      </View>
    );
  }

  // ========================================================================
  // MAIN UI
  // ========================================================================

  return (
    <View
      style={[
        styles.container,
        {paddingTop: Math.max(insets.top, 12)},
      ]}>

      {/* ================================================================
          HEADER
      ================================================================ */}

      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Welcome back 👋
          </Text>

          <Text style={styles.title}>
            E-Shopee
          </Text>
        </View>

        {/* CART QUICK ACCESS */}

        <Pressable
          style={({pressed}) => [
            styles.cartButton,
            pressed && styles.pressed,
          ]}
          onPress={() => navigation.navigate('Cart')}
          hitSlop={8}>

          <Ionicons
            name="cart-outline"
            size={24}
            color="#ed8312"
          />

          {cartCount > 0 ? (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartCount > 99 ? '99+' : cartCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </View>

      {/* ================================================================
          SEARCH BAR
      ================================================================ */}

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

            <Ionicons
              name="close-circle"
              size={18}
              color="#8e8e93"
            />
          </Pressable>
        ) : null}
      </View>

      {/* ================================================================
          CATEGORIES
      ================================================================ */}

      <View style={styles.categorySection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>

          {categories.map(category => {
            const isSelected =
              selectedCategory === category;

            return (
              <Pressable
                key={category}
                onPress={() => setSelectedCategory(category)}
                style={({pressed}) => [
                  styles.categoryPill,
                  isSelected &&
                    styles.categoryPillActive,
                  pressed && styles.pressed,
                ]}>

                <Text
                  style={[
                    styles.categoryText,
                    isSelected &&
                      styles.categoryTextActive,
                  ]}>
                  {category}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* ================================================================
          PROMO BANNER
      ================================================================ */}

      {search === '' &&
      selectedCategory === 'All' ? (
        <View style={styles.bannerCard}>
          <View style={styles.bannerContent}>

            <View style={styles.bannerTag}>
              <Text style={styles.bannerTagText}>
                LIMITED OFFER ⚡
              </Text>
            </View>

            <Text style={styles.bannerTitle}>
              Up to 30% OFF
            </Text>

            <Text style={styles.bannerSubtitle}>
              On selected gaming & audio accessories
            </Text>

          </View>
        </View>
      ) : null}

      {/* ================================================================
          API ERROR
      ================================================================ */}

      {error !== '' ? (
        <View style={styles.errorContainer}>

          <View style={styles.errorIconCircle}>
            <Ionicons
              name="cloud-offline-outline"
              size={36}
              color="#ff3b30"
            />
          </View>

          <Text style={styles.errorTitle}>
            Unable to Load Products
          </Text>

          <Text style={styles.errorSubtitle}>
            {error}
          </Text>

          <Pressable
            style={({pressed}) => [
              styles.retryBtn,
              pressed && styles.pressed,
            ]}
            onPress={handleRetry}>

            <Ionicons
              name="refresh-outline"
              size={18}
              color="#ffffff"
            />

            <Text style={styles.retryBtnText}>
              Try Again
            </Text>

          </Pressable>
        </View>
      ) : (
        /* ==============================================================
           PRODUCT LIST
        ============================================================== */

        <FlatList
          data={filteredProducts}
          keyExtractor={item => item.id}

          renderItem={({item}) => (
            <ProductCard
              product={item}

              onPress={() =>
                navigation.navigate(
                  'ProductDetails',
                  {
                    product: item,
                  },
                )
              }

              isWishlisted={isWishlisted(item.id)}

              onWishlistPress={() =>
                toggleWishlist(item)
              }
            />
          )}

          showsVerticalScrollIndicator={false}

          contentContainerStyle={[
            styles.listContent,
            {
              paddingBottom:
                insets.bottom + 20,
            },
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
                <Ionicons
                  name="search-outline"
                  size={38}
                  color="#8e8e93"
                />
              </View>

              <Text style={styles.emptyTitle}>
                No Products Found
              </Text>

              <Text style={styles.emptySubtitle}>
                {products.length === 0
                  ? 'There are currently no products in the database.'
                  : `No items match "${search}" in ${selectedCategory}. Try searching for another term or resetting filters.`}
              </Text>

              {products.length > 0 ? (
                <Pressable
                  style={({pressed}) => [
                    styles.resetBtn,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleResetFilters}>

                  <Text style={styles.resetBtnText}>
                    Reset All Filters
                  </Text>

                </Pressable>
              ) : null}

            </View>
          }
        />
      )}
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

  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#71717a',
    fontWeight: '500',
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    shadowOffset: {
      width: 0,
      height: 1,
    },
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
    shadowOffset: {
      width: 0,
      height: 3,
    },
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

  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 25,
  },

  errorIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff1f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#18181b',
    marginBottom: 8,
  },

  errorSubtitle: {
    fontSize: 14,
    color: '#71717a',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },

  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ff6b00',
    paddingHorizontal: 20,
    paddingVertical: 11,
    borderRadius: 10,
  },

  retryBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  pressed: {
    opacity: 0.75,
  },
});

export default HomeScreen;