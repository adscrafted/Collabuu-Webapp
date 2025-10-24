import { Star, Quote } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

export function Testimonials() {
  return (
    <section className="py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Trusted by Leading
            <span className="block bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Brands and Creators
            </span>
          </h2>
          <p className="text-xl text-gray-600">
            See what our community has to say about their experience with Collabuu
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <TestimonialCard
            quote="Collabuu has transformed how we work with influencers. The platform is intuitive, and we've seen a 3x increase in campaign ROI."
            author="Sarah Johnson"
            role="Marketing Director"
            company="TechFlow Inc."
            initials="SJ"
          />
          <TestimonialCard
            quote="As a creator, I love that there are no platform fees. I finally get to keep 100% of what I earn, and the payment process is seamless."
            author="Marcus Chen"
            role="Content Creator"
            company="@marcusmedia"
            initials="MC"
          />
          <TestimonialCard
            quote="The campaign management and tracking features are incredible. We can finally prove the value of influencer marketing to our stakeholders."
            author="Emily Rodriguez"
            role="Head of Growth"
            company="BeautyBox"
            initials="ER"
          />
          <TestimonialCard
            quote="We've managed over 50 campaigns through Collabuu and the automation features have saved us countless hours. It's a game-changer."
            author="David Park"
            role="Brand Manager"
            company="FitLife"
            initials="DP"
          />
          <TestimonialCard
            quote="The discovery tools helped me find brands that truly align with my values. I've built long-term partnerships that feel authentic."
            author="Jessica Williams"
            role="Lifestyle Influencer"
            company="@jesslifestyle"
            initials="JW"
          />
          <TestimonialCard
            quote="Collabuu's customer support is outstanding. They're always there to help us navigate campaigns and resolve any issues quickly."
            author="Michael Brown"
            role="E-commerce Director"
            company="StyleHub"
            initials="MB"
          />
        </div>

        {/* Trust Badges */}
        <div className="border-t border-gray-200 pt-16">
          <p className="text-center text-sm text-gray-500 mb-8">
            TRUSTED BY BRANDS WORLDWIDE
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12">
            {/* Placeholder brand logos */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-8 w-32 bg-gray-200 rounded opacity-50 hover:opacity-100 transition-opacity"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({
  quote,
  author,
  role,
  company,
  initials,
}: {
  quote: string;
  author: string;
  role: string;
  company: string;
  initials: string;
}) {
  return (
    <div className="group relative rounded-2xl border border-gray-200 bg-white p-8 transition-all hover:border-purple-300 hover:shadow-lg">
      {/* Quote Icon */}
      <Quote className="absolute top-6 right-6 h-8 w-8 text-purple-200 opacity-50" />

      {/* Star Rating */}
      <div className="flex gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="h-5 w-5 fill-yellow-400 text-yellow-400"
          />
        ))}
      </div>

      {/* Quote */}
      <p className="text-gray-700 mb-6 leading-relaxed">{quote}</p>

      {/* Author Info */}
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-semibold text-gray-900">{author}</div>
          <div className="text-sm text-gray-600">
            {role} at {company}
          </div>
        </div>
      </div>
    </div>
  );
}
