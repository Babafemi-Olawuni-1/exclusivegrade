import Navbar from '../components/layout/Navbar'
import Footer from '../components/layout/Footer'

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col">
      <Navbar />
      <div className="flex-1 container mx-auto px-4 py-32 max-w-3xl">
        <h1 className="text-3xl font-bold text-white mb-6">Privacy Policy</h1>
        <div className="prose prose-invert text-gray-400 space-y-4">
          <p>Last updated: January 2026</p>
          <h2 className="text-white text-xl font-semibold">Data We Collect</h2>
          <p>We collect school registration information, student records (as provided by schools), and usage data to improve our service.</p>
          <h2 className="text-white text-xl font-semibold">How We Use Your Data</h2>
          <p>Your data is used solely to provide the ExclusiveGrades service. We do not sell or share your data with third parties.</p>
          <h2 className="text-white text-xl font-semibold">Data Security</h2>
          <p>All data is encrypted in transit and at rest. We use industry-standard security practices to protect your information.</p>
          <h2 className="text-white text-xl font-semibold">Contact</h2>
          <p>For privacy concerns, email <a href="mailto:privacy@exclusivegrades.com" className="text-purple-400 hover:underline">privacy@exclusivegrades.com</a></p>
        </div>
      </div>
      <Footer />
    </div>
  )
}
