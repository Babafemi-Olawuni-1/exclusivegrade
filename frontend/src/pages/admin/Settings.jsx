import React from 'react'
import Card from '../../components/Card'
import Alert from '../../components/Alert'

export default function Settings() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Settings</h1>

      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">School Information</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">School Name</label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              defaultValue="Your School Name"
              disabled
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue="admin@school.com"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
              <input
                type="tel"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                defaultValue="+234 (0) 901 234 567"
                disabled
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">Subscription Plan</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border-l-4 border-orange-500">
            <div>
              <p className="font-bold text-orange-900">Pro Plan</p>
              <p className="text-sm text-orange-700">₦10,000/term</p>
            </div>
            <button className="px-4 py-2 border border-orange-500 text-orange-500 rounded-lg hover:bg-orange-50">
              Upgrade
            </button>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="text-xl font-bold mb-6 text-gray-900">API Configuration</h2>
        <Alert type="info" message="Contact support to configure custom domain and API access." dismissible={false} />
      </Card>
    </div>
  )
}
