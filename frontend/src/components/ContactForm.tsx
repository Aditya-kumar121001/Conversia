import  { useState } from "react";

export function ContactForm() {
  const [category, setCategory] = useState<"personal" | "business">("personal");

  return (
    <div className="flex items-center justify-center w-full p-6">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-lg p-8">
        {/* Toggle */}
        <div className="flex justify-center mb-6 space-x-6">
          <button
            className={`text-lg font-medium transition ${
              category === "personal" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setCategory("personal")}
          >
            Personal
          </button>
          <button
            className={`text-lg font-medium transition ${
              category === "business" ? "text-white" : "text-gray-400"
            }`}
            onClick={() => setCategory("business")}
          >
            Business
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6">
          {category === "personal" ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email *
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="you@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Use Case *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="E.g., study helper, travel guide"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Voice Preference
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="E.g., friendly, formal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Type your message here..."
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Company Name *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your company name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Business Email *
                </label>
                <input
                  type="email"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="contact@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Industry *
                </label>
                <input
                  type="text"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="E.g., healthcare, finance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Team Size
                </label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Number of employees"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Message *
                </label>
                <textarea
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Tell us about your project..."
                />
              </div>
            </>
          )}

          <div className="pt-4">
            <button
              type="submit"
              className="w-full rounded-md bg-black px-4 py-2 text-white shadow hover:bg-gray-800 focus:outline-none"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
