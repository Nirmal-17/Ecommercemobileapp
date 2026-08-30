import React from 'react';

import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
} from 'react-native';

function CartScreen({
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}: any) {
  const totalPrice = cartItems.reduce(
    (total: number, item: any) =>
      total +
      Number(item.price) * item.quantity,
    0,
  );

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>

        <Text style={styles.emptyIcon}>
          🛒
        </Text>

        <Text style={styles.emptyTitle}>
          Your Cart is Empty
        </Text>

        <Text style={styles.emptyText}>
          Add some products to your cart.
        </Text>

      </View>
    );
  }

  return (
    <View style={styles.container}>

      <FlatList
        data={cartItems}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({item}) => (
          <View style={styles.cartItem}>

            <Image
              source={{uri: item.image}}
              style={styles.image}
            />

            <View style={styles.details}>

              <Text style={styles.name}>
                {item.name}
              </Text>

              <Text style={styles.price}>
                {'$' + item.price}
              </Text>

              <View style={styles.quantityRow}>

                <Pressable
                  style={styles.quantityButton}
                  onPress={() =>
                    decreaseQuantity(item.id)
                  }
                >
                  <Text style={styles.quantityText}>
                    −
                  </Text>
                </Pressable>

                <Text style={styles.quantity}>
                  {item.quantity}
                </Text>

                <Pressable
                  style={styles.quantityButton}
                  onPress={() =>
                    increaseQuantity(item.id)
                  }
                >
                  <Text style={styles.quantityText}>
                    +
                  </Text>
                </Pressable>

              </View>

              <Pressable
                onPress={() =>
                  removeFromCart(item.id)
                }
              >
                <Text style={styles.removeText}>
                  Remove
                </Text>
              </Pressable>

            </View>

          </View>
        )}
      />

      <View style={styles.bottomSection}>

        <View style={styles.totalRow}>

          <Text style={styles.totalLabel}>
            Total
          </Text>

          <Text style={styles.totalPrice}>
            {'$' + totalPrice.toFixed(2)}
          </Text>

        </View>

        <Pressable style={styles.checkoutButton}>
          <Text style={styles.checkoutText}>
            Checkout
          </Text>
        </Pressable>

      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 15,
  },

  cartItem: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },

  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },

  details: {
    flex: 1,
    marginLeft: 15,
  },

  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  price: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 10,
  },

  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  quantityButton: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
  },

  quantityText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },

  quantity: {
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 15,
  },

  removeText: {
    color: '#e53935',
    fontSize: 15,
    fontWeight: '600',
  },

  bottomSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  totalPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  checkoutButton: {
    height: 52,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  checkoutText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },

  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  emptyIcon: {
    fontSize: 60,
    marginBottom: 15,
  },

  emptyTitle: {
    fontSize: 25,
    fontWeight: 'bold',
    marginBottom: 8,
  },

  emptyText: {
    fontSize: 16,
    color: 'gray',
  },
});

export default CartScreen;
