import { Hero } from '../components/landing/Hero';
import { ValueProposition } from '../components/landing/ValueProposition';
import { HowItWorks } from '../components/landing/HowItWorks';
import { LiveMetrics } from '../components/landing/LiveMetrics';
import { CreditScoring } from '../components/landing/CreditScoring';
import { ProtocolArchitecture } from '../components/landing/ProtocolArchitecture';
import { Integrations } from '../components/landing/Integrations';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { Roadmap } from '../components/landing/RoadMap';
import { StylusSection } from '../components/landing/StylusSection';
import { FinalCTA } from '../components/landing/FinalCTA';
import { Header } from '../components/landing/Header';
import { Footer } from '../components/landing/Footer';

export default function LandingPage({ onLaunchApp }) {
  return (
    <div className="min-h-screen bg-[#0a0e17] text-gray-100 overflow-x-hidden">
      <Header onLaunchApp={onLaunchApp} />
      <Hero onLaunchApp={onLaunchApp} />
      <ValueProposition />
      <HowItWorks />
      <LiveMetrics />
      <CreditScoring />
      <ProtocolArchitecture />
      <Integrations />
      <ComparisonTable />
      <Roadmap />
      <StylusSection />
      <FinalCTA onLaunchApp={onLaunchApp} />
      <Footer />
    </div>
  );
}