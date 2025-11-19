import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle, ArrowRight, Zap, ShieldAlert, Clock } from "lucide-react";

interface AlexRamozyPageProps {
    onDemoClick: () => void;
}

export function AlexRamozyPage({ onDemoClick }: AlexRamozyPageProps) {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-yellow-500 selection:text-black">
            {/* Hero Section */}
            <section className="relative pt-20 pb-32 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-800 via-black to-black opacity-50" />

                <div className="container relative z-10 mx-auto px-4 text-center">
                    <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-yellow-500/30 bg-yellow-500/10 text-yellow-400 font-bold uppercase tracking-wider text-sm animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        For Agency Owners Who Are Tired of Chaos
                    </div>

                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-8 leading-tight">
                        STOP RELYING ON <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-600">UNRELIABLE VAs</span>
                    </h1>

                    <p className="text-xl md:text-2xl text-neutral-400 max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
                        You didn't start an agency to babysit virtual assistants. <br className="hidden md:block" />
                        Reclaim your time, automate your workflow, and scale with <span className="text-white font-bold">absolute predictability</span>.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <Button
                            onClick={onDemoClick}
                            size="lg"
                            className="h-16 px-12 text-xl font-black uppercase tracking-wide bg-yellow-500 hover:bg-yellow-400 text-black border-0 rounded-xl shadow-[0_0_40px_-10px_rgba(234,179,8,0.6)] hover:shadow-[0_0_60px_-10px_rgba(234,179,8,0.8)] transition-all duration-300 transform hover:-translate-y-1"
                        >
                            See a Demo <ArrowRight className="ml-3 h-6 w-6" />
                        </Button>
                        <p className="text-sm text-neutral-500 font-medium">
                            No credit card required • Instant access
                        </p>
                    </div>
                </div>
            </section>

            {/* The Problem vs Solution Section */}
            <section className="py-24 bg-neutral-950">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl md:text-5xl font-black text-center mb-16 uppercase tracking-tight">
                        The <span className="text-red-500">Old Way</span> vs The <span className="text-green-500">New Way</span>
                    </h2>

                    <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                        {/* The Old Way - Pain */}
                        <Card className="bg-neutral-900/50 border-red-900/30 relative overflow-hidden group hover:border-red-900/50 transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 to-red-900" />
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-lg bg-red-500/10 text-red-500">
                                        <ShieldAlert className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-red-500">The "VA Chaos" Trap</h3>
                                </div>

                                <ul className="space-y-6">
                                    {[
                                        "Constant retraining every time someone quits",
                                        "Inconsistent quality and missed deadlines",
                                        "Paying for hours, not results",
                                        "Waking up to 'I can't work today' messages",
                                        "Zero scalability without hiring more people"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-neutral-400">
                                            <XCircle className="w-6 h-6 text-red-500 shrink-0" />
                                            <span className="text-lg">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>

                        {/* The New Way - Solution */}
                        <Card className="bg-neutral-900/50 border-green-900/30 relative overflow-hidden group hover:border-green-900/50 transition-colors">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600" />
                            <CardContent className="p-8 md:p-12">
                                <div className="flex items-center gap-4 mb-8">
                                    <div className="p-3 rounded-lg bg-green-500/10 text-green-500">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-2xl font-bold text-green-500">The Agency AI System</h3>
                                </div>

                                <ul className="space-y-6">
                                    {[
                                        "Systems that never sleep, quit, or complain",
                                        "Perfect execution, every single time",
                                        "Pay for output and performance only",
                                        "24/7 operation while you sleep",
                                        "Infinite scalability with a click of a button"
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-start gap-3 text-white">
                                            <CheckCircle2 className="w-6 h-6 text-green-500 shrink-0" />
                                            <span className="text-lg font-medium">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </section>

            {/* Value Props / "Ease & Flow" Section */}
            <section className="py-24 bg-black relative">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto text-center mb-20">
                        <h2 className="text-4xl md:text-6xl font-black mb-6">
                            CREATE <span className="text-yellow-500">EASE & FLOW</span>
                        </h2>
                        <p className="text-xl text-neutral-400">
                            Stop being the bottleneck in your own business. Let our AI infrastructure handle the heavy lifting so you can focus on strategy and growth.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                title: "Instant Implementation",
                                desc: "Deploy proven workflows in seconds, not weeks. No onboarding lag time.",
                                icon: <Clock className="w-10 h-10 text-blue-400" />
                            },
                            {
                                title: "Zero Management",
                                desc: "The system manages itself. No daily standups, no performance reviews.",
                                icon: <ShieldAlert className="w-10 h-10 text-purple-400" />
                            },
                            {
                                title: "Predictable Growth",
                                desc: "Scale your output without linearly scaling your headcount or stress.",
                                icon: <Zap className="w-10 h-10 text-yellow-400" />
                            }
                        ].map((feature, i) => (
                            <div key={i} className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all">
                                <div className="mb-6">{feature.icon}</div>
                                <h3 className="text-xl font-bold mb-4 text-white">{feature.title}</h3>
                                <p className="text-neutral-400 leading-relaxed">
                                    {feature.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-32 bg-gradient-to-b from-neutral-900 to-black text-center">
                <div className="container mx-auto px-4">
                    <h2 className="text-4xl md:text-6xl font-black mb-8 text-white">
                        READY TO <span className="text-yellow-500">SCALE?</span>
                    </h2>
                    <p className="text-xl text-neutral-400 mb-12 max-w-2xl mx-auto">
                        Join the top 1% of agencies who have replaced chaos with code.
                    </p>
                    <Button
                        onClick={onDemoClick}
                        size="lg"
                        className="h-20 px-16 text-2xl font-black uppercase tracking-wide bg-white text-black hover:bg-neutral-200 border-0 rounded-xl shadow-2xl transform hover:scale-105 transition-all duration-300"
                    >
                        Get Started Now
                    </Button>
                </div>
            </section>
        </div>
    );
}
