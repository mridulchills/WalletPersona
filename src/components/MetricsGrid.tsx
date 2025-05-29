
import { Card } from "@/components/ui/card";
import { Shield, TrendingUp, Wallet, Activity } from "lucide-react";

interface MetricsGridProps {
  metrics: {
    riskScore: number;
    totalValue: string;
    transactions: number;
    protocols: number;
  };
}

export const MetricsGrid = ({ metrics }: MetricsGridProps) => {
  const getRiskColor = (score: number) => {
    if (score < 30) return "text-green-400";
    if (score < 70) return "text-yellow-400";
    return "text-red-400";
  };

  const getRiskLabel = (score: number) => {
    if (score < 30) return "Conservative";
    if (score < 70) return "Moderate";
    return "High Risk";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Risk Score */}
      <Card className="p-6 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <Shield className="w-8 h-8 text-cyan-400" />
          <div className={`text-right ${getRiskColor(metrics.riskScore)}`}>
            <div className="text-2xl font-bold">{metrics.riskScore}</div>
            <div className="text-sm opacity-80">/100</div>
          </div>
        </div>
        <h3 className="text-white font-semibold mb-2">Risk Score</h3>
        <p className={`text-sm ${getRiskColor(metrics.riskScore)}`}>
          {getRiskLabel(metrics.riskScore)}
        </p>
        
        {/* Progress bar */}
        <div className="mt-4 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-out ${
              metrics.riskScore < 30 ? 'bg-green-400' :
              metrics.riskScore < 70 ? 'bg-yellow-400' : 'bg-red-400'
            }`}
            style={{ width: `${metrics.riskScore}%` }}
          ></div>
        </div>
      </Card>

      {/* Total Value */}
      <Card className="p-6 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group animate-fade-in delay-100">
        <div className="flex items-center justify-between mb-4">
          <Wallet className="w-8 h-8 text-green-400" />
          <div className="text-right text-green-400">
            <div className="text-2xl font-bold">{metrics.totalValue}</div>
          </div>
        </div>
        <h3 className="text-white font-semibold mb-2">Portfolio Value</h3>
        <p className="text-sm text-gray-400">Total USD value</p>
        
        {/* Sparkline effect */}
        <div className="mt-4 flex items-end space-x-1 h-8">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="bg-green-400/60 rounded-sm flex-1 animate-pulse"
              style={{
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
      </Card>

      {/* Transactions */}
      <Card className="p-6 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group animate-fade-in delay-200">
        <div className="flex items-center justify-between mb-4">
          <Activity className="w-8 h-8 text-purple-400" />
          <div className="text-right text-purple-400">
            <div className="text-2xl font-bold">{metrics.transactions.toLocaleString()}</div>
          </div>
        </div>
        <h3 className="text-white font-semibold mb-2">Transactions</h3>
        <p className="text-sm text-gray-400">All-time count</p>
        
        {/* Activity heatmap preview */}
        <div className="mt-4 grid grid-cols-7 gap-1">
          {[...Array(21)].map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-sm ${
                Math.random() > 0.7 ? 'bg-purple-400' :
                Math.random() > 0.5 ? 'bg-purple-600' : 'bg-gray-700'
              }`}
            ></div>
          ))}
        </div>
      </Card>

      {/* Protocols */}
      <Card className="p-6 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 hover:border-purple-400/50 transition-all duration-300 group animate-fade-in delay-300">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 text-cyan-400" />
          <div className="text-right text-cyan-400">
            <div className="text-2xl font-bold">{metrics.protocols}</div>
          </div>
        </div>
        <h3 className="text-white font-semibold mb-2">Protocols Used</h3>
        <p className="text-sm text-gray-400">DeFi interactions</p>
        
        {/* Protocol icons */}
        <div className="mt-4 flex space-x-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-6 h-6 bg-gradient-to-br from-cyan-400 to-purple-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            ></div>
          ))}
          <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
            <span className="text-xs text-gray-300">+{metrics.protocols - 5}</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
