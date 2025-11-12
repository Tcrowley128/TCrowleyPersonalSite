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
    <div className="h-full flex flex-col overflow-hidden">
      <Navigation />
      <main className="flex-1 pt-16 bg-gray-50 dark:bg-slate-900 overflow-y-auto overflow-x-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
}
