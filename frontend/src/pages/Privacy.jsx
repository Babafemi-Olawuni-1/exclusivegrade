import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">Privacy Policy</h1>
          <p className="text-gray-400 mt-2">Last updated: June 2026</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              ExclusiveGrades collects information when you register your school, add students and teachers, and use our platform. This includes school name, contact information, student names, admission numbers, academic records, and transaction data.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use your information to provide, maintain, and improve our services, process transactions, communicate with you, and ensure the security of our platform. We do not sell or share your personal information with third parties for marketing purposes.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Security</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit and at rest.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Data Retention</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We retain your data as long as your account is active. You may request deletion of your data at any time by contacting our support team.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">5. Third-Party Services</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We use trusted third-party services including Paystack for payment processing and cloud hosting providers to deliver our services. These providers have their own privacy policies and security measures.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">6. NDPR Compliance</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              ExclusiveGrades is committed to protecting your privacy in accordance with the Nigeria Data Protection Regulation (NDPR). We ensure that all data processing activities are lawful, fair, and transparent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">7. Children's Privacy</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Our platform is designed for use by schools and educational institutions. We do not knowingly collect personal information from children under 13 without parental consent.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">8. Changes to This Policy</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@exclusivegrades.com" className="text-purple-400 hover:text-purple-300">
                privacy@exclusivegrades.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}