"use client";

import { useState, useEffect } from "react";
import { Wifi, WifiOff, RefreshCw, MapPin, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflinePage() {
  const [currentAnimal, setCurrentAnimal] = useState("🦁");
  const [isChecking, setIsChecking] = useState(false);
  const [offlineTime, setOfflineTime] = useState(0);

  const animals = ["🦁", "🐘", "🦒", "🦓", "🦏", "🐆", "🐃", "🦘", "🐊", "🦜"];
  const facts = [
    "Lions can sleep up to 20 hours a day",
    "Elephants can remember their friends after years apart",
    "Giraffes only need 5-30 minutes of sleep per day",
    "Zebras are actually black with white stripes",
    "Rhinos have been around for 50 million years",
    "Leopards are excellent swimmers",
    "African buffalo have excellent memories",
    "Kangaroos can't walk backwards",
    "Crocodiles can live over 100 years",
    "Parrots can live longer than humans",
  ];

  useEffect(() => {
    // Animal animation cycle
    const animalInterval = setInterval(() => {
      setCurrentAnimal(animals[Math.floor(Math.random() * animals.length)]);
    }, 3000);

    // Offline time counter
    const timeInterval = setInterval(() => {
      setOfflineTime((prev) => prev + 1);
    }, 1000);

    return () => {
      clearInterval(animalInterval);
      clearInterval(timeInterval);
    };
  }, []);

  const checkConnection = async () => {
    setIsChecking(true);

    try {
      const response = await fetch("/api/health", {
        method: "HEAD",
        cache: "no-cache",
      });

      if (response.ok) {
        window.location.reload();
      }
    } catch (error) {
      // Still offline
      setTimeout(() => setIsChecking(false), 1000);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-100 via-amber-50 to-yellow-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="text-8xl animate-bounce mb-4">{currentAnimal}</div>
            <WifiOff className="h-8 w-8 text-red-500 mx-auto animate-pulse" />
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            You're Off the Grid!
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            But don't worry, your safari adventure continues...
          </p>
        </div>

        {/* Status Card */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 border-2 border-orange-200 dark:border-orange-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
                <span className="font-semibold text-gray-900 dark:text-white">
                  Offline Mode
                </span>
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {formatTime(offlineTime)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-orange-50 dark:bg-orange-900/30 p-4 rounded-lg">
                <h3 className="font-semibold text-orange-800 dark:text-orange-200 mb-2 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  What you can still do:
                </h3>
                <ul className="text-sm text-orange-700 dark:text-orange-300 space-y-1">
                  <li>• Browse cached safari tours</li>
                  <li>• View previously loaded destinations</li>
                  <li>• Read tour descriptions and details</li>
                  <li>• Plan your future adventures</li>
                </ul>
              </div>

              <Button
                onClick={checkConnection}
                disabled={isChecking}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isChecking ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking Connection...
                  </>
                ) : (
                  <>
                    <Wifi className="h-4 w-4 mr-2" />
                    Try to Reconnect
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Safari Facts */}
        <Card className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Compass className="h-5 w-5 text-orange-500" />
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Safari Fact
              </h3>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-slate-700 dark:to-slate-600 p-4 rounded-lg">
              <p className="text-gray-800 dark:text-gray-200 italic">
                "{facts[Math.floor(offlineTime / 10) % facts.length]}"
              </p>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              New fact every 10 seconds while you wait
            </p>
          </CardContent>
        </Card>

        {/* Animated Safari Scene */}
        <div className="text-center space-y-4">
          <div className="relative h-24 overflow-hidden rounded-lg bg-gradient-to-r from-green-200 to-yellow-200 dark:from-green-800 dark:to-yellow-800">
            <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-green-300 to-transparent dark:from-green-900"></div>

            {/* Animated animals walking across */}
            <div className="absolute bottom-2 left-0 animate-pulse">
              <div className="flex space-x-4 animate-bounce">
                <span className="text-2xl">🌳</span>
                <span className="text-2xl">🦁</span>
                <span className="text-2xl">🐘</span>
                <span className="text-2xl">🦒</span>
                <span className="text-2xl">🌳</span>
              </div>
            </div>

            {/* Sun */}
            <div className="absolute top-2 right-4 text-2xl animate-pulse">
              ☀️
            </div>
          </div>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Your safari adventure awaits when you're back online
          </p>
        </div>

        {/* Tips */}
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            💡 Tip: When you're back online, we'll automatically refresh your
            adventure
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Some content may be available from cache
          </p>
        </div>
      </div>

      {/* Floating animals animation */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {animals.map((animal, index) => (
          <div
            key={index}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${(index * 10 + 5) % 90}%`,
              top: `${(index * 15 + 10) % 80}%`,
              animationDelay: `${index * 0.5}s`,
              animationDuration: `${3 + index * 0.3}s`,
            }}
          >
            {animal}
          </div>
        ))}
      </div>
    </div>
  );
}
