import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';

function ProductDetailsScreen({
  route,
  navigation,
  addToCart,
}: any) {
  if (!route || !route.params || !route.params.product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>
          Product information not found.
        </Text>
      </View>
    );
  }

  const product = route.params.product;

  const handleAddToCart = () => {
    addToCart(product);

    Alert.alert(
      'Added to Cart',
      product.name + ' has been added to your cart.',
      [
        {
          text: 'Continue Shopping',
          onPress: () => {
            navigation.navigate('MainTabs', {
              screen: 'Home',
            });
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>

      <Image
        source={{uri: product.image}}
        style={styles.image}
      />

      <Text style={styles.name}>
        {product.name}
      </Text>

      <Text style={styles.price}>
        {'$' + product.price}
      </Text>

      <Text style={styles.description}>
        High-quality {product.name} for your everyday
        needs.
      </Text>

      <Pressable
        style={styles.cartButton}
        onPress={handleAddToCart}
      >
        <Text style={styles.cartButtonText}>
          Add to Cart
        </Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },

  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 20,
  },

  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  description: {
    fontSize: 16,
    color: 'gray',
    lineHeight: 24,
    marginBottom: 30,
  },

  cartButton: {
    height: 55,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  cartButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  errorText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 50,
  },
});

export default ProductDetailsScreen;
