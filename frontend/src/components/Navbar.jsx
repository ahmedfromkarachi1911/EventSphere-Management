import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Sparkles, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [open, setOpen] = useState(false)

  const links = [
    { to: '/', label: 'Home' },
    { to: '/expos', label: 'Expos' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  return (
    <header className="public-navbar">
      <div className="container">
        <Link to="/" className="brand">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span><span className="brand-event">EVENT</span><span className="brand-sphere">SPHERE</span></span>
        </Link>

        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.to === '/'}>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="nav-cta">
          <Link to="/login" className="btn btn-ghost">Login</Link>
          <Link to="/register" className="btn btn-primary">Register</Link>
          <button className="btn-icon mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="container" style={{ paddingBottom: 16 }}>
          <div className="flex" style={{ flexDirection: 'column', gap: 4 }}>
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === '/'}
                onClick={() => setOpen(false)}
                style={{ padding: '10px 4px', fontWeight: 600, fontSize: 14 }}
              >
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
