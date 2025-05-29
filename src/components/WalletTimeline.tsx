
import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp, TrendingDown, Sparkles, Coins } from "lucide-react";

interface TimelineEvent {
  event: string;
  date: string;
  value?: string;
}

interface WalletTimelineProps {
  timeline: TimelineEvent[];
}

export const WalletTimeline = ({ timeline }: WalletTimelineProps) => {
  // If no timeline data, show a placeholder
  if (!timeline || timeline.length === 0) {
    return (
      <Card className="p-8 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 mb-8 animate-fade-in">
        <div className="flex items-center space-x-3 mb-8">
          <Calendar className="w-6 h-6 text-cyan-400" />
          <h3 className="text-2xl font-bold text-white">Wallet Journey</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-400">No timeline data available for this wallet.</p>
        </div>
      </Card>
    );
  }

  const getEventIcon = (event: string) => {
    const lowerEvent = event.toLowerCase();
    if (lowerEvent.includes('first') || lowerEvent.includes('initial')) return Sparkles;
    if (lowerEvent.includes('nft') || lowerEvent.includes('collectible')) return Coins;
    if (lowerEvent.includes('profit') || lowerEvent.includes('gain') || lowerEvent.includes('win')) return TrendingUp;
    if (lowerEvent.includes('loss') || lowerEvent.includes('drop') || lowerEvent.includes('down')) return TrendingDown;
    return Sparkles;
  };

  const getEventColor = (event: string) => {
    const lowerEvent = event.toLowerCase();
    if (lowerEvent.includes('profit') || lowerEvent.includes('gain') || lowerEvent.includes('win')) return 'text-green-400';
    if (lowerEvent.includes('loss') || lowerEvent.includes('drop') || lowerEvent.includes('down')) return 'text-red-400';
    if (lowerEvent.includes('nft')) return 'text-purple-400';
    return 'text-cyan-400';
  };

  return (
    <Card className="p-8 bg-gray-800/40 backdrop-blur-sm border border-purple-500/30 mb-8 animate-fade-in">
      <div className="flex items-center space-x-3 mb-8">
        <Calendar className="w-6 h-6 text-cyan-400" />
        <h3 className="text-2xl font-bold text-white">Wallet Journey</h3>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-400 via-purple-400 to-pink-400"></div>

        <div className="space-y-8">
          {timeline.map((milestone, index) => {
            const IconComponent = getEventIcon(milestone.event);
            const colorClass = getEventColor(milestone.event);
            
            return (
              <div key={index} className="relative flex items-start space-x-6 group">
                {/* Timeline dot */}
                <div className="relative z-10 w-16 h-16 bg-gray-800 rounded-full border-2 border-gray-600 flex items-center justify-center group-hover:border-purple-400 transition-colors duration-300">
                  <IconComponent className={`w-6 h-6 ${colorClass}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-700 group-hover:border-purple-500/50 transition-all duration-300 group-hover:scale-105">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-lg font-semibold text-white">{milestone.event}</h4>
                      <span className="text-sm text-gray-400">{new Date(milestone.date).toLocaleDateString()}</span>
                    </div>
                    {milestone.value && (
                      <div className={`text-lg font-bold ${colorClass}`}>
                        {milestone.value}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};
