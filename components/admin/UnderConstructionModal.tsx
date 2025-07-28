"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Construction,
  Coffee,
  Wrench,
  Sparkles,
  ArrowLeft,
  Heart,
} from "lucide-react";

interface UnderConstructionModalProps {
  onBack?: () => void;
}

export default function UnderConstructionModal({
  onBack,
}: UnderConstructionModalProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Theme Colors
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize the color scheme for both light and dark modes.
          </p>
        </div>

        {/* Main Content */}
        <Card className="w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-sm border-2 border-dashed border-gray-300 dark:bg-gray-800/95 dark:border-gray-600">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <Construction className="h-16 w-16 text-orange-500 animate-bounce" />
                <Sparkles className="h-6 w-6 text-yellow-400 absolute -top-2 -right-2 animate-pulse" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              🚧 Under Construction 🚧
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Our theme wizard is taking a coffee break!
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                <Coffee className="h-4 w-4" />
                <span className="text-sm">☕ Brewing some magic...</span>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  <span className="font-semibold">🎨 Theme Colors</span> are
                  getting a fabulous makeover! Our design elves are working
                  overtime to bring you the most beautiful color schemes.
                </p>
              </div>

              <div className="flex items-center justify-center space-x-2 text-gray-500 dark:text-gray-400">
                <Wrench className="h-4 w-4" />
                <span className="text-sm">
                  🔧 Fine-tuning the color palette...
                </span>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-teal-50 dark:from-green-900/20 dark:to-teal-900/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  <span className="font-semibold">✨ Coming Soon:</span>
                  • Drag & drop color picker
                  <br />
                  • Live preview mode
                  <br />
                  • Preset theme collections
                  <br />• Advanced color harmony tools
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-1 text-pink-500">
              <Heart className="h-4 w-4 animate-pulse" />
              <span className="text-sm font-medium">
                Made with love by the Tripesa team
              </span>
              <Heart className="h-4 w-4 animate-pulse" />
            </div>

            {onBack && (
              <div className="flex justify-center pt-4">
                <Button
                  variant="outline"
                  onClick={onBack}
                  className="flex items-center space-x-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Go Back</span>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
