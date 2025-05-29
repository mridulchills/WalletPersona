
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Download, ExternalLink, Trophy, Shield, TrendingUp, Zap, Coins, Users } from "lucide-react";
import { PersonaAvatar } from "@/components/PersonaAvatar";
import { MetricsGrid } from "@/components/MetricsGrid";
import { WalletTimeline } from "@/components/WalletTimeline";
import { ShareCard } from "@/components/ShareCard";
import { useState } from "react";
import { WalletPersonaResponse } from "@/services/walletApi";

interface WalletDashboardProps {
  onReset: () => void;
  walletAddress: string;
  walletData: WalletPersonaResponse;
}

interface Recommendation {
  name: string;
  type: string;
  color: string;
  reason: string;
}

export const WalletDashboard = ({ onReset, walletAddress, walletData }: WalletDashboardProps) => {
  const [showShareCard, setShowShareCard] = useState(false);

  // Map persona name to avatar type
  const getAvatarType = (persona: string): string => {
    const lowerPersona = persona.toLowerCase();
    if (lowerPersona.includes('wizard') || lowerPersona.includes('defi')) return 'wizard';
    if (lowerPersona.includes('king') || lowerPersona.includes('whale')) return 'king';
    if (lowerPersona.includes('warrior') || lowerPersona.includes('trader')) return 'warrior';
    if (lowerPersona.includes('guardian') || lowerPersona.includes('hodl')) return 'guardian';
    if (lowerPersona.includes('pioneer') || lowerPersona.includes('early')) return 'pioneer';
    if (lowerPersona.includes('social') || lowerPersona.includes('dao')) return 'socialite';
    return 'wizard'; // default
  };

  // Generate personalized recommendations based on wallet data
  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    const persona = walletData.persona.toLowerCase();
    const riskScore = walletData.risk_score;
    const txCount = walletData.metrics?.transactions || 0;
    const protocols = walletData.metrics?.protocols || 0;

    // Recommendations based on persona
    if (persona.includes('defi') || persona.includes('farmer')) {
      recommendations.push({
        name: "Aave Protocol",
        type: "Lending & Borrowing",
        color: "from-purple-500 to-indigo-500",
        reason: "Perfect for advanced DeFi strategies"
      });
      recommendations.push({
        name: "Curve Finance",
        type: "DEX for Stablecoins",
        color: "from-blue-500 to-cyan-500",
        reason: "Low slippage stablecoin trading"
      });
    } else if (persona.includes('nft') || persona.includes('collector')) {
      recommendations.push({
        name: "OpenSea Pro",
        type: "NFT Marketplace",
        color: "from-pink-500 to-rose-500",
        reason: "Advanced NFT trading tools"
      });
      recommendations.push({
        name: "Blur Marketplace",
        type: "Pro NFT Trading",
        color: "from-orange-500 to-red-500",
        reason: "Professional NFT trading platform"
      });
    } else if (persona.includes('hodl') || persona.includes('diamond')) {
      recommendations.push({
        name: "Lido Staking",
        type: "Liquid Staking",
        color: "from-green-500 to-emerald-500",
        reason: "Earn rewards while HODLing"
      });
      recommendations.push({
        name: "Rocket Pool",
        type: "Decentralized Staking",
        color: "from-blue-500 to-teal-500",
        reason: "Decentralized ETH staking option"
      });
    } else if (persona.includes('newcomer') || persona.includes('beginner')) {
      recommendations.push({
        name: "Coinbase Wallet",
        type: "Educational Platform",
        color: "from-blue-500 to-indigo-500",
        reason: "Learn crypto basics safely"
      });
      recommendations.push({
        name: "Uniswap Interface",
        type: "Simple DEX",
        color: "from-pink-500 to-purple-500",
        reason: "User-friendly token swapping"
      });
    }

    // Risk-based recommendations
    if (riskScore < 30) { // Low risk
      recommendations.push({
        name: "MakerDAO",
        type: "Stable Lending",
        color: "from-green-500 to-emerald-500",
        reason: "Conservative DeFi lending"
      });
    } else if (riskScore > 70) { // High risk
      recommendations.push({
        name: "GMX Trading",
        type: "Perp Trading",
        color: "from-red-500 to-orange-500",
        reason: "Leverage trading platform"
      });
    }

    // Activity-based recommendations
    if (txCount > 100) {
      recommendations.push({
        name: "DeBank Portfolio",
        type: "Portfolio Tracker",
        color: "from-cyan-500 to-blue-500",
        reason: "Track your active portfolio"
      });
    }

    if (protocols > 5) {
      recommendations.push({
        name: "Zapper Finance",
        type: "DeFi Manager",
        color: "from-purple-500 to-pink-500",
        reason: "Manage multiple protocols"
      });
    }

    // Default recommendations if none match
    if (recommendations.length === 0) {
      recommendations.push(
        {
          name: "Ethereum Name Service",
          type: "Domain Service",
          color: "from-blue-500 to-cyan-500",
          reason: "Get your .eth domain"
        },
        {
          name: "Polygon Network",
          type: "Layer 2 Solution",
          color: "from-purple-500 to-indigo-500",
          reason: "Lower fees, faster transactions"
        }
      );
    }

    // Return max 3 recommendations
    return recommendations.slice(0, 3);
  };

  // Create default badges if none provided by API
  const defaultBadges = [
    { icon: Coins, label: "On-Chain Active", description: "Has transaction history" },
    { icon: TrendingUp, label: "Risk Score " + walletData.risk_score, description: "Calculated risk assessment" },
    { icon: Shield, label: "Verified Wallet", description: "Valid Ethereum address" }
  ];

  const badges = walletData.badges?.map((badge, index) => ({
    icon: [Coins, TrendingUp, Shield, Zap][index % 4],
    label: badge.label,
    description: badge.description
  })) || defaultBadges;

  // Ensure metrics always has riskScore
  const metrics = {
    riskScore: walletData.risk_score,
    totalValue: walletData.metrics?.totalValue || "Unknown",
    transactions: walletData.metrics?.transactions || 0,
    protocols: walletData.metrics?.protocols || 0
  };

  const recommendations = generateRecommendations();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative">
      {/* Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={onReset}
            variant="ghost" 
            className="text-gray-300 hover:text-white hover:bg-gray-800/50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Analyze Another
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button 
              onClick={() => setShowShareCard(true)}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share Results
            </Button>
          </div>
        </div>

        {/* Persona Summary */}
        <Card className="p-8 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 mb-8 animate-fade-in">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-6 md:space-y-0 md:space-x-8">
            <PersonaAvatar type={getAvatarType(walletData.persona)} />
            
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-4xl font-bold text-white">{walletData.persona}</h1>
                <Trophy className="w-8 h-8 text-yellow-500" />
              </div>
              
              <p className="text-gray-300 text-lg mb-6 italic">
                "{walletData.bio}"
              </p>
              
              <div className="flex flex-wrap gap-3">
                {badges.map((badge, index) => (
                  <Badge 
                    key={index}
                    className="bg-gradient-to-r from-purple-600/80 to-cyan-600/80 text-white px-4 py-2 hover:scale-105 transition-transform cursor-pointer group"
                    title={badge.description}
                  >
                    <badge.icon className="w-4 h-4 mr-2" />
                    {badge.label}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Metrics Grid */}
        <MetricsGrid metrics={metrics} />

        {/* Wallet Timeline */}
        <WalletTimeline timeline={walletData.timeline} />

        {/* Personalized Recommendations */}
        <Card className="p-8 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 mt-8 animate-fade-in">
          <h3 className="text-2xl font-bold text-white mb-6">Recommended for You</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommendations.map((rec, index) => (
              <div key={index} className="group cursor-pointer">
                <div className={`p-6 rounded-xl bg-gradient-to-br ${rec.color} opacity-80 hover:opacity-100 transition-all duration-300 transform hover:scale-105`}>
                  <h4 className="text-white font-semibold text-lg mb-2">{rec.name}</h4>
                  <p className="text-white/80 text-sm mb-2">{rec.type}</p>
                  <p className="text-white/70 text-xs mb-4 italic">{rec.reason}</p>
                  <ExternalLink className="w-5 h-5 text-white group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Share Modal */}
      {showShareCard && (
        <ShareCard 
          walletData={walletData}
          walletAddress={walletAddress}
          onClose={() => setShowShareCard(false)}
        />
      )}
    </div>
  );
};
