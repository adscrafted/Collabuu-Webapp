import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play, Sparkles } from 'lucide-react';

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-purple-50 via-pink-50 to-white py-20 sm:py-32">
      {/* Background decorative elements */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-purple-300 opacity-20 blur-3xl" />
        <div className="absolute right-[15%] top-[40%] h-96 w-96 rounded-full bg-pink-300 opacity-20 blur-3xl" />
      </div>

      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-purple-200 bg-white/80 px-4 py-2 text-sm font-medium text-purple-700 backdrop-blur">
            <Sparkles className="h-4 w-4" />
            <span>Join 10,000+ brands and creators</span>
          </div>

          {/* Main Headline */}
          <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            Connect Brands with
            <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Top Creators
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mb-10 text-xl text-gray-600 sm:text-2xl">
            The ultimate platform for authentic influencer collaborations that
            drive real results. Launch campaigns in minutes, not weeks.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button
                size="lg"
                className="group h-14 bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg font-semibold text-white hover:from-purple-700 hover:to-pink-700"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="group h-14 border-2 border-gray-300 px-8 text-lg font-semibold hover:border-purple-600 hover:text-purple-600"
            >
              <Play className="mr-2 h-5 w-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Easy setup in minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Connect with top creators</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span>Track real-time results</span>
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration Placeholder */}
        <div className="mx-auto mt-16 max-w-5xl">
          <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-2xl">
            <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
              {/* You can replace this with an actual dashboard screenshot or illustration */}
              <div className="flex h-full items-center justify-center text-gray-400">
                <span className="text-sm">Dashboard Preview</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
