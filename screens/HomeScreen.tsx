import React, {useState} from 'react';

import {
  View,
  Text,
  TextInput,
  FlatList,
  StyleSheet,
} from 'react-native';

import ProductCard from '../components/ProductCard';


const products = [

  {
    id: '1',
    name: 'Wireless Headphones',
    price: 50,
    image:
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
  },

  {
    id: '2',
    name: 'Mechanical Keyboard',
    price: 80,
    image:
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3',
  },

  {
    id: '3',
    name: 'Gaming Mouse',
    price: 35,
    image:
      'https://images.unsplash.com/photo-1527814050087-3793815479db',
  },

  {
    id: '4',
    name: 'USB-C Charger',
    price: 25,
    image:
      'https://www.4xem.com/cdn/shop/files/4X25WCHARGEKIT_main_42346726-05ee-4943-a08d-1874c698609c_535x.jpg?v=1695146056',
  },

  {
    id: '5',
    name: 'Gaming Monitor',
    price: 250,
    image:
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf',
  },

  {
    id: '6',
    name: 'Webcam',
    price: 70,
    image:
      'https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04',
  },

];


function HomeScreen({
  navigation,
  wishlist,
  toggleWishlist,
}: any) {

  const [
    search,
    setSearch,
  ] = useState('');


  // =================================
  // SEARCH
  // =================================

  const filteredProducts =
    products.filter(product =>
      product.name
        .toLowerCase()
        .includes(
          search.toLowerCase(),
        ),
    );


  // =================================
  // CHECK WISHLIST
  // =================================

  const isProductWishlisted = (
    productId: string,
  ) => {

    return wishlist.some(
      (item: any) =>
        item.id === productId,
    );

  };


  return (

    <View
      style={styles.container}
    >

      {/* TITLE */}

      <Text
        style={styles.title}
      >
        My Products
      </Text>


      {/* SEARCH */}

      <TextInput
        style={styles.search}

        placeholder="Search products..."

        value={search}

        onChangeText={
          setSearch
        }

        autoCapitalize="none"

        autoCorrect={false}
      />


      {/* PRODUCTS */}

      <FlatList

        data={
          filteredProducts
        }

        keyExtractor={
          item => item.id
        }

        renderItem={({
          item,
        }) => (

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

            isWishlisted={
              isProductWishlisted(
                item.id,
              )
            }

            onWishlistPress={() =>
              toggleWishlist(
                item,
              )
            }

          />

        )}

        showsVerticalScrollIndicator={
          false
        }

        ListEmptyComponent={

          <Text
            style={styles.empty}
          >
            No products found
          </Text>

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

    padding: 15,
  },


  title: {
    fontSize: 28,

    fontWeight: 'bold',

    marginBottom: 15,
  },


  search: {
    height: 50,

    backgroundColor:
      '#ffffff',

    borderWidth: 1,

    borderColor:
      '#dddddd',

    borderRadius: 10,

    paddingHorizontal: 15,

    fontSize: 16,

    marginBottom: 15,
  },


  empty: {
    textAlign: 'center',

    fontSize: 18,

    color: 'gray',

    marginTop: 40,
  },

});


export default HomeScreen;
