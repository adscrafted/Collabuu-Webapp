import {
  LandingHeader,
  Hero,
  ForBrands,
  ForCreators,
  Features,
  Testimonials,
  CTA,
  Footer,
} from '@/components/landing';

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <LandingHeader />
      <Hero />
      <ForBrands />
      <ForCreators />
      <Features />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
