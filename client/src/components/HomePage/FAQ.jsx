import { useState } from "react";
import { ChevronDown, MessageCircle, HelpCircle } from "lucide-react";

const faqItems = [
  {
    question: "How does the credit system work?",
    answer:
      "Our credit system allows you to earn credits by renting out your items. These credits can then be used to rent items from other users without paying cash. Credits are non-convertible to cash and are designed to encourage sharing within our community.",
  },
  {
    question: "What happens if an item is damaged?",
    answer:
      "We have a damage waiver system in place. If an item is damaged during rental, the borrower is responsible. Depending on the selected payment method, either the security deposit will be used or credits will be deducted. Our admin team reviews all damage claims for fair resolution.",
  },
  {
    question: "How is the security deposit determined?",
    answer:
      "Security deposits are typically set at 20-30% of the item's market value. This amount is held securely and returned in full once the item is returned in the same condition as it was rented.",
  },
  {
    question: "How does verification work?",
    answer:
      "We verify users through institutional email verification (for university students) and require a selfie during registration. Additionally, all listings undergo verification by our admin team to ensure quality and accuracy.",
  },
  {
    question: "What are the trust levels and how do I advance?",
    answer:
      "Our trust system has four levels: Bronze, Silver, Gold, and Platinum. You advance by maintaining positive reviews, completing successful rentals, and following community guidelines. Higher trust levels unlock benefits like reduced security deposits and priority listing visibility.",
  },
  {
    question: "How do I report issues with a rental?",
    answer:
      "You can report issues through the 'Report Issue' button available on any active rental. Our support team will review your report and help resolve the situation according to our dispute resolution policy.",
  },
];

const AccordionItem = ({ question, answer, isOpen, onToggle }) => (
  <div className="border border-gray-200 rounded-xl mb-4 overflow-hidden transition-all duration-300 hover:shadow-md">
    <button
      onClick={onToggle}
      className="w-full px-6 py-5 text-left bg-white hover:bg-gray-50 transition-colors duration-200 flex items-center justify-between group"
    >
      <span className="font-semibold text-gray-900 pr-4 group-hover:text-green-600 transition-colors duration-200 text-sm">
        {question}
      </span>
      <ChevronDown
        className={`h-5 w-5 text-green-600 transition-transform duration-300 flex-shrink-0 ${isOpen ? "rotate-180" : ""
          }`}
      />
    </button>
    <div
      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
    >
      <div className="px-6 pb-5 pt-1">
        <p className="text-gray-600 text-xs leading-relaxed border-l-4 border-green-100 pl-4">
          {answer}
        </p>
      </div>
    </div>
  </div>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-6 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-green-100 p-4 rounded-2xl">
              <HelpCircle className="h-8 w-8 text-green-600" />
            </div>
          </div>
          <div className="text-center mb-12 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-900 border-b-2 border-green-500 pb-2 w-fit">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-500 mt-3 text-sm max-w-3xl mx-auto leading-relaxed">
              Find answers to common questions about using Brittoo's rental
              platform
            </p>
          </div>
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          <div className="space-y-2">
            {faqItems.map((item, index) => (
              <AccordionItem
                key={index}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onToggle={() => toggleAccordion(index)}
              />
            ))}
          </div>
        </div>

        {/* Contact Support CTA */}
        <div className="mt-16 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 max-w-2xl mx-auto">
            <div className="flex justify-center mb-4">
              <div className="bg-green-100 p-3 rounded-xl">
                <MessageCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6 leading-relaxed text-sm">
              We're here to help! Our support team is ready to assist you with
              any questions or concerns.
            </p>
            <a href="https://wa.me/8801860064433?text=I%20have%20a%20question" target="_blank" rel="noopener noreferrer">
              <button className="bg-green-500 hover:bg-green-600 text-white text-sm px-6 py-2 rounded-md font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Contact Support
              </button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
