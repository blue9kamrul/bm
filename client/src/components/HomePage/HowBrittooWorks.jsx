import { CheckCircle, Plus, CreditCard, Shield } from "lucide-react";

const Step = ({ number, title, description, isLast = false }) => (
  <div className="flex group">
    <div className="flex flex-col items-center mr-6">
      <div className="flex items-center justify-center rounded-full bg-green-500 text-white w-10 h-10 font-semibold text-sm shadow-lg transition-all duration-300 group-hover:bg-green-600 group-hover:scale-110">
        {number}
      </div>
      {!isLast && (
        <div className="h-8 w-0.5 bg-gradient-to-b from-green-500 to-green-200 mt-2"></div>
      )}
    </div>
    <div className="flex-1">
      <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-green-600 transition-colors duration-300">
        {title}
      </h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  </div>
);

const HowBrittooWorks = () => {
  return (
    <div className="min-h-screen bg-white mt-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-12 flex flex-col items-center">
          <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 pb-2 w-fit">
            How It Works
          </h1>
          <p className="text-gray-500 mt-3 text-sm max-w-3xl mx-auto leading-relaxed">
            Our platform makes it easy to rent items with cash or credits earned
            by renting your own items. Join our community to reduce waste and
            get access to more while owning less.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
          {/* Renting Items */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center mb-8">
              <div className="bg-green-100 p-2 rounded-xl mr-4">
                <CreditCard className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Renting Items</h3>
            </div>

            <div className="space-y-3">
              <Step
                number={1}
                title="Browse Listings"
                description="Explore our categorized and verified listings to find exactly what you need."
              />
              <Step
                number={2}
                title="Choose Payment Method"
                description="Decide whether to pay with cash deposit or use your earned credits."
              />
              <Step
                number={3}
                title="Arrange Pickup"
                description="Coordinate with the owner for a convenient pickup location and time."
              />
              <Step
                number={4}
                title="Return & Review"
                description="Return the item in good condition and leave a review about your experience."
                isLast
              />
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Safety First:</span> All
                  rentals are covered by our damage waiver system to protect
                  both parties.
                </p>
              </div>
            </div>
          </div>

          {/* Listing Items */}
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col justify-between">
            <div className="flex items-center mb-8">
              <div className="bg-green-200 p-3 rounded-xl mr-4">
                <Plus className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Listing Your Items
              </h3>
            </div>

            <div className="space-y-3">
              <Step
                number={1}
                title="Create a Listing"
                description="Add details, photos, and set your rental price or credit requirements."
              />
              <Step
                number={2}
                title="Get Verified"
                description="Our team reviews your listing to ensure quality and accuracy."
              />
              <Step
                number={3}
                title="Respond to Requests"
                description="Accept rental requests and arrange item handover details."
              />
              <Step
                number={4}
                title="Earn & Grow"
                description="Collect cash or earn credits while building your trust profile."
                isLast
              />
            </div>

            <div className="mt-8 p-4 bg-green-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700">
                  <span className="font-semibold">Build Trust:</span> Higher
                  trust levels unlock better opportunities and features on the
                  platform.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Credit System */}
        <div className="bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-gray-100">
          <div className="text-center mb-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 pb-3 w-fit">
              Credit System Explained
            </h1>
            <p className="text-gray-500 mt-3 text-sm max-w-3xl mx-auto leading-relaxed">
              Our credit system enables a true sharing economy where your
              contributions are rewarded and can be used to access other
              community resources.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-green-100 p-4 inline-block rounded-2xl mb-3 group-hover:bg-green-200 transition-colors duration-300">
                <Plus className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-3 text-gray-900">
                Earn Credits
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                List your items and earn credits when others rent them based on
                item value.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 p-4 inline-block rounded-2xl mb-3 group-hover:bg-green-200 transition-colors duration-300">
                <CreditCard className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-3 text-gray-900">
                Spend Credits
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Use earned credits to rent items without paying cash deposits.
              </p>
            </div>

            <div className="text-center group">
              <div className="bg-green-100 p-4 inline-block rounded-2xl mb-3 group-hover:bg-green-200 transition-colors duration-300">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="font-semibold mb-3 text-gray-900">
                Gain Trust
              </h4>
              <p className="text-gray-600 leading-relaxed text-sm">
                Build trust through successful rentals and earn badges that
                increase your opportunities.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowBrittooWorks;
