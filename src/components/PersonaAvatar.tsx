
import { Crown, Sword, Wand2, Shield, Zap, Users } from "lucide-react";

interface PersonaAvatarProps {
  type: string;
}

export const PersonaAvatar = ({ type }: PersonaAvatarProps) => {
  const avatarConfig = {
    wizard: {
      icon: Wand2,
      gradient: "from-purple-500 to-indigo-600",
      glow: "shadow-purple-500/50"
    },
    king: {
      icon: Crown,
      gradient: "from-yellow-500 to-orange-600",
      glow: "shadow-yellow-500/50"
    },
    warrior: {
      icon: Sword,
      gradient: "from-red-500 to-rose-600",
      glow: "shadow-red-500/50"
    },
    guardian: {
      icon: Shield,
      gradient: "from-cyan-500 to-blue-600",
      glow: "shadow-cyan-500/50"
    },
    pioneer: {
      icon: Zap,
      gradient: "from-green-500 to-emerald-600",
      glow: "shadow-green-500/50"
    },
    socialite: {
      icon: Users,
      gradient: "from-pink-500 to-purple-600",
      glow: "shadow-pink-500/50"
    }
  };

  const config = avatarConfig[type as keyof typeof avatarConfig] || avatarConfig.wizard;
  const IconComponent = config.icon;

  return (
    <div className="relative group">
      <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-2xl ${config.glow} transform group-hover:scale-110 transition-all duration-300 animate-pulse`}>
        <IconComponent className="w-16 h-16 text-white" />
      </div>
      
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full opacity-60 animate-bounce`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${2 + Math.random()}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};
