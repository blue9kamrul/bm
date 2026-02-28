import React from 'react';
import { ChevronDown, ChevronRight, FileText, Scale, Shield, Users, Package, CreditCard, AlertTriangle } from 'lucide-react';

const TermsAndConditions = () => {
  const [expandedSections, setExpandedSections] = React.useState({});

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const sections = [
    {
      id: 'user-eligibility',
      title: '1. User Eligibility and Registration',
      icon: Users,
      articles: [
        {
          id: '1.1',
          title: 'Age Requirements',
          content: 'You must be at least 18 years old to register and use Brittoo.xyz services.'
        },
        {
          id: '1.2',
          title: 'Information Accuracy',
          content: 'Accurate and truthful information is required during sign-up and must be maintained throughout your use of the platform.'
        },
        {
          id: '1.3',
          title: 'Identity Verification',
          content: 'Any fake or misleading identity information will result in immediate account suspension and potential legal action.'
        }
      ]
    },
    {
      id: 'item-listings',
      title: '2. Item Listings and Rental Services',
      icon: Package,
      articles: [
        {
          id: '2.1',
          title: 'Permitted Items',
          content: 'Only legal and safe-to-use items may be listed for rent on the platform. Prohibited items include but are not limited to illegal substances, weapons, and hazardous materials.'
        },
        {
          id: '2.2',
          title: 'Renter Responsibilities',
          content: 'Renters are responsible for inspecting items before use and reporting any issues within the inspection period.'
        },
        {
          id: '2.3',
          title: 'Lender Obligations',
          content: 'Lenders must ensure items are in usable condition and provide honest, accurate descriptions including any defects or limitations.'
        }
      ]
    },
    {
      id: 'security-deposits',
      title: '3. Collateral and Security Deposits',
      icon: Shield,
      articles: [
        {
          id: '3.1',
          title: 'Deposit Requirements',
          content: 'Renters must either deposit cash or offer an approved collateral item of equal or lower value as security for the rental.'
        },
        {
          id: '3.2',
          title: 'Collateral Return',
          content: 'Collateral must be returned to the renter upon safe return of the rented item in the agreed-upon condition.'
        },
        {
          id: '3.3',
          title: 'Forfeiture Conditions',
          content: 'Failure to return the rented item or returning it damaged gives Brittoo the right to transfer the collateral or deduct appropriate charges from the deposit.'
        }
      ]
    },
    {
      id: 'barter-deposit',
      title: '4. Barter-As-Deposit System',
      icon: CreditCard,
      articles: [
        {
          id: '4.1',
          title: 'Barter Option',
          content: 'Users may offer their own listed item as a temporary deposit for high-value rentals, subject to approval and valuation.'
        },
        {
          id: '4.2',
          title: 'Transfer Rights',
          content: 'If the rented item is damaged or not returned, Brittoo reserves the right to finalize the transfer of the collateral item to the lender.'
        }
      ]
    },
    {
      id: 'rent-to-own',
      title: '5. Rent-to-Own Services',
      icon: FileText,
      articles: [
        {
          id: '5.1',
          title: 'Acquisition Process',
          content: 'Items tagged "Rent-to-Own" can be permanently acquired after completing a pre-defined rental period and payment terms.'
        },
        {
          id: '5.2',
          title: 'Payment Completion',
          content: 'Users must complete all payment terms and requirements before the item ownership is officially transferred.'
        }
      ]
    },
    {
      id: 'delivery-storage',
      title: '6. Delivery and Storage Services',
      icon: Package,
      articles: [
        {
          id: '6.1',
          title: 'Logistics Management',
          content: 'Delivery and return logistics are handled by either the platform or users based on location and subscription tier.'
        },
        {
          id: '6.2',
          title: 'Storage Standards',
          content: 'Decentralized storage renters must ensure secure and hygienic storage conditions meeting platform standards.'
        }
      ]
    },
    {
      id: 'user-conduct',
      title: '7. User Conduct and Community Guidelines',
      icon: Users,
      articles: [
        {
          id: '7.1',
          title: 'Prohibited Behavior',
          content: 'No abusive, fraudulent, or harmful behavior will be tolerated on the platform.'
        },
        {
          id: '7.2',
          title: 'Platform Integrity',
          content: 'Any attempt to bypass the platform (e.g., conducting rentals outside the platform to avoid commission) may result in account ban and legal action.'
        }
      ]
    },
    {
      id: 'disputes',
      title: '8. Disputes and Resolution',
      icon: Scale,
      articles: [
        {
          id: '8.1',
          title: 'Reporting Timeline',
          content: 'All disputes related to rentals or damage must be reported within 24 hours of item return.'
        },
        {
          id: '8.2',
          title: 'Mediation Process',
          content: 'Brittoo\'s internal team will mediate disputes and make final decisions, which all users agree to honor and accept as binding.'
        }
      ]
    },
    {
      id: 'fees',
      title: '9. Fees and Charges',
      icon: CreditCard,
      articles: [
        {
          id: '9.1',
          title: 'Service Fees',
          content: 'Brittoo may charge service fees, late return penalties, and premium subscription charges as outlined in our fee schedule.'
        },
        {
          id: '9.2',
          title: 'Fee Changes',
          content: 'Fees are subject to change with prior notice provided to users through the platform or email.'
        }
      ]
    },
    {
      id: 'termination',
      title: '10. Account Termination',
      icon: AlertTriangle,
      articles: [
        {
          id: '10.1',
          title: 'Termination Rights',
          content: 'Brittoo reserves the right to suspend or terminate any account violating these terms or harming community trust.'
        }
      ]
    },
    {
      id: 'privacy',
      title: '11. Privacy and Data Protection',
      icon: Shield,
      articles: [
        {
          id: '11.1',
          title: 'Data Protection',
          content: 'Your personal data is protected under our comprehensive privacy policy and applicable data protection laws.'
        },
        {
          id: '11.2',
          title: 'Data Sharing',
          content: 'We never sell your data. Some data may be shared with delivery/storage partners only for operational purposes and service delivery.'
        }
      ]
    },
    {
      id: 'liability',
      title: '12. Liability and Disclaimers',
      icon: AlertTriangle,
      articles: [
        {
          id: '12.1',
          title: 'Platform Role',
          content: 'Brittoo is a platform that connects users and does not guarantee item quality, performance, or fitness for any particular purpose.'
        },
        {
          id: '12.2',
          title: 'User Risk',
          content: 'Users transact at their own risk, but Brittoo will take reasonable steps to ensure trust and safety within the community.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100">
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-full mb-6">
            <FileText className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-green-900 mb-4">Terms and Conditions</h1>
          <p className="text-green-700 text-lg max-w-2xl mx-auto">
            Please read these terms carefully before using Brittoo.xyz. By creating an account and using our services, you agree to be bound by these terms and conditions.
          </p>
          <div className="mt-6 p-4 bg-green-100 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              <strong>Last Updated:</strong> January 2025 | <strong>Effective Date:</strong> Upon Account Creation
            </p>
          </div>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-sm border border-green-200 p-8 mb-8">
          <h2 className="text-2xl font-semibold text-green-900 mb-4">Agreement to Terms</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            By signing up and using Brittoo.xyz, you enter into a legally binding agreement with us. These terms govern your use of our rental marketplace platform and all related services.
          </p>
          <p className="text-gray-700 leading-relaxed">
            If you do not agree with any part of these terms, you must not use our services. We reserve the right to update these terms at any time, and continued use of the platform constitutes acceptance of any modifications.
          </p>
        </div>

        {/* Terms Sections */}
        <div className="space-y-4">
          {sections.map((section) => {
            const IconComponent = section.icon;
            const isExpanded = expandedSections[section.id];
            
            return (
              <div key={section.id} className="bg-white rounded-lg shadow-sm border border-green-200 overflow-hidden">
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full px-8 py-6 text-left hover:bg-green-50 transition-colors duration-200 focus:outline-none focus:bg-green-50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-5 h-5 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-900">{section.title}</h3>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                </button>
                
                {isExpanded && (
                  <div className="px-8 pb-6">
                    <div className="space-y-6">
                      {section.articles.map((article) => (
                        <div key={article.id} className="border-l-4 border-green-200 pl-6">
                          <h4 className="text-lg font-medium text-green-800 mb-3">
                            Article {article.id}: {article.title}
                          </h4>
                          <p className="text-gray-700 leading-relaxed">{article.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm border border-green-200 p-8">
          <h3 className="text-xl font-semibold text-green-900 mb-4">Contact Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions about these Terms and Conditions, please contact our legal team:
          </p>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-green-800">
              <strong>Email:</strong> legal@brittoo.xyz<br />
              <strong>Address:</strong> Brittoo Legal Department<br />
              <strong>Response Time:</strong> Within 48 hours for terms-related inquiries
            </p>
          </div>
        </div>

        {/* Acceptance */}
        <div className="mt-8 text-center p-6 bg-green-600 text-white rounded-lg">
          <p className="text-lg font-medium">
            By using Brittoo.xyz, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;