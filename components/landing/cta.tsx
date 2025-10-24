import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, CheckCircle } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 p-12 md:p-16">
          {/* Background decorative elements */}
          <div className="absolute inset-0">
            <div className="absolute left-[10%] top-[20%] h-64 w-64 rounded-full bg-white opacity-10 blur-3xl" />
            <div className="absolute right-[15%] bottom-[20%] h-80 w-80 rounded-full bg-white opacity-10 blur-3xl" />
          </div>

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            {/* Main Headline */}
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Ready to Transform Your
              <span className="block">Influencer Marketing?</span>
            </h2>

            {/* Subheadline */}
            <p className="mb-10 text-xl text-purple-100 sm:text-2xl">
              Join thousands of brands and creators already growing with Collabuu.
              Start connecting today.
            </p>

            {/* Benefits List */}
            <div className="mb-10 flex flex-wrap items-center justify-center gap-6 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Connect with verified creators</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Launch campaigns instantly</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-300" />
                <span>Track performance in real-time</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group h-14 bg-white px-8 text-lg font-semibold text-purple-600 hover:bg-gray-100"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="#features">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 border-white px-8 text-lg font-semibold text-white hover:bg-white/10"
                >
                  Learn More
                </Button>
              </Link>
            </div>

            {/* Trust indicator */}
            <p className="mt-8 text-sm text-purple-200">
              Join 10,000+ brands and 50,000+ creators already using Collabuu
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
