import React, { useState } from 'react';
import { Language, UserProfile, Page, DayOfWeek } from '../types';
import { TRANSLATIONS, DAYS_OF_WEEK } from '../constants';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getHealthAdvice } from '../services/geminiService';
import { Button } from './Button';
import { Sparkles, Plus, Save, CheckCircle, AlertCircle } from 'lucide-react';

interface DashboardProps {
  user: UserProfile;
  language: Language;
  onNavigate: (page: Page) => void;
  completedMealsCount: number;
  completedExercisesCount: number;
  currentDay: DayOfWeek;
  onLogWeight: (weight: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  user, language, onNavigate, completedMealsCount, completedExercisesCount, currentDay, onLogWeight 
}) => {
  const t = TRANSLATIONS[language];
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showWeightInput, setShowWeightInput] = useState(false);
  const [newWeight, setNewWeight] = useState(user.weight.toString());

  const currentDayLabel = language === Language.ENGLISH 
    ? DAYS_OF_WEEK.find(d => d.key === currentDay)?.labelEn 
    : DAYS_OF_WEEK.find(d => d.key === currentDay)?.labelAm;

  const heightM = user.height / 100;
  const bmi = (user.weight / (heightM * heightM)).toFixed(1);

  // Weight History Logic
  const sortedHistory = [...(user.weightHistory || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Use the static startWeight from profile
  const startWeight = user.startWeight;
  
  // Progress Calculation
  const totalToLose = startWeight - user.targetWeight;
  const lostSoFar = startWeight - user.weight;
  // Progress is 0 if no weight lost or gained, caps at 100
  const progressPercent = totalToLose > 0 
    ? Math.min(100, Math.max(0, (lostSoFar / totalToLose) * 100)) 
    : 0;
  
  // On Track logic: Strictly checks if weight loss has occurred (current weight < start weight).
  // If weight is same or increased, it is considered "Needs Focus".
  const isOnTrack = user.weight < startWeight;

  // Prepare chart data (Last 7 entries)
  const chartData = sortedHistory.slice(-7).map(entry => {
    const dateObj = new Date(entry.date);
    const label = `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
    return { name: label, weight: entry.weight };
  });

  if (chartData.length === 0) {
    chartData.push({ name: 'Start', weight: user.weight });
  }

  const mealProgress = Math.min(100, (completedMealsCount / 3) * 100);
  const exerciseProgress = Math.min(100, (completedExercisesCount / 30) * 100);

  const handleAskAi = async () => {
    if (!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiResponse('');
    try {
      const context = `User is ${user.age} years old female, ${user.weight}kg, ${user.height}cm tall. Goal: ${user.targetWeight}kg.`;
      const response = await getHealthAdvice(aiQuery, language, context);
      setAiResponse(response);
    } finally {
      setLoadingAi(false);
    }
  };

  const saveWeight = () => {
    const w = parseFloat(newWeight);
    if (!isNaN(w) && w > 0) {
      onLogWeight(w);
      setShowWeightInput(false);
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary to-rose-500 rounded-2xl p-6 text-white shadow-xl shadow-pink-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t.welcome}, {user.name}</h2>
            <p className="opacity-90 text-sm mb-4">{t.subtitle}</p>
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold backdrop-blur-sm">
             {currentDayLabel}
          </div>
        </div>
        
        <div className="flex justify-between items-end">
          <div>
             <span className="text-3xl font-bold">{user.weight}</span>
             <span className="text-sm ml-1">kg</span>
             <div className="text-xs opacity-80">{t.currentWeight}</div>
          </div>
           <div className="text-right">
             <span className="text-xl font-bold">{bmi}</span>
             <div className="text-xs opacity-80">{t.bmi}</div>
          </div>
        </div>
      </div>

      {/* Daily Progress Rings */}
      <div className="grid grid-cols-2 gap-4">
        <div 
          onClick={() => onNavigate(Page.DIET)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative w-16 h-16 mb-2">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
              <circle 
                cx="32" cy="32" r="28" 
                stroke="#14b8a6" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={175.9} 
                strokeDashoffset={175.9 - (175.9 * mealProgress) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-teal-600 font-bold text-sm">
               {Math.round(mealProgress)}%
            </div>
          </div>
          <span className="text-sm font-bold text-gray-700">{t.diet}</span>
          <span className="text-xs text-gray-400">{completedMealsCount}/3 {t.meals}</span>
        </div>

        <div 
          onClick={() => onNavigate(Page.EXERCISE)}
          className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer active:scale-95 transition-transform"
        >
          <div className="relative w-16 h-16 mb-2">
             <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="#f3f4f6" strokeWidth="6" fill="transparent" />
              <circle 
                cx="32" cy="32" r="28" 
                stroke="#ec4899" 
                strokeWidth="6" 
                fill="transparent" 
                strokeDasharray={175.9} 
                strokeDashoffset={175.9 - (exerciseProgress) / 100 * 175.9}
                strokeLinecap="round"
              />
            </svg>
             <div className="absolute inset-0 flex items-center justify-center text-pink-600 font-bold text-sm">
               {Math.round(exerciseProgress)}%
            </div>
          </div>
          <span className="text-sm font-bold text-gray-700">{t.exercise}</span>
           <span className="text-xs text-gray-400">{completedExercisesCount}/30 Days</span>
        </div>
      </div>

      {/* Weight Tracker Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-6">
        
        {/* Header & Log Button */}
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-gray-800">{t.weightTracker}</h3>
          {!showWeightInput ? (
            <button 
              onClick={() => setShowWeightInput(true)}
              className="text-xs flex items-center gap-1 bg-pink-50 text-pink-600 px-2 py-1 rounded-lg hover:bg-pink-100 font-bold"
            >
              <Plus size={14} /> {t.logWeight}
            </button>
          ) : (
             <div className="flex items-center gap-2">
                <input 
                  type="number" 
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  className="w-20 px-2 py-1 text-sm border border-pink-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="kg"
                />
                <button 
                  onClick={saveWeight}
                  className="bg-primary text-white p-1 rounded-lg"
                >
                  <Save size={16} />
                </button>
             </div>
          )}
        </div>
        
        {/* Progress Bar & Stats */}
        <div>
           <div className="flex justify-between items-end mb-2">
              <span className="text-xs text-gray-500 font-medium">{t.startingWeight}: {startWeight}kg</span>
              <span className="text-xs text-gray-500 font-medium">{t.targetWeight}: {user.targetWeight}kg</span>
           </div>
           <div className="h-4 bg-gray-100 rounded-full overflow-hidden relative">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-1000"
                style={{ width: `${progressPercent}%` }}
              ></div>
           </div>
           <div className="flex justify-between items-start mt-2">
              <div>
                <span className="text-2xl font-bold text-gray-800">{lostSoFar > 0 ? '-' : '+'}{Math.abs(lostSoFar).toFixed(1)} <span className="text-sm font-normal text-gray-500">kg</span></span>
                <p className="text-xs text-gray-400 uppercase tracking-wide">{t.totalLoss}</p>
              </div>
              <div className={`px-2 py-1 rounded-lg flex items-center gap-1 text-xs font-bold ${isOnTrack ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                 {isOnTrack ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
                 {isOnTrack ? t.onTrack : t.offTrack}
              </div>
           </div>
        </div>

        {/* Chart */}
        <div className="h-40 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fill: '#9ca3af'}} />
              <YAxis hide domain={['dataMin - 1', 'dataMax + 1']} />
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area 
                type="monotone" 
                dataKey="weight" 
                stroke="#ec4899" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorWeight)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Recent History Table */}
        <div className="bg-gray-50 rounded-xl p-4">
           <h4 className="font-bold text-gray-700 mb-3 text-sm">{t.history}</h4>
           <div className="space-y-2">
             {sortedHistory.slice(-5).reverse().map((entry, idx, arr) => {
               // arr is the sliced reversed array. To find the previous weight (chronologically earlier),
               // we look at the NEXT item in this reversed array.
               // For the last item in this visual list (which is chronologically earliest of the slice),
               // we try to find it in the full sortedHistory to get its predecessor.
               
               let prevWeight = entry.weight; // default if no prev
               
               // If this visual entry has a 'next' item in the reversed array, that is its chronological predecessor
               if (idx < arr.length - 1) {
                  prevWeight = arr[idx + 1].weight;
               } else {
                  // This is the earliest item in our slice. Find its index in full history.
                  const fullIndex = sortedHistory.findIndex(h => h.date === entry.date);
                  if (fullIndex > 0) {
                     prevWeight = sortedHistory[fullIndex - 1].weight;
                  }
               }
               
               const diff = entry.weight - prevWeight;
               const isLoss = diff < 0;
               const isGain = diff > 0;
               const noChange = diff === 0;

               return (
                 <div key={entry.date} className="flex justify-between items-center text-sm border-b border-gray-100 last:border-0 pb-1 last:pb-0">
                   <span className="text-gray-500">{entry.date}</span>
                   <div className="flex items-center gap-4">
                      <span className="font-bold text-gray-800">{entry.weight} kg</span>
                      <span className={`text-xs font-bold w-12 text-right ${isLoss ? 'text-green-600' : isGain ? 'text-red-500' : 'text-gray-400'}`}>
                         {noChange ? '-' : `${isLoss ? '' : '+'}${diff.toFixed(1)}`}
                      </span>
                   </div>
                 </div>
               );
             })}
           </div>
        </div>

      </div>

      {/* AI Coach Section */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="bg-purple-100 p-1.5 rounded-lg">
            <Sparkles className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-800">{t.aiCoach}</h3>
        </div>
        
        <div className="space-y-3">
          {aiResponse && (
            <div className="bg-purple-50 p-3 rounded-xl text-sm text-purple-900 leading-relaxed animate-in fade-in">
              {aiResponse}
            </div>
          )}
          
          <div className="flex gap-2">
            <input 
              type="text" 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder={t.askAiPlaceholder}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
            <Button onClick={handleAskAi} disabled={loadingAi} className="!p-2">
               {loadingAi ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Sparkles size={20} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
