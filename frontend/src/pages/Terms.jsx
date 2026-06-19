import { Link } from 'react-router-dom'
import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0B1120]">
      <Navbar />
      <div className="container mx-auto px-4 py-20 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white">Terms of Service</h1>
          <p className="text-gray-400 mt-2">Last updated: June 2026</p>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance of Terms</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              By using ExclusiveGrades, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">2. Account Registration</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              You must provide accurate and complete information when registering your school account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">3. School Data</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              All data you upload to ExclusiveGrades remains your property. We act as a data processor, storing and managing your data securely. You have full control over your data and may export or delete it at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">4. Payments and Subscriptions</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Payments for PINs and subscriptions are processed securely through Paystack. All fees are non-refundable unless otherwise stated. We reserve the right to change pricing with notice.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">5. Acceptable Use</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              You agree to use ExclusiveGrades only for lawful purposes related to school administration. You may not use the platform to store or distribute illegal content, harass others, or disrupt the service.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">6. Service Availability</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We strive to provide reliable service but do not guarantee uninterrupted availability. We may perform maintenance and updates that could temporarily affect access.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">7. Termination</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms, engage in fraudulent activity, or fail to make timely payments. You may cancel your account at any time.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">8. Limitation of Liability</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              ExclusiveGrades is provided "as is" without warranties. We are not liable for any direct, indirect, incidental, or consequential damages arising from your use of the platform.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-white mb-3">9. Governing Law</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be resolved in the courts of Lagos, Nigeria.
            </p>
          </div>

          <div className="border-t border-white/10 pt-6">
            <h2 className="text-xl font-semibold text-white mb-3">Contact Us</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              For any questions regarding these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@exclusivegrades.com" className="text-purple-400 hover:text-purple-300">
                legal@exclusivegrades.com
              </a>
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}