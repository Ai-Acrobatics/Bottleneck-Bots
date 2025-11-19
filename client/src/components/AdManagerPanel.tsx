import React, { useState } from 'react';
import { GlassPane } from './GlassPane';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Megaphone, Lock, Upload, Zap, ExternalLink, Eye, MousePointer2, RefreshCw } from 'lucide-react';

export const AdManagerPanel: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'ANALYZE' | 'EDIT' | 'AUTH'>('ANALYZE');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [adScreenshot, setAdScreenshot] = useState<File | null>(null);
    const [passwordManagerConnected, setPasswordManagerConnected] = useState(false);

    const handleAnalyze = () => {
        if (!adScreenshot) return;
        setIsAnalyzing(true);
        setTimeout(() => setIsAnalyzing(false), 2500);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Megaphone className="w-6 h-6 text-pink-600" />
                        AI Ad Manager
                    </h2>
                    <p className="text-slate-500 text-sm">Analyze performance and automate ad optimization on Meta.</p>
                </div>
                <div className="flex items-center gap-2 bg-pink-50 px-3 py-1 rounded-full border border-pink-100">
                    <Zap className="w-4 h-4 text-pink-600 fill-pink-600" />
                    <span className="text-xs font-bold text-pink-700">Premium Credits: 450</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 shrink-0">
                <button
                    onClick={() => setActiveTab('ANALYZE')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'ANALYZE' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Eye className="w-4 h-4" /> Analyze Ads
                </button>
                <button
                    onClick={() => setActiveTab('EDIT')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'EDIT' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <MousePointer2 className="w-4 h-4" /> Auto-Edit
                </button>
                <button
                    onClick={() => setActiveTab('AUTH')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'AUTH' ? 'border-pink-600 text-pink-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Lock className="w-4 h-4" /> Secure Auth
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">

                {/* ANALYZE TAB */}
                {activeTab === 'ANALYZE' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        <div className="flex flex-col gap-6">
                            <GlassPane title="Upload Ad Dashboard" className="p-6 space-y-6">
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                        onChange={(e) => setAdScreenshot(e.target.files?.[0] || null)}
                                    />
                                    <Upload className="w-10 h-10 text-slate-400 mx-auto mb-4" />
                                    <p className="text-sm font-medium text-slate-700">
                                        {adScreenshot ? adScreenshot.name : "Drop screenshot of Meta Ads Manager"}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-2">AI will extract CPC, CTR, and ROAS data.</p>
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={!adScreenshot || isAnalyzing}
                                    className="w-full bg-pink-600 hover:bg-pink-700 text-white py-6"
                                >
                                    {isAnalyzing ? (
                                        <span className="flex items-center gap-2">
                                            <RefreshCw className="w-4 h-4 animate-spin" /> Analyzing Pixels...
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            <Zap className="w-4 h-4 fill-yellow-400 text-yellow-400" /> Analyze Performance (50 Credits)
                                        </span>
                                    )}
                                </Button>
                            </GlassPane>
                        </div>

                        <GlassPane title="AI Insights" className="flex-1 p-0 overflow-hidden flex flex-col bg-slate-50">
                            <div className="flex-1 flex items-center justify-center text-slate-400 p-8 text-center">
                                {isAnalyzing ? (
                                    <div className="space-y-4">
                                        <div className="w-12 h-12 border-4 border-pink-200 border-t-pink-600 rounded-full animate-spin mx-auto"></div>
                                        <p>Reading ad metrics from image...</p>
                                    </div>
                                ) : (
                                    <div>
                                        <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Upload a screenshot to see AI optimization suggestions.</p>
                                    </div>
                                )}
                            </div>
                        </GlassPane>
                    </div>
                )}

                {/* EDIT TAB */}
                {activeTab === 'EDIT' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                            <MousePointer2 className="w-12 h-12 text-pink-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Browser Automation Agent</h3>
                        <p className="text-slate-500 max-w-md">
                            The agent will log in to Meta Ads Manager, navigate to your ad sets, and apply text changes directly.
                        </p>
                        {!passwordManagerConnected && (
                            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Authentication required. Please connect Password Manager.
                            </div>
                        )}
                        <Button disabled={!passwordManagerConnected} className="bg-pink-600 text-white">
                            Start Edit Session
                        </Button>
                    </div>
                )}

                {/* AUTH TAB */}
                {activeTab === 'AUTH' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        <GlassPane title="Secure Authentication" className="p-6">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                                    <Lock className="w-5 h-5 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-800">Password Manager Integration</h3>
                                    <p className="text-sm text-slate-500 mt-1">
                                        Securely authorize the browser agent to access your ad accounts without sharing raw passwords.
                                        Supports 1Password and LastPass.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-indigo-300 transition-colors cursor-pointer" onClick={() => setPasswordManagerConnected(!passwordManagerConnected)}>
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/1Password_logo.svg/1200px-1Password_logo.svg.png" alt="1Password" className="w-8 h-8 object-contain" />
                                        <span className="font-medium text-slate-700">1Password Connect</span>
                                    </div>
                                    {passwordManagerConnected ? (
                                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Connected</Badge>
                                    ) : (
                                        <Button variant="outline" size="sm">Connect</Button>
                                    )}
                                </div>

                                <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between hover:border-red-300 transition-colors cursor-pointer">
                                    <div className="flex items-center gap-3">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/LastPass_Logo.svg/2560px-LastPass_Logo.svg.png" alt="LastPass" className="w-8 h-8 object-contain" />
                                        <span className="font-medium text-slate-700">LastPass Enterprise</span>
                                    </div>
                                    <Button variant="outline" size="sm">Connect</Button>
                                </div>
                            </div>
                        </GlassPane>
                    </div>
                )}

            </div>
        </div>
    );
};

// Helper icon component since BarChart3 wasn't imported
const BarChart3 = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);
