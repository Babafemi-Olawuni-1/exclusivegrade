import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Help() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-6">Help Center</h1>
        <div className="space-y-6 text-gray-400">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">How do I register my school?</h2>
            <p>Click "Register Free" on the homepage and fill in your school details. You'll be up and running in minutes.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">How do parents check results?</h2>
            <p>Parents visit your school's page and enter the student's admission number and PIN to view their result.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">How do I fund my wallet?</h2>
            <p>Go to the Wallet section in your dashboard and click "Fund Wallet". You can pay via Paystack or request a manual transfer.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-white font-semibold mb-2">Need more help?</h2>
            <p>Email us at <a href="mailto:support@exclusivegrades.com" className="text-purple-400 hover:underline">support@exclusivegrades.com</a></p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
