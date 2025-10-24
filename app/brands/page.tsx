import Link from 'next/link';
import { Target, BarChart3, Users, ArrowRight, Sparkles } from 'lucide-react';

export default function BrandsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-orange-300">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Grow Your Brand with{' '}
            <span className="bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
              Authentic Content
            </span>
          </h1>
          <p className="mb-8 max-w-3xl text-xl text-gray-800 sm:text-2xl">
            Connect with talented creators, launch powerful campaigns, and measure real results.
            The future of influencer marketing is here.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link
              href="/register"
              className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-8 py-4 text-lg font-semibold text-white transition-all hover:bg-pink-700 hover:shadow-xl"
            >
              Get Started
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 rounded-xl border-2 border-gray-900 bg-white/30 backdrop-blur-sm px-8 py-4 text-lg font-semibold text-gray-900 transition-all hover:bg-white/50 hover:shadow-xl"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-24">
          <h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
            How it Works
          </h2>
          <p className="mx-auto mb-12 max-w-4xl text-center text-lg text-gray-800">
            Collabuu makes influencer marketing simple and effective. Create campaigns, connect with
            creators, and track your ROI all in one powerful platform.
          </p>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-3 mt-16">
            <FeatureCard
              icon={<Target className="h-10 w-10 text-pink-600" />}
              title="Create Campaigns"
              description="Launch targeted campaigns with flexible models: Pay Per Customer, Pay Per Post, Media Events, or Loyalty Rewards."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-purple-600" />}
              title="Connect with Creators"
              description="Access a diverse network of authentic creators who align with your brand values and target audience."
            />
            <FeatureCard
              icon={<BarChart3 className="h-10 w-10 text-orange-600" />}
              title="Measure Performance"
              description="Monitor campaign performance and track engagement with your audience in real-time."
            />
          </div>
        </div>

        {/* Campaign Types Section */}
        <div className="mt-24">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            Flexible Campaign Models
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <CampaignTypeCard
              title="Pay Per Customer"
              description="Pay only when creators bring verified customers through QR code scans."
            />
            <CampaignTypeCard
              title="Pay Per Post"
              description="Commission content creation with approval workflows before payment."
            />
            <CampaignTypeCard
              title="Media Events"
              description="Host events with shared influencer pools for maximum reach."
            />
            <CampaignTypeCard
              title="Loyalty Rewards"
              description="Build customer loyalty through ongoing creator partnerships."
            />
          </div>
        </div>

        {/* Benefits Section */}
        <div className="mt-24">
          <div className="rounded-3xl bg-white/30 backdrop-blur-sm p-12">
            <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
              Why Brands Choose Collabuu
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <BenefitItem
                icon={<Sparkles className="h-6 w-6 text-pink-600" />}
                text="Authentic creator partnerships that resonate with audiences"
              />
              <BenefitItem
                icon={<Target className="h-6 w-6 text-purple-600" />}
                text="Real-time performance monitoring and insights"
              />
              <BenefitItem
                icon={<Target className="h-6 w-6 text-orange-600" />}
                text="Flexible payment models that fit your budget"
              />
              <BenefitItem
                icon={<Users className="h-6 w-6 text-pink-600" />}
                text="Access to diverse creator networks"
              />
              <BenefitItem
                icon={<Sparkles className="h-6 w-6 text-purple-600" />}
                text="Easy campaign setup and management"
              />
              <BenefitItem
                icon={<Target className="h-6 w-6 text-orange-600" />}
                text="Verified customer acquisition through QR technology"
              />
            </div>
          </div>
        </div>

        {/* Final CTA Section */}
        <div className="mt-24 text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Ready to Transform Your Marketing?
          </h2>
          <p className="mb-8 text-lg text-gray-800">
            Join leading brands already using Collabuu to drive real results.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-10 py-5 text-xl font-semibold text-white transition-all hover:bg-pink-700 hover:shadow-2xl"
          >
            Start Your Campaign Today
            <ArrowRight className="h-6 w-6" />
          </Link>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-800">
            Are you a creator looking to collaborate?{' '}
            <Link
              href="/creators"
              className="font-semibold text-gray-900 underline hover:text-pink-600"
            >
              Learn more about Collabuu for Creators
            </Link>
          </p>
        </div>
      </div>
    </main>
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
    <div className="rounded-2xl bg-white/40 backdrop-blur-sm p-8 shadow-lg transition-all hover:shadow-xl hover:bg-white/50">
      <div className="mb-4">{icon}</div>
      <h3 className="mb-3 text-2xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-800 leading-relaxed">{description}</p>
    </div>
  );
}

function CampaignTypeCard({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-xl bg-white/50 backdrop-blur-sm p-6 shadow-md transition-all hover:shadow-lg hover:bg-white/60">
      <h4 className="mb-2 text-lg font-semibold text-gray-900">{title}</h4>
      <p className="text-sm text-gray-800">{description}</p>
    </div>
  );
}

function BenefitItem({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 rounded-lg bg-white p-2">{icon}</div>
      <p className="text-gray-900">{text}</p>
    </div>
  );
}
