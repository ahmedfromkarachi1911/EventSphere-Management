import { Link } from 'react-router-dom'
import { Sparkles, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="public-footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ color: '#fff', marginBottom: 14 }}>
              <span className="brand-mark"><Sparkles size={20} /></span>
              <span style={{ color: '#fff' }}>EVENT<span style={{ color: '#60A5FA' }}>SPHERE</span></span>
            </div>
            <p style={{ maxWidth: 300, fontSize: 13, color: '#94A3B8' }}>
              A complete platform to organize, manage and explore expos, exhibitions and trade shows across Pakistan.
            </p>
            <div className="flex gap-3 mt-4">
              <Facebook size={18} /> <Twitter size={18} /> <Instagram size={18} /> <Linkedin size={18} />
            </div>
          </div>

          <div>
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/expos">Explore Expos</Link></li>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4>Account</h4>
            <ul>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
              <li><Link to="/register">Become an Exhibitor</Link></li>
            </ul>
          </div>

          <div>
            <h4>Contact</h4>
            <ul>
              <li>Expo Centre, Karachi, Pakistan</li>
              <li>+92 300 1234567</li>
              <li>info@eventsphere.com</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 EventSphere. All rights reserved.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  )
}
