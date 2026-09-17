
import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import HowItWorks from './components/HowItWorks';
import Services from './components/Services';
import TopRatedCaregivers from './components/TopRatedCaregivers';
import PartnerNetwork from './components/PartnerNetwork';
import SubscriptionPlans from './components/SubscriptionPlans';
import DonationSection from './components/DonationSection';
import Testimonials from './components/Testimonials';
import WhyUs from './components/WhyUs';
import CaregiverRegistration from './components/CaregiverRegistration';
import CTAFinal from './components/CTAFinal';
import Footer from './components/Footer';
import { supabase } from './lib/supabase';
import { useEffect } from 'react';

const App: React.FC = () => {
  useEffect(() => {
    const checkConnection = async () => {
      const { data, error } = await supabase.from('test').select('*').limit(1);
      if (error && error.code !== 'PGRST116') { // Ignoring "relation does not exist" if table missing, just checking connectivity
        console.log('Supabase connection check:', error.message);
      } else {
        console.log('Supabase connected successfully');
      }
    };
    checkConnection();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section id="home">
          <Hero />
        </section>
        <section id="como-funciona" className="bg-white">
          <HowItWorks />
        </section>
        <section id="servicos">
          <Services />
        </section>
        <section id="planos" className="bg-slate-50">
          <SubscriptionPlans />
        </section>
        <section id="parceiros" className="bg-white">
          <PartnerNetwork />
        </section>
        <section id="ranking" className="bg-slate-50">
          <TopRatedCaregivers />
        </section>
        <section id="depoimentos">
          <Testimonials />
        </section>
        <section id="doacao" className="bg-blue-900">
          <DonationSection />
        </section>
        <section id="por-que-nos" className="bg-white">
          <WhyUs />
        </section>
        <section id="trabalhe-conosco" className="bg-slate-50">
          <CaregiverRegistration />
        </section>
        <section id="contato">
          <CTAFinal />
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default App;
