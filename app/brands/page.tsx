import Link from 'next/link';
import {
  Target,
  BarChart3,
  Users,
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  ChevronDown,
} from 'lucide-react';
import { LandingHeader, Footer } from '@/components/landing';
import { Button } from '@/components/ui/button';

export default function BrandsPage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />

      {/* Hero Section */}
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
              <span>Trusted by 1,000+ brands worldwide</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Make your product go viral with
              <span className="block bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
                Creator Campaigns
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl text-gray-600 sm:text-2xl">
              Connect with thousands of authentic creators. Launch powerful campaigns. Track
              real results. All in one platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group h-14 bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg font-semibold text-white hover:from-purple-700 hover:to-pink-700"
                >
                  Launch a Campaign
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 border-2 border-gray-300 px-8 text-lg font-semibold hover:border-purple-600 hover:text-purple-600"
                >
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Launch in minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>35,000+ creators</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Verified results</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-2xl">
              <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                <div className="flex h-full items-center justify-center text-gray-400">
                  <span className="text-sm">Campaign Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Collabuu */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
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
              Collabuu makes influencer marketing simple and effective. Create campaigns, connect
              with creators, and track your ROI all in one powerful platform.
            </p>
          </div>

          {/* Features Grid */}
          <div className="mb-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Target className="h-8 w-8" />}
              title="Smart Creator Discovery"
              description="AI-powered matching to find creators that perfectly align with your brand values and target audience."
            />
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8" />}
              title="Real-Time Analytics"
              description="Track campaign performance, engagement, and ROI with comprehensive analytics dashboards."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8" />}
              title="Verified Results"
              description="QR code technology ensures every customer acquisition is tracked and verified in real-time."
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
              icon={<Users className="h-8 w-8" />}
              title="Creator Management"
              description="Build lasting partnerships with creators through our built-in CRM and collaboration tools."
            />
          </div>

          {/* Stats Section */}
          <div className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 p-12 text-white">
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">35,000+</div>
                <div className="text-purple-100">Active Creators</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">1,000+</div>
                <div className="text-purple-100">Brand Partners</div>
              </div>
              <div className="text-center">
                <div className="mb-2 text-5xl font-bold">18+</div>
                <div className="text-purple-100">Countries Served</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-16 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
            How it Works
          </h2>

          {/* Step 1 */}
          <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold text-white">
                1
              </div>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">Launch a Campaign</h3>
              <p className="mb-6 text-lg text-gray-600">
                Create targeted campaigns in minutes. Choose from multiple campaign types including
                Pay Per Customer, Pay Per Post, Media Events, and Loyalty Rewards.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
              <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Campaign Builder
                </div>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
                <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Content Brief
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold text-white">
                2
              </div>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">
                Creative brief collaboration & approval flow
              </h3>
              <p className="mb-6 text-lg text-gray-600">
                Set clear guidelines for your campaign. Review and approve content before it goes
                live. Maintain brand consistency across all creator content.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>

          {/* Step 3 */}
          <div className="mb-20 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold text-white">
                3
              </div>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">
                Connect with the right creators
              </h3>
              <p className="mb-6 text-lg text-gray-600">
                Access a diverse network of authentic creators who align with your brand values and
                target audience. Filter by niche, engagement, and demographics.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </Link>
            </div>
            <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
              <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                <div className="flex h-full items-center justify-center text-gray-400">
                  Creator Network
                </div>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-purple-100 to-pink-100 p-8 shadow-lg">
                <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Analytics Dashboard
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-2xl font-bold text-white">
                4
              </div>
              <h3 className="mb-4 text-3xl font-bold text-gray-900">
                Pay for winning content only
              </h3>
              <p className="mb-6 text-lg text-gray-600">
                With our Pay Per Customer model, you only pay when creators bring verified
                customers. Track every conversion with QR code technology and comprehensive
                analytics.
              </p>
              <Link href="/register">
                <Button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Launch a campaign today
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            Join hundreds of brands already using Collabuu to drive real results
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 bg-gradient-to-r from-purple-600 to-pink-600 px-8 text-lg font-semibold text-white hover:from-purple-700 hover:to-pink-700"
            >
              Get Started Free
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Join leading brands already using Collabuu
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-4xl font-bold text-gray-900">
            We've got you covered
          </h2>
          <div className="mx-auto max-w-3xl space-y-4">
            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                What makes Collabuu different?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Collabuu combines authentic creator partnerships with verified results tracking.
                Our QR code technology ensures you only pay for real customer acquisitions, not
                just impressions or engagement.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                How do I track campaign performance?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Our comprehensive dashboard provides real-time analytics including engagement rates,
                conversion tracking, ROI metrics, and detailed creator performance reports.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                Can I choose which creators work with my brand?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! You have full control over creator selection. Review creator profiles, past
                performance, audience demographics, and approve applications before campaigns begin.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                What payment models do you support?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                We offer Pay Per Customer, Pay Per Post, Media Events, and Loyalty Rewards. Choose
                the model that best fits your marketing goals and budget.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-purple-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                How quickly can I launch a campaign?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Most brands launch their first campaign within 24-48 hours. Simply create your
                brief, set your budget, and creators can start applying immediately.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Link to Creators */}
      <section className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Are you a creator looking to collaborate?{' '}
            <Link
              href="/creators"
              className="font-semibold text-purple-600 underline hover:text-purple-700"
            >
              Learn more about Collabuu for Creators
            </Link>
          </p>
        </div>
      </section>

      <Footer />
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
    <div className="group rounded-xl border border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg">
      <div className="mb-4 inline-flex rounded-lg bg-gradient-to-r from-purple-100 to-pink-100 p-3 text-purple-600 transition-transform group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-semibold text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
