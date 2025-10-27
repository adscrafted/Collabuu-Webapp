import Link from 'next/link';
import {
  Users,
  DollarSign,
  Smartphone,
  Star,
  Award,
  ChevronDown,
  Download,
  Calendar,
  Briefcase,
} from 'lucide-react';
import { LandingHeader, Footer } from '@/components/landing';
import { Button } from '@/components/ui/button';

export default function CreatorsPage() {
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
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-pink-200 bg-white/80 px-4 py-2 text-sm font-medium text-pink-700 backdrop-blur">
              <Star className="h-4 w-4" />
              <span>Join 35,000+ successful creators</span>
            </div>

            {/* Main Headline */}
            <h1 className="mb-6 text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Get Paid To Create
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Authentic Content
              </span>
            </h1>

            {/* Subheadline */}
            <p className="mb-10 text-xl text-gray-600 sm:text-2xl">
              Connect with top brands, create content you love, and earn money doing what you do
              best. The ultimate platform for creators.
            </p>

            {/* App Download Button */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href="https://apps.apple.com/app/collabuu"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
                  alt="Download on the App Store"
                  className="h-14"
                />
              </a>
            </div>

            {/* Trust indicators */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Free to join</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>$0 platform fees</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Get paid in 7-14 days</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="mx-auto mt-16 max-w-5xl">
            <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-2xl">
              <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                <div className="flex h-full items-center justify-center text-gray-400">
                  <span className="text-sm">Creator Dashboard Preview</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* For Creators Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4">
          {/* Section Header */}
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <div className="mb-4 inline-block rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-pink-700">
              For Creators
            </div>
            <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
              Monetize Your Influence
              <span className="block bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Work with Top Brands
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Get discovered by leading brands, manage collaborations effortlessly, and get paid on
              time. Every time.
            </p>
          </div>

          {/* Two Column Layout */}
          <div className="mb-16 grid items-center gap-12 lg:grid-cols-2">
            {/* Left: Benefits List */}
            <div className="space-y-6">
              <BenefitItem
                icon={<DollarSign className="h-6 w-6" />}
                title="Get Paid What You're Worth"
                description="Set your own rates and negotiate directly with brands. Secure payments with automatic invoicing."
              />
              <BenefitItem
                icon={<Briefcase className="h-6 w-6" />}
                title="Access Premium Opportunities"
                description="Browse exclusive campaigns from verified brands looking for creators like you."
              />
              <BenefitItem
                icon={<Calendar className="h-6 w-6" />}
                title="Manage Everything in One Place"
                description="Track deals, schedule content, communicate with brands, and manage deliverables seamlessly."
              />
              <BenefitItem
                icon={<Star className="h-6 w-6" />}
                title="Build Your Reputation"
                description="Showcase your work and grow your portfolio with successful brand collaborations."
              />
            </div>

            {/* Right: Feature Cards */}
            <div className="space-y-6">
              <div className="rounded-2xl border-2 border-pink-200 bg-gradient-to-br from-pink-50 to-purple-50 p-8">
                <Star className="mb-4 h-12 w-12 text-pink-600" />
                <h3 className="mb-3 text-2xl font-bold text-gray-900">Build Your Portfolio</h3>
                <p className="mb-6 text-gray-600">
                  Showcase your best work, share your media kit, and let brands discover you
                  through our creator marketplace.
                </p>
                <div className="flex items-center gap-2 text-sm text-pink-700">
                  <Award className="h-4 w-4" />
                  <span>Get verified creator badge</span>
                </div>
              </div>

              <div className="rounded-2xl border-2 border-purple-200 bg-white p-8 shadow-lg">
                <div className="mb-6">
                  <div className="text-4xl font-bold text-gray-900">$0</div>
                  <div className="text-gray-600">Platform fees forever</div>
                </div>
                <p className="text-sm text-gray-500">
                  Unlike other platforms that take 20-30% commission, we charge brands, not
                  creators. Keep 100% of what you earn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-center text-4xl font-bold text-gray-900 sm:text-5xl">
            How it Works
          </h2>
          <p className="mx-auto mb-16 max-w-3xl text-center text-xl text-gray-600">
            Collabuu is a platform that connects creators to brands in a new and innovative way!
            Browse paid content opportunities and pick the ones you vibe with, create content and
            get paid!
          </p>

          <div className="mb-16">
            <div className="grid gap-8 md:grid-cols-3">
              <StepCard
                number="1"
                title="Create Your Profile"
                description="Set up your creator profile in minutes. Add your social stats, past work, and preferences."
              />
              <StepCard
                number="2"
                title="Get Discovered"
                description="Brands find you through our AI-powered matching or you can apply to open campaigns."
              />
              <StepCard
                number="3"
                title="Collaborate & Earn"
                description="Accept deals, create content, deliver results, and get paid securely through our platform."
              />
            </div>
          </div>

          {/* Step-by-step visual guide */}
          <div className="space-y-20">
            {/* Download App */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
                  1
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-900">
                  Download the Collabuu App
                </h3>
                <p className="mb-6 text-lg text-gray-600">
                  Download the Collabuu App on iOS and set up your profile in minutes.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <a
                    href="https://apps.apple.com/app/collabuu"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src="https://tools.applemediaservices.com/api/badges/download-on-the-app-store/black/en-us?size=250x83"
                      alt="Download on the App Store"
                      className="h-12"
                    />
                  </a>
                </div>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-lg">
                <div className="aspect-[9/16] max-w-sm mx-auto rounded-lg bg-white/50 backdrop-blur">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    App Preview
                  </div>
                </div>
              </div>
            </div>

            {/* Browse Opportunities */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-lg">
                  <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Campaign Browser
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
                  2
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-900">
                  Browse Paid Opportunities
                </h3>
                <p className="mb-6 text-lg text-gray-600">
                  Compete in a contest or secure 1-on-1 brand deals. Choose campaigns that match
                  your style and audience.
                </p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>
            </div>

            {/* Create Content */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div>
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
                  3
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-900">Create Content</h3>
                <p className="mb-6 text-lg text-gray-600">
                  This is the fun part! Do what you do best, and create awesome content that
                  resonates with your audience.
                </p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                    Get Started
                  </Button>
                </Link>
              </div>
              <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-lg">
                <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                  <div className="flex h-full items-center justify-center text-gray-400">
                    Content Creation
                  </div>
                </div>
              </div>
            </div>

            {/* Get Paid */}
            <div className="grid items-center gap-12 lg:grid-cols-2">
              <div className="order-2 lg:order-1">
                <div className="relative rounded-2xl border border-gray-200 bg-gradient-to-br from-pink-100 to-purple-100 p-8 shadow-lg">
                  <div className="aspect-video rounded-lg bg-white/50 backdrop-blur">
                    <div className="flex h-full items-center justify-center text-gray-400">
                      Payout Dashboard
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
                  4
                </div>
                <h3 className="mb-4 text-3xl font-bold text-gray-900">Get Paid</h3>
                <p className="mb-6 text-lg text-gray-600">
                  Submit your content directly on the app and get paid within 7-14 business days!
                  Track your earnings in real-time.
                </p>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-pink-600 to-purple-600 text-white hover:from-pink-700 hover:to-purple-700">
                    Start Earning
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-4xl font-bold text-gray-900 sm:text-5xl">
            Ready to start earning?
          </h2>
          <p className="mx-auto mb-10 max-w-2xl text-xl text-gray-600">
            Download the Collabuu app today and start collaborating with top brands
          </p>
          <Link href="/register">
            <Button
              size="lg"
              className="h-14 bg-gradient-to-r from-pink-600 to-purple-600 px-8 text-lg font-semibold text-white hover:from-pink-700 hover:to-purple-700"
            >
              Join as a Creator
            </Button>
          </Link>
          <p className="mt-4 text-sm text-gray-500">
            Connect with brands • Create content • Get paid what you earn
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
            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                What is Collabuu?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Collabuu is a platform that connects creators with brands for authentic
                collaborations and paid content opportunities.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                How do I make money on Collabuu?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                You can earn money through various campaign types including Pay Per Customer, Pay
                Per Post, Media Events, and Loyalty Rewards.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                Do I need a certain number of followers to participate?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                While some campaigns may have follower requirements, we welcome creators of all
                sizes. Many brands value engagement and authenticity over follower count.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                How long until I get paid?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Payments are processed within 7-14 business days after campaign completion. You'll
                receive your earnings directly through the app.
              </p>
            </details>

            <details className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-pink-300 hover:shadow-lg">
              <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900">
                Is Collabuu free to use?
                <ChevronDown className="h-5 w-5 text-gray-400 transition-transform group-open:rotate-180" />
              </summary>
              <p className="mt-4 text-gray-600">
                Yes! Collabuu is completely free for creators. There are no subscription fees or
                hidden costs. Keep 100% of what you earn.
              </p>
            </details>
          </div>
        </div>
      </section>

      {/* Link to Brands */}
      <section className="border-t border-gray-200 bg-gradient-to-b from-gray-50 to-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-600">
            Are you a brand looking to collaborate?{' '}
            <Link
              href="/brands"
              className="font-semibold text-purple-600 underline hover:text-purple-700"
            >
              Learn more about Collabuu for Brands
            </Link>
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0 rounded-lg bg-gradient-to-r from-pink-100 to-purple-100 p-3 text-pink-600">
        {icon}
      </div>
      <div>
        <h4 className="mb-2 text-lg font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative text-center">
      <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-purple-600 text-2xl font-bold text-white">
        {number}
      </div>
      <h4 className="mb-3 text-xl font-semibold text-gray-900">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
