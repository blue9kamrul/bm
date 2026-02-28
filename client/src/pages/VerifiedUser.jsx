import { CheckCircle, User, Shield } from 'lucide-react';

const VerifiedUser = ({ currentUser }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Account Verified!
          </h1>
          <p className="text-gray-600">
            Your account has been successfully verified and is ready to use.
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-center mb-2">
            <User className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-800">
              {currentUser?.email || currentUser?.username || 'User'}
            </span>
          </div>
          <div className="flex items-center justify-center">
            <Shield className="w-4 h-4 text-green-600 mr-2" />
            <span className="text-xs text-green-700">
              Status: {currentUser?.isVerified || 'VERIFIED'}
            </span>
          </div>
        </div>
        <div className="text-left mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            What you can do now:
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Access all premium features
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Secure account protection
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Full platform functionality
            </li>
            <li className="flex items-center">
              <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
              Priority customer support
            </li>
          </ul>
        </div>
        <div className="space-y-3">
          <button
            onClick={() => window.location.href = '/dashboard/overview'}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Need help? Contact our support team
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifiedUser;