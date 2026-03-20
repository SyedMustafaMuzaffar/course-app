"use client";

import { useEffect, useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import api from '@/lib/axios';
import { Subject } from '@/types';

// ─── Payment Modal ────────────────────────────────────────────────────────────
function PaymentModal({
  subject,
  onClose,
  onSuccess,
}: {
  subject: Subject;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [method, setMethod] = useState<'upi' | 'card' | 'netbanking' | 'wallet'>('upi');
  const [processing, setProcessing] = useState(false);
  const [upiId, setUpiId] = useState('');
  const [cardNo, setCardNo] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [bank, setBank] = useState('sbi');
  const [wallet, setWallet] = useState('paytm');
  const [step, setStep] = useState<'pay' | 'success'>('pay');

  const handlePay = async () => {
    setProcessing(true);
    // Simulate payment processing
    await new Promise((r) => setTimeout(r, 1800));
    try {
      await api.post('/enrollments/enroll', { subject_id: subject.id });
    } catch {}
    setProcessing(false);
    setStep('success');
  };

  const methodTab = (id: typeof method, label: string, icon: string) => (
    <button
      onClick={() => setMethod(id)}
      className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 rounded-xl text-xs font-semibold border-2 transition-all ${
        method === id
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-slate-200 bg-white text-slate-500 hover:border-indigo-300'
      }`}
    >
      <span className="text-xl">{icon}</span>
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
        {step === 'success' ? (
          <div className="p-10 flex flex-col items-center text-center gap-4">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center text-4xl">✅</div>
            <h2 className="text-2xl font-bold text-slate-900">Payment Successful!</h2>
            <p className="text-slate-500">You are now enrolled in <strong>{subject.title}</strong></p>
            <p className="text-slate-400 text-sm">Amount paid: <span className="font-semibold text-slate-700">₹{Number(subject.price).toLocaleString('en-IN')}</span></p>
            <button
              onClick={onSuccess}
              className="mt-2 w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold transition-colors"
            >
              Start Learning →
            </button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-5 flex items-start justify-between">
              <div>
                <p className="text-indigo-200 text-xs font-medium uppercase tracking-wider">Secure Checkout</p>
                <h2 className="text-white font-bold text-lg mt-0.5 leading-snug">{subject.title}</h2>
              </div>
              <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none ml-4">×</button>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount */}
              <div className="bg-slate-50 rounded-xl p-4 flex items-center justify-between">
                <span className="text-slate-600 text-sm">Order Total</span>
                <span className="text-2xl font-extrabold text-slate-900">₹{Number(subject.price).toLocaleString('en-IN')}</span>
              </div>

              {/* Method tabs */}
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Choose Payment Method</p>
                <div className="flex gap-2">
                  {methodTab('upi', 'UPI', '🏦')}
                  {methodTab('card', 'Card', '💳')}
                  {methodTab('netbanking', 'Net Banking', '🌐')}
                  {methodTab('wallet', 'Wallet', '👛')}
                </div>
              </div>

              {/* Method form */}
              <div className="space-y-3">
                {method === 'upi' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">UPI ID</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Supports PhonePe, Google Pay, Paytm, BHIM UPI</p>
                    <div className="flex gap-3 mt-3">
                      {['gpay', 'phonepe', 'paytm', 'bhim'].map((app) => (
                        <div key={app} className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 uppercase">{app.slice(0,2)}</div>
                      ))}
                    </div>
                  </div>
                )}
                {method === 'card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Card Number</label>
                      <input
                        type="text"
                        placeholder="1234 5678 9012 3456"
                        value={cardNo}
                        onChange={(e) => setCardNo(e.target.value.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1 ').trim())}
                        maxLength={19}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 block mb-1.5">Name on Card</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">Expiry</label>
                        <input
                          type="text"
                          placeholder="MM/YY"
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          maxLength={5}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-slate-600 block mb-1.5">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value.slice(0,3))}
                          maxLength={3}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">Supports Visa, Mastercard, RuPay, Amex</p>
                  </div>
                )}
                {method === 'netbanking' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Select Your Bank</label>
                    <select
                      value={bank}
                      onChange={(e) => setBank(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="sbi">State Bank of India (SBI)</option>
                      <option value="hdfc">HDFC Bank</option>
                      <option value="icici">ICICI Bank</option>
                      <option value="axis">Axis Bank</option>
                      <option value="kotak">Kotak Mahindra Bank</option>
                      <option value="pnb">Punjab National Bank</option>
                      <option value="bob">Bank of Baroda</option>
                      <option value="idbi">IDBI Bank</option>
                    </select>
                    <p className="text-xs text-slate-400 mt-2">You will be redirected to your bank's secure portal.</p>
                  </div>
                )}
                {method === 'wallet' && (
                  <div>
                    <label className="text-xs font-semibold text-slate-600 block mb-1.5">Select Wallet</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { id: 'paytm', name: 'Paytm', emoji: '💰' },
                        { id: 'mobikwik', name: 'MobiKwik', emoji: '📱' },
                        { id: 'freecharge', name: 'FreeCharge', emoji: '⚡' },
                        { id: 'amazonpay', name: 'Amazon Pay', emoji: '🛒' },
                      ].map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setWallet(w.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border-2 text-sm font-medium transition-all ${
                            wallet === w.id ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600 hover:border-indigo-300'
                          }`}
                        >
                          <span className="text-lg">{w.emoji}</span> {w.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Pay button */}
              <button
                onClick={handlePay}
                disabled={processing}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:opacity-70 text-white rounded-xl font-bold text-sm tracking-wide transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-300"
              >
                {processing ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                    </svg>
                    Processing Payment…
                  </>
                ) : (
                  <>🔒 Pay ₹{Number(subject.price).toLocaleString('en-IN')}</>
                )}
              </button>
              <p className="text-center text-xs text-slate-400">🔐 256-bit SSL encrypted • Safe & Secure</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Star Rating ─────────────────────────────────────────────────────────────
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-xs font-semibold text-slate-700 ml-0.5">{rating}</span>
    </div>
  );
}

