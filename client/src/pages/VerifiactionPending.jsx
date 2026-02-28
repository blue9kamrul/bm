import { Clock, AlertCircle, Mail, CheckCircle } from "lucide-react";

export default function VerificationPending() {
  return (
    <div className="mx-2 flex flex-col items-center justify-center min-h-screen">
      <div className="text-center max-w-md bg-white rounded-lg shadow-lg border border-amber-200 p-6 mt-8">
        <div className="mx-auto flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        
        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Verification Pending
        </h2>
        
        {/* Description */}
        <p className="text-gray-600 mb-6 text-sm">
          Your verification request has been submitted and is currently being reviewed by our team.
        </p>
        
        {/* Status Steps */}
        <div className="text-left mb-6">
          <div className="flex items-center mb-3">
            <CheckCircle className="w-3 h-3 text-green-500 mr-3" />
            <span className="text-xs text-gray-700">Application submitted</span>
          </div>
          <div className="flex items-center mb-3">
            <Clock className="w-3 h-3 text-amber-500 mr-3" />
            <span className="text-xs text-amber-700 font-medium">Under review</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 border-2 border-gray-300 rounded-full mr-3"></div>
            <span className="text-xs text-gray-500">Verification complete</span>
          </div>
        </div>
        
        {/* Timeline */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="w-3 h-3 text-blue-600 mt-0.5 mr-3" />
            <div className="text-left">
              <p className="text-sm font-medium text-blue-900 mb-1">
                Review Timeline
              </p>
              <p className="text-xs text-blue-700">
                Verification typically takes 1-2 hours. We'll notify you once complete.
              </p>
            </div>
          </div>
        </div>
        
        {/* Contact Info */}
        <div className="flex items-center justify-center text-xs text-gray-600 mb-4">
          <Mail className="w-4 h-4 mr-2" />
          <span>Check your email for updates</span>
        </div>
        
        {/* Action Button */}
        <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 text-sm">
          Contact Support
        </button>
      </div>
    </div>
  );
}