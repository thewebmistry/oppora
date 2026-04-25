'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export interface PageLoaderProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  backgroundColor?: string;
}

const PageLoader = ({
  message = 'Loading...',
  fullScreen = true,
  size = 'md',
  backgroundColor = 'bg-white/80 dark:bg-gray-900/80',
}: PageLoaderProps) => {
  const sizeStyles = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  const spinnerSize = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <motion.div
        animate={{
          rotate: 360,
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        className={`${sizeStyles[size]} rounded-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 dark:border-t-blue-400 flex items-center justify-center`}
      >
        <motion.div
          animate={{
            rotate: -360,
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Loader2 className={`${spinnerSize[size]} text-blue-500 dark:text-blue-400`} />
        </motion.div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-gray-700 dark:text-gray-300 font-medium">{message}</p>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 1.5, repeat: Infinity }}
          className="h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2"
        />
      </motion.div>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={`fixed inset-0 z-50 flex items-center justify-center ${backgroundColor} backdrop-blur-sm`}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center justify-center p-8"
    >
      {content}
    </motion.div>
  );
};

export default PageLoader;