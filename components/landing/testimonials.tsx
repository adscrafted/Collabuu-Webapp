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

        {/* Testimonials Grid - Empty until real testimonials are added to database */}
        <div className="text-center py-12">
          <p className="text-gray-500">
            No testimonials available yet. Check back soon!
          </p>
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
