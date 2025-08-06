"use client";

import { useEffect, useState } from "react";
import { DollarSign, Coins, Gem, Diamond, Star } from "lucide-react";
import { FloatingIcon } from "@/types";

export default function BackgroundGrid() {
  const [floatingIcons, setFloatingIcons] = useState<FloatingIcon[]>([]);
  useEffect(() => {
    const icons: FloatingIcon[] = [];

    for (let i = 0; i < 30; i++) {
      icons.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        scale: Math.random() * 0.4 + 0.6,
        rotation: Math.random() * 360,
        animationDelay: Math.random() * 8,
        animationDuration: Math.random() * 15 + 10,
        iconType: Math.floor(Math.random() * 5),
      });
    }
    setFloatingIcons(icons);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {" "}
      {/* Enhanced Grid Background */}
      <div className="absolute inset-0 grid-bg opacity-25" />
      {/* Additional subtle grid layer */}
      <div className="absolute inset-0 grid-bg-fine opacity-40" />{" "}
      {/* Floating Money and Jewelry Icons */}
      {floatingIcons.map((icon) => {
        const iconTypes = [DollarSign, Coins, Gem, Diamond, Star];
        const IconComponent = iconTypes[icon.iconType];
        const colors = [
          "text-green-400/70",
          "text-yellow-400/65",
          "text-purple-400/70",
          "text-blue-400/65",
          "text-pink-400/70",
        ];

        return (
          <div
            key={icon.id}
            className={`absolute ${colors[icon.iconType]} floating-icon drop-shadow-lg`}
            style={{
              left: `${icon.x}%`,
              top: `${icon.y}%`,
              transform: `scale(${icon.scale}) rotate(${icon.rotation}deg)`,
              animationDelay: `${icon.animationDelay}s`,
              animationDuration: `${icon.animationDuration}s`,
            }}
          >
            <IconComponent size={36} strokeWidth={1.8} />
          </div>
        );
      })}
      {/* Subtle gradient overlay to maintain readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950/70 via-slate-950/60 to-slate-950/70" />
    </div>
  );
}
