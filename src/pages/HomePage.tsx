import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomePageProps {
  onNavigateToLogin: () => void;
}

export default function HomePage({ onNavigateToLogin }: HomePageProps) {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Background Video */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        poster="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1920&q=80"
      >
        <source
          src="https://videos.pexels.com/video-files/5676400/5676400-uhd_2560_1440_30fps.mp4"
          type="video/mp4"
        />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50 z-[1]" />

      {/* Floating particles */}
      <div className="absolute inset-0 z-[2] pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full bg-white/20"
            style={{ left: `${15 + i * 15}%`, top: `${20 + (i % 3) * 25}%` }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Infinity,
              delay: i * 0.4,
            }}
          />
        ))}
      </div>

      {/* Glassmorphism Welcome Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-xl mx-4"
      >
        <div className="rounded-3xl border border-white/15 backdrop-blur-xl bg-white/10 p-8 md:p-12 shadow-2xl shadow-black/30">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30"
          >
            <BookOpen className="w-8 h-8 text-white" />
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-300 uppercase tracking-widest">
                Department of CSE
              </span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-3 leading-tight">
              CSE Library
            </h1>
            <p className="text-lg text-white/70 font-body mb-2">
              Digital Library Management System
            </p>
            <p className="text-sm text-white/50 font-body max-w-sm mx-auto">
              Browse, borrow, and manage books seamlessly. A modern portal for students, faculty, and staff.
            </p>
          </motion.div>

          {/* Divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-8"
          />

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-3 gap-4 mb-8"
          >
            {[
              { label: 'Books', value: '1200+' },
              { label: 'Members', value: '500+' },
              { label: 'Categories', value: '25+' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl md:text-2xl font-display font-bold text-white">{stat.value}</div>
                <div className="text-xs text-white/50 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <Button
              onClick={onNavigateToLogin}
              size="lg"
              className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border-0 shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-[1.02]"
            >
              Login to Library Portal
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>

          {/* Footer */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="text-center text-xs text-white/30 mt-6"
          >
            © 2026 CSE Department Library • All rights reserved
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
