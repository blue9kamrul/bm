import { Mail, Phone, MapPin, Heart, BugIcon, User2 } from "lucide-react";
import brittooLogo from "../../assets/brittoo.jpg";
import {
  FaFacebook,
  FaGithub,
  FaInstagram,
  FaLinkedin,
  FaTwitter,
} from "react-icons/fa6";
import Swal from "sweetalert2";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white mt-18">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center mb-6">
              <img src={brittooLogo} className="h-16 rounded-md" alt="" />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">
              Building a sustainable sharing economy where communities thrive
              through collaborative consumption and reduced waste.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com/profile.php?id=61575887767858"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-700 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 group"
              >
                <FaFacebook className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </a>
              <div
                onClick={() => {
                  Swal.fire({
                    icon: "info",
                    title: "Heads Up!",
                    text: "We’re not on Twitter yet, but stay tuned for updates! 😃"
                  });
                }}
                className="bg-gray-700 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 group"
              >
                <FaTwitter className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </div>
              <div
                onClick={() => {
                  Swal.fire({
                    icon: "info",
                    title: "Heads Up!",
                    text: "We’re not on Linked yet, but stay tuned for updates! 😃"
                  });
                }}
                className="bg-gray-700 hover:bg-emerald-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110 group"
              >
                <FaLinkedin className="h-5 w-5 text-gray-300 group-hover:text-white" />
              </div>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Contact Developer
            </h4>
            <ul className="space-y-3">
              <DeveloperLink
                href="mailto:aagalib2323@gmail.com?subject=Report%20A%20Bug"
                text="Report A Bug"
                icon={BugIcon}
              />
              <DeveloperLink
                href="https://www.linkedin.com/in/asadullah-al"
                text="LinkedIn"
                icon={FaLinkedin}
              />
              <DeveloperLink
                href="https://github.com/Galib-23"
                text="Github"
                icon={FaGithub}
              />
              <DeveloperLink
                href="https://www.facebook.com/galib.rcc.23"
                text="Facebook"
                icon={FaFacebook}
              />
            </ul>
          </div>

          {/* Support Links */}


          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-6 text-white">
              Get in Touch
            </h4>
            <div className="space-y-4">
              <ContactItem icon={Mail} text="durjoy6812@gmail.com" />
              <ContactItem icon={Phone} text="+8801860064433" />
              <ContactItem icon={MapPin} text="RUET, Rajshahi, Bangladesh" />
            </div>
            {/* Newsletter Signup */}
            <div className="mt-8 hidden md:block">
              <h5 className="font-semibold mb-3 text-white">Stay Updated</h5>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-2 rounded-l-xl bg-gray-700 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-gray-400"
                />
                <button className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-r-xl transition-colors duration-300 font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col justify-center sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <p className="text-gray-400 text-sm">
              © {currentYear} Brittoo. All rights reserved.
            </p>
            <div className="flex items-center text-gray-400 text-sm">
              <span>Made with</span>
              <Heart className="h-4 w-4 mx-1 text-green-500" />
              <span>for sustainable communities</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

const DeveloperLink = ({ href, text, icon: Icon }) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    <div className="flex items-center space-x-3 mt-2">
      <div className="bg-gray-700 p-1.5 rounded-lg">
        <Icon className="h-3 w-3 text-emerald-400" />
      </div>
      <span className="text-gray-300">{text}</span>
    </div>
  </a>
);

const ContactItem = ({ icon: Icon, text }) => (
  <div className="flex items-center space-x-3">
    <div className="bg-gray-700 p-2 rounded-lg">
      <Icon className="h-4 w-4 text-emerald-400" />
    </div>
    <span className="text-gray-300">{text}</span>
  </div>
);

export default Footer;
