import React, { useState } from 'react';
import { GlassPane } from './GlassPane';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Search, BarChart3, FileText, Zap, Globe, ArrowRight, Download, Loader2 } from 'lucide-react';

export const SEOManager: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'KEYWORDS' | 'HEATMAPS' | 'AUDIT'>('KEYWORDS');
    const [targetUrl, setTargetUrl] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [keywords, setKeywords] = useState([
        { term: 'marketing agency automation', vol: '1.2K', diff: 'High', cpc: '$12.50' },
        { term: 'ai for agencies', vol: '850', diff: 'Med', cpc: '$8.20' },
        { term: 'white label gohighlevel', vol: '2.4K', diff: 'High', cpc: '$15.00' },
        { term: 'agency fulfillment services', vol: '500', diff: 'Low', cpc: '$5.50' },
    ]);

    const handleAnalyze = () => {
        if (!targetUrl) return;
        setIsAnalyzing(true);
        // Mock delay
        setTimeout(() => setIsAnalyzing(false), 2000);
    };

    return (
        <div className="h-full flex flex-col gap-6 p-4 overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Globe className="w-6 h-6 text-indigo-600" />
                        SEO & Advanced Reporting
                    </h2>
                    <p className="text-slate-500 text-sm">AI-powered insights, keyword analysis, and technical audits.</p>
                </div>
                <div className="flex items-center gap-2 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
                    <Zap className="w-4 h-4 text-indigo-600 fill-indigo-600" />
                    <span className="text-xs font-bold text-indigo-700">Premium Credits: 450</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-200 shrink-0">
                <button
                    onClick={() => setActiveTab('KEYWORDS')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'KEYWORDS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Search className="w-4 h-4" /> Keyword Analysis
                </button>
                <button
                    onClick={() => setActiveTab('HEATMAPS')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'HEATMAPS' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <BarChart3 className="w-4 h-4" /> Heatmaps
                </button>
                <button
                    onClick={() => setActiveTab('AUDIT')}
                    className={`px-4 py-2 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'AUDIT' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <FileText className="w-4 h-4" /> AI Audit Reports
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-h-0">

                {/* KEYWORD ANALYSIS */}
                {activeTab === 'KEYWORDS' && (
                    <div className="flex flex-col gap-6 h-full">
                        <GlassPane className="p-6 shrink-0">
                            <div className="flex gap-4 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label>Target Topic or Domain</Label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="e.g. dental marketing, yourcompetitor.com"
                                            className="pl-10"
                                            value={targetUrl}
                                            onChange={(e) => setTargetUrl(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <Button
                                    onClick={handleAnalyze}
                                    disabled={isAnalyzing || !targetUrl}
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[120px]"
                                >
                                    {isAnalyzing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Analyze'}
                                </Button>
                            </div>
                        </GlassPane>

                        <GlassPane title="Keyword Opportunities" className="flex-1 p-0 overflow-hidden flex flex-col">
                            <div className="grid grid-cols-4 gap-4 p-4 border-b border-slate-100 bg-slate-50 font-bold text-xs text-slate-500 uppercase tracking-wider">
                                <div>Keyword</div>
                                <div>Volume</div>
                                <div>Difficulty</div>
                                <div>CPC</div>
                            </div>
                            <div className="overflow-y-auto flex-1">
                                {keywords.map((k, i) => (
                                    <div key={i} className="grid grid-cols-4 gap-4 p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors items-center">
                                        <div className="font-medium text-slate-700">{k.term}</div>
                                        <div className="text-slate-500">{k.vol}</div>
                                        <div>
                                            <Badge variant="outline" className={`${k.diff === 'High' ? 'bg-red-50 text-red-600 border-red-200' :
                                                    k.diff === 'Med' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' :
                                                        'bg-green-50 text-green-600 border-green-200'
                                                }`}>
                                                {k.diff}
                                            </Badge>
                                        </div>
                                        <div className="text-slate-500">{k.cpc}</div>
                                    </div>
                                ))}
                            </div>
                        </GlassPane>
                    </div>
                )}

                {/* HEATMAPS */}
                {activeTab === 'HEATMAPS' && (
                    <div className="h-full flex flex-col items-center justify-center text-center p-12 space-y-6">
                        <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                            <BarChart3 className="w-12 h-12 text-indigo-600" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Visual User Intelligence</h3>
                        <p className="text-slate-500 max-w-md">
                            Generate heatmaps and scroll maps to understand how users interact with your client's landing pages.
                        </p>
                        <div className="flex gap-4">
                            <Input placeholder="Enter Landing Page URL" className="w-80" />
                            <Button className="bg-indigo-600 text-white">Generate Heatmap (50 Credits)</Button>
                        </div>
                        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800 max-w-lg">
                            <strong>Note:</strong> Requires installation of the tracking pixel on the target site.
                        </div>
                    </div>
                )}

                {/* AI AUDIT */}
                {activeTab === 'AUDIT' && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                        <div className="flex flex-col gap-6">
                            <GlassPane title="New Audit" className="p-6 space-y-6">
                                <div className="space-y-2">
                                    <Label>Website URL</Label>
                                    <Input placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label>Audit Type</Label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="border rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                            <div className="font-bold text-slate-700 mb-1">Technical SEO</div>
                                            <div className="text-xs text-slate-500">Speed, Tags, Structure</div>
                                        </div>
                                        <div className="border rounded-lg p-4 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-all">
                                            <div className="font-bold text-slate-700 mb-1">Content & Gaps</div>
                                            <div className="text-xs text-slate-500">Quality, Keywords, Relevance</div>
                                        </div>
                                    </div>
                                </div>
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-6">
                                    <Zap className="w-4 h-4 mr-2 fill-yellow-400 text-yellow-400" />
                                    Run Deep Audit (100 Credits)
                                </Button>
                            </GlassPane>
                        </div>

                        <GlassPane title="Recent Reports" className="flex-1 p-0 overflow-hidden flex flex-col">
                            <div className="overflow-y-auto flex-1 p-4 space-y-3">
                                {[
                                    { site: 'client-dental.com', date: '2 hours ago', score: 85 },
                                    { site: 'law-firm-nyc.com', date: 'Yesterday', score: 62 },
                                    { site: 'roofing-pros.net', date: '3 days ago', score: 94 },
                                ].map((report, i) => (
                                    <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
                                        <div>
                                            <div className="font-bold text-slate-800">{report.site}</div>
                                            <div className="text-xs text-slate-500">{report.date}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className={`font-bold text-lg ${report.score >= 90 ? 'text-green-600' :
                                                    report.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                                                }`}>
                                                {report.score}
                                            </div>
                                            <Button variant="ghost" size="icon">
                                                <Download className="w-4 h-4 text-slate-400" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </GlassPane>
                    </div>
                )}

            </div>
        </div>
    );
};
