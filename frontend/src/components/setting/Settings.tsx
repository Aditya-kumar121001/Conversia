export default function Setting() {
    const tabs = [
      "My details",
      "Profile",
      "Password",
      "Team",
      "Billings",
      "Plan",
      "Email",
      "Notifications",
    ];
  
    return (
      <div className="min-h-screen bg-gray-50 px-2 py-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-semibold">Settings</h1>
          <p className="text-sm text-gray-500 mt-1 mb-6">
            Manage your account settings and preferences.
          </p>
  
          {/* Tabs */}
          <div className="flex gap-6 border-b mb-8 text-sm">
            {tabs.map((tab) => (
              <button
                key={tab}
                className={`pb-3 ${
                  tab === "Billings"
                    ? "border-b-2 border-black font-medium text-black"
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
  
          {/* Billing Content */}
          <div className="space-y-10">
            {/* Payment Method */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-1">Payment Method</h3>
              <p className="text-sm text-gray-500 mb-4">
                Update your billing details and address.
              </p>
  
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">
                    Name on card
                  </label>
                  <input className="input" placeholder="Mayad Ahmed" />
                </div>
  
                <div>
                  <label className="block text-gray-600 mb-1">Expiry</label>
                  <input className="input" placeholder="02 / 2028" />
                </div>
  
                <div className="md:col-span-2">
                  <label className="block text-gray-600 mb-1">
                    Card number
                  </label>
                  <input className="input" placeholder="8269 9602 9292 2538" />
                </div>
  
                <div>
                  <label className="block text-gray-600 mb-1">CVV</label>
                  <input className="input" placeholder="•••" />
                </div>
              </div>
  
              <button className="mt-4 text-sm text-gray-600 hover:underline">
                + Add another card
              </button>
            </section>
  
            {/* Contact Email */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-1">Contact email</h3>
              <p className="text-sm text-gray-500 mb-4">
                Where should invoices be sent?
              </p>
  
              <div className="space-y-3 text-sm">
                <label className="flex items-center gap-2">
                  <input type="radio" defaultChecked />
                  Send to the existing email
                </label>
                <label className="flex items-center gap-2">
                  <input type="radio" />
                  Add another email address
                </label>
              </div>
            </section>
  
            {/* Billing History */}
            <section className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="font-semibold mb-4">Billing History</h3>
  
              <table className="w-full text-sm">
                <thead className="text-gray-500 border-b">
                  <tr>
                    <th className="text-left py-2">Invoice</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Tracking</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Account Sale",
                      date: "Apr 14, 2004",
                      amount: "$3,050",
                      status: "Pending",
                    },
                    {
                      name: "Account Sale",
                      date: "Jun 24, 2008",
                      amount: "$1,050",
                      status: "Cancelled",
                    },
                    {
                      name: "Netflix Subscription",
                      date: "Feb 28, 2004",
                      amount: "$800",
                      status: "Refund",
                    },
                  ].map((row, i) => (
                    <tr key={i} className="border-b last:border-none">
                      <td className="py-3">{row.name}</td>
                      <td>{row.date}</td>
                      <td>{row.amount}</td>
                      <td>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            row.status === "Pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : row.status === "Cancelled"
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-700"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                      <td className="text-blue-600 hover:underline cursor-pointer">
                        View
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        </div>
      </div>
    );
  }
  