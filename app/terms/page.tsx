export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="rounded-2xl bg-white p-8 sm:p-12 shadow-xl">
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
              <p className="text-gray-600">Effective Date: June 2025</p>
            </div>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Document Overview</h2>
                <p className="text-gray-600 leading-relaxed">
                  The Terms of Service establish rules for using Collabuu's platform, which facilitates collaborations between
                  businesses and influencers through campaign management and QR code-based customer acquisition.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Requirements</h2>
                <p className="text-gray-600 leading-relaxed">
                  Users must be 18+. Business accounts need valid registration documents, while influencer accounts must comply
                  with FTC/Canadian endorsement guidelines and disclose sponsored content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Token System</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The platform uses non-transferable tokens ($25 CAD minimum) for campaign funding.
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Unused tokens are non-refundable</li>
                  <li>Tokens deployed in campaigns cannot be refunded</li>
                  <li>Annual inactivity fees apply</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Campaign Models</h2>
                <p className="text-gray-600 leading-relaxed mb-4">Four types of campaigns are available:</p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li><strong className="text-gray-900">Pay Per Customer:</strong> QR scan verification</li>
                  <li><strong className="text-gray-900">Pay Per Post:</strong> Content approval required</li>
                  <li><strong className="text-gray-900">Media Events:</strong> Shared influencer pools</li>
                  <li><strong className="text-gray-900">Loyalty Reward Advertising:</strong> Customer loyalty programs</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment Timeline</h2>
                <p className="text-gray-600 leading-relaxed">
                  Influencers are paid within 7–14 business days post-campaign, with $25 CAD minimum payout thresholds.
                  Tax documentation is required for payments above $1000 CAD.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Dispute Resolution</h2>
                <p className="text-gray-600 leading-relaxed">
                  Complaints are reviewed within five business days. Alberta law governs Canadian users; California law
                  applies internationally, with corresponding court jurisdictions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Handling</h2>
                <p className="text-gray-600 leading-relaxed">
                  Personal data may be stored outside Canada (e.g., in the U.S. via Supabase, Stripe) per PIPEDA
                  compliance standards.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Prohibited Activities</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  The following activities violate terms and risk immediate account termination:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-600">
                  <li>Fraud</li>
                  <li>Harassment</li>
                  <li>Spam</li>
                  <li>QR manipulation</li>
                  <li>Bot usage</li>
                </ul>
              </section>

              <section className="pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-600">
                  By using Collabuu's platform, you agree to these Terms of Service. If you have questions,
                  please contact us at{' '}
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
