import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronRight, Check, Users, TrendingUp, Shield, ArrowRight } from 'lucide-react'
import Button from '../components/Button'

export default function Landing() {
  const [billingPeriod, setBillingPeriod] = useState('term')

  const features = [
    {
      icon: '🏫',
      title: 'Branded School Page',
      description: 'Get your own branded portal with custom domain options',
    },
    {
      icon: '📊',
      title: 'Result Management',
      description: 'Upload, manage, and publish student results easily',
    },
    {
      icon: '🔐',
      title: 'Secure PIN System',
      description: 'Secure PIN-based result access for parents',
    },
    {
      icon: '💳',
      title: 'Wallet & Payments',
      description: 'Integrated Paystack payments for PIN generation',
    },
    {
      icon: '🤖',
      title: 'AI Lesson Notes',
      description: 'Auto-generated lesson notes powered by AI',
    },
    {
      icon: '🎫',
      title: 'ID Card Generator',
      description: 'Create and print professional student ID cards',
    },
    {
      icon: '📈',
      title: 'Analytics Dashboard',
      description: 'Comprehensive insights into school performance',
    },
    {
      icon: '📢',
      title: 'Announcements',
      description: 'Send updates to students and parents',
    },
    {
      icon: '🌐',
      title: 'Custom Domain',
      description: 'Enterprise plan includes custom domain',
    },
  ]

  const pricing = [
    {
      name: 'Starter',
      pricePerTerm: 0,
      pricePerYear: 0,
      free: true,
      features: ['5 students', '2 teachers', '₦100 per PIN', 'Basic result management'],
      cta: 'Get Started Free',
    },
    {
      name: 'Pro',
      pricePerTerm: 10000,
      pricePerYear: 30000,
      popular: true,
      features: [
        '200 students',
        '10 teachers',
        '₦80 per PIN',
        'ID card generator',
        'AI lesson notes',
        'Analytics dashboard',
      ],
      cta: 'Start Pro Trial',
    },
    {
      name: 'Enterprise',
      pricePerTerm: 30000,
      pricePerYear: 90000,
      features: [
        'Unlimited students',
        'Unlimited teachers',
        '₦50 per PIN',
        'All Pro features',
        'Custom domain',
        'Priority support',
      ],
      cta: 'Contact Sales',
    },
  ]

  const testimonials = [
    {
      name: 'Dr. Oladele Ayokunle',
      title: 'Principal, Excellent Academy',
      text: 'ExclusiveGrades transformed how we manage results. Parents love the PIN system and we save hours on result distribution.',
      image: '👨‍💼',
    },
    {
      name: 'Mrs. Ifeoma Nwosu',
      title: 'Registrar, Heritage School',
      text: 'The AI lesson notes feature is incredible. Teachers can focus on teaching while the system handles documentation.',
      image: '👩‍💼',
    },
    {
      name: 'Mr. Chukwu Adeyemi',
      title: 'Admin, Learning Hub International',
      text: 'We manage 500+ students efficiently. The dashboard gives us real-time insights into school operations.',
      image: '👨‍💼',
    },
  ]

  const stats = [
    { number: '500+', label: 'Schools Registered' },
    { number: '50,000+', label: 'Results Checked' },
    { number: '99%', label: 'Uptime' },
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Register Your School',
      description: 'Create your account and get a branded URL for your school',
    },
    {
      step: 2,
      title: 'Add Students & Teachers',
      description: 'Import via CSV or add manually in seconds',
    },
    {
      step: 3,
      title: 'Upload Results',
      description: 'Teachers upload scores, admin reviews and approves',
    },
    {
      step: 4,
      title: 'Generate PINs',
      description: 'Fund your wallet and generate secure PINs for parents',
    },
    {
      step: 5,
      title: 'Parents Check Results',
      description: 'Parents enter PIN and admission number to view full report cards',
    },
  ]

  const bulkDiscounts = [
    { quantity: '100+', discount: '5% off' },
    { quantity: '500+', discount: '10% off' },
    { quantity: '1000+', discount: '15% off' },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-orange-500">ExclusiveGrades</div>
            <div className="flex gap-4">
              <Link to="/auth/login">
                <Button variant="ghost">Log In</Button>
              </Link>
              <Link to="/auth/register">
                <Button variant="primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="gradient-dark py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-orange-500 rounded-full text-sm font-semibold mb-6">
                ✓ Trusted by 100+ Schools Across Nigeria
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                The Smarter Way to Manage School Results
              </h1>
              <p className="text-xl text-gray-300 mb-8">
                ExclusiveGrades gives every school a branded page, secure PIN-based result access, AI lesson notes, and ID card generation — all in one platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth/register">
                  <Button variant="primary" size="lg">
                    Get Started Free
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="secondary" size="lg">
                    See How It Works
                  </Button>
                </a>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-orange-400 to-orange-600 rounded-2xl p-8 card-shadow-lg">
                <div className="bg-white rounded-lg p-6 text-gray-900">
                  <h3 className="font-bold text-lg mb-4">Sample Report Card</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Mathematics</span>
                      <span className="font-bold text-orange-500">A (85)</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>English Language</span>
                      <span className="font-bold text-orange-500">B+ (78)</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                      <span>Physics</span>
                      <span className="font-bold text-orange-500">A (82)</span>
                    </div>
                    <div className="mt-4 pt-4 border-t font-bold">
                      Average: 85.2%
                    </div>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 bg-white rounded-lg p-3 card-shadow-lg">
                  <div className="text-2xl">✓ PIN Verified</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-5xl font-bold text-orange-500 mb-2">{stat.number}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid md:grid-cols-5 gap-4">
            {howItWorks.map((item, idx) => (
              <div key={idx} className="relative">
                <div className="bg-orange-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-orange-600">{item.step}</span>
                </div>
                <h3 className="font-bold text-center mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 text-center">{item.description}</p>
                {idx < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-8 -right-2 transform translate-x-full">
                    <ChevronRight className="w-6 h-6 text-orange-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 card-shadow hover:card-shadow-lg transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-8">Simple, Transparent Pricing</h2>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-200 rounded-lg p-1 inline-flex">
              <button
                onClick={() => setBillingPeriod('term')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  billingPeriod === 'term'
                    ? 'bg-white text-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Per Term
              </button>
              <button
                onClick={() => setBillingPeriod('year')}
                className={`px-6 py-2 rounded-md font-semibold transition-colors ${
                  billingPeriod === 'year'
                    ? 'bg-white text-orange-500'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Per Year
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {pricing.map((plan, idx) => (
              <div
                key={idx}
                className={`rounded-lg p-8 ${
                  plan.popular
                    ? 'bg-orange-500 text-white ring-2 ring-orange-500 transform scale-105'
                    : 'bg-white text-gray-900 card-shadow'
                }`}
              >
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                {plan.free ? (
                  <div className="mb-6">
                    <span className="text-4xl font-bold">Free</span>
                  </div>
                ) : (
                  <div className="mb-6">
                    <span className="text-4xl font-bold">
                      ₦{billingPeriod === 'term' ? plan.pricePerTerm.toLocaleString() : plan.pricePerYear.toLocaleString()}
                    </span>
                    <span className="text-sm opacity-75">/{billingPeriod === 'term' ? 'term' : 'year'}</span>
                  </div>
                )}
                <button className={`w-full py-2 rounded-lg font-semibold mb-6 transition-colors ${
                  plan.popular
                    ? 'bg-white text-orange-500 hover:bg-gray-100'
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                }`}>
                  {plan.cta}
                </button>
                <ul className="space-y-3">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center">
                      <Check className="w-5 h-5 mr-2 flex-shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bulk Discounts */}
          <div className="bg-blue-50 rounded-lg p-8">
            <h3 className="font-bold text-lg mb-4">💰 Bulk PIN Discounts</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {bulkDiscounts.map((discount, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-gray-700">{discount.quantity} PINs:</span>
                  <span className="font-bold text-orange-500">{discount.discount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-16">What School Leaders Say</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div key={idx} className="bg-white rounded-lg p-8 card-shadow">
                <div className="text-4xl mb-4">{testimonial.image}</div>
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="border-t pt-4">
                  <p className="font-bold">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="gradient-primary py-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Modernize Your School?</h2>
          <p className="text-xl mb-8 opacity-90">Join 500+ schools already managing results with ExclusiveGrades</p>
          <Link to="/auth/register">
            <Button variant="secondary" size="lg">
              Register Your School Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">ExclusiveGrades</h3>
              <p className="text-gray-400">The smarter way to manage school results.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Privacy</a></li>
                <li><a href="#" className="hover:text-white">Terms</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ExclusiveGrades. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
