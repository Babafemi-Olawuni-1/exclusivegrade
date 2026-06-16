import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronRight, Check, ArrowRight, Star,
  Users, BookOpen, BarChart2, Key, Cpu,
  BadgeInfo, School, Bell, Globe,
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'
import Button from '../components/forms/Button'

const features = [
  { icon: School,    title: 'Branded School Page',    desc: 'Get your own branded portal with logo and welcome text.' },
  { icon: BarChart2, title: 'Result Management',      desc: 'Upload, review, and publish student results with ease.' },
  { icon: Key,       title: 'Secure PIN System',      desc: 'PIN-based result access keeps parent data secure.' },
  { icon: Users,     title: 'Wallet & Payments',      desc: 'Integrated Paystack wallet for PIN and plan purchases.' },
  { icon: Cpu,       title: 'AI Lesson Notes',        desc: 'Auto-generate lesson notes powered by OpenAI.' },
  { icon: BadgeInfo,    title: 'ID Card Generator',      desc: 'Create and print professional student ID cards.' },
  { icon: BarChart2, title: 'Analytics Dashboard',    desc: 'Real-time insights into school performance.' },
  { icon: Bell,      title: 'Announcements',          desc: 'Send updates to students, parents, and teachers.' },
  { icon: Globe,     title: 'Custom Domain',          desc: 'Enterprise plan includes your own custom domain.' },
]

const steps = [
  { n: 1, title: 'Register Your School',       desc: 'Create your account and get a branded school URL.' },
  { n: 2, title: 'Add Students & Teachers',    desc: 'Import via CSV or add manually in seconds.' },
  { n: 3, title: 'Upload Results',             desc: 'Teachers upload scores; admin reviews and approves.' },
  { n: 4, title: 'Generate PINs',              desc: 'Fund wallet and generate secure PINs for parents.' },
  { n: 5, title: 'Parents Check Results',      desc: 'Enter PIN + admission number to view full report card.' },
]

const testimonials = [
  { name: 'Dr. Oladele Ayokunle',  role: 'Principal, Excellent Academy',          text: 'ExclusiveGrades transformed how we manage results. Parents love the PIN system and we save hours every term.' },
  { name: 'Mrs. Ifeoma Nwosu',     role: 'Registrar, Heritage School',             text: 'The AI lesson notes feature is incredible. Teachers can focus on teaching while the system handles documentation.' },
  { name: 'Mr. Chukwu Adeyemi',   role: 'Admin, Learning Hub International',       text: 'We manage 500+ students efficiently. The dashboard gives us real-time insights we never had before.' },
]

const plans = [
  {
    name: 'Starter', free: true, priceT: 0, priceY: 0,
    features: ['10 students', '2 teachers', '₦100 per PIN', 'Basic result management'],
    cta: 'Get Started Free',
  },
  {
    name: 'Pro', popular: true, priceT: 10000, priceY: 30000,
    features: ['200 students', '10 teachers', '₦80 per PIN', 'ID card generator', 'AI lesson notes', 'Analytics dashboard'],
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise', priceT: 30000, priceY: 90000,
    features: ['Unlimited students', 'Unlimited teachers', '₦50 per PIN', 'All Pro features', 'Custom domain', 'Priority support'],
    cta: 'Contact Sales',
  },
]

