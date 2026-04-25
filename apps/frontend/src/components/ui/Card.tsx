'use client';

import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface CardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  shadow?: boolean;
  hoverEffect?: boolean;
  border?: boolean;
}

const Card = ({
  children,
  padding = 'md',
  shadow = true,
  hoverEffect = false,
  border = false,
  className = '',
  ...props
}: CardProps) => {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };

  const baseStyles = 'rounded-2xl transition-all duration-300';
  
  const lightStyles = 'bg-white';
  const darkStyles = 'dark:bg-gray-900';
  
  const shadowStyles = shadow ? 'shadow-lg dark:shadow-gray-900/30' : '';
  const borderStyles = border ? 'border border-gray-200 dark:border-gray-700' : '';
  
  const hoverStyles = hoverEffect ? 'hover:shadow-xl hover:-translate-y-1 dark:hover:shadow-gray-900/50' : '';

  const combinedClassName = `${baseStyles} ${lightStyles} ${darkStyles} ${paddingStyles[padding]} ${shadowStyles} ${borderStyles} ${hoverStyles} ${className}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      whileHover={hoverEffect ? { scale: 1.02 } : {}}
      className={combinedClassName}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export default Card;