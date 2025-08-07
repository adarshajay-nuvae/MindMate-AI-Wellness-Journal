
import React, { useState, useEffect, useCallback } from 'react';
import type { JournalEntry, Analysis, View, CognitiveDistortion } from './types';
import { analyzeEntry } from './services/aiService';
import { BrainIcon, FileTextIcon, LightBulbIcon, ChartBarIcon, PlusIcon, QuestionMarkCircleIcon, FlagIcon } from './constants';
import LandingPage from './src/components/LandingPage';
import Insights from './src/components/Insights';

// --- Helper Components ---

const Spinner = () => (
    <div className="flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-primary"></div>
    </div>
);

interface AnalysisCardProps {
    icon: React.ReactNode;
    title: string;
    content: string;
    color: string;
}

const AnalysisCard: React.FC<AnalysisCardProps> = ({ icon, title, content, color }) => (
    <div className="bg-white/50 backdrop-blur-lg p-4 rounded-lg shadow-md flex items-start space-x-4">
        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${color}`}>
            {icon}
        </div>
        <div>
            <h3 className="font-semibold text-gray-700">{title}</h3>
            <p className="text-gray-600">{content}</p>
        </div>
    </div>
);

interface CognitiveDistortionDisplayProps {
    distortions: CognitiveDistortion[];
}

const CognitiveDistortionDisplay: React.FC<CognitiveDistortionDisplayProps> = ({ distortions }) => {
    if (!distortions || distortions.length === 0) {
        return null;
    }

    return (
        <div className="bg-white/50 backdrop-blur-lg p-4 rounded-lg shadow-md">
            <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-orange-400">
                    <FlagIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-semibold text-gray-700">Thought Patterns Noticed</h3>
                    <p className="text-sm text-gray-600 mb-3">Being aware of thought patterns is the first step to reframing them. Here's what we spotted:</p>
                    <div className="space-y-3">
                        {distortions.map((d, index) => (
                            <div key={index} className="border-l-4 border-orange-300 pl-3">
                                <h4 className="font-bold text-gray-800">{d.name}</h4>
                                <p className="text-sm text-gray-600 italic mt-1">"{d.example}"</p>
                                <p className="text-sm text-gray-600 mt-1">{d.explanation}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


// --- Main UI Components ---

interface AnalysisDisplayProps {
    analysis: Analysis;
}
const AnalysisDisplay: React.FC<AnalysisDisplayProps> = ({ analysis }) => (
    <div className="space-y-4 mt-6">
        <h2 className="text-xl font-bold text-gray-800">Analysis Results</h2>
        <AnalysisCard
            icon={<BrainIcon className="w-6 h-6 text-white" />}
            title="Mood"
            content={analysis.mood}
            color="bg-purple-400"
        />
        <AnalysisCard
            icon={<FileTextIcon className="w-6 h-6 text-white" />}
            title="Summary"
            content={analysis.summary}
            color="bg-blue-400"
        />
        <AnalysisCard
            icon={<LightBulbIcon className="w-6 h-6 text-white" />}
            title="Wellness Tip"
            content={analysis.tip}
            color="bg-green-400"
        />
        <CognitiveDistortionDisplay distortions={analysis.cognitiveDistortions || []} />
    </div>
);

interface JournalEditorProps {
    onSave: (entry: JournalEntry) => void;
    setView: (view: View) => void;
}
const JournalEditor: React.FC<JournalEditorProps> = ({ onSave, setView }) => {
    const [text, setText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analysis, setAnalysis] = useState<Analysis | null>(null);

    const handleAnalyze = async () => {
        if (!text.trim()) {
            setError("Journal entry cannot be empty.");
            return;
        }
        setIsLoading(true);
        setError(null);
        setAnalysis(null);
        try {
            const result = await analyzeEntry(text);
            setAnalysis(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An unknown error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = () => {
        if (!analysis) return;
        const newEntry: JournalEntry = {
            id: new Date().toISOString(),
            date: new Date().toISOString(),
            text,
            analysis,
        };
        onSave(newEntry);
        setView('dashboard');
    };

    return (
        <div className="p-4 md:p-6 space-y-4 animate-fade-in">
            <h2 className="text-2xl font-bold text-gray-800">How are you feeling today?</h2>
            <textarea
                className="w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all duration-300 ease-in-out"
                rows={10}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Write about your day, your thoughts, your feelings..."
                aria-label="Journal Entry Input"
            />
            {error && <p className="text-red-500 text-center">{error}</p>}
            <div className="flex flex-col sm:flex-row gap-2">
                 <button
                    onClick={handleAnalyze}
                    disabled={isLoading}
                    className="flex-1 bg-brand-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-primary/90 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                    {isLoading ? <Spinner /> : "Analyze Entry"}
                </button>
                {analysis && (
                    <button
                        onClick={handleSave}
                        className="flex-1 bg-brand-secondary text-white font-bold py-3 px-4 rounded-lg hover:bg-brand-secondary/90 transition-colors animate-fade-in"
                    >
                        Save Journal
                    </button>
                )}
            </div>
            {isLoading && !analysis && (
                <div className="text-center text-gray-500">
                    <p>Analyzing your thoughts...</p>
                </div>
            )}
            {analysis && <AnalysisDisplay analysis={analysis} />}
        </div>
    );
};

interface JournalEntryCardProps {
    entry: JournalEntry;
}
const JournalEntryCard: React.FC<JournalEntryCardProps> = ({ entry }) => (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer">
        <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        <p className="font-semibold text-gray-700 mt-1">Mood: {entry.analysis.mood}</p>
        <p className="text-gray-600 mt-2 truncate">{entry.text}</p>
    </div>
);

interface DashboardProps {
    entries: JournalEntry[];
    setView: (view: View) => void;
}
const Dashboard: React.FC<DashboardProps> = ({ entries, setView }) => {
    const latestPrompt = entries[0]?.analysis.reflectionPrompt;

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
                <button
                    onClick={() => setView('editor')}
                    className="bg-brand-primary text-white font-bold py-2 px-4 rounded-full hover:bg-brand-primary/90 transition-colors shadow-lg flex items-center gap-2"
                >
                    <PlusIcon className="w-5 h-5" />
                    New Entry
                </button>
            </div>

            {latestPrompt && (
                 <div className="bg-purple-100 border-l-4 border-purple-500 text-purple-700 p-4 rounded-r-lg" role="alert">
                    <div className="flex">
                        <div className="py-1"><QuestionMarkCircleIcon className="h-6 w-6 text-purple-500 mr-4"/></div>
                        <div>
                            <p className="font-bold">A prompt for your next reflection</p>
                            <p className="text-sm">{latestPrompt}</p>
                        </div>
                    </div>
                </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Total Entries</h3>
                    <p className="text-4xl font-bold text-brand-primary">{entries.length}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md text-center">
                    <h3 className="text-lg font-semibold text-gray-700">Last Entry</h3>
                    <p className="text-md text-gray-600">{entries.length > 0 ? new Date(entries[0].date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Recent Entries</h2>
                {entries.length > 0 ? (
                    <div className="space-y-4">
                        {entries.slice(0, 5).map(entry => (
                           <JournalEntryCard key={entry.id} entry={entry} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-white rounded-lg shadow-md">
                        <p className="text-gray-500">You have no journal entries yet.</p>
                        <button
                            onClick={() => setView('editor')}
                            className="mt-4 bg-brand-secondary text-white font-bold py-2 px-4 rounded-lg hover:bg-brand-secondary/90 transition-colors"
                        >
                            Write your first entry
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};


// --- Main App Component ---

const App = () => {
    const [view, setView] = useState<View>('dashboard');
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showLanding, setShowLanding] = useState(true);

    // Load entries from local storage on initial render
    useEffect(() => {
        try {
            const savedEntries = localStorage.getItem('mindmate_entries');
            if (savedEntries) {
                // Sort entries by date descending to ensure latest is first
                const parsedEntries = JSON.parse(savedEntries);
                parsedEntries.sort((a: JournalEntry, b: JournalEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
                setEntries(parsedEntries);
            }
        } catch (error) {
            console.error("Failed to load entries from local storage", error);
        }
    }, []);

    // Save entries to local storage whenever they change
    useEffect(() => {
        try {
            localStorage.setItem('mindmate_entries', JSON.stringify(entries));
        } catch (error) {
            console.error("Failed to save entries to local storage", error);
        }
    }, [entries]);

    const addEntry = (entry: JournalEntry) => {
        // Add new entry to the start of the array
        const newEntries = [entry, ...entries];
        setEntries(newEntries);
    };
    
    const handleGetStarted = () => {
        setShowLanding(false);
    };

    if (showLanding) {
        return <LandingPage onGetStarted={handleGetStarted} />;
    }
    
    const NavItem = ({ currentView, targetView, label, icon }: { currentView: View, targetView: View, label: string, icon: React.ReactNode}) => (
        <button
            onClick={() => setView(targetView)}
            className={`flex flex-col items-center justify-center space-y-1 p-2 rounded-lg w-24 transition-colors ${
              currentView === targetView ? 'bg-brand-primary/20 text-brand-primary' : 'text-gray-500 hover:bg-gray-100'
            }`}
            aria-current={currentView === targetView}
        >
            {icon}
            <span className="text-xs font-medium">{label}</span>
        </button>
    );

    return (
        <div className="bg-gray-50 min-h-screen font-sans flex flex-col">
            <main className="flex-grow container mx-auto max-w-4xl py-4 pb-24">
                {view === 'dashboard' && <Dashboard entries={entries} setView={setView} />}
                {view === 'editor' && <JournalEditor onSave={addEntry} setView={setView} />}
                {view === 'insights' && <Insights entries={entries} />}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 bg-white/70 backdrop-blur-lg shadow-t border-t border-gray-200 z-50">
                <nav className="container mx-auto max-w-4xl flex justify-around p-2">
                    <NavItem currentView={view} targetView="dashboard" label="Dashboard" icon={<ChartBarIcon className="w-6 h-6" />} />
                    <NavItem currentView={view} targetView="editor" label="New Entry" icon={<PlusIcon className="w-6 h-6" />} />
                    <NavItem currentView={view} targetView="insights" label="Insights" icon={<BrainIcon className="w-6 h-6" />} />
                </nav>
            </footer>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default App;
