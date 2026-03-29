import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import HowItWorks from '@/components/landing/HowItWorks';
import Stats from '@/components/landing/Stats';
import WhyUs from '@/components/landing/WhyUs';
import Testimonials from '@/components/landing/Testimonials';
import CTA from '@/components/landing/CTA';
import FAQ from '@/components/landing/FAQ';
import Footer from '@/components/landing/Footer';

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Services />
      <HowItWorks />
      <Stats />
      <WhyUs />
      <Testimonials />
      <CTA />
      <FAQ />
      <Footer />
    </main>
  );
}
