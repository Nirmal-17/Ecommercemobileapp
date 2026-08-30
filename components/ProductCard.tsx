import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
};

type ProductCardProps = {
  product: Product;
  onPress: () => void;
};

function ProductCard({
  product,
  onPress,
}: ProductCardProps) {
  return (
    <Pressable
      style={({pressed}) => [
        styles.card,
        pressed && styles.pressed,
      ]}
      onPress={onPress}>

      <Image
        source={{uri: product.image}}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.info}>

        <Text
          style={styles.name}
          numberOfLines={2}>
          {product.name}
        </Text>

        <Text style={styles.price}>
          ${product.price}
        </Text>

      </View>

    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',

    elevation: 3,

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.15,
    shadowRadius: 4,
  },

  pressed: {
    opacity: 0.7,
  },

  image: {
    width: '100%',
    height: 180,
  },

  info: {
    padding: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: '600',
  },

  price: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
});

export default ProductCard;