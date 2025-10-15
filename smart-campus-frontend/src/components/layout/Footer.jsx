import { Link } from "react-router-dom";
import { Github, Twitter, Linkedin, Mail, Heart } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Footer Component
 * Site footer with links and social media
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { name: "Features", path: "/#features" },
      { name: "Events", path: "/events" },
      { name: "Electives", path: "/electives" },
      { name: "Timetable", path: "/timetable" },
    ],
    company: [
      { name: "About", path: "/about" },
      { name: "Contact", path: "/contact" },
      { name: "Privacy", path: "/privacy" },
      { name: "Terms", path: "/terms" },
    ],
    social: [
      { name: "GitHub", icon: Github, url: "https://github.com" },
      { name: "Twitter", icon: Twitter, url: "https://twitter.com" },
      { name: "LinkedIn", icon: Linkedin, url: "https://linkedin.com" },
      { name: "Email", icon: Mail, url: "mailto:contact@smartcampus.edu" },
    ],
  };

  return (
    <footer className="bg-backgroundAlt dark:bg-backgroundAlt-dark border-t border-border dark:border-border-dark mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center space-x-2 group mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-white font-bold text-xl">SC</span>
              </div>
              <span className="font-display font-bold text-xl text-textPrimary dark:text-textPrimary-dark">
                Smart Campus
              </span>
            </Link>
            <p className="text-textSecondary dark:text-textSecondary-dark mb-6 max-w-md">
              Your all-in-one platform for campus events, elective selection,
              and timetable management. Making student life simpler and more
              organized.
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              {footerLinks.social.map((social) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-white dark:bg-backgroundAlt-dark hover:bg-primary hover:text-white dark:hover:bg-primary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                  >
                    <Icon className="w-5 h-5" />
                  </motion.a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="font-display font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">
              Product
            </h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-textSecondary dark:text-textSecondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="font-display font-semibold text-textPrimary dark:text-textPrimary-dark mb-4">
              Company
            </h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-textSecondary dark:text-textSecondary-dark hover:text-primary dark:hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border dark:border-border-dark">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-textSecondary dark:text-textSecondary-dark text-sm">
              © {currentYear} Smart Campus. All rights reserved.
            </p>
            <p className="text-textSecondary dark:text-textSecondary-dark text-sm flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-error fill-current" /> by
              the Smart Campus Team
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
