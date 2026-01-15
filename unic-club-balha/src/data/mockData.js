// ===== IMAGE IMPORTS =====
import chhatPuja from '../assets/chhat_puja.png';
import sarswatiPuja from '../assets/sarswati_puja.png';
import ganpatiPuja from '../assets/ganpati_puja.png';
import dasahara from '../assets/dasahara.png';
import diwali1 from '../assets/Diwali1.png';
import diwali2 from '../assets/diwali2.png';
import diwali3 from '../assets/dipawli3.png';

// ===== FESTIVALS DATA =====
export const festivals = [
  {
    id: '1',
    name: 'छठ पूजा',
    nameEn: 'Chhath Puja',
    year: 2026,
    description: 'गांव के घाट पर छठ पूजा का भव्य आयोजन। सभी ग्रामवासियों का स्वागत है।',
    expectedBudget: 35000,
    totalCollection: 28500,
    totalExpense: 24000,
    status: 'ongoing',
    startDate: '2026-11-07',
    endDate: '2026-11-10',
    image: chhatPuja,
    contributorCount: 42,
  },
  {
    id: '2',
    name: 'दुर्गा पूजा',
    nameEn: 'Durga Puja',
    year: 2026,
    description: 'माँ दुर्गा की भव्य पूजा का आयोजन। पंडाल सजावट और भोग प्रसाद।',
    expectedBudget: 50000,
    totalCollection: 52000,
    totalExpense: 48500,
    status: 'completed',
    startDate: '2026-10-01',
    endDate: '2026-10-05',
    image: ganpatiPuja,
    contributorCount: 65,
  },
  {
    id: '3',
    name: 'होली मिलन',
    nameEn: 'Holi Celebration',
    year: 2026,
    description: 'रंगों का त्योहार होली मिलन समारोह। गुलाल और मिठाई वितरण।',
    expectedBudget: 25000,
    totalCollection: 0,
    totalExpense: 0,
    status: 'upcoming',
    startDate: '2026-03-14',
    endDate: '2026-03-15',
    image: dasahara,
    contributorCount: 0,
  },
  {
    id: '4',
    name: 'सरस्वती पूजा',
    nameEn: 'Saraswati Puja',
    year: 2026,
    description: 'विद्या की देवी माँ सरस्वती की पूजा। छात्रों के लिए विशेष कार्यक्रम।',
    expectedBudget: 20000,
    totalCollection: 22000,
    totalExpense: 19500,
    status: 'completed',
    startDate: '2026-02-02',
    endDate: '2026-02-02',
    image: sarswatiPuja,
    contributorCount: 38,
  },
  {
    id: '5',
    name: 'दीपावली',
    nameEn: 'Diwali',
    year: 2025,
    description: 'दीपावली का भव्य आयोजन। पटाखे, दीप और मिठाई।',
    expectedBudget: 40000,
    totalCollection: 45000,
    totalExpense: 42000,
    status: 'completed',
    startDate: '2025-10-20',
    endDate: '2025-10-22',
    image: diwali1,
    contributorCount: 58,
  },
];

// ===== CONTRIBUTIONS DATA =====
export const contributions = [
  {
    id: '1',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    festivalNameEn: 'Chhath Puja 2026',
    userId: '1',
    userName: 'राम कुमार',
    userNameEn: 'Ram Kumar',
    userPhone: '9876543210',
    amount: 1001,
    paymentMethod: 'UPI',
    transactionId: 'UPI123456789',
    proofImageUrl: 'https://via.placeholder.com/400x600',
    status: 'verified',
    verifiedBy: 'admin',
    verifiedAt: '2026-11-01T10:30:00',
    createdAt: '2026-11-01T09:15:00',
  },
  {
    id: '2',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    festivalNameEn: 'Chhath Puja 2026',
    userId: '2',
    userName: 'श्याम यादव',
    userNameEn: 'Shyam Yadav',
    userPhone: '9876543211',
    amount: 500,
    paymentMethod: 'UPI',
    transactionId: 'UPI987654321',
    proofImageUrl: 'https://via.placeholder.com/400x600',
    status: 'verified',
    verifiedBy: 'admin',
    verifiedAt: '2026-11-01T14:20:00',
    createdAt: '2026-11-01T12:00:00',
  },
  {
    id: '3',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    festivalNameEn: 'Chhath Puja 2026',
    userId: '3',
    userName: 'मोहन सिंह',
    userNameEn: 'Mohan Singh',
    userPhone: '9876543212',
    amount: 251,
    paymentMethod: 'UPI',
    transactionId: 'UPI456789123',
    proofImageUrl: 'https://via.placeholder.com/400x600',
    status: 'pending',
    verifiedBy: null,
    verifiedAt: null,
    createdAt: '2026-11-02T08:45:00',
  },
  {
    id: '4',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    festivalNameEn: 'Chhath Puja 2026',
    userId: '4',
    userName: 'सुनील कुमार',
    userNameEn: 'Sunil Kumar',
    userPhone: '9876543213',
    amount: 1500,
    paymentMethod: 'UPI',
    transactionId: 'UPI789123456',
    proofImageUrl: 'https://via.placeholder.com/400x600',
    status: 'pending',
    verifiedBy: null,
    verifiedAt: null,
    createdAt: '2026-11-02T16:30:00',
  },
];

