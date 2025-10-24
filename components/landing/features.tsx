import {
  Search,
  Shield,
  Zap,
  BarChart3,
  CreditCard,
  FileText,
} from 'lucide-react';

export function Features() {
  return (
    <section id="features" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Everything You Need to
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Run Successful Campaigns
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            From discovery to payment, we've built all the tools you need to
            manage influencer collaborations at scale.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={<Search className="h-7 w-7" />}
            title="Smart Discovery"
            description="Find creators using advanced filters, AI matching, and audience insights."
            gradient="from-blue-500 to-cyan-500"
          />
          <FeatureCard
            icon={<FileText className="h-7 w-7" />}
            title="Campaign Briefs"
            description="Create detailed briefs with deliverables, deadlines, and guidelines."
            gradient="from-green-500 to-emerald-500"
          />
          <FeatureCard
            icon={<BarChart3 className="h-7 w-7" />}
            title="Campaign Dashboard"
            description="Monitor your campaigns, track engagement rates, and measure ROI in real-time."
            gradient="from-orange-500 to-red-500"
          />
          <FeatureCard
            icon={<Shield className="h-7 w-7" />}
            title="Secure Escrow"
            description="Protected payments with milestone releases and dispute resolution."
            gradient="from-indigo-500 to-purple-500"
          />
          <FeatureCard
            icon={<CreditCard className="h-7 w-7" />}
            title="Easy Payments"
            description="Automated invoicing, multiple payment methods, and instant payouts."
            gradient="from-pink-500 to-rose-500"
          />
          <FeatureCard
            icon={<Zap className="h-7 w-7" />}
            title="Workflow Automation"
            description="Save time with automated approvals, reminders, and status updates."
            gradient="from-teal-500 to-cyan-500"
          />
        </div>

        {/* Additional Feature Highlights */}
        <div className="mt-20 grid lg:grid-cols-3 gap-8">
          <HighlightCard
            title="Performance Insights"
            description="Track campaign success with detailed performance reports, audience demographics, and conversion tracking across all your influencer partnerships."
            features={[
              'Real-time performance metrics',
              'Audience demographic data',
              'ROI and conversion tracking',
              'Competitor benchmarking',
            ]}
          />
          <HighlightCard
            title="Collaboration Tools"
            description="Streamline your workflow with built-in tools designed specifically for influencer marketing teams."
            features={[
              'Team collaboration workspace',
              'Content approval workflows',
              'Shared media library',
              'Task management system',
            ]}
          />
          <HighlightCard
            title="Enterprise Ready"
            description="Scale your influencer marketing with features built for teams and large organizations."
            features={[
              'Multi-user accounts',
              'Custom approval workflows',
              'API access',
              'Dedicated account manager',
            ]}
          />
        </div>
      </div>
    </section>
  );
}

function FeatureCard({
  icon,
  title,
  description,
  gradient,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
}) {
  return (
    <div className="group relative rounded-xl border border-gray-200 bg-white p-6 transition-all hover:border-transparent hover:shadow-xl">
      {/* Gradient border on hover */}
      <div
        className={`absolute inset-0 rounded-xl bg-gradient-to-r ${gradient} opacity-0 transition-opacity group-hover:opacity-100 -z-10`}
        style={{ padding: '2px' }}
      >
        <div className="h-full w-full rounded-xl bg-white" />
      </div>

      <div
        className={`mb-4 inline-flex rounded-lg bg-gradient-to-r ${gradient} p-3 text-white`}
      >
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function HighlightCard({
  title,
  description,
  features,
}: {
  title: string;
  description: string;
  features: string[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-8">
      <h3 className="mb-4 text-2xl font-bold text-gray-900">{title}</h3>
      <p className="mb-6 text-gray-600">{description}</p>
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3 text-sm text-gray-700">
            <div className="flex-shrink-0 h-5 w-5 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center">
              <svg
                className="h-3 w-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
}
