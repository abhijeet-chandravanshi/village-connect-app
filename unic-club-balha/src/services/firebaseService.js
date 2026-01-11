// Firebase Database Service for UNIC Club Balha
// This replaces the mock data with real Firebase Firestore

import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../config/firebase';

// ==================== USERS ====================

export const usersCollection = collection(db, 'users');

export const getUserByPhone = async (phone) => {
  const q = query(usersCollection, where('phone', '==', phone));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
};

export const createUser = async (userData) => {
  const docRef = await addDoc(usersCollection, {
    ...userData,
    role: 'user',
    active: true,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: docRef.id, ...userData };
};

export const updateUser = async (userId, userData) => {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    ...userData,
    updatedAt: serverTimestamp()
  });
  return { id: userId, ...userData };
};

export const getAllUsers = async () => {
  const q = query(usersCollection, where('active', '==', true), orderBy('name'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// ==================== FESTIVALS ====================

export const festivalsCollection = collection(db, 'festivals');

export const getAllFestivals = async () => {
  const q = query(festivalsCollection, orderBy('year', 'desc'), orderBy('startDate', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getActiveFestivals = async () => {
  const q = query(
    festivalsCollection, 
    where('status', 'in', ['upcoming', 'ongoing']),
    orderBy('startDate', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFestivalById = async (festivalId) => {
  const docRef = doc(db, 'festivals', festivalId);
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() };
};

export const createFestival = async (festivalData) => {
  const docRef = await addDoc(festivalsCollection, {
    ...festivalData,
    totalCollection: 0,
    totalExpense: 0,
    contributorCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: docRef.id, ...festivalData };
};

export const updateFestival = async (festivalId, festivalData) => {
  const festivalRef = doc(db, 'festivals', festivalId);
  await updateDoc(festivalRef, {
    ...festivalData,
    updatedAt: serverTimestamp()
  });
  return { id: festivalId, ...festivalData };
};

export const deleteFestival = async (festivalId) => {
  await deleteDoc(doc(db, 'festivals', festivalId));
};

// ==================== CONTRIBUTIONS ====================

export const contributionsCollection = collection(db, 'contributions');

export const createContribution = async (contributionData) => {
  const docRef = await addDoc(contributionsCollection, {
    ...contributionData,
    status: 'pending',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
  return { id: docRef.id, ...contributionData, status: 'pending' };
};

export const getUserContributions = async (userId) => {
  const q = query(
    contributionsCollection, 
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getFestivalContributions = async (festivalId) => {
  const q = query(
    contributionsCollection, 
    where('festivalId', '==', festivalId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getPendingContributions = async () => {
  const q = query(
    contributionsCollection, 
    where('status', '==', 'pending'),
    orderBy('createdAt', 'asc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const getRecentContributions = async (limitCount = 10) => {
  const q = query(
    contributionsCollection, 
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const verifyContribution = async (contributionId, verifiedBy) => {
  const contribRef = doc(db, 'contributions', contributionId);
  await updateDoc(contribRef, {
    status: 'verified',
    verifiedBy,
    verifiedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

export const rejectContribution = async (contributionId, verifiedBy, reason) => {
  const contribRef = doc(db, 'contributions', contributionId);
  await updateDoc(contribRef, {
    status: 'rejected',
    verifiedBy,
    rejectionReason: reason,
    verifiedAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

// ==================== EXPENSES ====================

export const expensesCollection = collection(db, 'expenses');

export const getFestivalExpenses = async (festivalId) => {
  const q = query(
    expensesCollection, 
    where('festivalId', '==', festivalId),
    orderBy('expenseDate', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createExpense = async (expenseData) => {
  const docRef = await addDoc(expensesCollection, {
    ...expenseData,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...expenseData };
};

// ==================== GALLERY ====================

export const galleryCollection = collection(db, 'gallery');

export const getGalleryImages = async (festivalId = null, year = null) => {
  let q = query(galleryCollection, orderBy('createdAt', 'desc'));
  
  if (festivalId) {
    q = query(galleryCollection, where('festivalId', '==', festivalId), orderBy('createdAt', 'desc'));
  } else if (year) {
    q = query(galleryCollection, where('year', '==', year), orderBy('createdAt', 'desc'));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const uploadImage = async (file, festivalId, caption, uploadedBy) => {
  // Upload to Firebase Storage
  const fileName = `gallery/${festivalId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  const imageUrl = await getDownloadURL(storageRef);
  
  // Save to Firestore
  const docRef = await addDoc(galleryCollection, {
    festivalId,
    imageUrl,
    caption,
    uploadedBy,
    year: new Date().getFullYear(),
    createdAt: serverTimestamp()
  });
  
  return { id: docRef.id, imageUrl, caption };
};

// ==================== NOTIFICATIONS ====================

export const notificationsCollection = collection(db, 'notifications');

export const getNotifications = async (userId = null) => {
  let q;
  if (userId) {
    // Get notifications for specific user or all users (targetUserId is null)
    q = query(
      notificationsCollection,
      orderBy('createdAt', 'desc'),
      limit(50)
    );
  } else {
    q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(50));
  }
  
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const createNotification = async (notificationData) => {
  const docRef = await addDoc(notificationsCollection, {
    ...notificationData,
    createdAt: serverTimestamp()
  });
  return { id: docRef.id, ...notificationData };
};

// ==================== REAL-TIME LISTENERS ====================

export const subscribeToContributions = (festivalId, callback) => {
  const q = query(
    contributionsCollection,
    where('festivalId', '==', festivalId),
    orderBy('createdAt', 'desc')
  );
  
  return onSnapshot(q, (snapshot) => {
    const contributions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(contributions);
  });
};

export const subscribeToNotifications = (callback) => {
  const q = query(notificationsCollection, orderBy('createdAt', 'desc'), limit(20));
  
  return onSnapshot(q, (snapshot) => {
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(notifications);
  });
};

// ==================== UPLOAD PAYMENT PROOF ====================

export const uploadPaymentProof = async (file, contributionId) => {
  const fileName = `proofs/${contributionId}/${Date.now()}_${file.name}`;
  const storageRef = ref(storage, fileName);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};


