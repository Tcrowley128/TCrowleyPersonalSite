import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'Digital Transformation Assessment | Tyler Crowley',
  description: 'Get a personalized digital transformation roadmap tailored to your business. Discover quick wins, strategic recommendations, and actionable insights.',
};

export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navigation />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
    </>
  );
}
