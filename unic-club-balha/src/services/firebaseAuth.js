// Firebase Phone Authentication Service
// Uses Firebase's built-in OTP authentication

import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { auth } from '../config/firebase';
import { getUserByPhone, createUser, updateUser } from './firebaseService';

let recaptchaVerifier = null;
let confirmationResult = null;

// Initialize reCAPTCHA verifier (invisible)
export const initRecaptcha = (buttonId) => {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
    size: 'invisible',
    callback: () => {
      console.log('reCAPTCHA solved');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
  
  return recaptchaVerifier;
};

// Send OTP to phone number
export const sendOTP = async (phoneNumber) => {
  try {
    // Format phone number with country code
    const formattedPhone = phoneNumber.startsWith('+') 
      ? phoneNumber 
      : `+91${phoneNumber}`;
    
    // Initialize recaptcha if not already done
    if (!recaptchaVerifier) {
      initRecaptcha('send-otp-button');
    }
    
    confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    
    return { success: true, message: 'OTP sent successfully' };
  } catch (error) {
    console.error('Error sending OTP:', error);
    
    // Reset recaptcha on error
    if (recaptchaVerifier) {
      recaptchaVerifier.clear();
      recaptchaVerifier = null;
    }
    
    return { success: false, message: error.message };
  }
};

// Verify OTP and sign in
export const verifyOTP = async (otp) => {
  try {
    if (!confirmationResult) {
      return { success: false, message: 'Please request OTP first' };
    }
    
    const result = await confirmationResult.confirm(otp);
    const firebaseUser = result.user;
    
    // Get phone number without country code
    const phone = firebaseUser.phoneNumber.replace('+91', '');
    
    // Check if user exists in Firestore
    let user = await getUserByPhone(phone);
    let isNewUser = false;
    
    if (!user) {
      // Create new user in Firestore
      user = await createUser({
        phone,
        firebaseUid: firebaseUser.uid,
        name: '',
        nameEn: '',
        ward: '',
        wardEn: '',
        dateOfBirth: null,
        role: 'user'
      });
      isNewUser = true;
    } else if (!user.name) {
      isNewUser = true;
    }
    
    return { 
      success: true, 
      user,
      isNewUser,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return { success: false, message: 'Invalid OTP' };
  }
};

// Sign out
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Error signing out:', error);
    return { success: false, message: error.message };
  }
};

// Get current Firebase user
export const getCurrentUser = () => {
  return auth.currentUser;
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return auth.onAuthStateChanged(async (firebaseUser) => {
    if (firebaseUser) {
      const phone = firebaseUser.phoneNumber?.replace('+91', '');
      if (phone) {
        const user = await getUserByPhone(phone);
        callback(user);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
};


