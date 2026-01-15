import { createContext, useContext, useState, useEffect } from 'react';
import { authService, userService } from '../services';
import { 
  sendOTP as firebaseSendOTP, 
  verifyOTP as firebaseVerifyOTP,
  signOut as firebaseSignOut,
  initRecaptcha
} from '../services/firebaseAuth';

// Configuration: Set to true to use Firebase Phone Auth (free OTP)
// Set to false to use backend OTP (requires SMS service)
const USE_FIREBASE_AUTH = import.meta.env.VITE_USE_FIREBASE_AUTH === 'true';

const AuthContext = createContext(null);

// Mock users for demo (when backend is not running)
const MOCK_USERS = {
  '9876543210': {
    id: '1',
    phone: '9876543210',
    name: 'राम कुमार',
    nameEn: 'Ram Kumar',
    role: 'super_admin',
    ward: 'वार्ड 1',
    wardEn: 'Ward 1',
    dateOfBirth: '1985-05-15',
    avatar: null,
    isNewUser: false,
  },
  '9876543211': {
    id: '2',
    phone: '9876543211',
    name: 'श्याम यादव',
    nameEn: 'Shyam Yadav',
    role: 'admin',
    ward: 'वार्ड 2',
    wardEn: 'Ward 2',
    dateOfBirth: '1990-11-02',
    avatar: null,
    isNewUser: false,
  },
  '9876543212': {
    id: '3',
    phone: '9876543212',
    name: 'मोहन सिंह',
    nameEn: 'Mohan Singh',
    role: 'user',
    ward: 'वार्ड 1',
    wardEn: 'Ward 1',
    dateOfBirth: '1988-03-20',
    avatar: null,
    isNewUser: false,
  },
};

// Check if backend is available
const checkBackendAvailable = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080/api'}/festivals`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.ok;
  } catch {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [useBackend, setUseBackend] = useState(true);

  // Check authentication on mount
  useEffect(() => {
    const initAuth = async () => {
      // Check if backend is available
      const backendAvailable = await checkBackendAvailable();
      setUseBackend(backendAvailable);
      
      if (!backendAvailable) {
        console.log('Backend not available, using mock data');
      }

      // Check for stored user
      const storedUser = localStorage.getItem('unicclub_user');
      if (storedUser) {
        try {
          const parsed = JSON.parse(storedUser);
          
          // If backend is available, refresh user data
          if (backendAvailable && authService.isLoggedIn()) {
            const refreshedUser = await authService.refreshUser();
            if (refreshedUser) {
              setUser(refreshedUser);
            } else {
              setUser(parsed);
            }
          } else {
            setUser(parsed);
          }
        } catch (e) {
          localStorage.removeItem('unicclub_user');
          localStorage.removeItem('unicclub_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Send OTP
  const sendOTP = async (phone) => {
    setPhoneNumber(phone);
    
    // Use Firebase Phone Auth if configured
    if (USE_FIREBASE_AUTH) {
      try {
        // Initialize reCAPTCHA before sending OTP
        initRecaptcha('send-otp-button');
        const result = await firebaseSendOTP(phone);
        if (result.success) {
          setOtpSent(true);
        }
        return result;
      } catch (error) {
        console.error('Firebase OTP error:', error);
        return { success: false, message: error.message || 'Failed to send OTP' };
      }
    }
    
    if (useBackend) {
      const result = await authService.sendOtp(phone);
      if (result.success) {
        setOtpSent(true);
      }
      return result;
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      return { success: true, message: 'OTP भेज दिया गया है (Demo: 123456)' };
    }
  };

  // Verify OTP
  const verifyOTP = async (otp) => {
    // Use Firebase Phone Auth if configured
    if (USE_FIREBASE_AUTH) {
      try {
        const result = await firebaseVerifyOTP(otp);
        if (result.success) {
          // Map Firebase user to app user format
          const appUser = {
            id: result.user?.id || result.user?.firebaseUid || Date.now().toString(),
            phone: phoneNumber,
            name: result.user?.name || '',
            nameEn: result.user?.nameEn || '',
            role: result.user?.role || 'user',
            ward: result.user?.ward || '',
            wardEn: result.user?.wardEn || '',
            dateOfBirth: result.user?.dateOfBirth || '',
            avatar: result.user?.avatar || null,
            isNewUser: result.isNewUser,
            firebaseUid: result.user?.firebaseUid,
          };
          
          setUser(appUser);
          localStorage.setItem('unicclub_user', JSON.stringify(appUser));
          setOtpSent(false);
          return { success: true, user: appUser, isNewUser: result.isNewUser };
        }
        return result;
      } catch (error) {
        console.error('Firebase verify error:', error);
        return { success: false, message: error.message || 'Invalid OTP' };
      }
    }
    
    if (useBackend) {
      const result = await authService.verifyOtp(phoneNumber, otp);
      if (result.success) {
        setUser(result.user);
        setOtpSent(false);
      }
      return result;
    } else {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (otp === '123456') {
        const mockUser = MOCK_USERS[phoneNumber] || {
          id: Date.now().toString(),
          phone: phoneNumber,
          name: '',
          nameEn: '',
          role: 'user',
          ward: '',
          wardEn: '',
          dateOfBirth: '',
          avatar: null,
          isNewUser: true,
        };

        setUser(mockUser);
        localStorage.setItem('unicclub_user', JSON.stringify(mockUser));
        setOtpSent(false);
        return { success: true, user: mockUser, isNewUser: mockUser.isNewUser };
      }

      return { success: false, message: 'गलत OTP' };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    if (useBackend) {
      try {
        const updatedUser = await userService.updateProfile(profileData);
        setUser(updatedUser);
        return updatedUser;
      } catch (error) {
        throw error;
      }
    } else {
      // Mock implementation
      const updatedUser = { ...user, ...profileData, isNewUser: false };
      setUser(updatedUser);
      localStorage.setItem('unicclub_user', JSON.stringify(updatedUser));
      return updatedUser;
    }
  };

  // Logout
  const logout = async () => {
    // Sign out from Firebase if using Firebase auth
    if (USE_FIREBASE_AUTH) {
      try {
        await firebaseSignOut();
      } catch (error) {
        console.error('Firebase sign out error:', error);
      }
    }
    
    authService.logout();
    setUser(null);
    setOtpSent(false);
    setPhoneNumber('');
  };

  // Check if user is admin
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin' || 
                  user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  
  // Check if user is super admin
  const isSuperAdmin = user?.role === 'super_admin' || user?.role === 'SUPER_ADMIN';

  const value = {
    user,
    loading,
    otpSent,
    phoneNumber,
    isAdmin,
    isSuperAdmin,
    useBackend,
    useFirebaseAuth: USE_FIREBASE_AUTH,
    sendOTP,
    verifyOTP,
    updateProfile,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