export default function Landing() {
  const [billing, setBilling] = useState('term')

  return (
    <div className="min-h-screen bg-white font-sora">
      <Navbar />

      {/* Hero */}
      <section className="bg-[#1A1A1A] text-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#FF6B00]/20 rounded-full text-[#FF6B00] text-sm font-semibold mb-6">
                <Star className="w-3.5 h-3.5 fill-current" />
                Trusted by 100+ Schools Across Nigeria
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                The Smarter Way to <span className="text-[#FF6B00]">Manage School Results</span>
              </h1>
              <p className="text-lg text-gray-300 mb-8 leading-relaxed">
                ExclusiveGrades gives every school a branded page, secure PIN-based result access, AI lesson notes, and ID card generation — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button size="lg">Get Started Free <ArrowRight className="w-4 h-4" /></Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg">See How It Works</Button>
                </a>
              </div>
            </div>

            {/* Mock report card */}
            <div className="relative">
              <div className="bg-gradient-to-br from-[#FF6B00] to-orange-700 rounded-2xl p-6 shadow-2xl">
                <div className="bg-white rounded-xl p-5 text-[#1A1A1A]">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#E5E5E5]">
                    <h3 className="font-bold text-base">Sample Report Card</h3>
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">Published</span>
                  </div>
                  {[['Mathematics','A (92)'],['English Language','B+ (78)'],['Physics','A- (85)'],['Chemistry','A (88)']].map(([s,g]) => (
                    <div key={s} className="flex justify-between items-center py-2 border-b border-[#F5F5F5] last:border-0">
                      <span className="text-sm text-gray-700">{s}</span>
                      <span className="text-sm font-bold text-[#FF6B00]">{g}</span>
                    </div>
                  ))}
                  <div className="mt-3 pt-3 border-t border-[#E5E5E5] flex justify-between font-bold text-sm">
                    <span>Average Score</span><span className="text-[#FF6B00]">85.75%</span>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-white rounded-xl px-4 py-2.5 shadow-card-lg text-sm font-semibold text-green-700 flex items-center gap-1.5">
                <Check className="w-4 h-4" /> PIN Verified
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[['500+','Schools Registered'],['50,000+','Results Checked'],['99.9%','Uptime SLA']].map(([n,l]) => (
            <div key={l}>
              <p className="text-3xl lg:text-5xl font-bold text-[#FF6B00]">{n}</p>
              <p className="text-sm text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">Get your school up and running in minutes, not days.</p>
          <div className="grid md:grid-cols-5 gap-4 lg:gap-6">
            {steps.map((s, i) => (
              <div key={s.n} className="relative flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-full bg-[#FF6B00]/10 border-2 border-[#FF6B00]/30 flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-[#FF6B00]">{s.n}</span>
                </div>
                <h3 className="font-semibold text-sm mb-2">{s.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{s.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(50%+2rem)] text-gray-300">
                    <ChevronRight className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">Powerful Features</h2>
          <p className="text-gray-500 text-center mb-14 max-w-xl mx-auto">Everything your school needs, built into one platform.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-card hover:shadow-card-lg transition-shadow">
                <div className="w-11 h-11 rounded-xl bg-[#FF6B00]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#FF6B00]" />
                </div>
                <h3 className="font-semibold mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
          <p className="text-gray-500 text-center mb-8 max-w-xl mx-auto">No hidden fees. Pay per term or save with annual billing.</p>

          {/* Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-[#F5F5F5] rounded-xl p-1 inline-flex">
              {['term','year'].map((b) => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${billing === b ? 'bg-white text-[#FF6B00] shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                >
                  {b === 'term' ? 'Per Term' : 'Per Year'}
                  {b === 'year' && <span className="ml-1.5 text-xs text-green-600 font-bold">Save 17%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {plans.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl p-8 ${p.popular ? 'bg-[#FF6B00] text-white scale-105 shadow-2xl' : 'bg-white text-[#1A1A1A] shadow-card'}`}
              >
                {p.popular && <div className="text-xs font-bold uppercase tracking-widest mb-3 opacity-80">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{p.name}</h3>
                <div className="mb-6">
                  {p.free ? (
                    <span className="text-4xl font-bold">Free</span>
                  ) : (
                    <>
                      <span className="text-4xl font-bold">
                        ₦{(billing === 'term' ? p.priceT : p.priceY).toLocaleString()}
                      </span>
                      <span className={`text-sm ml-1 ${p.popular ? 'opacity-75' : 'text-gray-500'}`}>
                        /{billing === 'term' ? 'term' : 'year'}
                      </span>
                    </>
                  )}
                </div>
                <Link to="/register">
                  <button className={`w-full py-2.5 rounded-xl font-semibold text-sm mb-6 transition-colors ${p.popular ? 'bg-white text-[#FF6B00] hover:bg-gray-50' : 'bg-[#FF6B00] text-white hover:bg-orange-700'}`}>
                    {p.cta}
                  </button>
                </Link>
                <ul className="space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <Check className={`w-4 h-4 mt-0.5 flex-shrink-0 ${p.popular ? 'text-white' : 'text-[#FF6B00]'}`} />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bulk discounts */}
          <div className="mt-10 bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <h4 className="font-semibold text-blue-900 mb-3">💰 Bulk PIN Discounts</h4>
            <div className="grid sm:grid-cols-3 gap-4">
              {[['100+ PINs','5% off'],['500+ PINs','10% off'],['1,000+ PINs','15% off']].map(([q,d]) => (
                <div key={q} className="flex items-center justify-between text-sm">
                  <span className="text-blue-700">{q}:</span>
                  <span className="font-bold text-blue-900">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-[#F5F5F5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-center mb-14">What School Leaders Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl p-6 shadow-card">
                <div className="flex mb-3">
                  {[...Array(5)].map((_,i) => <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />)}
                </div>
                <p className="text-sm text-gray-600 italic mb-6 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-[#E5E5E5] pt-4">
                  <div className="w-10 h-10 rounded-full bg-[#FF6B00]/10 flex items-center justify-center text-[#FF6B00] font-bold text-sm">
                    {t.name.split(' ').map(n=>n[0]).join('').slice(0,2)}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#FF6B00]">
        <div className="max-w-4xl mx-auto px-4 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">Ready to Modernize Your School?</h2>
          <p className="text-lg opacity-90 mb-8">Join 500+ schools already managing results with ExclusiveGrades</p>
          <Link to="/register">
            <button className="bg-white text-[#FF6B00] hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold text-base transition-colors inline-flex items-center gap-2">
              Register Your School Free <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  )
}
