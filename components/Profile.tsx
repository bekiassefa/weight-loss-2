import React, { useState } from 'react';
import { Language, UserProfile } from '../types';
import { TRANSLATIONS } from '../constants';
import { Button } from './Button';
import { Settings, LogOut, FileText } from 'lucide-react';

interface ProfileProps {
  user: UserProfile;
  language: Language;
}

export const Profile: React.FC<ProfileProps> = ({ user, language }) => {
  const t = TRANSLATIONS[language];
  const [weight, setWeight] = useState(user.weight.toString());
  const [height, setHeight] = useState(user.height.toString());

  // Calculate BMI
  const hM = parseFloat(height) / 100;
  const wKg = parseFloat(weight);
  let bmiVal = 0;
  if (hM > 0 && wKg > 0) {
    bmiVal = wKg / (hM * hM);
  }
  const bmi = bmiVal.toFixed(1);

  // Determine Category and Color
  let category = '';
  let colorClass = '';
  // Yellow zone for Underweight (< 18.5) and Overweight (25-30)
  // Green zone for Healthy (18.5 - 25)
  // Red zone for Obese (>= 30)
  
  if (bmiVal < 18.5) {
    category = t.underweight;
    colorClass = 'text-yellow-500'; 
  } else if (bmiVal < 25) {
    category = t.healthy;
    colorClass = 'text-green-500';
  } else if (bmiVal < 30) {
    category = t.overweight;
    colorClass = 'text-yellow-600';
  } else {
    category = t.obese;
    colorClass = 'text-red-500';
  }

  // Calculate Ideal Weight Range (BMI 18.5 - 24.9)
  const minIdeal = (18.5 * hM * hM).toFixed(1);
  const maxIdeal = (24.9 * hM * hM).toFixed(1);

  // Position indicator for the gauge (Range 10 to 40)
  // 10 is 0%, 40 is 100%
  const position = Math.max(0, Math.min(100, ((bmiVal - 10) / 30) * 100));

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center text-primary font-bold text-3xl">
          {user.name.charAt(0)}
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
          <p className="text-sm text-gray-500">{user.age} Years Old</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4">{t.bmi} Calculator</h3>
        
        {/* Input Fields */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Weight (kg)</label>
            <input 
              type="number" 
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">Height (cm)</label>
            <input 
              type="number" 
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              className="w-full p-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* BMI Result Display */}
        <div className="bg-soft p-4 rounded-xl text-center mb-6">
           <span className="text-sm text-gray-600 block mb-1">Your BMI is</span>
           <div className={`text-4xl font-extrabold ${colorClass} mb-1`}>{bmi}</div>
           <span className={`text-sm font-bold ${colorClass} uppercase tracking-wide`}>
             {category}
           </span>
        </div>

        {/* Visual Gauge */}
        <div className="relative mb-6">
          {/* Color Bar */}
          <div className="h-3 w-full rounded-full flex overflow-hidden">
             {/* Underweight: 10 - 18.5 (approx 28% of width 30 units) */}
             <div className="w-[28%] bg-yellow-400 h-full"></div>
             {/* Healthy: 18.5 - 25 (approx 22% of width) */}
             <div className="w-[22%] bg-green-500 h-full"></div>
             {/* Overweight: 25 - 30 (approx 17% of width) */}
             <div className="w-[17%] bg-yellow-500 h-full"></div>
             {/* Obese: 30 - 40 (approx 33% of width) */}
             <div className="w-[33%] bg-red-500 h-full"></div>
          </div>
          
          {/* Indicator Triangle */}
          <div 
            className="absolute -top-1 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-800 transition-all duration-500"
            style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
          ></div>

          {/* Scale Labels */}
          <div className="flex justify-between text-[10px] text-gray-400 mt-1 font-mono">
            <span>10</span>
            <span className="pl-4">18.5</span>
            <span className="pl-2">25</span>
            <span className="pl-2">30</span>
            <span>40</span>
          </div>
        </div>

        {/* Ideal Weight Box */}
        <div className="border border-green-200 bg-green-50 rounded-lg p-3 flex justify-between items-center">
           <span className="text-sm font-medium text-green-800">{t.idealWeight}</span>
           <span className="text-lg font-bold text-green-700">{minIdeal} - {maxIdeal} kg</span>
        </div>

      </div>

      <div className="space-y-2">
        <button className="w-full p-4 bg-white rounded-xl flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50">
          <div className="flex items-center gap-3">
             <FileText size={20} className="text-gray-400" />
             <span className="font-medium text-gray-700">Download Guidelines (PDF)</span>
          </div>
        </button>
        <button className="w-full p-4 bg-white rounded-xl flex items-center justify-between shadow-sm border border-gray-100 hover:bg-gray-50">
          <div className="flex items-center gap-3">
             <Settings size={20} className="text-gray-400" />
             <span className="font-medium text-gray-700">Settings</span>
          </div>
        </button>
      </div>
      
      <Button variant="outline" className="w-full border-red-200 text-red-500 hover:bg-red-50">
        <LogOut size={18} className="mr-2 inline" /> Sign Out
      </Button>
    </div>
  );
};