import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, Sparkles, Zap, TrendingUp, Shield, PieChart, AlertCircle } from "lucide-react";
import { LoadingState } from "@/components/LoadingState";
import { WalletDashboard } from "@/components/WalletDashboard";
import { analyzeWallet, WalletPersonaResponse } from "@/services/walletApi";

const Index = () => {
  const [walletAddress, setWalletAddress] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [walletData, setWalletData] = useState<WalletPersonaResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!walletAddress.trim()) return;
    
    setIsAnalyzing(true);
    setError(null);
    setWalletData(null);
    
    try {
      console.log('Starting wallet analysis for:', walletAddress);
      const data = await analyzeWallet(walletAddress.trim());
      console.log('Analysis completed:', data);
      setWalletData(data);
      setIsAnalyzing(false);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setWalletData(null);
    setWalletAddress("");
    setError(null);
    setIsAnalyzing(false);
  };

  if (isAnalyzing) {
    return <LoadingState />;
  }

  if (walletData) {
    return <WalletDashboard onReset={handleReset} walletAddress={walletAddress} walletData={walletData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating blockchain elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-cyan-400 rounded-full animate-bounce opacity-40`}
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 10}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${2 + i * 0.3}s`
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8 flex flex-col justify-center min-h-screen">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-6 animate-fade-in">
            Spendora
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4 animate-fade-in delay-150">
            Discover your wallet's secret personality
          </p>
          <p className="text-lg text-gray-400 animate-fade-in delay-300">
            What's your wallet's vibe? 🕵️‍♂️ No seed phrases required, we promise 🔒
          </p>
        </div>

        <Card className="max-w-2xl mx-auto p-8 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 shadow-2xl animate-scale-in">
          <div className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            )}

            <div className="relative">
              <Input
                type="text"
                placeholder="Enter wallet address (0x...) or ENS name"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                className="w-full h-14 px-6 text-lg bg-gray-900/60 border-2 border-purple-500/50 rounded-xl text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={!walletAddress.trim() || isAnalyzing}
              className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-purple-500/25"
            >
              <Sparkles className="mr-2 w-5 h-5" />
              Analyze Wallet
            </Button>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-400">Trading Style</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-400">Risk Profile</p>
              </div>
              <div className="text-center group cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl mx-auto mb-2 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <PieChart className="w-6 h-6 text-white" />
                </div>
                <p className="text-sm text-gray-400">Portfolio Mix</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="text-center mt-8 animate-fade-in delay-500">
          <p className="text-gray-400 text-sm">
            ✨ Analyze any Ethereum wallet • Get shareable results • 100% free
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
