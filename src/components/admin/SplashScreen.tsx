import { Loader2 } from "lucide-react";

interface SplashScreenProps {
  open: boolean;
}

export const SplashScreen = ({ open }: SplashScreenProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-8 shadow-2xl max-w-sm w-full mx-4">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Loader2 className="h-16 w-16 animate-spin text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Aguarde
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Limpando todos os dados...
          </p>
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
            <div className="h-full bg-blue-600 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
}; 