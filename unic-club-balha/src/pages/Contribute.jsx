import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Card, Button, Input, Badge } from '../components/ui';
import { 
  ArrowLeft, 
  IndianRupee, 
  QrCode, 
  Upload, 
  CheckCircle,
  Copy,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { villageSettings, formatCurrency } from '../data/mockData';
import { festivalService, contributionService, imageService } from '../services';

function Contribute() {
  const { festivalId } = useParams();
  const { user, useBackend } = useAuth();
  const { t, language } = useLanguage();
  const [step, setStep] = useState(1);
  const [amount, setAmount] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofImage, setProofImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [festival, setFestival] = useState(null);
  const [fetchingFestival, setFetchingFestival] = useState(true);

  // Fetch festival data from backend
  useEffect(() => {
    const fetchFestival = async () => {
      try {
        if (useBackend) {
          const data = await festivalService.getById(festivalId);
          setFestival(data);
        } else {
          // Fallback to mock data
          const { festivals } = await import('../data/mockData');
          const mockFestival = festivals.find(f => f.id === festivalId);
          setFestival(mockFestival);
        }
      } catch (error) {
        console.error('Error fetching festival:', error);
        toast.error(t('common.errorLoadingFestival'));
      } finally {
        setFetchingFestival(false);
      }
    };
    fetchFestival();
  }, [festivalId, useBackend, t]);

  // Loading state
  if (fetchingFestival) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary-500" />
        <p className="text-earth-500 dark:text-earth-400 mt-4">{t('common.loading')}</p>
      </div>
    );
  }

  if (!festival) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-earth-500 dark:text-earth-400 text-lg">
          {t('common.festivalNotFound')}
        </p>
        <Link to="/festivals" className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block">
          {t('common.back')}
        </Link>
      </div>
    );
  }

  const quickAmounts = [101, 251, 501, 1001, 2001];
  const displayName = language === 'en' ? (user?.nameEn || user?.name) : user?.name;

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(villageSettings.upiId);
    toast.success(t('common.upiCopied'));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} ${t('common.fileTooLarge')}`);
        return;
      }
      setProofImage(file);
    }
  };

  const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(t('common.enterAmount'));
      return;
    }
    if (!proofImage) {
      toast.error(t('common.uploadPaymentProof'));
      return;
    }

    setLoading(true);
    try {
      if (useBackend) {
        // Step 1: Create contribution first (to get contribution ID)
        const contribution = await contributionService.create({
          festivalId: parseInt(festivalId),
          amount: parseFloat(amount),
          paymentMethod: 'UPI',
          transactionId: transactionId || null,
        });
        
        // Step 2: Upload payment proof image (stored securely in database)
        if (contribution?.id && proofImage) {
          try {
            await imageService.uploadPaymentProof(contribution.id, proofImage);
            toast.success(t('contributions.contributionRecorded'));
          } catch (uploadError) {
            console.log('Payment proof upload failed:', uploadError.message);
            // Contribution was created, just proof upload failed
            toast.success(t('contributions.contributionRecorded'));
            toast.error('Payment proof upload failed. You can upload it later.');
          }
        } else {
          toast.success(t('contributions.contributionRecorded'));
        }
        
        setStep(4);
      } else {
        // Mock implementation
        await new Promise(resolve => setTimeout(resolve, 1500));
        toast.success(t('contributions.contributionRecorded'));
        setStep(4);
      }
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast.error(error.message || t('common.errorSubmitting'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      {/* Back Button */}
      <Link 
        to={`/festivals/${festivalId}`}
        className="inline-flex items-center gap-2 text-earth-600 dark:text-earth-400 hover:text-earth-900 dark:hover:text-cream-100 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>{t('common.back')}</span>
      </Link>

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
              step >= s 
                ? 'bg-primary-500 text-white' 
                : 'bg-cream-200 dark:bg-earth-700 text-earth-500 dark:text-earth-400'
            }`}>
              {step > s ? <CheckCircle className="w-5 h-5" /> : s}
            </div>
            {s < 3 && (
              <div className={`w-16 md:w-24 h-1 mx-2 rounded ${
                step > s ? 'bg-primary-500' : 'bg-cream-200 dark:bg-earth-700'
              }`} />
            )}
          </div>
        ))}
      </div>

      {/* Step Labels */}
      <div className="flex justify-between text-sm text-earth-500 dark:text-earth-400 mb-8 px-2">
        <span>{t('steps.amount')}</span>
        <span>{t('steps.payment')}</span>
        <span>{t('steps.proof')}</span>
      </div>

      {/* Festival Info */}
      <Card className="mb-6">
        <div className="p-4 flex items-center gap-4">
          <img 
            src={festival.image} 
            alt={festival.name}
            className="w-16 h-16 rounded-xl object-cover"
          />
          <div>
            <h2 className="font-semibold text-earth-900 dark:text-cream-100">
              {language === 'en' ? festival.nameEn : festival.name}
            </h2>
            <p className="text-sm text-earth-500 dark:text-earth-400">{festival.year}</p>
          </div>
        </div>
      </Card>

      {/* Step 1: Amount */}
      {step === 1 && (
        <Card>
          <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700">
            <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
              {t('contributions.contributionAmount')}
            </h2>
          </div>
          <div className="p-4 md:p-6 space-y-6">
            {/* Quick Amount Buttons */}
            <div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-3">{t('contributions.quickSelect')}</p>
              <div className="flex flex-wrap gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setAmount(amt.toString())}
                    className={`px-4 py-2 rounded-xl font-medium transition-all ${
                      amount === amt.toString()
                        ? 'bg-primary-500 text-white shadow-warm'
                        : 'bg-cream-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-cream-200 dark:hover:bg-earth-600'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-3">{t('contributions.enterAmount')}</p>
              <div className="relative">
                <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-earth-400" />
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('common.enterAmountPlaceholder')}
                  className="input-field pl-12 text-2xl font-semibold"
                  min="1"
                />
              </div>
            </div>

            <Button 
              onClick={() => setStep(2)} 
              className="w-full"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              {t('common.proceed')}
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Payment */}
      {step === 2 && (
        <Card>
          <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700">
            <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
              {t('contributions.payViaUpi')}
            </h2>
          </div>
          <div className="p-4 md:p-6 space-y-6">
            {/* Amount Display */}
            <div className="text-center p-4 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-1">{t('contributions.paymentAmount')}</p>
              <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                {formatCurrency(parseFloat(amount))}
              </p>
            </div>

            {/* QR Code Placeholder */}
            <div className="text-center">
              <div className="w-48 h-48 mx-auto bg-cream-100 dark:bg-earth-700 rounded-2xl flex items-center justify-center border-2 border-dashed border-cream-300 dark:border-earth-600">
                <div className="text-center">
                  <QrCode className="w-16 h-16 mx-auto text-earth-400 mb-2" />
                  <p className="text-sm text-earth-500 dark:text-earth-400">QR Code</p>
                </div>
              </div>
            </div>

            {/* UPI ID */}
            <div className="p-4 bg-cream-50 dark:bg-earth-800 rounded-xl">
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-2">{t('contributions.upiId')}</p>
              <div className="flex items-center justify-between">
                <p className="font-mono font-medium text-earth-900 dark:text-cream-100">
                  {villageSettings.upiId}
                </p>
                <button
                  onClick={handleCopyUPI}
                  className="p-2 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                >
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                {villageSettings.upiName}
              </p>
            </div>

            {/* Instructions */}
            <div className="p-4 bg-saffron-50 dark:bg-saffron-900/20 rounded-xl border border-saffron-200 dark:border-saffron-800">
              <p className="text-sm text-saffron-700 dark:text-saffron-300">
                <span className="font-semibold">{t('common.instructions')}:</span>{' '}
                {t('common.paymentInstructions')}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
                {t('common.back')}
              </Button>
              <Button onClick={() => setStep(3)} className="flex-1">
                {t('contributions.paymentDone')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 3: Proof Upload */}
      {step === 3 && (
        <Card>
          <div className="p-4 md:p-5 border-b border-cream-100 dark:border-earth-700">
            <h2 className="text-xl font-display font-semibold text-earth-900 dark:text-cream-100">
              {t('contributions.uploadProof')}
            </h2>
          </div>
          <div className="p-4 md:p-6 space-y-6">
            {/* Upload Area */}
            <div>
              <p className="text-sm text-earth-500 dark:text-earth-400 mb-3">{t('contributions.uploadScreenshot')} *</p>
              <label className="block">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                  proofImage 
                    ? 'border-leaf-400 dark:border-leaf-600 bg-leaf-50 dark:bg-leaf-900/20' 
                    : 'border-cream-300 dark:border-earth-600 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20'
                }`}>
                  {proofImage ? (
                    <div>
                      <CheckCircle className="w-12 h-12 mx-auto text-leaf-500 mb-2" />
                      <p className="font-medium text-leaf-700 dark:text-leaf-300">{proofImage.name}</p>
                      <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                        {t('common.clickToChange')}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 mx-auto text-earth-400 mb-2" />
                      <p className="font-medium text-earth-700 dark:text-earth-300">
                        {t('common.clickToUpload')}
                      </p>
                      <p className="text-sm text-earth-500 dark:text-earth-400 mt-1">
                        PNG, JPG (max 5MB)
                      </p>
                    </div>
                  )}
                </div>
              </label>
            </div>

            {/* Transaction ID */}
            <Input
              label={`${t('contributions.transactionId')} (${t('common.optional')})`}
              placeholder="UPI123456789"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />

            {/* Summary */}
            <div className="p-4 bg-cream-50 dark:bg-earth-800 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-earth-500 dark:text-earth-400">{t('nav.festivals')}</span>
                <span className="font-medium text-earth-900 dark:text-cream-100">
                  {language === 'en' ? festival.nameEn : festival.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-500 dark:text-earth-400">{t('common.amount')}</span>
                <span className="font-semibold text-primary-600 dark:text-primary-400">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-500 dark:text-earth-400">{t('common.contributor')}</span>
                <span className="font-medium text-earth-900 dark:text-cream-100">{displayName}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" onClick={() => setStep(2)} className="flex-1">
                {t('common.back')}
              </Button>
              <Button 
                onClick={handleSubmit} 
                className="flex-1"
                loading={loading}
                disabled={!proofImage}
              >
                {t('common.submit')}
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Step 4: Success */}
      {step === 4 && (
        <Card>
          <div className="py-12 text-center p-4 md:p-6">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-leaf-100 dark:bg-leaf-900/40 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-leaf-500" />
            </div>
            <h2 className="text-2xl font-display font-bold text-earth-900 dark:text-cream-100 mb-2">
              {t('contributions.contributionSuccess')}
            </h2>
            <p className="text-earth-600 dark:text-earth-400 mb-6">
              {t('contributions.verificationPending')}
            </p>
            
            <div className="p-4 bg-cream-50 dark:bg-earth-800 rounded-xl mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-earth-500 dark:text-earth-400">{t('common.amount')}</span>
                <span className="font-bold text-leaf-600 dark:text-leaf-400">
                  {formatCurrency(parseFloat(amount))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-earth-500 dark:text-earth-400">{t('common.status')}</span>
                <Badge variant="pending">{t('contributions.pendingVerification')}</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Link to="/" className="flex-1">
                <Button variant="secondary" className="w-full">
                  {t('nav.home')}
                </Button>
              </Link>
              <Link to="/my-contributions" className="flex-1">
                <Button className="w-full">
                  {t('contributions.myContributions')}
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Contribute;