// ===== EXPENSES DATA =====
export const expenses = [
  {
    id: '1',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    description: 'टेंट और पंडाल',
    category: 'Infrastructure',
    amount: 8000,
    paidTo: 'रामू टेंट हाउस',
    addedBy: 'राम कुमार',
    createdAt: '2026-11-05',
  },
  {
    id: '2',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    description: 'फूल और माला',
    category: 'Decoration',
    amount: 3000,
    paidTo: 'गांव फूलवाला',
    addedBy: 'राम कुमार',
    createdAt: '2026-11-06',
  },
  {
    id: '3',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    description: 'पूजा सामग्री',
    category: 'Puja Items',
    amount: 5000,
    paidTo: 'श्री किराना स्टोर',
    addedBy: 'श्याम यादव',
    createdAt: '2026-11-06',
  },
  {
    id: '4',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    description: 'प्रसाद और मिठाई',
    category: 'Food',
    amount: 4000,
    paidTo: 'रघुनाथ हलवाई',
    addedBy: 'राम कुमार',
    createdAt: '2026-11-07',
  },
  {
    id: '5',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    description: 'बिजली और लाइटिंग',
    category: 'Infrastructure',
    amount: 4000,
    paidTo: 'विजय इलेक्ट्रिकल',
    addedBy: 'श्याम यादव',
    createdAt: '2026-11-07',
  },
];

// ===== GALLERY DATA =====
export const galleryImages = [
  {
    id: '1',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    imageUrl: chhatPuja,
    caption: 'संध्या अर्घ्य का दृश्य',
    year: 2026,
  },
  {
    id: '2',
    festivalId: '1',
    festivalName: 'छठ पूजा 2026',
    imageUrl: diwali2,
    caption: 'दीप सजावट',
    year: 2026,
  },
  {
    id: '3',
    festivalId: '2',
    festivalName: 'दुर्गा पूजा 2026',
    imageUrl: ganpatiPuja,
    caption: 'माँ दुर्गा की प्रतिमा',
    year: 2026,
  },
  {
    id: '4',
    festivalId: '2',
    festivalName: 'दुर्गा पूजा 2026',
    imageUrl: dasahara,
    caption: 'पंडाल सजावट',
    year: 2026,
  },
  {
    id: '5',
    festivalId: '4',
    festivalName: 'सरस्वती पूजा 2026',
    imageUrl: sarswatiPuja,
    caption: 'पूजा स्थल',
    year: 2026,
  },
  {
    id: '6',
    festivalId: '5',
    festivalName: 'दीपावली 2025',
    imageUrl: diwali3,
    caption: 'दीपावली की रोशनी',
    year: 2025,
  },
];

