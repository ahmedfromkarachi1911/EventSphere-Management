import { Target, Eye, HeartHandshake } from 'lucide-react'

export default function About() {
  return (
    <div className="container section">
      <div className="hero-grid" style={{ alignItems: 'center' }}>
        <div>
          <span className="eyebrow">About EventSphere</span>
          <h1 style={{ fontSize: 36 }}>Built to bring expos, exhibitors and attendees together.</h1>
          <p className="lead mt-4">
            EventSphere is a smart expo management platform designed to simplify the way events are
            organized and experienced. We connect organizers, exhibitors and attendees on a single platform.
          </p>
        </div>
        <div className="hero-image">
          <img src="https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=900&q=80" alt="EventSphere office" />
        </div>
      </div>

      <div className="grid grid-3 mt-6" style={{ marginTop: 56 }}>
        <div className="card">
          <div className="stat-icon" style={{ marginBottom: 14 }}><Target size={20} /></div>
          <h3 style={{ fontSize: 16 }}>Our Mission</h3>
          <p className="text-muted mt-2" style={{ fontSize: 14 }}>To empower events organizers, exhibitors and attendees with technology that makes every expo effortless to run and enjoy.</p>
        </div>
        <div className="card">
          <div className="stat-icon" style={{ marginBottom: 14 }}><Eye size={20} /></div>
          <h3 style={{ fontSize: 16 }}>Our Vision</h3>
          <p className="text-muted mt-2" style={{ fontSize: 14 }}>To be the region's go-to platform for discovering, managing and experiencing expos and trade shows.</p>
        </div>
        <div className="card">
          <div className="stat-icon" style={{ marginBottom: 14 }}><HeartHandshake size={20} /></div>
          <h3 style={{ fontSize: 16 }}>Our Values</h3>
          <p className="text-muted mt-2" style={{ fontSize: 14 }}>Innovation, integrity and customer success guide every feature we build.</p>
        </div>
      </div>
    </div>
  )
}
