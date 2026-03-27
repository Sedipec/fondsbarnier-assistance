import FAQ from '@/components/landing/FAQ';
import Hero from '@/components/landing/Hero';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <HowItWorks />
      <FAQ />
      <Testimonials />
    </main>
  );
}