// ===== NOTIFICATIONS DATA =====
export const notifications = [
  {
    id: '1',
    title: 'छठ पूजा योगदान अनुरोध',
    message: 'छठ पूजा 2026 के लिए योगदान शुरू हो गया है। कृपया अपना सहयोग दें।',
    type: 'festival',
    createdAt: '2026-11-01T08:00:00',
    isRead: false,
  },
  {
    id: '2',
    title: 'योगदान सत्यापित',
    message: 'आपका ₹1,001 का योगदान सफलतापूर्वक सत्यापित हो गया है। धन्यवाद!',
    type: 'contribution',
    createdAt: '2026-11-01T10:30:00',
    isRead: true,
  },
  {
    id: '3',
    title: '🎂 जन्मदिन की शुभकामनाएं!',
    message: 'श्याम यादव जी को जन्मदिन की हार्दिक शुभकामनाएं!',
    type: 'birthday',
    createdAt: '2026-11-02T08:00:00',
    isRead: false,
  },
];

// ===== VILLAGE SETTINGS =====
export const villageSettings = {
  name: 'UNIC CLUB BALHA',
  nameHindi: 'यूनिक क्लब बलहा',
  village: 'बलहा',
  district: 'समस्तीपुर',
  state: 'बिहार',
  upiId: 'unicclubbalha@upi',
  upiName: 'UNIC CLUB BALHA',
  qrCodeUrl: null,
  adminPhones: ['9876543210', '9876543211'],
  totalMembers: 85,
  establishedYear: 2020,
};

// ===== MEMBERS/USERS DATA =====
export const members = [
  { id: '1', name: 'राम कुमार', nameEn: 'Ram Kumar', phone: '9876543210', ward: 'वार्ड 1', wardEn: 'Ward 1', role: 'super_admin', dateOfBirth: '1985-05-15' },
  { id: '2', name: 'श्याम यादव', nameEn: 'Shyam Yadav', phone: '9876543211', ward: 'वार्ड 2', wardEn: 'Ward 2', role: 'admin', dateOfBirth: '1990-11-02' },
  { id: '3', name: 'मोहन सिंह', nameEn: 'Mohan Singh', phone: '9876543212', ward: 'वार्ड 1', wardEn: 'Ward 1', role: 'user', dateOfBirth: '1988-03-20' },
  { id: '4', name: 'सुनील कुमार', nameEn: 'Sunil Kumar', phone: '9876543213', ward: 'वार्ड 3', wardEn: 'Ward 3', role: 'user', dateOfBirth: '1992-07-08' },
  { id: '5', name: 'अनिल प्रसाद', nameEn: 'Anil Prasad', phone: '9876543214', ward: 'वार्ड 2', wardEn: 'Ward 2', role: 'user', dateOfBirth: '1987-01-25' },
  { id: '6', name: 'विजय यादव', nameEn: 'Vijay Yadav', phone: '9876543215', ward: 'वार्ड 1', wardEn: 'Ward 1', role: 'user', dateOfBirth: '1995-09-12' },
  { id: '7', name: 'राजेश कुमार', nameEn: 'Rajesh Kumar', phone: '9876543216', ward: 'वार्ड 3', wardEn: 'Ward 3', role: 'user', dateOfBirth: '1983-12-05' },
  { id: '8', name: 'संजय सिंह', nameEn: 'Sanjay Singh', phone: '9876543217', ward: 'वार्ड 2', wardEn: 'Ward 2', role: 'user', dateOfBirth: '1991-04-18' },
];

// Alias for backward compatibility
export const users = members;

// ===== HELPER FUNCTIONS =====
export const getStatusColor = (status) => {
  switch (status) {
    case 'upcoming':
      return 'badge-saffron';
    case 'ongoing':
      return 'badge-primary';
    case 'completed':
      return 'badge-leaf';
    default:
      return 'badge-primary';
  }
};

export const getStatusText = (status) => {
  switch (status) {
    case 'upcoming':
      return 'आगामी';
    case 'ongoing':
      return 'चालू';
    case 'completed':
      return 'संपन्न';
    default:
      return status;
  }
};

export const getPaymentStatusColor = (status) => {
  switch (status) {
    case 'pending':
      return 'badge-pending';
    case 'verified':
      return 'badge-verified';
    case 'rejected':
      return 'badge-rejected';
    default:
      return 'badge-primary';
  }
};

export const getPaymentStatusText = (status) => {
  switch (status) {
    case 'pending':
      return 'सत्यापन लंबित';
    case 'verified':
      return 'सत्यापित';
    case 'rejected':
      return 'अस्वीकृत';
    default:
      return status;
  }
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('hi-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleString('hi-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

