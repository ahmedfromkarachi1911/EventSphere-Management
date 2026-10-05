import { Phone, Mail, MapPin } from 'lucide-react'

export default function Contact() {
  return (
    <div className="container section">
      <div className="grid grid-2">
        <div>
          <span className="eyebrow">Get in Touch</span>
          <h1 style={{ fontSize: 32 }}>Contact Us</h1>
          <p className="text-muted mt-4">Have questions? We're here to help. Reach out to us.</p>

          <div className="mt-6" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="flex gap-3 items-center">
              <div className="stat-icon" style={{ width: 40, height: 40 }}><Phone size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Phone</div>
                <div className="text-muted" style={{ fontSize: 13 }}>+92 300 1234567</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="stat-icon" style={{ width: 40, height: 40 }}><Mail size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Email</div>
                <div className="text-muted" style={{ fontSize: 13 }}>info@eventsphere.com</div>
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <div className="stat-icon" style={{ width: 40, height: 40 }}><MapPin size={18} /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13 }}>Location</div>
                <div className="text-muted" style={{ fontSize: 13 }}>Expo Centre, Karachi, Pakistan</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="form-group">
            <label className="form-label">Your Name</label>
            <input className="input" placeholder="Enter your full name" />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="input" placeholder="Enter your email" />
          </div>
          <div className="form-group">
            <label className="form-label">Subject</label>
            <input className="input" placeholder="Subject" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="textarea" placeholder="Write your message..." />
          </div>
          <button className="btn btn-primary btn-block">Send Message</button>
        </div>
      </div>
    </div>
  )
}
