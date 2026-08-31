import React from 'react';

import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  FlatList,
} from 'react-native';


function CartScreen({
  navigation,
  cartItems,
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
}: any) {


  // =================================
  // TOTAL CALCULATION
  // =================================

  const subtotal = cartItems.reduce(
    (total: number, item: any) =>
      total +
      item.price * item.quantity,
    0,
  );


  const deliveryFee =
    cartItems.length > 0
      ? 5
      : 0;


  const total =
    subtotal + deliveryFee;


  // =================================
  // EMPTY CART
  // =================================

  if (cartItems.length === 0) {

    return (

      <View
        style={styles.emptyContainer}
      >

        <Text
          style={styles.emptyIcon}
        >
          🛒
        </Text>


        <Text
          style={styles.emptyTitle}
        >
          Your Cart is Empty
        </Text>


        <Text
          style={styles.emptyText}
        >
          Add some products to your cart
          to see them here.
        </Text>


        <Pressable
          style={styles.shopButton}

          onPress={() =>
            navigation.navigate(
              'Home',
            )
          }
        >

          <Text
            style={styles.shopButtonText}
          >
            Start Shopping
          </Text>

        </Pressable>

      </View>

    );
  }


  // =================================
  // CART ITEM
  // =================================

  const renderCartItem = ({
    item,
  }: any) => (

    <View
      style={styles.cartItem}
    >

      <Image
        source={{
          uri: item.image,
        }}

        style={styles.productImage}
      />


      <View
        style={styles.itemDetails}
      >

        <Text
          style={styles.productName}
          numberOfLines={2}
        >
          {item.name}
        </Text>


        <Text
          style={styles.productPrice}
        >
          ${item.price.toFixed(2)}
        </Text>


        {/* QUANTITY */}

        <View
          style={styles.quantityRow}
        >

          <Pressable
            style={styles.quantityButton}

            onPress={() =>
              decreaseQuantity(
                item.id,
              )
            }
          >

            <Text
              style={styles.quantityText}
            >
              −
            </Text>

          </Pressable>


          <Text
            style={styles.quantity}
          >
            {item.quantity}
          </Text>


          <Pressable
            style={styles.quantityButton}

            onPress={() =>
              increaseQuantity(
                item.id,
              )
            }
          >

            <Text
              style={styles.quantityText}
            >
              +
            </Text>

          </Pressable>

        </View>

      </View>


      {/* RIGHT SIDE */}

      <View
        style={styles.rightSection}
      >

        <Text
          style={styles.itemTotal}
        >
          $
          {(
            item.price *
            item.quantity
          ).toFixed(2)}
        </Text>


        <Pressable
          onPress={() =>
            removeFromCart(
              item.id,
            )
          }
        >

          <Text
            style={styles.removeText}
          >
            Remove
          </Text>

        </Pressable>

      </View>

    </View>

  );


  // =================================
  // MAIN CART
  // =================================

  return (

    <View
      style={styles.container}
    >

      <FlatList

        data={cartItems}

        keyExtractor={
          item => item.id
        }

        renderItem={
          renderCartItem
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          styles.listContent
        }

        ListHeaderComponent={

          <Text
            style={styles.title}
          >
            Shopping Cart
          </Text>

        }

        ListFooterComponent={

          <View>

            {/* SUMMARY */}

            <View
              style={styles.summaryCard}
            >

              <Text
                style={styles.summaryTitle}
              >
                Order Summary
              </Text>


              {/* SUBTOTAL */}

              <View
                style={styles.summaryRow}
              >

                <Text
                  style={styles.summaryLabel}
                >
                  Subtotal
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  $
                  {subtotal.toFixed(2)}
                </Text>

              </View>


              {/* DELIVERY */}

              <View
                style={styles.summaryRow}
              >

                <Text
                  style={styles.summaryLabel}
                >
                  Delivery
                </Text>

                <Text
                  style={styles.summaryValue}
                >
                  $
                  {deliveryFee.toFixed(2)}
                </Text>

              </View>


              <View
                style={styles.divider}
              />


              {/* TOTAL */}

              <View
                style={styles.totalRow}
              >

                <Text
                  style={styles.totalLabel}
                >
                  Total
                </Text>

                <Text
                  style={styles.totalValue}
                >
                  $
                  {total.toFixed(2)}
                </Text>

              </View>

            </View>


            {/* CHECKOUT BUTTON */}

            <Pressable
              style={({pressed}) => [
                styles.checkoutButton,

                pressed &&
                  styles.pressed,
              ]}

              onPress={() =>
                navigation.navigate(
                  'Checkout',
                  {
                    cartItems:
                      cartItems,
                  },
                )
              }
            >

              <Text
                style={
                  styles.checkoutButtonText
                }
              >
                Proceed to Checkout
              </Text>

            </Pressable>

          </View>

        }

      />

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor:
      '#f5f5f5',
  },


  listContent: {
    padding: 15,

    paddingBottom: 30,
  },


  title: {
    fontSize: 28,

    fontWeight: 'bold',

    marginBottom: 15,
  },


  cartItem: {
    backgroundColor:
      '#ffffff',

    borderRadius: 12,

    padding: 12,

    marginBottom: 12,

    flexDirection: 'row',

    elevation: 2,

    minHeight: 130,
  },


  productImage: {
    width: 95,

    height: 105,

    borderRadius: 10,

    backgroundColor:
      '#eeeeee',
  },


  itemDetails: {
    flex: 1,

    paddingLeft: 12,

    paddingRight: 5,

  },


  productName: {
    fontSize: 16,

    fontWeight: '600',

    marginBottom: 7,
  },


  productPrice: {
    fontSize: 15,

    fontWeight: 'bold',

    marginBottom: 10,
  },


  quantityRow: {
    flexDirection: 'row',

    alignItems: 'center',
  },


  quantityButton: {
    width: 32,

    height: 32,

    borderRadius: 8,

    backgroundColor:
      '#eeeeee',

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  quantityText: {
    fontSize: 21,

    fontWeight: 'bold',
  },


  quantity: {
    fontSize: 16,

    fontWeight: 'bold',

    marginHorizontal: 13,

    minWidth: 15,

    textAlign: 'center',
  },


  rightSection: {
    justifyContent:
      'space-between',

    alignItems: 'flex-end',

    paddingVertical: 2,
  },


  itemTotal: {
    fontSize: 16,

    fontWeight: 'bold',
  },


  removeText: {
    color: '#ff3b30',

    fontSize: 13,

    fontWeight: '600',
  },


  summaryCard: {
    backgroundColor:
      '#ffffff',

    borderRadius: 14,

    padding: 18,

    marginTop: 8,

    elevation: 2,
  },


  summaryTitle: {
    fontSize: 20,

    fontWeight: 'bold',

    marginBottom: 15,
  },


  summaryRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    marginBottom: 10,
  },


  summaryLabel: {
    fontSize: 15,

    color: '#666',
  },


  summaryValue: {
    fontSize: 15,

    fontWeight: '600',
  },


  divider: {
    height: 1,

    backgroundColor:
      '#eeeeee',

    marginVertical: 8,
  },


  totalRow: {
    flexDirection: 'row',

    justifyContent:
      'space-between',

    alignItems: 'center',

    marginTop: 5,
  },


  totalLabel: {
    fontSize: 20,

    fontWeight: 'bold',
  },


  totalValue: {
    fontSize: 22,

    fontWeight: 'bold',
  },


  checkoutButton: {
    height: 55,

    backgroundColor:
      '#007AFF',

    borderRadius: 11,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginTop: 15,
  },


  checkoutButtonText: {
    color: '#ffffff',

    fontSize: 18,

    fontWeight: 'bold',
  },


  pressed: {
    opacity: 0.7,
  },


  emptyContainer: {
    flex: 1,

    justifyContent:
      'center',

    alignItems:
      'center',

    padding: 30,

    backgroundColor:
      '#f5f5f5',
  },


  emptyIcon: {
    fontSize: 70,

    marginBottom: 15,
  },


  emptyTitle: {
    fontSize: 25,

    fontWeight: 'bold',

    marginBottom: 10,
  },


  emptyText: {
    fontSize: 15,

    color: '#777',

    textAlign: 'center',

    lineHeight: 22,

    marginBottom: 25,
  },


  shopButton: {
    backgroundColor:
      '#007AFF',

    paddingHorizontal: 25,

    height: 50,

    borderRadius: 10,

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  shopButtonText: {
    color: '#ffffff',

    fontSize: 16,

    fontWeight: 'bold',
  },

});


export default CartScreen;
