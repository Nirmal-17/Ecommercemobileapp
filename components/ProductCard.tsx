import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import type {Product} from '../App';

export type ProductCardProps = {
  product: Product;
  onPress: () => void;
  isWishlisted: boolean;
  onWishlistPress: () => void;
};

function ProductCard({
  product,
  onPress,
  isWishlisted,
  onWishlistPress,
}: ProductCardProps) {
  const formattedPrice = Number(product.price || 0).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
  });

  return (
    <Pressable
      style={({pressed}) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      {/* PRODUCT IMAGE CONTAINER */}
      <View style={styles.imageContainer}>
        <Image
          source={{uri: product.image}}
          style={styles.image}
          resizeMode="cover"
        />

        {/* WISHLIST HEART BUTTON */}
        <Pressable
          style={({pressed}) => [
            styles.heartButton,
            pressed && styles.heartPressed,
          ]}
          onPress={onWishlistPress}
          hitSlop={8}>
          <Ionicons
            name={isWishlisted ? 'heart' : 'heart-outline'}
            size={22}
            color={isWishlisted ? '#ff3b30' : '#71717a'}
          />
        </Pressable>

        {/* CATEGORY BADGE IF AVAILABLE */}
        {product.category ? (
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryBadgeText}>{product.category}</Text>
          </View>
        ) : null}
      </View>

      {/* PRODUCT INFORMATION */}
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        <View style={styles.priceRow}>
          <Text style={styles.currencyPrefix}>Rs. </Text>
          <Text style={styles.price}>{formattedPrice}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  pressed: {
    opacity: 0.9,
    transform: [{scale: 0.99}],
  },
  imageContainer: {
    position: 'relative',
    backgroundColor: '#f4f4f5',
  },
  image: {
    width: '100%',
    height: 190,
  },
  heartButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  heartPressed: {
    transform: [{scale: 1.15}],
  },
  categoryBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    backgroundColor: 'rgba(24, 24, 27, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  info: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: '#18181b',
    lineHeight: 22,
    minHeight: 44,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 8,
  },
  currencyPrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ff6b00',
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ff6b00',
  },
});

export default ProductCard;
