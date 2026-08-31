import React, {useEffect, useState} from 'react';

import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';


// ========================================
// STORAGE KEYS
// ========================================

const USER_NAME_KEY = '@user_name';
const USER_EMAIL_KEY = '@user_email';
const LOGIN_STATUS_KEY = '@login_status';


// ========================================
// PROFILE SCREEN
// ========================================

function ProfileScreen({navigation}: any) {

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);


  // ========================================
  // LOAD USER INFORMATION
  // ========================================

  useEffect(() => {

    const loadUserData = async () => {

      try {

        const savedName =
          await AsyncStorage.getItem(
            USER_NAME_KEY,
          );

        const savedEmail =
          await AsyncStorage.getItem(
            USER_EMAIL_KEY,
          );

        const loginStatus =
          await AsyncStorage.getItem(
            LOGIN_STATUS_KEY,
          );


        if (savedName) {
          setName(savedName);
        }

        if (savedEmail) {
          setEmail(savedEmail);
        }

        if (loginStatus === 'true') {
          setLoggedIn(true);
        }

      } catch (error) {

        console.log(
          'Error loading user data:',
          error,
        );

      }

    };


    loadUserData();

  }, []);


  // ========================================
  // LOGOUT
  // ========================================

  const handleLogout = () => {

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',

      [

        {
          text: 'Cancel',
          style: 'cancel',
        },

        {
          text: 'Logout',
          style: 'destructive',

          onPress: async () => {

            try {

              await AsyncStorage.removeItem(
                USER_NAME_KEY,
              );

              await AsyncStorage.removeItem(
                USER_EMAIL_KEY,
              );

              await AsyncStorage.removeItem(
                LOGIN_STATUS_KEY,
              );


              navigation
                .getParent()
                ?.replace('Login');

            } catch (error) {

              console.log(
                'Error logging out:',
                error,
              );

            }

          },

        },

      ],

    );

  };


  // ========================================
  // SCREEN
  // ========================================

  return (

    <ScrollView
      contentContainerStyle={
        styles.container
      }
    >

      {/* ==================================
          PROFILE ICON
      ================================== */}

      <View style={styles.profileIcon}>

        <Text style={styles.profileIconText}>
          👤
        </Text>

      </View>


      {/* ==================================
          TITLE
      ================================== */}

      <Text style={styles.title}>
        My Profile
      </Text>


      {/* ==================================
          NAME
      ================================== */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Name
        </Text>

        <Text style={styles.value}>
          {name || 'Name not available'}
        </Text>

      </View>


      {/* ==================================
          EMAIL
      ================================== */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Email
        </Text>

        <Text style={styles.value}>
          {email || 'Email not available'}
        </Text>

      </View>


      {/* ==================================
          ACCOUNT STATUS
      ================================== */}

      <View style={styles.card}>

        <Text style={styles.label}>
          Account Status
        </Text>

        <Text
          style={[
            styles.value,
            styles.status,
          ]}
        >
          {loggedIn
            ? '● Logged In'
            : '● Not Logged In'}
        </Text>

      </View>


      {/* ==================================
          LOGOUT BUTTON
      ================================== */}

      <Pressable
        style={({pressed}) => [
          styles.logoutButton,

          pressed && styles.pressed,
        ]}

        onPress={handleLogout}
      >

        <Text style={styles.logoutText}>
          Logout
        </Text>

      </Pressable>

    </ScrollView>

  );

}


// ========================================
// STYLES
// ========================================

const styles = StyleSheet.create({

  container: {

    flexGrow: 1,

    backgroundColor: '#f5f5f5',

    padding: 20,

    alignItems: 'stretch',

  },


  // PROFILE ICON

  profileIcon: {

    width: 110,

    height: 110,

    borderRadius: 55,

    backgroundColor: '#14ed04',

    justifyContent: 'center',

    alignItems: 'center',

    alignSelf: 'center',

    marginTop: 30,

    marginBottom: 15,

  },


  profileIconText: {

    fontSize: 55,

  },


  // TITLE

  title: {

    fontSize: 28,

    fontWeight: 'bold',

    textAlign: 'center',

    color: '#222',

    marginBottom: 30,

  },


  // INFORMATION CARD

  card: {

    backgroundColor: '#ffffff',

    borderRadius: 12,

    padding: 18,

    marginBottom: 15,

    elevation: 3,

    shadowColor: '#000',

    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.1,

    shadowRadius: 4,

  },


  // LABEL

  label: {

    fontSize: 14,

    color: '#777',

    marginBottom: 7,

  },


  // VALUE

  value: {

    fontSize: 18,

    fontWeight: '600',

    color: '#222',

  },


  // STATUS

  status: {

    color: '#14a000',

  },


  // LOGOUT

  logoutButton: {

    height: 52,

    backgroundColor: '#d3170d',

    borderRadius: 10,

    justifyContent: 'center',

    alignItems: 'center',

    marginTop: 10,

    marginBottom: 30,

  },


  logoutText: {

    color: '#ffffff',

    fontSize: 18,

    fontWeight: 'bold',

  },


  pressed: {

    opacity: 0.7,

  },

});


export default ProfileScreen;