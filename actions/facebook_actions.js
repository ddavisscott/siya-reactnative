// import { AsyncStorage } from 'react-native';
import { Facebook } from 'expo';
import firebase from 'firebase';
import { fbappid } from './../consts';
// import { emailChanged, passwordChanged, signupUser } from '../actions';

import {
  FACEBOOK_LOGIN_SUCCESS,
  FACEBOOK_LOGIN_FAIL,
  LOGIN_STATUS_CHANGED,
  ERROR_CLEAR
} from './types';


export const facebookSignin = () => {

    return async (dispatch) => {
      console.log('facebook_Actions.js:line17:fbappid');
      console.log(fbappid);
      let { type, token } = await Facebook.logInWithReadPermissionsAsync(fbappid, {
        permissions: ['public_profile', 'email']
      });

      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });

      console.log('---credential---');
      console.log(credential);
      if (type === 'cancel') {
        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'loginfailed'
        });
        return (dispatch({ type: FACEBOOK_LOGIN_FAIL }));
      }

      var credential = firebase.auth.FacebookAuthProvider.credential(token);

      console.log('---token---');
      console.log(token);

      try {

        let user = await firebase.auth().signInWithCredential(credential);
        // write user properties to firebase
        firebase.database().ref(`/users/${user.uid}/userDetails`).update({
          fbEmail: user.email,
          fbDisplayName: user.displayName,
          fbPhotoURL: user.photoURL
        });

        let emailcheck = await firebase.database().ref(`/users/${user.uid}/userDetails/email`).once('value');
        var emailcheckflag = emailcheck.val();
      } catch (error) {
        console.log('fb_actions.js:line57:error');
        console.log(error);
        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'notloggedin'
        });
      }
      // await AsyncStorage.setItem('fb_token', token);
      if (emailcheckflag) {
        dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
      } else {
        // case where the user has signed in without signing up.
        await firebase.auth().signOut();
        dispatch({ type: ERROR_CLEAR, payload: 'Please Register first ...'});
      }

  };

};

export const facebookSignup = ({ email, phone, firstname, lastname  }) => {

    return async (dispatch) => {
      console.log(fbappid);
      let { type, token } = await Facebook.logInWithReadPermissionsAsync(fbappid, {
        permissions: ['public_profile', 'email']
      });

      dispatch({
        type: LOGIN_STATUS_CHANGED,
        payload: 'checking'
      });

      console.log(credential);
      if (type === 'cancel') {
        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'loginfailed'
        });
        return (dispatch({ type: FACEBOOK_LOGIN_FAIL }));
      }

      var credential = firebase.auth.FacebookAuthProvider.credential(token);
      console.log(token);

      try {
        let user = await firebase.auth().signInWithCredential(credential);
        console.log(user);
        console.log(user.email);
        var displayName = firstname + ' ' + lastname;
        console.log(email);
        console.log(displayName);
        // write user properties to firebase
        firebase.database().ref(`/users/${user.uid}/userDetails`).set({
          email: email,
          phone: phone,
          firstname: firstname,
          lastname: lastname,
          displayName: displayName,
          fbEmail: user.email,
          fbDisplayName: user.displayName,
          fbPhotoURL: user.photoURL
        });

      } catch (error) {
        console.log(error);
        dispatch({
          type: LOGIN_STATUS_CHANGED,
          payload: 'notloggedin'
        });
      }
      // await AsyncStorage.setItem('fb_token', token);
      dispatch({ type: FACEBOOK_LOGIN_SUCCESS, payload: token });
  };

};
