'use client';

import { Home, Globe, Building2, User, MessageSquare } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/companies', label: 'Companies', icon: Building2 },
  { href: '/profile', label: 'Profile', icon: User },
  { href: '/chat-test', label: 'Chat Test', icon: MessageSquare },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <motion.nav
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
    >
      <div className="mx-auto max-w-screen-xl px-4">
        <div className="relative">
          {/* Background with blur and border */}
          <div className="absolute inset-0 rounded-t-2xl bg-white/90 backdrop-blur-lg dark:bg-gray-900/90 border-t border-x border-gray-200 dark:border-gray-800 shadow-2xl" />
          
          {/* Navigation items */}
          <div className="relative flex items-center justify-around py-4 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex flex-col items-center justify-center relative"
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute -top-3 w-12 h-1 rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                    />
                  )}
                  
                  {/* Icon container */}
                  <div className={`p-3 rounded-xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-gradient-to-br from-blue-500/10 to-purple-500/10 text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}>
                    <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                  </div>
                  
                  {/* Label */}
                  <span className={`mt-1 text-xs font-medium transition-colors ${
                    isActive 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}