// ─── Level Badge ──────────────────────────────────────────────────────────────
function LevelBadge({ level }: { level: string }) {
  const colors: Record<string, string> = {
    Beginner: 'bg-emerald-100 text-emerald-700',
    Intermediate: 'bg-blue-100 text-blue-700',
    Advanced: 'bg-rose-100 text-rose-700',
  };
  return (
    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${colors[level] ?? 'bg-slate-100 text-slate-600'}`}>
      {level}
    </span>
  );
}

// ─── Course Catalog Page ──────────────────────────────────────────────────────
export default function CourseCatalog() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [enrolledMap, setEnrolledMap] = useState<Record<number, boolean>>({});
  const [paySubject, setPaySubject] = useState<Subject | null>(null);
  const [search, setSearch] = useState('');
  const [filterLevel, setFilterLevel] = useState('All');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Fetch Subjects
      try {
        const { data } = await api.get(`/subjects?t=${Date.now()}`);
        console.log('API DEB: Subjects received:', data?.length);
        setSubjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }

      // Fetch Enrollments (separately)
      try {
        const { data: myEnrollments } = await api.get(`/enrollments/my?t=${Date.now()}`);
        if (Array.isArray(myEnrollments)) {
          const map: Record<number, boolean> = {};
          myEnrollments.forEach((e: any) => { map[e.subject_id] = true; });
          setEnrolledMap(map);
        }
      } catch (error) {
        console.error('Failed to load my enrollments:', error);
      }
      
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = subjects.filter((s) => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.description.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === 'All' || s.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleEnrollSuccess = (subjectId: number) => {
    setEnrolledMap((prev) => ({ ...prev, [subjectId]: true }));
    setPaySubject(null);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%)' }}>
        <Navbar />

        {/* Hero Banner */}
        <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }} className="py-14 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-indigo-200 text-sm font-semibold uppercase tracking-widest mb-3">🎓 KodNest Learning Platform</p>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              Unlock Your Potential with<br />
              <span className="text-yellow-300">Expert-Led Courses</span>
            </h1>
            <p className="text-indigo-200 text-lg mb-8 max-w-2xl mx-auto">
              Learn in-demand skills from industry professionals. Get certified and land your dream job.
            </p>
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 bg-white/95 text-slate-800 placeholder:text-slate-400"
                />
              </div>
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="px-4 py-3.5 rounded-xl text-sm focus:outline-none bg-white/95 text-slate-700 font-medium min-w-[140px]"
              >
                <option value="All">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-8 justify-center sm:justify-start text-sm text-slate-600">
            <div className="flex items-center gap-2"><span className="text-xl">📚</span><span><strong className="text-slate-900">{subjects.length}</strong> Courses</span></div>
            <div className="flex items-center gap-2"><span className="text-xl">🎓</span><span><strong className="text-slate-900">50,000+</strong> Students</span></div>
            <div className="flex items-center gap-2"><span className="text-xl">⭐</span><span><strong className="text-slate-900">4.7/5</strong> Avg Rating</span></div>
            <div className="flex items-center gap-2"><span className="text-xl">🏆</span><span><strong className="text-slate-900">Certificate</strong> on Completion</span></div>
          </div>
        </div>

        <main className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
          {/* Results count */}
          {!loading && (
            <p className="text-slate-500 text-sm mb-6">
              Showing <strong className="text-slate-800">{filtered.length}</strong> courses
              {filterLevel !== 'All' && <> in <strong className="text-indigo-600">{filterLevel}</strong></>}
              {search && <> matching "<strong className="text-indigo-600">{search}</strong>"</>}
            </p>
          )}

          {loading ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
                  <div className="h-48 bg-slate-200" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-slate-200 rounded w-1/3" />
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-200 rounded w-full" />
                    <div className="h-4 bg-slate-200 rounded w-2/3" />
                    <div className="h-10 bg-slate-200 rounded-xl mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-slate-700">No courses found</h3>
              <p className="text-slate-500 mt-2">Try adjusting your search or filter</p>
              
              <div className="mt-8 flex flex-col items-center gap-4">
                <button onClick={() => { setSearch(''); setFilterLevel('All'); }} className="text-indigo-600 hover:underline text-sm font-medium">Clear filters</button>
                
                <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 max-w-md">
                  <p className="text-amber-800 text-sm mb-4 font-medium">If you just deployed and see 0 courses, click below to initialize the catalog:</p>
                  <a 
                    href="/api/health?init=true" 
                    target="_blank"
                    className="inline-block px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-amber-200"
                  >
                    🚀 Fix & Initialize Catalog
                  </a>
                  <p className="text-amber-600 text-[10px] mt-3 font-semibold uppercase tracking-wider">Wait 30 seconds after clicking, then refresh this page</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((subject) => (
                <div
                  key={subject.id}
                  className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col group hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden">
                    {subject.thumbnail_url ? (
                      <img
                        src={subject.thumbnail_url}
                        alt={subject.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-5xl">📚</div>
                    )}
                    {/* Level badge over image */}
                    <div className="absolute top-3 left-3">
                      <LevelBadge level={subject.level} />
                    </div>
                    {enrolledMap[subject.id] && (
                      <div className="absolute top-3 right-3 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        ✓ ENROLLED
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col">
                    {/* Rating */}
                    <div className="flex items-center justify-between mb-2">
                      <StarRating rating={subject.rating} />
                      <span className="text-xs text-slate-400">{Number(subject.students_count).toLocaleString('en-IN')} students</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug mb-2 line-clamp-2 group-hover:text-indigo-700 transition-colors">
                      {subject.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 flex-1 leading-relaxed">{subject.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><span>🕒</span> {subject.duration_hours}h total</span>
                      <span className="flex items-center gap-1"><span>📋</span> Certificate</span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-slate-100 mt-4 pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-extrabold text-slate-900">
                            ₹{Number(subject.price).toLocaleString('en-IN')}
                          </p>
                          <p className="text-xs text-slate-400 line-through">
                            ₹{(Number(subject.price) * 2).toLocaleString('en-IN')}
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">50% OFF</span>
                      </div>

                      {enrolledMap[subject.id] ? (
                        <div className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 border-2 border-green-400 text-green-600 rounded-xl text-sm font-semibold">
                          ✓ Already Enrolled
                        </div>
                      ) : (
                        <button
                          onClick={() => setPaySubject(subject)}
                          className="mt-3 w-full py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300 flex items-center justify-center gap-2"
                        >
                          🎓 Enroll Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        {/* Payment Modal */}
        {paySubject && (
          <PaymentModal
            subject={paySubject}
            onClose={() => setPaySubject(null)}
            onSuccess={() => handleEnrollSuccess(paySubject.id)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
