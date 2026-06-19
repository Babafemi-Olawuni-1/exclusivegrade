import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, School, FileText, Lock, Wallet, Bot, CreditCard,
  BarChart3, Megaphone, Globe, CheckCircle, XCircle, Star,
  Users, ShieldCheck, Zap, Award, TrendingUp, Clock, Play,
  GraduationCap, ClipboardCheck, Server, Gift, HelpCircle,
  Building2, UserPlus, Upload, Key, Eye, Sparkles, ChevronRight
} from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function useCounter(target, duration = 1800) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      observer.disconnect()
      let start = 0
      const step = Math.ceil(target / (duration / 16))
      const timer = setInterval(() => {
        start = Math.min(start + step, target)
        setCount(start)
        if (start >= target) clearInterval(timer)
      }, 16)
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])
  return [count, ref]
}

function useFadeIn() {
  const ref = useRef(null)
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0')
        observer.unobserve(entry.target)
      }
    }, { threshold: 0.1 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [])
  return ref
}

function Particles() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let width = window.innerWidth
    let height = window.innerHeight
    let particles = []
    let animationId

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height
    }

    const createParticles = () => {
      particles = []
      const count = Math.min(60, Math.floor((width * height) / 10000))
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
        })
      }
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      particles.forEach((p) => {
        p.x += p.speedX
        p.y += p.speedY
        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(139, 92, 246, ${p.opacity})`
        ctx.fill()
      })
      animationId = requestAnimationFrame(animate)
    }

    window.addEventListener('resize', () => {
      resize()
      createParticles()
    })

    resize()
    createParticles()
    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
}

function Stat({ target, suffix, label, icon: Icon }) {
  const [count, ref] = useCounter(target)
  return (
    <div className="text-center" ref={ref}>
      <div className="flex justify-center mb-2">
        <Icon size={28} className="text-purple-400" />
      </div>
      <div className="text-2xl md:text-3xl font-bold text-white">{count.toLocaleString()}{suffix}</div>
      <div className="text-gray-400 text-sm mt-1">{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, delay = 0 }) {
  const ref = useFadeIn()
  return (
    <div 
      ref={ref}
      className="group bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-500 opacity-0 translate-y-8 hover:-translate-y-1"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-xl flex items-center justify-center text-purple-400 mb-4 group-hover:scale-110 transition-transform duration-300">
        <Icon size={24} />
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function StepCard({ icon: Icon, num, title, desc }) {
  const ref = useFadeIn()
  return (
    <div 
      ref={ref}
      className="relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 opacity-0 translate-y-8 group"
    >
      <div className="flex items-center gap-4 mb-3">
        <div className="w-12 h-12 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-full flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform duration-300">
          <Icon size={20} />
        </div>
        <span className="text-purple-400 font-mono text-sm bg-purple-500/10 px-3 py-1 rounded-full">0{num}</span>
      </div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function PricingCard({ plan, price, annualPrice, desc, features, popular, period }) {
  const ref = useFadeIn()
  const displayPrice = period === 'annual' && price !== 'Free' ? annualPrice : price
  return (
    <div 
      ref={ref}
      className={`relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border rounded-2xl p-8 transition-all duration-300 opacity-0 translate-y-8 hover:-translate-y-2 ${
        popular ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-purple-500/5' : 'border-white/10'
      }`}
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/30">
          Most Popular
        </div>
      )}
      <div className="text-white font-semibold text-lg">{plan}</div>
      <div className="text-3xl font-bold text-white mt-2">{displayPrice}</div>
      {price !== 'Free' && <div className="text-gray-400 text-sm">/{period === 'annual' ? 'year' : 'term'}</div>}
      <p className="text-gray-400 text-sm mt-2">{desc}</p>
      <ul className="mt-6 space-y-3">
        {features.map((f, i) => (
          <li key={i} className={`flex items-start gap-3 text-sm ${f.included ? 'text-gray-300' : 'text-gray-500'}`}>
            {f.included ? (
              <CheckCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
            ) : (
              <XCircle size={16} className="text-gray-600 flex-shrink-0 mt-0.5" />
            )}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>
      <Link
        to={plan === 'Enterprise' ? '/contact' : '/register'}
        className={`mt-8 w-full py-3 rounded-xl text-center block transition-all duration-300 ${
          popular
            ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-lg shadow-purple-500/30'
            : 'border border-white/20 hover:bg-white/10 text-white'
        }`}
      >
        {plan === 'Enterprise' ? 'Contact Sales' : plan === 'Starter' ? 'Start Free' : 'Choose Pro'}
      </Link>
    </div>
  )
}

function TestimonialCard({ quote, name, role }) {
  const ref = useFadeIn()
  return (
    <div 
      ref={ref}
      className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 opacity-0 translate-y-8"
    >
      <div className="flex gap-1 text-yellow-400 mb-3">
        {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#fbbf24" color="#fbbf24" />)}
      </div>
      <p className="text-gray-300 text-sm leading-relaxed">"{quote}"</p>
      <div className="flex items-center gap-3 mt-4">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500/30 to-purple-600/10 rounded-full flex items-center justify-center text-purple-400 font-semibold text-sm">
          {name.split(' ').map(n => n[0]).join('')}
        </div>
        <div>
          <div className="text-white text-sm font-semibold">{name}</div>
          <div className="text-gray-400 text-xs">{role}</div>
        </div>
      </div>
    </div>
  )
}

function WhyChooseItem({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-purple-500/30 transition-all duration-300">
      <Icon size={18} className="text-purple-400 flex-shrink-0" />
      <span className="text-gray-300 text-sm">{title}</span>
    </div>
  )
}

export default function Landing() {
  const [period, setPeriod] = useState('monthly')

  const features = [
    { icon: Building2, title: 'School Website', desc: 'Give your school a professional online presence with a custom page.', delay: 0 },
    { icon: FileText, title: 'Result Management', desc: 'Upload, edit, and publish results securely every term.', delay: 50 },
    { icon: Key, title: 'Secure Result PINs', desc: 'Generate unique PINs with full tracking and security.', delay: 100 },
    { icon: Wallet, title: 'Wallet System', desc: 'Fund your account and manage all PIN purchases from one place.', delay: 150 },
    { icon: Bot, title: 'AI Lesson Notes', desc: 'Generate quality lesson notes in seconds using AI.', delay: 200 },
    { icon: CreditCard, title: 'Student ID Cards', desc: 'Create beautiful, print-ready ID cards with QR codes.', delay: 250 },
    { icon: BarChart3, title: 'Analytics', desc: 'Track student performance, PIN usage, and school activities.', delay: 300 },
    { icon: Megaphone, title: 'Announcements', desc: 'Share important updates with students and parents instantly.', delay: 350 },
    { icon: Globe, title: 'Custom Domain', desc: 'Connect your own domain and strengthen your school\'s brand.', delay: 400 },
  ]

  const steps = [
    { icon: Building2, title: 'Create Your School', desc: 'Sign up for free and get your own branded school portal instantly.' },
    { icon: UserPlus, title: 'Add Students & Teachers', desc: 'Import your records or add them manually with ease.' },
    { icon: Upload, title: 'Upload Results', desc: 'Enter scores manually or upload them in bulk using Excel or CSV.' },
    { icon: Key, title: 'Generate Result PINs', desc: 'Buy and generate secure PINs in seconds.' },
    { icon: Eye, title: 'Parents Check Results', desc: 'Parents simply enter their PIN and admission number to view results anytime.' },
  ]

  const whyChooseItems = [
    { icon: CheckCircle, title: 'WAEC & NECO grading support' },
    { icon: CheckCircle, title: 'Secure online result checking' },
    { icon: CheckCircle, title: 'Paystack payment integration' },
    { icon: CheckCircle, title: 'Mobile-friendly for parents' },
    { icon: CheckCircle, title: 'Fast and reliable cloud platform' },
    { icon: CheckCircle, title: 'Safe and secure student data' },
  ]

  const plans = [
    {
      plan: 'Starter', price: 'Free', annualPrice: 'Free',
      desc: 'Perfect for schools getting started.',
      features: [
        { text: 'Up to 5 students', included: true },
        { text: 'Up to 2 teachers', included: true },
        { text: 'School page', included: true },
        { text: 'Result management', included: true },
        { text: 'PIN generation', included: true },
        { text: 'Wallet system', included: true },
        { text: 'AI lesson notes', included: false },
        { text: 'ID cards', included: false },
      ]
    },
    {
      plan: 'Pro', price: '₦10,000', annualPrice: '₦60,000', popular: true,
      desc: 'Perfect for growing schools.',
      features: [
        { text: 'Everything in Starter', included: true },
        { text: 'Up to 200 students', included: true },
        { text: 'Up to 10 teachers', included: true },
        { text: 'AI lesson notes', included: true },
        { text: 'Student ID cards', included: true },
        { text: 'Lower PIN prices', included: true },
        { text: 'Priority support', included: true },
      ]
    },
    {
      plan: 'Enterprise', price: '₦30,000', annualPrice: '₦180,000',
      desc: 'For large schools and campuses.',
      features: [
        { text: 'Everything in Pro', included: true },
        { text: 'Unlimited students', included: true },
        { text: 'Unlimited teachers', included: true },
        { text: 'Unlimited ID cards', included: true },
        { text: 'Unlimited AI lesson notes', included: true },
        { text: 'Custom domain', included: true },
        { text: 'Dedicated support', included: true },
      ]
    },
  ]

  const testimonials = [
    { quote: 'Publishing results has never been this easy. Parents now check results online without visiting the school.', name: 'Adaeze Okonkwo', role: 'School Administrator' },
    { quote: 'Our teachers save hours every week with the AI lesson notes.', name: 'Babatunde Musa', role: 'Principal' },
    { quote: 'We were fully set up in less than 10 minutes.', name: 'Fatima Eze', role: 'ICT Coordinator' },
    { quote: 'The PIN system has completely eliminated result fraud in our school.', name: 'Chidi Okoro', role: 'School Director' },
  ]

  return (
    <div className="min-h-screen bg-[#0B1120] overflow-hidden relative">
      {/* Gradient backgrounds */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-[#0B1120] to-[#0B1120] pointer-events-none" />
      <div className="absolute top-1/4 -left-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-3xl pointer-events-none" />
      
      <Particles />
      <Navbar />
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-24 md:pt-20 lg:pt-16 z-10">
        <div className="container mx-auto px-4 py-8 md:py-12 lg:py-16 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-8 max-w-6xl mx-auto">
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-3">
                <Zap size={14} fill="currentColor" />
                Trusted by 500+ Schools Across Nigeria
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                School Management<br />
                <span className="bg-gradient-to-r from-purple-400 to-purple-300 bg-clip-text text-transparent">
                  Made Simple
                </span>
              </h1>
              <p className="text-gray-400 text-lg mt-3 max-w-2xl mx-auto lg:mx-0">
                Everything your school needs to manage results, generate secure PINs, create student ID cards, 
                and help teachers work smarter—all in one easy-to-use platform.
              </p>
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 mt-4">
                <Link to="/register" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30">
                  Start Free <ArrowRight size={18} />
                </Link>
                <a href="#how-it-works" className="border border-white/20 hover:bg-white/10 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2">
                  <Play size={16} /> Watch Demo
                </a>
              </div>
            </div>

            <div className="flex-1 relative max-w-sm mx-auto lg:max-w-sm">
              <div className="relative bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-2 shadow-2xl shadow-purple-500/10">
                <img
                  src="/report.jfif"
                  alt="Sample student result sheet"
                  className="w-full rounded-xl"
                />
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-purple-500/30 to-purple-600/20 border border-purple-500/30 rounded-xl px-2 py-1 text-xs text-purple-300 backdrop-blur-sm">
                  <Sparkles size={10} className="inline mr-1" /> Live Preview
                </div>
              </div>
              <div className="absolute -top-3 -right-3 bg-[#0B1120] border border-purple-500/30 rounded-xl px-2 py-1 text-xs text-purple-300 shadow-xl backdrop-blur-sm flex items-center gap-1">
                <ShieldCheck size={12} /> PIN Verified
              </div>
              <div className="absolute -bottom-3 -left-3 bg-[#0B1120] border border-purple-500/30 rounded-xl px-2 py-1 text-xs text-purple-300 shadow-xl backdrop-blur-sm flex items-center gap-1">
                <Award size={12} /> Avg: 85.2%
              </div>
            </div>
          </div>

          {/* Stats with icons centered */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-10 max-w-4xl mx-auto">
            <Stat target={500} suffix="+" label="Schools" icon={School} />
            <Stat target={50000} suffix="+" label="Results Published" icon={ClipboardCheck} />
            <Stat target={1000} suffix="+" label="Teachers" icon={Users} />
            <Stat target={99.9} suffix="%" label="Uptime" icon={Server} />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="py-20 bg-gradient-to-b from-transparent to-white/5 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider bg-purple-500/10 px-4 py-1.5 rounded-full">How It Works</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">Get Started in Minutes</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {steps.map((s, i) => <StepCard key={i} num={i + 1} {...s} />)}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider bg-purple-500/10 px-4 py-1.5 rounded-full">Everything Your School Needs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">One Platform. Endless Possibilities.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => <FeatureCard key={i} {...f} />)}
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ── */}
      <section className="py-20 bg-gradient-to-b from-white/5 to-transparent relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider bg-purple-500/10 px-4 py-1.5 rounded-full">Why ExclusiveGrades</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">Built specifically for Nigerian schools.</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {whyChooseItems.map((item, i) => (
              <WhyChooseItem key={i} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-20 bg-gradient-to-b from-transparent to-white/5 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider bg-purple-500/10 px-4 py-1.5 rounded-full">Pricing</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">Simple Plans for Every School</h2>
            <p className="text-gray-400 mt-2 max-w-xl mx-auto">Choose a plan that fits your school and upgrade anytime.</p>
            <div className="inline-flex bg-white/5 border border-white/10 rounded-xl p-1 mt-4">
              <button
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${period === 'monthly' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
                onClick={() => setPeriod('monthly')}
              >
                Per Term
              </button>
              <button
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${period === 'annual' ? 'bg-purple-500 text-white' : 'text-gray-400'}`}
                onClick={() => setPeriod('annual')}
              >
                Per Year <span className="text-purple-400">Save 20%</span>
              </button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((p, i) => <PricingCard key={i} {...p} period={period} />)}
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8 text-sm text-gray-400">
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Gift size={14} className="text-purple-400" /> 100+ PINs — Save 5%
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Gift size={14} className="text-purple-400" /> 500+ PINs — Save 10%
            </span>
            <span className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5">
              <Gift size={14} className="text-purple-400" /> 1,000+ PINs — Save 15%
            </span>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <span className="text-purple-400 text-sm font-semibold uppercase tracking-wider bg-purple-500/10 px-4 py-1.5 rounded-full">What Schools Say</span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-4">Loved by school administrators</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-gradient-to-r from-purple-900/30 via-[#0B1120] to-purple-900/30 border-t border-white/5 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/5 to-transparent" />
        <div className="container mx-auto px-4 text-center relative z-10 max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Ready to Get Started?
          </h2>
          <p className="text-gray-400 mt-3 max-w-2xl mx-auto">
            Join hundreds of schools already using ExclusiveGrades to simplify school management.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link to="/register" className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg shadow-purple-500/30">
              Start Free Today <ArrowRight size={18} />
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">No credit card required. Set up in minutes.</p>
        </div>
      </section>

      <Footer />
    </div>
  )
}