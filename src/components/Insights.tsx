import React, { useState, useEffect, useCallback } from 'react';
import type { JournalEntry } from '../types';

interface InsightsProps {
  entries: JournalEntry[];
}

const Insights: React.FC<InsightsProps> = ({ entries }) => {
  const [recharts, setRecharts] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRecharts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check if Recharts is already loaded
        if (window.Recharts) {
          setRecharts(window.Recharts);
          setIsLoading(false);
          return;
        }

        // Wait a bit for the script to load
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds total
        
        const checkRecharts = () => {
          attempts++;
          if (window.Recharts) {
            setRecharts(window.Recharts);
            setIsLoading(false);
          } else if (attempts < maxAttempts) {
            setTimeout(checkRecharts, 100);
          } else {
            setError('Failed to load charts library. Please refresh the page.');
            setIsLoading(false);
          }
        };
        
        checkRecharts();
      } catch (err) {
        setError('Error loading charts library');
        setIsLoading(false);
      }
    };

    loadRecharts();
  }, []);

  const getMoodColor = (mood: string) => {
    const lowerMood = mood.toLowerCase();
    if (lowerMood.includes('happy') || lowerMood.includes('joy') || lowerMood.includes('excited') || lowerMood.includes('grateful')) return '#4ade80'; // green-400
    if (lowerMood.includes('sad') || lowerMood.includes('down') || lowerMood.includes('depressed')) return '#60a5fa'; // blue-400
    if (lowerMood.includes('anxious') || lowerMood.includes('stressed') || lowerMood.includes('overwhelmed')) return '#facc15'; // yellow-400
    if (lowerMood.includes('angry') || lowerMood.includes('frustrated')) return '#f87171'; // red-400
    if (lowerMood.includes('calm') || lowerMood.includes('relaxed') || lowerMood.includes('peaceful')) return '#c084fc'; // purple-400
    return '#9ca3af'; // gray-400
  };
  
  const processChartData = useCallback((journalEntries: JournalEntry[]) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const recentEntries = journalEntries.filter(entry => new Date(entry.date) >= sevenDaysAgo);

    const dataByDate: { [key: string]: { date: string; moods: { [mood: string]: number } } } = {};

    recentEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      const dateKey = entryDate.toISOString().split('T')[0];
      
      if (!dataByDate[dateKey]) {
        dataByDate[dateKey] = {
          date: entryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          moods: {},
        };
      }
      
      const mood = entry.analysis.mood;
      dataByDate[dateKey].moods[mood] = (dataByDate[dateKey].moods[mood] || 0) + 1;
    });

    const sortedData = Object.entries(dataByDate)
      .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
      .map(([, value]) => value);

    return sortedData;
  }, []);

  const chartData = processChartData(entries);
  const allMoods = [...new Set(entries.flatMap(e => e.analysis.mood))];

  if (isLoading) {
    return (
      <div className="p-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mood Timeline (Last 7 Days)</h1>
        <div className="bg-white p-8 rounded-lg shadow-md w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary mx-auto mb-4"></div>
            <p className="text-gray-500">Loading charts...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Mood Timeline (Last 7 Days)</h1>
        <div className="bg-white p-8 rounded-lg shadow-md w-full h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-500 font-semibold mb-2">Chart Loading Error</p>
            <p className="text-gray-600 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  if (entries.length === 0) {
    return (
      <div className="p-6 text-center bg-white rounded-lg shadow-md animate-fade-in">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Mood Timeline</h2>
        <p className="text-gray-500">No entries yet. Write a journal to see your mood timeline.</p>
      </div>
    );
  }
  
  const { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } = recharts;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg shadow-lg">
          <p className="font-bold text-gray-800 mb-2">{label}</p>
          {payload.map((pld: any, index: number) => (
            <div key={index} className="flex items-center gap-2" style={{ color: pld.fill }}>
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pld.fill }}></div>
              <span className="text-sm">{`${pld.name}: ${pld.value}`}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Mood Timeline (Last 7 Days)</h1>
      <div className="bg-white p-6 rounded-lg shadow-md w-full h-96">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                allowDecimals={false} 
                stroke="#6b7280" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
              {allMoods.map((mood) => (
                <Bar 
                  key={mood} 
                  dataKey={`moods.${mood}`} 
                  stackId="a" 
                  name={mood} 
                  fill={getMoodColor(mood)}
                  radius={[2, 2, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-gray-500">No entries in the last 7 days to display.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Insights;