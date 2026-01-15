import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Button, Input, Card } from '../components/ui';
import { Phone, Key, ArrowRight, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

function Login() {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [loading, setLoading] = useState(false);
  
  const { sendOTP, verifyOTP } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (phone.length !== 10) {
      toast.error(t('login.invalidMobile'));
      return;
    }
    
    setLoading(true);
    const result = await sendOTP(phone);
    setLoading(false);
    
    if (result.success) {
      toast.success(t('login.otpSent'));
      setStep('otp');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error(t('login.invalidOtp'));
      return;
    }
    
    setLoading(true);
    const result = await verifyOTP(otp);
    setLoading(false);
    
    if (result.success) {
      toast.success(t('login.loginSuccess'));
      if (result.user.isNewUser) {
        navigate('/profile-setup');
      } else {
        navigate('/');
      }
    } else {
      toast.error(t('login.wrongOtp'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-100 via-primary-50 to-saffron-50 dark:from-earth-900 dark:via-earth-800 dark:to-earth-900 flex items-center justify-center p-4">
      {/* Language Toggle */}
      <button
        onClick={() => setLanguage(language === 'hi' ? 'en' : 'hi')}
        className="absolute top-4 right-4 flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-earth-800/80 backdrop-blur-sm border border-cream-200 dark:border-earth-700 text-earth-700 dark:text-earth-300 hover:shadow-md transition-all"
      >
        <Globe className="w-4 h-4" />
        <span className="text-sm font-medium">{language === 'hi' ? 'EN' : 'हिन्दी'}</span>
      </button>

      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary-500 to-saffron-500 shadow-warm flex items-center justify-center">
            <span className="text-4xl">🏘️</span>
          </div>
          <h1 className="text-3xl font-display font-bold text-earth-800 dark:text-cream-100 mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-earth-800 dark:text-earth-400">
            {t('login.title')}
          </p>
        </div>

        <Card>
          <div className="p-5 md:p-6">
            {step === 'phone' ? (
              <form onSubmit={handleSendOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-earth-900 dark:text-cream-100 mb-1">
                    {t('login.subtitle')}
                  </h2>
                  <p className="text-sm text-earth-500 dark:text-earth-400">
                    {t('common.weWillSendOtp')}
                  </p>
                </div>

                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1 text-earth-500 dark:text-earth-400">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm font-medium">+91</span>
                  </div>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder={t('login.enterMobile')}
                    className="input-field pl-20 text-lg tracking-wider"
                    maxLength={10}
                  />
                </div>

                <Button 
                  type="submit" 
                  loading={loading} 
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('login.sendOtp')}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOTP} className="space-y-5">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-semibold text-earth-900 dark:text-cream-100 mb-1">
                    {t('login.verifyOtp')}
                  </h2>
                  <p className="text-sm text-earth-500 dark:text-earth-400">
                    +91 {phone}
                  </p>
                </div>

                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
                  <input
                    type="tel"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder={t('login.enterOtp')}
                    className="input-field pl-10 text-2xl tracking-[0.5em] text-center font-mono"
                    maxLength={6}
                    autoFocus
                  />
                </div>

                <p className="text-sm text-center text-earth-500 dark:text-earth-400">
                  Demo OTP: <span className="font-mono font-semibold">123456</span>
                </p>

                <Button 
                  type="submit" 
                  loading={loading} 
                  className="w-full"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  {t('login.verifyOtp')}
                </Button>

                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="w-full text-sm text-primary-600 dark:text-primary-400 hover:underline"
                >
                  {t('common.changeNumber')}
                </button>
              </form>
            )}
          </div>
        </Card>

        <p className="mt-6 text-center text-sm text-earth-500 dark:text-earth-400">
          © 2025 {t('common.appName')}
        </p>
      </div>
    </div>
  );
}

export default Login;
