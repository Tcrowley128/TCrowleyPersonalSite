'use client';

import { motion } from 'framer-motion';
import Layout from '@/components/Layout';
import Breadcrumb from '@/components/Breadcrumb';

export default function WorkingWithMePage() {
  const breadcrumbItems = [
    { label: 'Working with Me' }
  ];

  const commitments = [
    {
      title: "Team First",
      description: "We prioritize our team, then customers, partners, and finally investors."
    },
    {
      title: "Value Every Strength",
      description: "Recognize and nurture everyone's unique talents—find your strengths and help others discover theirs."
    },
    {
      title: "Show Up and Engage",
      description: "Be present, listen actively, and contribute in every meeting or session. Your voice matters."
    },
    {
      title: "Lead by Example",
      description: "If you want change, take initiative—speak up, reach out, and model the behavior you want to see."
    },
    {
      title: "Embrace Debate and Candor",
      description: "Share your ideas, especially minority views. Respect others, constructively debate, and practice radical candor—be direct with good intent."
    },
    {
      title: "Stay Curious and Experiment",
      description: "Think like a scientist: focus on the problem, test ideas, and learn from results. Value learning over being right, and bring in insights from all areas of life."
    },
    {
      title: "Don't Get Stuck",
      description: "If the decision maker isn't clear, ask or decide. Avoid paralysis—take action and clarify responsibilities as needed."
    },
    {
      title: "Communicate Purpose",
      description: "Know and share the \"why\" behind actions and outcomes so we can repeat successes."
    },
    {
      title: "Support Authentic Growth",
      description: "Help others become their best selves, not just your ideal version. Appreciate and encourage each person's unique journey."
    },
    {
      title: "Lead with Positivity and Gratitude",
      description: "Foster positivity, show appreciation (be specific and brief), and give quick favors when you can—they build trust and culture."
    },
    {
      title: "Balance Work and Life",
      description: "Protect time for family, friends, and personal well-being. Block it on your calendar and communicate boundaries."
    },
    {
      title: "Make Meetings Count",
      description: "Start meetings by defining success; end with clear action items and deadlines."
    },
    {
      title: "Challenge Ideas, Including Mine",
      description: "Don't hesitate to question or improve on my suggestions—open disagreement leads to better solutions and earns my respect."
    }
  ];

  const workingOn = [
    {
      title: "Listen First, Ask Better Questions",
      description: "I tend to jump in with solutions too quickly. I'm working on listening more, understanding the root problem before suggesting answers."
    },
    {
      title: "Show Up Fully",
      description: "I aim to be more present—giving my full attention, understanding others' needs, and following through."
    },
    {
      title: "Be the Change",
      description: "Instead of complaining or feeling resentful, I want to use those moments as cues to take positive action and model the change we seek."
    },
    {
      title: "Support Authentic Growth",
      description: "I want to help teammates become their best selves—not just my version of \"best.\" I'm working on getting to know colleagues better to support what matters most to them, so everyone leaves our team stronger."
    },
    {
      title: "Communicate Concisely",
      description: "I'm practicing being brief and focused—tailoring messages to what matters most for each audience, and seeking feedback to improve."
    },
    {
      title: "Share the Vision",
      description: "I'm striving to balance immediate priorities with long-term goals, and to communicate our vision more often to get team input and alignment."
    }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-slate-800 pt-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-6">
              Working with Tyler
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              A guide to understanding my leadership style, commitments, and how we can collaborate effectively
            </p>
          </motion.div>

          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-8 md:p-12 mb-12 shadow-sm"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Accountability</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Holding myself responsible for growth and collaboration</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Partnership</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Working together to make our collaboration more fulfilling</p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Growth</h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">Continuously learning and adapting my approach</p>
              </div>
            </div>
            <div className="mt-8 text-center">
              <p className="text-gray-600 dark:text-gray-300 text-lg italic">
                "Work and life are ongoing journeys—I'm glad we're on this ride together."
              </p>
            </div>
          </motion.div>

          {/* My Commitments */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-8 md:p-12 mb-12 shadow-sm"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">My Commitments & Expectations</h2>
            <div className="space-y-6">
              {commitments.map((commitment, index) => (
                <motion.div
                  key={commitment.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.05 }}
                  className="border-l-4 border-blue-500 dark:border-blue-400 pl-6 py-2"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {index + 1}. {commitment.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{commitment.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Things I'm Working On */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-8 md:p-12 mb-12 shadow-sm"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-6">Things I'm working on</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 text-lg">
              If you notice me slipping on any of these—or see other opportunities—please let me know.
              Your feedback helps me grow, and I'll gladly return the favor.
            </p>
            <div className="space-y-6">
              {workingOn.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: 1 + index * 0.05 }}
                  className="border-l-4 border-yellow-500 dark:border-yellow-400 pl-6 py-2"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {index + 1}. {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Working Hours */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="bg-white dark:bg-slate-700 rounded-xl p-8 md:p-12 mb-12 shadow-sm"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">Working Hours</h2>
            <div className="space-y-6">
              <div className="bg-blue-50 dark:bg-slate-600 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">My Schedule</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
                  I work from home which makes an early start way easier. I'm an early riser. I usually start my work day around 7am but most mornings,
                  around 5:45am, I like to check in and do some "5 minute favor" responses while my global colleagues in Europe or Asia are still online
                  with time in their day. My goal is to get a few work things and personal priorities done before my family wakes up. With the early start,
                  I usually end my day around 4-5pm. Sometimes earlier if schedules allow and we have plans with family or friends.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Communication Preferences</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>Phone call or Teams chat for urgent matters</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>Prefer Teams chat over email</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>More responsive via Chat vs Teams channels</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>Don't hesitate to message if unsure about urgency</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Boundaries & Flexibility</h3>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>May check in on weekends when inspired</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>No expectation to reply outside working hours</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>Monthly 8pm calls for China team members</span>
                    </li>
                    <li className="flex">
                      <span className="mr-2">•</span>
                      <span>Respect for work-life balance</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
            className="bg-blue-600 text-white rounded-xl p-8 md:p-12 mb-16 text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Still have unanswered questions?</h2>
            <p className="text-blue-100 mb-6 text-lg">Ask me.</p>
            <p className="text-blue-100 text-lg">
              <strong>PS.</strong> I'd love to read your "Working with me" doc to see how we can best work together!
            </p>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
}