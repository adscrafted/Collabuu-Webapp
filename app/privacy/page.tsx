export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
              <p className="text-gray-600">Effective Date: June 2025</p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Overview</h2>
                <p className="text-gray-600 leading-relaxed">
                  Collabuu is committed to protecting your privacy and explains data handling practices across its
                  mobile app and website while noting compliance with PIPEDA and Canadian privacy laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information Collection</h2>
                <p className="text-gray-600 leading-relaxed mb-4">The platform gathers:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong className="text-gray-900">Personal details:</strong> Name, email, phone, payment info via Stripe, and social handles</li>
                  <li><strong className="text-gray-900">Usage data:</strong> IP addresses, device information, and platform interactions</li>
                  <li><strong className="text-gray-900">User-generated content:</strong> Posts, media submissions, and QR code scan data</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Data Usage Purposes</h2>
                <p className="text-gray-600 leading-relaxed mb-4">Information serves to:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Facilitate event operations</li>
                  <li>Process payments</li>
                  <li>Share content with businesses</li>
                  <li>Enhance user experience</li>
                  <li>Prevent fraud</li>
                  <li>Enable customer communications</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Sharing Practices</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Personal data is <strong className="text-gray-900">not sold</strong>. However, business partners receive social media handles and
                  submitted content when users engage with events.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Third-party services include Stripe for payments and Supabase for backend infrastructure.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Storage & Geographic Transfer</h2>
                <p className="text-gray-600 leading-relaxed">
                  Data resides on Supabase servers potentially located outside Canada. Users consent to international
                  transfers by utilizing the platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Retention Timeframe</h2>
                <p className="text-gray-600 leading-relaxed">
                  Information is maintained only as necessary for stated purposes or legal obligations, with deletion
                  available upon request.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. User Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4">Canadian users can:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Access their data</li>
                  <li>Correct their information</li>
                  <li>Withdraw consent</li>
                  <li>Request deletion</li>
                  <li>Inquire about disclosure practices</li>
                </ul>
                <p className="text-gray-600 leading-relaxed mt-4">
                  Contact us at{' '}
                  <a href="mailto:support@collabuu.com" className="font-medium text-pink-500 hover:text-pink-600">
                    support@collabuu.com
                  </a>{' '}
                  to exercise these rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Communications Policy</h2>
                <p className="text-gray-600 leading-relaxed">
                  The platform complies with Canada's Anti-Spam Legislation, requiring express or implied consent for
                  messaging, with opt-out mechanisms available.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Tracking Technology</h2>
                <p className="text-gray-600 leading-relaxed">
                  The website uses cookies for essential functionality and user preferences; the mobile app does not use cookies.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Security Measures</h2>
                <p className="text-gray-600 leading-relaxed">
                  The company implements safeguards while acknowledging no system achieves absolute security.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Policy Modifications</h2>
                <p className="text-gray-600 leading-relaxed">
                  Updates will be noted with revised effective dates.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
                <p className="text-gray-600 leading-relaxed mb-2">
                  <strong className="text-gray-900">Email:</strong>{' '}
                  <a href="mailto:support@collabuu.com" className="font-medium text-pink-500 hover:text-pink-600">
                    support@collabuu.com
                  </a>
                </p>
                <p className="text-gray-600 leading-relaxed">
                  <strong className="text-gray-900">Address:</strong> 1234 Fake Street, Edmonton, Alberta, Canada
                </p>
              </section>

              <section className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  By using Collabuu's platform, you consent to this Privacy Policy. If you have questions or concerns
                  about how we handle your data, please contact us at{' '}
                  <a href="mailto:support@collabuu.com" className="font-medium text-pink-500 hover:text-pink-600">
                    support@collabuu.com
                  </a>.
                </p>
              </section>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
