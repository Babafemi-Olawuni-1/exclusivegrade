import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Terms() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-6">Terms of Service</h1>
        <div className="text-gray-400 space-y-4">
          <p>Last updated: January 2026</p>
          <h2 className="text-white text-xl font-semibold">Acceptance of Terms</h2>
          <p>By using ExclusiveGrades, you agree to these terms. Schools are responsible for the accuracy of student data they enter.</p>
          <h2 className="text-white text-xl font-semibold">Service Usage</h2>
          <p>ExclusiveGrades is provided for school management purposes only. Any misuse will result in account termination.</p>
          <h2 className="text-white text-xl font-semibold">Payments</h2>
          <p>All payments are processed securely via Paystack. Wallet funds are non-refundable once PINs are generated.</p>
          <h2 className="text-white text-xl font-semibold">Contact</h2>
          <p>Email <a href="mailto:legal@exclusivegrades.com" className="text-purple-400 hover:underline">legal@exclusivegrades.com</a> for legal inquiries.</p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
