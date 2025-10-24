import Link from 'next/link';
import { Users, Zap, TrendingUp, Download } from 'lucide-react';

export default function CreatorsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-400 via-pink-300 to-pink-400">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
            Get Paid To Create
          </h1>
          <p className="mb-8 max-w-3xl text-xl text-gray-800 sm:text-2xl">
            Connect with brands, create authentic content, and earn money doing what you love.
            Join thousands of creators already making an impact.
          </p>

          {/* App Store Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <a
              href="https://apps.apple.com/app/collabuu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-black px-6 py-4 transition-all hover:bg-gray-900 hover:shadow-xl"
            >
              <Download className="h-8 w-8 text-white" />
              <div className="text-left">
                <p className="text-xs text-gray-300">Download on the</p>
                <p className="text-xl font-semibold text-white">App Store</p>
              </div>
            </a>
            <a
              href="https://play.google.com/store/apps/details?id=com.collabuu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 rounded-xl bg-black px-6 py-4 transition-all hover:bg-gray-900 hover:shadow-xl"
            >
              <Download className="h-8 w-8 text-white" />
              <div className="text-left">
                <p className="text-xs text-gray-300">Get it on</p>
                <p className="text-xl font-semibold text-white">Google Play</p>
              </div>
            </a>
          </div>
        </div>

        {/* How it Works Section */}
        <div className="mt-24">
          <h2 className="mb-4 text-center text-4xl font-bold text-gray-900">
            How it Works
          </h2>
          <p className="mx-auto mb-12 max-w-4xl text-center text-lg text-gray-800">
            Collabuu is a platform that connects creators with brands in a new and innovative way!
            Browse paid content opportunities and pick the ones you vibe with, create content and get paid!
          </p>

          {/* Features Grid */}
          <div className="grid gap-8 md:grid-cols-3 mt-16">
            <FeatureCard
              icon={<Users className="h-10 w-10 text-pink-600" />}
              title="Browse Campaigns"
              description="Discover exciting brand campaigns that match your style and audience. Choose the ones that resonate with you."
            />
            <FeatureCard
              icon={<Zap className="h-10 w-10 text-purple-600" />}
              title="Create Content"
              description="Use your creativity to produce authentic content that showcases the brand. Be yourself and engage your audience."
            />
            <FeatureCard
              icon={<TrendingUp className="h-10 w-10 text-blue-600" />}
              title="Get Paid"
              description="Earn money for your work! Get paid within 7-14 business days after campaign completion. Track your earnings in the app."
            />
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-24 text-center">
          <div className="rounded-3xl bg-white/30 backdrop-blur-sm p-12">
            <h2 className="mb-4 text-3xl font-bold text-gray-900">
              Ready to Start Earning?
            </h2>
            <p className="mb-8 text-lg text-gray-800">
              Download the Collabuu app today and start collaborating with top brands.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://apps.apple.com/app/collabuu"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-pink-500 px-8 py-4 font-semibold text-white transition-all hover:bg-pink-600 hover:shadow-lg"
              >
                Download for iOS
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.collabuu"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-gray-900 px-8 py-4 font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
              >
                Download for Android
              </a>
            </div>
          </div>
        </div>

        {/* Footer Link */}
        <div className="mt-12 text-center">
          <p className="text-gray-800">
            Are you a brand looking to collaborate?{' '}
            <Link
              href="/brands"
              className="font-semibold text-gray-900 underline hover:text-pink-600"
            >
              Learn more about Collabuu for Brands
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
