
import { useEffect, useState } from "react";
import { Zap, Coins, Shield, TrendingUp } from "lucide-react";

const loadingMessages = [
  "Scanning for degen trades… 🔍",
  "Counting NFTs (so. many. apes.) 🦍",
  "Checking if this wallet touches grass 🌱",
  "Analyzing diamond hands strength 💎",
  "Calculating FOMO resistance levels 📈",
  "Detecting rug pull survival rate 🪤",
  "Measuring DeFi appetite 🍽️",
  "Evaluating meme coin tolerance 🚀"
];

export const LoadingState = () => {
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-20 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-cyan-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-8 left-40 w-80 h-80 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      <div className="text-center z-10">
        {/* 3D Blockchain Animation */}
        <div className="relative mb-12">
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-16 h-16 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg transform rotate-45 animate-bounce shadow-lg`}
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1.5s'
                }}
              >
                <div className="w-full h-full bg-gradient-to-br from-cyan-400 to-purple-400 rounded-lg transform -rotate-45 flex items-center justify-center">
                  {i === 0 && <Coins className="w-6 h-6 text-white" />}
                  {i === 1 && <Shield className="w-6 h-6 text-white" />}
                  {i === 2 && <TrendingUp className="w-6 h-6 text-white" />}
                </div>
              </div>
            ))}
          </div>

          {/* Connecting lines */}
          <div className="absolute top-8 left-1/2 transform -translate-x-1/2 w-32 h-0.5 bg-gradient-to-r from-purple-500 to-cyan-500 animate-pulse"></div>
        </div>

        <h2 className="text-4xl font-bold text-white mb-6 animate-pulse">
          Analyzing Wallet...
        </h2>

        <div className="bg-gray-800/40 backdrop-blur-sm rounded-2xl p-6 max-w-md mx-auto border border-purple-500/30">
          <div className="flex items-center justify-center mb-4">
            <Zap className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          <p className="text-lg text-gray-300 animate-fade-in" key={currentMessage}>
            {loadingMessages[currentMessage]}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mt-8 w-64 mx-auto">
          <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
