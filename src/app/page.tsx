import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Accomplishments from '@/components/Accomplishments';
import Blog from '@/components/Blog';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <Layout>
      <Hero />
      <About />
      <Accomplishments />
      <Blog />
      <Contact />
    </Layout>
  );
}
