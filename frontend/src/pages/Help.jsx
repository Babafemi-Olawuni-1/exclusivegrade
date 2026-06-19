import { useState } from 'react'
import { Link } from 'react-router-dom'
import { HelpCircle, Mail, Phone, MessageCircle, BookOpen, Shield, Users, FileText, ChevronRight, X } from 'lucide-react'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

function FlipCard({ icon: Icon, title, description, details, buttonText }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="relative h-[280px] cursor-pointer perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
    >
      <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Front */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:border-purple-500/30 transition-all duration-300 backface-hidden">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400 mb-4">
            <Icon size={24} />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
          <p className="text-gray-400 text-sm">{description}</p>
          <div className="absolute bottom-6 left-6 right-6">
            <span className="text-purple-400 text-sm font-medium hover:text-purple-300 transition-colors duration-200 inline-flex items-center gap-1">
              {buttonText} →
            </span>
          </div>
        </div>

        {/* Back */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm border border-purple-500/30 rounded-2xl p-6 rotate-y-180 backface-hidden overflow-y-auto">
          <button 
            onClick={() => setIsFlipped(false)}
            className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <X size={18} />
          </button>
          <div className="mt-4">
            <h4 className="text-white font-semibold text-base mb-3">{title}</h4>
            <div className="space-y-2 text-sm text-gray-300">
              {details.map((detail, index) => (
                <p key={index} className="flex items-start gap-2">
                  <ChevronRight size={14} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <span>{detail}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Help() {
  const helpCards = [
    {
      icon: BookOpen,
      title: 'Getting Started',
      description: 'Learn how to set up your school, add students, and publish your first results.',
      buttonText: 'View Guide',
      details: [
        'Create your school account and get your branded URL',
        'Add your school logo, colors, and contact information',
        'Create classes and subjects for your school',
        'Add students manually or import via CSV',
        'Add teachers and assign them to classes and subjects',
        'Upload your first set of results'
      ]
    },
    {
      icon: Shield,
      title: 'PIN System',
      description: 'Understand how PINs work, how to generate them, and how parents use them.',
      buttonText: 'Learn More',
      details: [
        'What are result PINs and how they work',
        'How to generate single and bulk PINs',
        'Setting PIN usage limits and expiry dates',
        'How parents check results using PINs',
        'Tracking PIN usage and status',
        'Troubleshooting common PIN issues'
      ]
    },
    {
      icon: Users,
      title: 'Student & Teacher Management',
      description: 'Add students, assign teachers, create classes, and organize your school.',
      buttonText: 'View Guide',
      details: [
        'Adding and managing student records',
        'Bulk import of students via CSV',
        'Creating and managing classes',
        'Adding teachers and generating login credentials',
        'Assigning teachers to classes and subjects',
        'Managing teacher and student accounts'
      ]
    },
    {
      icon: FileText,
      title: 'Results & Reports',
      description: 'Learn how to upload results, generate reports, and publish report cards.',
      buttonText: 'View Guide',
      details: [
        'Creating result templates for different classes',
        'Uploading results via CSV or manual entry',
        'Reviewing and approving draft results',
        'Publishing results for parent access',
        'Adding teacher and admin comments',
        'Generating student transcripts and report cards'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-4">
            <HelpCircle size={14} /> Support Center
          </div>
          <h1 className="text-4xl font-bold text-white">How can we help?</h1>
          <p className="text-gray-400 mt-2 max-w-xl mx-auto">Find answers to common questions and get the support you need.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {helpCards.map((card, index) => (
            <FlipCard key={index} {...card} />
          ))}
        </div>

        <div className="bg-gradient-to-br from-white/5 to-transparent backdrop-blur-sm border border-white/10 rounded-2xl p-8 mt-12 text-center">
          <h3 className="text-white font-semibold text-xl mb-4">Still need help?</h3>
          <p className="text-gray-400 mb-6">Our support team is ready to assist you.</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a href="mailto:support@exclusivegrades.com" className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-2">
              <Mail size={18} /> support@exclusivegrades.com
            </a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-2">
              <Phone size={18} /> +234 800 000 0000
            </a>
            <a href="#" className="text-purple-400 hover:text-purple-300 transition-colors duration-200 flex items-center gap-2">
              <MessageCircle size={18} /> Live Chat
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}