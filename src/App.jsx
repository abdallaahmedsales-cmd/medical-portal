import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, Plus, Save, CheckCircle, TrendingUp, Users } from 'lucide-react';

const MedicalRepsPortal = () => {
  // Data
  const representatives = [
    { code: 'REP_1', name: 'Ahmed Nashaat', areas: 'Gerga, Sohag City, El Baliana, El Monshaa, Dar ElSalam' },
    { code: 'REP_2', name: 'Ahmed Osman', areas: 'Deshna, Nagaa Hamady, Farshout, Abo Tesht, Kaft, Nakada' },
    { code: 'REP_3', name: 'Azza Moatamed', areas: 'El Menia, Samalout, Maghagha, Bani Mazar, Matay, El Adwa' },
    { code: 'REP_4', name: 'Mary Hosny', areas: 'Sohag City, Tahta, El Maragha, Sakalta, Guhaina, Akhmeem, Tema' },
    { code: 'REP_5', name: 'Mayar Gamal', areas: 'Assuit, Manqabad, Manfalout, Dayrout, El Qousia, New Valley' },
    { code: 'REP_6', name: 'Sara Nabil', areas: 'Abou Korkas, Dair Mouas, Malawy' },
    { code: 'REP_7', name: 'Ahmed Hady', areas: 'Qena, Luxor, Hurghada, Naqada' }
  ];

  const workDays = [
    { id: 'saturday', name: 'Saturday' },
    { id: 'sunday', name: 'Sunday' },
    { id: 'monday', name: 'Monday' },
    { id: 'tuesday', name: 'Tuesday' },
    { id: 'wednesday', name: 'Wednesday' }
  ];

  const specialties = [
    'Cardiology', 'Dermatology', 'Neurology', 'Orthopedics', 
    'Pediatrics', 'Psychiatry', 'General Practice', 'Internal Medicine',
    'Rheumatology', 'Endocrinology'
  ];

  const products = [
    'Etoricox 60mg',
    'Etoricox 90mg',
    'Etoricox 120mg',
    'Flexilax Cap',
    'Miacalcic Amp'
  ];

  // State
  const [activeTab, setActiveTab] = useState('weekly');
  const [selectedRep, setSelectedRep] = useState('');
  const [selectedRepData, setSelectedRepData] = useState(null);
  const [weekStartDate, setWeekStartDate] = useState('');
  const [activeDay, setActiveDay] = useState('saturday');
  
  // Daily Report State
  const [dailyRep, setDailyRep] = useState('');
  const [dailyRepData, setDailyRepData] = useState(null);
  const [dailyVisits, setDailyVisits] = useState([
    { id: 1, doctorName: '', specialty: '', location: '', feedback: '' }
  ]);
  
  // Login State
  const [userRole, setUserRole] = useState(null); // 'manager' or 'rep'
  const [loggedInRep, setLoggedInRep] = useState(null);
  const [loginCode, setLoginCode] = useState('');
  const [loginError, setLoginError] = useState('');
  
  // AI Analysis State
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  
  // Dashboard Data State
  const [allWeeklyPlans, setAllWeeklyPlans] = useState([]);
  const [allDailyReports, setAllDailyReports] = useState([]);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardView, setDashboardView] = useState('weekly'); // 'weekly' or 'daily'
  
  // Private Hospitals State
  const [hospitals, setHospitals] = useState([]);
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [newHospital, setNewHospital] = useState({
    name: '',
    location: '',
    contactPerson: '',
    phone: '',
    products: {}
  });
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [editingRepCode, setEditingRepCode] = useState(null);
  const [newCode, setNewCode] = useState('');
  const [showVisitModal, setShowVisitModal] = useState(false);
  const [visitHospitalId, setVisitHospitalId] = useState(null);
  const [visitFeedback, setVisitFeedback] = useState('');

  // Load dashboard data
  useEffect(() => {
    if (activeTab === 'dashboard' && userRole === 'manager') {
      loadDashboardData();
    }
    if (activeTab === 'hospitals') {
      loadHospitals();
    }
  }, [activeTab, userRole]);

  const loadHospitals = () => {
    try {
      const loadedHospitals = [];
      const keys = Object.keys(localStorage).filter(key => key.startsWith('hospital_'));
      
      for (const key of keys) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            loadedHospitals.push(JSON.parse(item));
          }
        } catch (e) {
          console.log('Error parsing key:', key);
        }
      }
      
      // Filter by rep if not manager
      if (userRole === 'rep') {
        setHospitals(loadedHospitals.filter(h => h.representative === loggedInRep?.code));
      } else {
        setHospitals(loadedHospitals);
      }
    } catch (error) {
      console.error('Error loading hospitals:', error);
    }
  };

  const loadDashboardData = () => {
    setDashboardLoading(true);
    try {
      // Load weekly plans
      const weeklyPlans = [];
      const weeklyKeys = Object.keys(localStorage).filter(key => key.startsWith('weekly_plan_'));
      
      for (const key of weeklyKeys) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            weeklyPlans.push(JSON.parse(item));
          }
        } catch (e) {
          console.log('Error parsing weekly plan:', key);
        }
      }
      setAllWeeklyPlans(weeklyPlans);

      // Load daily reports
      const dailyReports = [];
      const dailyKeys = Object.keys(localStorage).filter(key => key.startsWith('daily_report_'));
      
      for (const key of dailyKeys) {
        try {
          const item = localStorage.getItem(key);
          if (item) {
            dailyReports.push(JSON.parse(item));
          }
        } catch (e) {
          console.log('Error parsing daily report:', key);
        }
      }
      setAllDailyReports(dailyReports);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const getTotalDoctorsPlanned = () => {
    return allWeeklyPlans.reduce((sum, plan) => sum + (plan.totalDoctors || 0), 0);
  };

  const getTotalDoctorsVisited = () => {
    return allDailyReports.reduce((sum, report) => sum + (report.totalVisits || 0), 0);
  };

  const addHospital = () => {
    if (!newHospital.name || !newHospital.location) {
      alert('Please fill hospital name and location');
      return;
    }

    const hospitalData = {
      id: Date.now().toString(),
      ...newHospital,
      representative: userRole === 'rep' ? loggedInRep.code : selectedRep,
      repName: userRole === 'rep' ? loggedInRep.name : selectedRepData?.name || 'Unknown',
      products: products.reduce((acc, p) => ({ ...acc, [p]: 'pending' }), {}),
      visits: [],
      createdAt: new Date().toISOString()
    };

    try {
      localStorage.setItem(`hospital_${hospitalData.id}`, JSON.stringify(hospitalData));
      setHospitals([...hospitals, hospitalData]);
      setNewHospital({ name: '', location: '', contactPerson: '', phone: '', products: {} });
      setShowAddHospital(false);
      alert('Hospital added successfully!');
    } catch (error) {
      alert('Error adding hospital: ' + error.message);
    }
  };

  const updateHospitalProduct = (hospitalId, product, status) => {
    const hospital = hospitals.find(h => h.id === hospitalId);
    if (!hospital) return;

    const updated = {
      ...hospital,
      products: { ...hospital.products, [product]: status }
    };

    try {
      localStorage.setItem(`hospital_${hospitalId}`, JSON.stringify(updated));
      setHospitals(hospitals.map(h => h.id === hospitalId ? updated : h));
    } catch (error) {
      alert('Error updating: ' + error.message);
    }
  };

  const addHospitalVisit = (hospitalId) => {
    setVisitHospitalId(hospitalId);
    setVisitFeedback('');
    setShowVisitModal(true);
  };

  const submitVisit = () => {
    if (!visitFeedback.trim()) {
      alert('Please enter visit feedback');
      return;
    }

    const hospital = hospitals.find(h => h.id === visitHospitalId);
    if (!hospital) return;

    const visit = {
      date: new Date().toISOString(),
      feedback: visitFeedback,
      by: userRole === 'rep' ? loggedInRep.name : 'Manager'
    };

    const updated = {
      ...hospital,
      visits: [...(hospital.visits || []), visit],
      lastVisit: new Date().toISOString()
    };

    try {
      localStorage.setItem(`hospital_${visitHospitalId}`, JSON.stringify(updated));
      setHospitals(hospitals.map(h => h.id === visitHospitalId ? updated : h));
      setShowVisitModal(false);
      setVisitFeedback('');
      setVisitHospitalId(null);
      alert('Visit logged successfully!');
    } catch (error) {
      alert('Error logging visit: ' + error.message);
    }
  };

  const changeRepCode = (repCode) => {
    if (!newCode.trim()) {
      alert('Please enter new code');
      return;
    }

    // Check if code already exists
    const existingRep = representatives.find(r => r.code === newCode && r.code !== repCode);
    if (existingRep) {
      alert('This code is already in use!');
      return;
    }

    alert(`Code changed successfully!\n\nOld Code: ${repCode}\nNew Code: ${newCode}\n\nNote: This is a demo. In production, this would update the database.`);
    setEditingRepCode(null);
    setNewCode('');
  };
  
  const [weeklyPlan, setWeeklyPlan] = useState(() => {
    const plan = {};
    workDays.forEach(day => {
      plan[day.id] = Array(10).fill(null).map((_, idx) => ({
        id: `${day.id}-${idx}`,
        doctorName: '',
        specialty: '',
        location: '',
        products: []
      }));
    });
    return plan;
  });

  // Functions
  const handleLogin = () => {
    if (loginCode === 'MANAGER@2026') {
      setUserRole('manager');
      setLoginError('');
    } else {
      const rep = representatives.find(r => r.code === loginCode);
      if (rep) {
        setUserRole('rep');
        setLoggedInRep(rep);
        setSelectedRep(rep.code);
        setSelectedRepData(rep);
        setDailyRep(rep.code);
        setDailyRepData(rep);
        setLoginError('');
      } else {
        setLoginError('Invalid code. Please try again.');
      }
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    setLoggedInRep(null);
    setLoginCode('');
    setSelectedRep('');
    setSelectedRepData(null);
    setDailyRep('');
    setDailyRepData(null);
  };

  const handleAIAnalysis = async () => {
    if (!aiQuery.trim()) return;
    
    setAiLoading(true);
    setAiResponse('');
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [
            {
              role: 'user',
              content: `You are a medical sales analytics expert. Analyze the following query about medical representatives performance and provide insights:

Query: ${aiQuery}

Context: We have ${representatives.length} medical representatives covering regions in Egypt (Sohag, Menia, Assuit, Qena). They promote products: Etoricox (60mg, 90mg, 120mg), Flexilax Cap, and Miacalcic Amp. Each rep plans 50 doctor visits per week (10 per day, 5 working days).

Provide actionable insights and recommendations.`
            }
          ]
        })
      });

      const data = await response.json();
      const aiText = data.content
        .filter(item => item.type === 'text')
        .map(item => item.text)
        .join('\n');
      
      setAiResponse(aiText);
    } catch (error) {
      setAiResponse('Error connecting to AI service. Please try again.');
      console.error('AI Analysis Error:', error);
    } finally {
      setAiLoading(false);
    }
  };

  const handleRepChange = (repCode) => {
    setSelectedRep(repCode);
    const repData = representatives.find(r => r.code === repCode);
    setSelectedRepData(repData);
  };

  const handleDailyRepChange = (repCode) => {
    setDailyRep(repCode);
    const repData = representatives.find(r => r.code === repCode);
    setDailyRepData(repData);
  };

  const getRepAreas = (repData) => {
    if (!repData) return [];
    return repData.areas.split(',').map(area => area.trim());
  };

  const addDailyVisit = () => {
    if (dailyVisits.length < 10) {
      setDailyVisits([...dailyVisits, {
        id: dailyVisits.length + 1,
        doctorName: '',
        specialty: '',
        location: '',
        feedback: ''
      }]);
    }
  };

  const removeDailyVisit = (id) => {
    if (dailyVisits.length > 1) {
      setDailyVisits(dailyVisits.filter(visit => visit.id !== id));
    }
  };

  const updateDailyVisit = (id, field, value) => {
    setDailyVisits(dailyVisits.map(visit =>
      visit.id === id ? { ...visit, [field]: value } : visit
    ));
  };

  const updateDoctor = (dayId, doctorIdx, field, value) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [dayId]: prev[dayId].map((doc, idx) => 
        idx === doctorIdx ? { ...doc, [field]: value } : doc
      )
    }));
  };

  const clearDoctor = (dayId, doctorIdx) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [dayId]: prev[dayId].map((doc, idx) => 
        idx === doctorIdx ? { id: doc.id, doctorName: '', specialty: '', location: '', products: [] } : doc
      )
    }));
  };

  const toggleProduct = (dayId, doctorIdx, product) => {
    setWeeklyPlan(prev => ({
      ...prev,
      [dayId]: prev[dayId].map((doc, idx) => {
        if (idx === doctorIdx) {
          const hasProduct = doc.products.includes(product);
          return {
            ...doc,
            products: hasProduct 
              ? doc.products.filter(p => p !== product)
              : [...doc.products, product]
          };
        }
        return doc;
      })
    }));
  };

  const getTotalPlannedDoctors = () => {
    let total = 0;
    Object.values(weeklyPlan).forEach(dayDoctors => {
      dayDoctors.forEach(doc => {
        if (doc.doctorName.trim()) total++;
      });
    });
    return total;
  };

  const getDayPlannedCount = (dayId) => {
    return weeklyPlan[dayId].filter(doc => doc.doctorName.trim()).length;
  };

  const handleSubmit = () => {
    if (!selectedRep || !weekStartDate) {
      alert('Please select representative and week start date');
      return;
    }
    
    const planData = {
      representative: selectedRep,
      repName: selectedRepData.name,
      weekStartDate,
      plan: weeklyPlan,
      totalDoctors: getTotalPlannedDoctors(),
      submittedAt: new Date().toISOString()
    };
    
    // Save to local storage
    try {
      const storageKey = `weekly_plan_${selectedRep}_${weekStartDate}`;
      localStorage.setItem(storageKey, JSON.stringify(planData));
      
      console.log('Weekly Plan Submitted:', planData);
      alert(`Weekly plan submitted successfully!\n\nTotal doctors planned: ${getTotalPlannedDoctors()} out of 50`);
      
      // Reset form
      setWeeklyPlan(() => {
        const plan = {};
        workDays.forEach(day => {
          plan[day.id] = Array(10).fill(null).map((_, idx) => ({
            id: `${day.id}-${idx}`,
            doctorName: '',
            specialty: '',
            location: '',
            products: []
          }));
        });
        return plan;
      });
      setWeekStartDate('');
    } catch (error) {
      alert('Error saving plan: ' + error.message);
      console.error('Storage error:', error);
    }
  };

  const handleDailyReportSubmit = () => {
    if (!dailyRep) {
      alert('Please select representative');
      return;
    }
    
    const reportDateInput = document.querySelector('#daily-report-date');
    const reportDate = reportDateInput?.value;
    if (!reportDate) {
      alert('Please select report date');
      return;
    }
    
    const reportData = {
      representative: dailyRep,
      repName: dailyRepData.name,
      reportDate,
      visits: dailyVisits.filter(v => v.doctorName.trim()),
      totalVisits: dailyVisits.filter(v => v.doctorName.trim()).length,
      submittedAt: new Date().toISOString()
    };
    
    // Save to local storage
    try {
      const storageKey = `daily_report_${dailyRep}_${reportDate}`;
      localStorage.setItem(storageKey, JSON.stringify(reportData));
      
      console.log('Daily Report Submitted:', reportData);
      alert(`Daily report submitted successfully!\n\nTotal visits: ${reportData.totalVisits}`);
      
      // Reset form
      setDailyVisits([
        { id: 1, doctorName: '', specialty: '', location: '', feedback: '' }
      ]);
      if (reportDateInput) reportDateInput.value = '';
    } catch (error) {
      alert('Error saving report: ' + error.message);
      console.error('Storage error:', error);
    }
  };

  return (
    <div className="min-h-screen animated-gradient">
      {/* Login Screen */}
      {!userRole && (
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="glass-card rounded-3xl shadow-2xl p-10 w-full max-w-md transform hover:scale-105 transition-transform duration-300">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">Medical Reps Portal</h1>
              <p className="text-gray-600">Enter your access code to continue</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  value={loginCode}
                  onChange={(e) => setLoginCode(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                  placeholder="Enter your code..."
                  className="w-full px-5 py-4 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none text-gray-800 placeholder-gray-400 font-medium"
                />
                {loginError && (
                  <p className="mt-2 text-sm text-red-500 font-medium">{loginError}</p>
                )}
              </div>

              <button
                onClick={handleLogin}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 shadow-lg"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Application */}
      {userRole && (
        <>
      {/* Header */}
      <div className="glass-card border-0 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Medical Reps Portal</h1>
                <p className="text-gray-600 font-medium">
                  {userRole === 'manager' 
                    ? 'Manager Dashboard' 
                    : `Welcome, ${loggedInRep?.name}`
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {userRole === 'manager' && (
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 glass-card hover:shadow-lg rounded-xl transition-all"
                >
                  ⚙️ Settings
                </button>
              )}
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 text-sm font-semibold text-gray-700 glass-card hover:shadow-lg rounded-xl transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="glass-card border-0 mt-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-6 overflow-x-auto pb-1">
            <button 
              onClick={() => setActiveTab('weekly')}
              className={`py-4 px-6 border-b-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'weekly' 
                  ? 'border-purple-500 text-purple-600 bg-purple-50/50 rounded-t-xl' 
                  : 'border-transparent text-gray-600 hover:text-purple-600 hover:bg-purple-50/30 rounded-t-xl'
              }`}
            >
              📅 Weekly Plan
            </button>
            <button 
              onClick={() => setActiveTab('daily')}
              className={`py-4 px-6 border-b-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'daily' 
                  ? 'border-green-500 text-green-600 bg-green-50/50 rounded-t-xl' 
                  : 'border-transparent text-gray-600 hover:text-green-600 hover:bg-green-50/30 rounded-t-xl'
              }`}
            >
              📝 Daily Report
            </button>
            <button 
              onClick={() => setActiveTab('hospitals')}
              className={`py-4 px-6 border-b-3 font-semibold transition-all whitespace-nowrap ${
                activeTab === 'hospitals' 
                  ? 'border-cyan-500 text-cyan-600 bg-cyan-50/50 rounded-t-xl' 
                  : 'border-transparent text-gray-600 hover:text-cyan-600 hover:bg-cyan-50/30 rounded-t-xl'
              }`}
            >
              🏥 Private Hospitals
            </button>
            {userRole === 'manager' && (
              <button 
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-6 border-b-3 font-semibold transition-all whitespace-nowrap ${
                  activeTab === 'dashboard' 
                    ? 'border-orange-500 text-orange-600 bg-orange-50/50 rounded-t-xl' 
                    : 'border-transparent text-gray-600 hover:text-orange-600 hover:bg-orange-50/30 rounded-t-xl'
                }`}
              >
                📊 Dashboard
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Visit Modal */}
        {showVisitModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden transform hover:scale-105 transition-transform">
              <div className="bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-5 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">📝 Log Hospital Visit</h2>
                <button
                  onClick={() => { setShowVisitModal(false); setVisitFeedback(''); }}
                  className="text-white hover:bg-white/20 rounded-full p-2 text-2xl transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Visit Feedback *
                </label>
                <textarea
                  value={visitFeedback}
                  onChange={(e) => setVisitFeedback(e.target.value)}
                  placeholder="Describe the visit: discussions, doctor feedback, orders, follow-up needed..."
                  rows="6"
                  className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                />
                
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={submitVisit}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                  >
                    Submit Visit
                  </button>
                  <button
                    onClick={() => { setShowVisitModal(false); setVisitFeedback(''); }}
                    className="px-6 py-3 glass-card text-gray-700 font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Modal */}
        {showSettings && userRole === 'manager' && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-gray-700 to-gray-900 px-6 py-5 flex items-center justify-between sticky top-0">
                <h2 className="text-xl font-bold text-white">⚙️ Manager Settings</h2>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 text-2xl transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Manage Access Codes</h3>
                <div className="space-y-3">
                  {representatives.map(rep => (
                    <div key={rep.code} className="glass rounded-xl p-4 border border-white/30 hover:border-purple-300 transition-all">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-gray-900">{rep.name}</h4>
                          <p className="text-sm text-gray-600">Current Code: <span className="font-mono bg-gradient-to-r from-purple-100 to-pink-100 px-3 py-1 rounded-lg font-bold">{rep.code}</span></p>
                        </div>
                        {editingRepCode === rep.code ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={newCode}
                              onChange={(e) => setNewCode(e.target.value)}
                              placeholder="New code"
                              className="px-3 py-2 glass-card rounded-lg text-sm focus:ring-2 focus:ring-purple-400 focus:outline-none"
                            />
                            <button
                              onClick={() => changeRepCode(rep.code)}
                              className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg text-sm font-bold hover:shadow-lg transition-all"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => { setEditingRepCode(null); setNewCode(''); }}
                              className="px-4 py-2 glass-card text-gray-700 rounded-lg text-sm font-bold hover:shadow-lg transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingRepCode(rep.code)}
                            className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg text-sm font-bold transition-all"
                          >
                            Change Code
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Manager Code</h3>
                  <p className="text-sm text-gray-600 mb-4">Current manager code: <span className="font-mono bg-gradient-to-r from-yellow-100 to-orange-100 px-3 py-1 rounded-lg font-bold">MANAGER@2026</span></p>
                  <p className="text-xs text-gray-500 bg-yellow-50 p-3 rounded-xl">⚠️ Changing the manager code will require you to login again.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Plan Tab */}
        {activeTab === 'weekly' && (
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-8 py-6 border-b border-purple-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">📅 Weekly Planning Form</h2>
              <p className="text-gray-700 font-medium">Plan 10 doctor visits for each working day (50 total per week)</p>
            </div>

            <div className="p-8">
              {/* Rep & Date Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Select Representative
                  </label>
                  {userRole === 'manager' ? (
                    <select
                      value={selectedRep}
                      onChange={(e) => handleRepChange(e.target.value)}
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                    >
                      <option value="">Choose a representative...</option>
                      {representatives.map(rep => (
                        <option key={rep.code} value={rep.code}>
                          {rep.name} ({rep.code})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={`${loggedInRep?.name} (${loggedInRep?.code})`}
                      disabled
                      className="w-full px-4 py-3 glass rounded-xl text-gray-600 font-medium"
                    />
                  )}
                  {selectedRepData && (
                    <div className="mt-3 text-sm text-gray-700 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-3 rounded-xl font-medium">
                      <span className="font-bold">Areas:</span> {selectedRepData.areas}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Week Start Date
                  </label>
                  <input
                    type="date"
                    value={weekStartDate}
                    onChange={(e) => setWeekStartDate(e.target.value)}
                    className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                  />
                </div>
              </div>

              {/* Progress */}
              <div className="glass rounded-2xl p-6 mb-8 border border-purple-200 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900 text-lg">Week Planning Progress</h3>
                  <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    {getTotalPlannedDoctors()} / 50
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500 shadow-lg"
                    style={{ width: `${(getTotalPlannedDoctors() / 50) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-5 gap-3 mt-5">
                  {workDays.map(day => (
                    <div key={day.id} className="text-center glass rounded-xl p-3">
                      <div className="text-xs font-bold text-gray-600 mb-2">{day.name}</div>
                      <div className={`text-sm font-bold ${getDayPlannedCount(day.id) === 10 ? 'text-green-600' : 'text-purple-600'}`}>
                        {getDayPlannedCount(day.id)} / 10
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Day Tabs */}
              <div className="flex gap-3 mb-6 overflow-x-auto pb-2">
                {workDays.map(day => (
                  <button
                    key={day.id}
                    onClick={() => setActiveDay(day.id)}
                    className={`px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap shadow-lg ${
                      activeDay === day.id
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white transform scale-105' 
                        : 'glass-card text-gray-700 hover:shadow-xl'
                    }`}
                  >
                    {day.name}
                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-bold ${
                      activeDay === day.id ? 'bg-white/30' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {getDayPlannedCount(day.id)}/10
                    </span>
                  </button>
                ))}
              </div>

              {/* Doctors List */}
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xl font-bold text-gray-900">
                    Doctor Visits - {workDays.find(d => d.id === activeDay)?.name}
                  </h3>
                  <span className="text-sm font-bold bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl">
                    {getDayPlannedCount(activeDay)} out of 10 planned
                  </span>
                </div>

                {weeklyPlan[activeDay].map((doctor, idx) => (
                  <div key={doctor.id} className="glass-card rounded-2xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                              Doctor Name
                            </label>
                            <input
                              type="text"
                              value={doctor.doctorName}
                              onChange={(e) => updateDoctor(activeDay, idx, 'doctorName', e.target.value)}
                              placeholder="Dr. Name"
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                              Specialty
                            </label>
                            <select
                              value={doctor.specialty}
                              onChange={(e) => updateDoctor(activeDay, idx, 'specialty', e.target.value)}
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                            >
                              <option value="">Select...</option>
                              {specialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                              ))}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">
                              Location
                            </label>
                            <select
                              value={doctor.location}
                              onChange={(e) => updateDoctor(activeDay, idx, 'location', e.target.value)}
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                              disabled={!selectedRepData}
                            >
                              <option value="">
                                {selectedRepData ? 'Select location...' : 'Select rep first'}
                              </option>
                              {selectedRepData && getRepAreas(selectedRepData).map((area, areaIdx) => (
                                <option key={areaIdx} value={area}>{area}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-3">
                            Products to Promote
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {products.map(product => (
                              <button
                                key={product}
                                type="button"
                                onClick={() => toggleProduct(activeDay, idx, product)}
                                className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md ${
                                  doctor.products.includes(product)
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg transform scale-105'
                                    : 'glass-card text-gray-700 hover:border-purple-300 hover:shadow-lg'
                                }`}
                              >
                                {product}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => clearDoctor(activeDay, idx)}
                        className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all glass-card"
                        title="Clear"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Submit */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={handleSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  <Save className="w-6 h-6" />
                  Submit Weekly Plan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Report Tab */}
        {activeTab === 'daily' && (
          <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-8 py-6 border-b border-green-200">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">📝 Daily Activity Report</h2>
              <p className="text-gray-700 font-medium">Record your doctor visits and activities for today</p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Representative</label>
                  {userRole === 'manager' ? (
                    <select 
                      value={dailyRep}
                      onChange={(e) => handleDailyRepChange(e.target.value)}
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                    >
                      <option value="">Choose a representative...</option>
                      {representatives.map(rep => (
                        <option key={rep.code} value={rep.code}>{rep.name} ({rep.code})</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={`${loggedInRep?.name} (${loggedInRep?.code})`}
                      disabled
                      className="w-full px-4 py-3 glass rounded-xl text-gray-600 font-medium"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Report Date</label>
                  <input
                    id="daily-report-date"
                    type="date"
                    className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Region</label>
                  <select 
                    className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                    disabled={!dailyRepData}
                  >
                    <option value="">
                      {dailyRepData ? 'Select region...' : 'Select a representative first'}
                    </option>
                    {dailyRepData && getRepAreas(dailyRepData).map((area, idx) => (
                      <option key={idx} value={area}>{area}</option>
                    ))}
                  </select>
                  {dailyRepData && (
                    <div className="mt-2 text-xs text-gray-600 font-medium">
                      Available regions for {dailyRepData.name}
                    </div>
                  )}
                </div>
              </div>

              <div className="glass rounded-2xl p-5 mb-6 border border-green-200 bg-gradient-to-br from-green-50/50 to-emerald-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900">Doctors Visited Today</h3>
                  <span className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {dailyVisits.filter(v => v.doctorName.trim()).length} / 10 visits
                  </span>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {dailyVisits.map((visit, idx) => (
                  <div key={visit.id} className="glass-card rounded-2xl p-6 border border-green-100 hover:border-green-300 hover:shadow-xl transition-all">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Doctor Name</label>
                            <input
                              type="text"
                              value={visit.doctorName}
                              onChange={(e) => updateDailyVisit(visit.id, 'doctorName', e.target.value)}
                              placeholder="Dr. Name"
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Specialty</label>
                            <select
                              value={visit.specialty}
                              onChange={(e) => updateDailyVisit(visit.id, 'specialty', e.target.value)}
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                            >
                              <option value="">Select...</option>
                              {specialties.map(spec => (
                                <option key={spec} value={spec}>{spec}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-gray-700 mb-2">Location</label>
                            <select
                              value={visit.location}
                              onChange={(e) => updateDailyVisit(visit.id, 'location', e.target.value)}
                              className="w-full px-4 py-2 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                              disabled={!dailyRepData}
                            >
                              <option value="">
                                {dailyRepData ? 'Select location...' : 'Select rep first'}
                              </option>
                              {dailyRepData && getRepAreas(dailyRepData).map((area, areaIdx) => (
                                <option key={areaIdx} value={area}>{area}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-700 mb-2">Feedback</label>
                          <textarea
                            value={visit.feedback}
                            onChange={(e) => updateDailyVisit(visit.id, 'feedback', e.target.value)}
                            placeholder="Doctor feedback, products discussed, follow-up notes..."
                            rows="3"
                            className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"
                          />
                        </div>
                      </div>

                      {dailyVisits.length > 1 && (
                        <button
                          onClick={() => removeDailyVisit(visit.id)}
                          className="flex-shrink-0 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all glass-card"
                          title="Remove"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {dailyVisits.length < 10 && (
                <button
                  onClick={addDailyVisit}
                  className="w-full glass border-2 border-dashed border-green-300 text-green-600 hover:border-green-400 hover:bg-green-50 font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all mb-6"
                >
                  <Plus className="w-5 h-5" />
                  Add Another Doctor Visit ({dailyVisits.length} / 10)
                </button>
              )}

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Manager Comments (Optional)</label>
                <textarea placeholder="Add any additional notes or comments..." rows="3" className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-green-400 focus:outline-none font-medium"></textarea>
              </div>

              <button
                  onClick={handleDailyReportSubmit}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-5 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                <Plus className="w-6 h-6" />
                Submit Daily Report
              </button>
            </div>
          </div>
        )}

        {/* Private Hospitals Tab */}
        {activeTab === 'hospitals' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="glass-card rounded-3xl shadow-xl p-8 bg-gradient-to-br from-cyan-50/50 to-blue-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-2">🏥 Private Hospitals Tracking</h2>
                  <p className="text-gray-700 font-medium">Track relationships and product status with private hospitals</p>
                </div>
                <button
                  onClick={() => setShowAddHospital(!showAddHospital)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-lg transform hover:scale-105"
                >
                  <Plus className="w-5 h-5" />
                  Add Hospital
                </button>
              </div>
            </div>

            {/* Add Hospital Form */}
            {showAddHospital && (
              <div className="glass-card rounded-3xl shadow-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Add New Hospital</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Hospital Name *</label>
                    <input
                      type="text"
                      value={newHospital.name}
                      onChange={(e) => setNewHospital({ ...newHospital, name: e.target.value })}
                      placeholder="e.g., Sohag Medical Center"
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Location *</label>
                    <input
                      type="text"
                      value={newHospital.location}
                      onChange={(e) => setNewHospital({ ...newHospital, location: e.target.value })}
                      placeholder="e.g., Sohag City"
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Contact Person</label>
                    <input
                      type="text"
                      value={newHospital.contactPerson}
                      onChange={(e) => setNewHospital({ ...newHospital, contactPerson: e.target.value })}
                      placeholder="e.g., Dr. Ahmed"
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={newHospital.phone}
                      onChange={(e) => setNewHospital({ ...newHospital, phone: e.target.value })}
                      placeholder="e.g., 0123456789"
                      className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-cyan-400 focus:outline-none font-medium"
                    />
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addHospital}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all transform hover:scale-105"
                  >
                    Add Hospital
                  </button>
                  <button
                    onClick={() => setShowAddHospital(false)}
                    className="px-6 py-3 glass-card text-gray-700 font-bold rounded-xl hover:shadow-lg transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Hospitals List */}
            <div className="glass-card rounded-3xl shadow-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-5">
                Your Hospitals ({hospitals.length})
              </h3>

              {hospitals.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-20 h-20 glass rounded-3xl flex items-center justify-center mx-auto mb-5">
                    <span className="text-5xl">🏥</span>
                  </div>
                  <p className="text-gray-600 text-xl font-bold">No hospitals added yet</p>
                  <p className="text-gray-500 text-sm mt-2">Click "Add Hospital" to start tracking</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hospitals.map(hospital => (
                    <div key={hospital.id} className="glass rounded-2xl p-6 border border-cyan-100 hover:border-cyan-300 hover:shadow-xl transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h4 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            🏥 {hospital.name}
                          </h4>
                          <p className="text-sm text-gray-600 font-medium">📍 {hospital.location}</p>
                          {hospital.contactPerson && (
                            <p className="text-sm text-gray-600 font-medium">👤 {hospital.contactPerson} {hospital.phone && `- ${hospital.phone}`}</p>
                          )}
                        </div>
                        {userRole === 'manager' && (
                          <span className="text-xs bg-gradient-to-r from-cyan-100 to-blue-100 text-cyan-800 px-3 py-1 rounded-full font-bold">
                            {hospital.repName}
                          </span>
                        )}
                      </div>

                      {/* Products Status */}
                      <div className="mb-4">
                        <p className="text-sm font-bold text-gray-700 mb-3">Products Status:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {products.map(product => {
                            const status = hospital.products?.[product] || 'pending';
                            const statusConfig = {
                              active: { bg: 'from-green-400 to-emerald-400', text: 'text-white', label: '✅ Active' },
                              progress: { bg: 'from-yellow-400 to-orange-400', text: 'text-white', label: '⏳ In Progress' },
                              rejected: { bg: 'from-red-400 to-pink-400', text: 'text-white', label: '❌ Rejected' },
                              pending: { bg: 'from-gray-300 to-gray-400', text: 'text-white', label: '⏸️ Pending' }
                            };
                            const config = statusConfig[status];

                            return (
                              <div key={product} className="flex items-center justify-between glass-card rounded-xl p-3 border border-gray-200">
                                <span className="text-sm font-bold text-gray-700">{product}</span>
                                <select
                                  value={status}
                                  onChange={(e) => updateHospitalProduct(hospital.id, product, e.target.value)}
                                  className={`text-xs px-3 py-1 rounded-lg border-0 bg-gradient-to-r ${config.bg} ${config.text} font-bold shadow-md`}
                                >
                                  <option value="pending">⏸️ Pending</option>
                                  <option value="active">✅ Active</option>
                                  <option value="progress">⏳ In Progress</option>
                                  <option value="rejected">❌ Rejected</option>
                                </select>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Visit History */}
                      {hospital.visits && hospital.visits.length > 0 && (
                        <div className="mb-4">
                          <p className="text-sm font-bold text-gray-700 mb-3">Recent Visits:</p>
                          <div className="space-y-2">
                            {hospital.visits.slice(-2).reverse().map((visit, idx) => (
                              <div key={idx} className="glass-card rounded-xl p-4 border border-gray-200 text-sm">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="font-bold text-gray-900">{visit.by}</span>
                                  <span className="text-xs text-gray-500 font-medium">{new Date(visit.date).toLocaleDateString()}</span>
                                </div>
                                <p className="text-gray-700 font-medium">💬 {visit.feedback}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Last Visit */}
                      {hospital.lastVisit && (
                        <p className="text-xs text-gray-500 mb-4 font-medium">
                          Last Visit: {new Date(hospital.lastVisit).toLocaleDateString()}
                        </p>
                      )}

                      {/* Actions */}
                      <div className="flex gap-3">
                        <button
                          onClick={() => addHospitalVisit(hospital.id)}
                          className="px-5 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-sm font-bold rounded-xl shadow-lg transition-all"
                        >
                          Add Visit
                        </button>
                        {hospital.visits && hospital.visits.length > 2 && (
                          <button className="px-5 py-2 glass-card text-gray-700 text-sm font-bold rounded-xl hover:shadow-lg transition-all">
                            View All Visits ({hospital.visits.length})
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && userRole === 'manager' && (
          <div className="space-y-6">
            {/* AI Analysis Section */}
            <div className="glass-card rounded-3xl shadow-xl p-8 bg-gradient-to-br from-purple-50/50 to-pink-50/50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">AI-Powered Analytics</h2>
                  <p className="text-gray-600 font-medium">Ask Claude to analyze your team's performance</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Ask a Question
                  </label>
                  <textarea
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    placeholder="e.g., 'Analyze the coverage distribution across regions' or 'What are the top performing areas?'"
                    rows="3"
                    className="w-full px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-medium"
                  />
                </div>

                <button
                  onClick={handleAIAnalysis}
                  disabled={aiLoading || !aiQuery.trim()}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl transform hover:scale-105"
                >
                  {aiLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5" />
                      Analyze with AI
                    </>
                  )}
                </button>

                {aiResponse && (
                  <div className="glass-card rounded-2xl p-6 mt-4 border border-purple-200">
                    <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                      AI Analysis Results
                    </h3>
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap font-medium">
                      {aiResponse}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="glass-card rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600">Weekly Plans</h3>
                  <Calendar className="w-10 h-10 text-purple-500" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{allWeeklyPlans.length}</p>
              </div>

              <div className="glass-card rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600">Daily Reports</h3>
                  <CheckCircle className="w-10 h-10 text-green-500" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{allDailyReports.length}</p>
              </div>

              <div className="glass-card rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600">Doctors Planned</h3>
                  <TrendingUp className="w-10 h-10 text-blue-500" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">{getTotalDoctorsPlanned()}</p>
              </div>

              <div className="glass-card rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600">Doctors Visited</h3>
                  <Users className="w-10 h-10 text-orange-500" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">{getTotalDoctorsVisited()}</p>
              </div>

              <div className="glass-card rounded-2xl shadow-xl p-6 transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-gray-600">Active Reps</h3>
                  <Users className="w-10 h-10 text-pink-500" />
                </div>
                <p className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">{representatives.length}</p>
              </div>
            </div>

            <div className="glass-card rounded-3xl shadow-xl overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Filter Submissions</h3>
                <select className="w-full md:w-72 px-4 py-3 glass-card rounded-xl focus:ring-2 focus:ring-purple-400 focus:outline-none font-bold">
                  <option>All Submissions</option>
                  <option>Weekly Plans</option>
                  <option>Daily Reports</option>
                </select>
              </div>

              <div className="px-8 py-5 border-b border-gray-200">
                <div className="flex gap-4">
                  <button 
                    onClick={() => setDashboardView('weekly')}
                    className={`px-6 py-3 font-bold rounded-xl transition-all ${
                      dashboardView === 'weekly' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                        : 'glass-card text-gray-600 hover:shadow-lg'
                    }`}
                  >
                    Weekly Plans ({allWeeklyPlans.length})
                  </button>
                  <button 
                    onClick={() => setDashboardView('daily')}
                    className={`px-6 py-3 font-bold rounded-xl transition-all ${
                      dashboardView === 'daily' 
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' 
                        : 'glass-card text-gray-600 hover:shadow-lg'
                    }`}
                  >
                    Daily Reports ({allDailyReports.length})
                  </button>
                </div>
              </div>

              <div className="p-8">
                {dashboardLoading ? (
                  <div className="text-center py-16">
                    <div className="animate-spin w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600 font-bold">Loading data...</p>
                  </div>
                ) : dashboardView === 'weekly' ? (
                  // Weekly Plans View
                  allWeeklyPlans.length === 0 ? (
                    <div className="text-center py-16">
                      <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-xl font-bold">No weekly plans found</p>
                      <p className="text-gray-500 font-medium mt-2">Start by creating a weekly plan</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allWeeklyPlans.map((plan, idx) => (
                        <div key={idx} className="glass rounded-2xl p-6 border border-purple-100 hover:border-purple-300 hover:shadow-xl transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{plan.repName}</h3>
                              <p className="text-sm text-gray-600 font-medium">Week of {plan.weekStartDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">{plan.totalDoctors}</p>
                              <p className="text-xs text-gray-500 font-bold">Doctors Planned</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-medium">
                            Submitted: {new Date(plan.submittedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  // Daily Reports View
                  allDailyReports.length === 0 ? (
                    <div className="text-center py-16">
                      <CheckCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600 text-xl font-bold">No daily reports found</p>
                      <p className="text-gray-500 font-medium mt-2">Representatives haven't submitted reports yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {allDailyReports.map((report, idx) => (
                        <div key={idx} className="glass rounded-2xl p-6 border border-green-100 hover:border-green-300 hover:shadow-xl transition-all">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-gray-900 text-lg">{report.repName}</h3>
                              <p className="text-sm text-gray-600 font-medium">Date: {report.reportDate}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{report.totalVisits}</p>
                              <p className="text-xs text-gray-500 font-bold">Visits Made</p>
                            </div>
                          </div>
                          
                          {/* Show visits details */}
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold text-gray-700 mb-3">Doctors Visited:</p>
                            {report.visits.map((visit, vIdx) => (
                              <div key={vIdx} className="glass-card rounded-xl p-4 text-sm border border-gray-200">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-gray-900">{visit.doctorName}</span>
                                    {visit.specialty && (
                                      <span className="text-gray-600 ml-2">• {visit.specialty}</span>
                                    )}
                                    {visit.location && (
                                      <span className="text-gray-600 ml-2">• {visit.location}</span>
                                    )}
                                  </div>
                                </div>
                                {visit.feedback && (
                                  <p className="text-xs text-gray-600 mt-2 font-medium">💬 {visit.feedback}</p>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="text-xs text-gray-500 mt-4 font-medium">
                            Submitted: {new Date(report.submittedAt).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      </>
      )}
    </div>
  );
};

export default MedicalRepsPortal;
