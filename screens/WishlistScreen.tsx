import React from 'react';

import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Alert,
} from 'react-native';


function WishlistScreen({
  navigation,
  wishlist,
  toggleWishlist,
  addToCart,
}: any) {


  // =================================
  // ADD TO CART
  // =================================

  const handleAddToCart = (
    product: any,
  ) => {

    addToCart(product);

    Alert.alert(
      'Added to Cart',
      product.name +
        ' has been added to your cart.',
    );

  };


  return (

    <View style={styles.container}>

      <FlatList

        data={wishlist}

        keyExtractor={
          item => item.id
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={
          wishlist.length === 0
            ? styles.emptyList
            : undefined
        }


        // =================================
        // EMPTY WISHLIST
        // =================================

        ListEmptyComponent={

          <View
            style={
              styles.emptyContainer
            }
          >

            <Text
              style={styles.emptyIcon}
            >
              ♡
            </Text>


            <Text
              style={styles.emptyTitle}
            >
              Your Wishlist is Empty
            </Text>


            <Text
              style={styles.emptyText}
            >
              Add products you love to
              your wishlist.
            </Text>

          </View>

        }


        // =================================
        // WISHLIST PRODUCT
        // =================================

        renderItem={({
          item,
        }) => (

          <View
            style={styles.card}
          >

            {/* IMAGE */}

            <Pressable
              onPress={() =>
                navigation.navigate(
                  'ProductDetails',
                  {
                    product: item,
                  },
                )
              }
            >

              <Image
                source={{
                  uri: item.image,
                }}

                style={styles.image}
              />

            </Pressable>


            {/* INFO */}

            <View
              style={styles.info}
            >

              <Text
                style={styles.name}
                numberOfLines={2}
              >
                {item.name}
              </Text>


              <Text
                style={styles.price}
              >
                ${item.price}
              </Text>


              {/* ADD TO CART */}

              <Pressable

                style={({pressed}) => [
                  styles.cartButton,

                  pressed &&
                    styles.pressed,
                ]}

                onPress={() =>
                  handleAddToCart(item)
                }
              >

                <Text
                  style={
                    styles.cartButtonText
                  }
                >
                  Add to Cart
                </Text>

              </Pressable>


              {/* REMOVE */}

              <Pressable

                style={({pressed}) => [
                  styles.removeButton,

                  pressed &&
                    styles.pressed,
                ]}

                onPress={() =>
                  toggleWishlist(item)
                }
              >

                <Text
                  style={styles.removeText}
                >
                  ♥ Remove from Wishlist
                </Text>

              </Pressable>

            </View>

          </View>

        )}

      />

    </View>

  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,

    backgroundColor:
      '#f5f5f5',

    padding: 15,
  },


  card: {
    backgroundColor:
      'white',

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


  image: {
    width: '100%',

    height: 200,

    resizeMode: 'cover',
  },


  info: {
    padding: 15,
  },


  name: {
    fontSize: 20,

    fontWeight: '600',

    marginBottom: 8,
  },


  price: {
    fontSize: 20,

    fontWeight: 'bold',

    marginBottom: 15,
  },


  cartButton: {
    height: 48,

    backgroundColor:
      '#007AFF',

    borderRadius: 8,

    justifyContent:
      'center',

    alignItems:
      'center',

    marginBottom: 10,
  },


  cartButtonText: {
    color: 'white',

    fontSize: 16,

    fontWeight: 'bold',
  },


  removeButton: {
    height: 45,

    borderWidth: 1,

    borderColor:
      '#ff3b30',

    borderRadius: 8,

    justifyContent:
      'center',

    alignItems:
      'center',
  },


  removeText: {
    color: '#ff3b30',

    fontSize: 16,

    fontWeight: '600',
  },


  pressed: {
    opacity: 0.7,
  },


  emptyList: {
    flexGrow: 1,
  },


  emptyContainer: {
    flex: 1,

    justifyContent:
      'center',

    alignItems:
      'center',

    paddingHorizontal: 20,
  },


  emptyIcon: {
    fontSize: 70,

    color: '#aaa',

    marginBottom: 15,
  },


  emptyTitle: {
    fontSize: 24,

    fontWeight: 'bold',

    marginBottom: 10,

    textAlign: 'center',
  },


  emptyText: {
    fontSize: 16,

    color: 'gray',

    textAlign: 'center',
  },

});


export default WishlistScreen;
