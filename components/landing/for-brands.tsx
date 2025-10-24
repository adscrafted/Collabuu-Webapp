import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Target,
  TrendingUp,
  Users,
  BarChart3,
  Zap,
  Shield,
} from 'lucide-react';

export function ForBrands() {
  return (
    <section id="for-brands" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <div className="mb-4 inline-block rounded-full bg-purple-100 px-4 py-2 text-sm font-semibold text-purple-700">
            For Brands
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Scale Your Brand with
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Authentic Influencer Marketing
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            Find, connect, and collaborate with the perfect creators for your
            brand. Launch campaigns that drive real results.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-16">
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Smart Creator Discovery"
            description="AI-powered matching to find creators that perfectly align with your brand values and target audience."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Real-Time Tracking"
            description="Monitor campaign performance with live insights on reach, engagement, and ROI as your campaigns unfold."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Relationship Management"
            description="Build lasting partnerships with creators through our built-in CRM and collaboration tools."
          />
          <FeatureCard
            icon={<Zap className="h-8 w-8" />}
            title="Automated Workflows"
            description="Streamline your campaigns with automated briefs, approvals, and payment processing."
          />
          <FeatureCard
            icon={<TrendingUp className="h-8 w-8" />}
            title="Performance Tracking"
            description="Measure what matters with advanced attribution and conversion tracking across platforms."
          />
          <FeatureCard
            icon={<Shield className="h-8 w-8" />}
            title="Secure Payments"
            description="Protected transactions with escrow, milestone payments, and fraud protection built-in."
          />
        </div>

        {/* Stats Section */}
        <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-white">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">10K+</div>
              <div className="text-purple-100">Active Brands</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">50K+</div>
              <div className="text-purple-100">Campaigns Launched</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-5xl font-bold">$100M+</div>
              <div className="text-purple-100">Creator Earnings</div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg font-semibold text-white hover:from-purple-700 hover:to-pink-700"
            >
              Start Your Campaign
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Join leading brands already using Collabuu
          </p>
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-3 text-purple-600 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
