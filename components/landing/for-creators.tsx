import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DollarSign,
  Calendar,
  Star,
  Briefcase,
  Award,
} from 'lucide-react';

export function ForCreators() {
  return (
    <section id="for-creators" className="py-24 bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
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
            Get discovered by leading brands, manage collaborations effortlessly,
            and get paid on time. Every time.
          </p>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
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
              <Star className="h-12 w-12 text-pink-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Build Your Portfolio
              </h3>
              <p className="text-gray-600 mb-6">
                Showcase your best work, share your media kit, and let brands
                discover you through our creator marketplace.
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
                Unlike other platforms that take 20-30% commission, we charge
                brands, not creators. Keep 100% of what you earn.
              </p>
            </div>
          </div>
        </div>

        {/* How It Works */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h3>
          <div className="grid md:grid-cols-3 gap-8">
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

        {/* CTA */}
        <div className="text-center">
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
      </div>
    </section>
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
        <h4 className="text-lg font-semibold text-gray-900 mb-2">{title}</h4>
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
      <h4 className="text-xl font-semibold text-gray-900 mb-3">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
