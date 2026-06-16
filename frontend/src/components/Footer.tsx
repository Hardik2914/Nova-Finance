import { useState } from 'react';
import { Terminal } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      window.alert(`Subscribed ${email} to Nova newsletter! (Simulated)`);
      setEmail('');
    }
  };

  const columns = [
    {
      title: 'Product',
      links: ['Hub Client', 'Extensions Store', 'Pricing', 'Changelog', 'Developer API']
    },
    {
      title: 'Core Features',
      links: ['Search', 'Command Palette', 'Custom Aliases', 'Shortcuts', 'System Control']
    },
    {
      title: 'Top Extensions',
      links: ['GitHub Integration', 'Slack Commands', 'Linear Tasks', 'Notion workspace', 'Spotify Player']
    },
    {
      title: 'Company',
      links: ['About Us', 'Careers', 'Security', 'Privacy Policy', 'Brand Assets']
    },
    {
      title: 'Community',
      links: ['Slack Community', 'GitHub Org', 'Changelog Contributions', 'Developer Stories']
    },
    {
      title: 'By Nova',
      links: ['Nova macOS', 'Nova Windows', 'Nova Web', 'Nova Teams']
    }
  ];

  return (
    <footer style={{
      backgroundColor: 'var(--color-surface-elevated)',
      borderTop: '1px solid var(--color-hairline)',
      position: 'relative',
      padding: '64px 0 48px 0',
    }}>
      <div className="container-hub">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '32px',
          marginBottom: '64px'
        }}>
          {columns.map((col, idx) => (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h4 className="body-sm-strong" style={{ color: 'var(--color-charcoal)' }}>
                {col.title}
              </h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a 
                      href="#" 
                      onClick={(e) => e.preventDefault()}
                      style={{
                        color: 'var(--color-mute)',
                        textDecoration: 'none',
                        fontSize: '13px',
                        fontWeight: 500,
                        transition: 'color 0.15s ease'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-primary)'}
                      onMouseOut={(e) => e.currentTarget.style.color = 'var(--color-mute)'}
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div style={{
          borderTop: '1px solid var(--color-hairline-strong)',
          paddingTop: '32px',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
          justifyContent: 'space-between',
          alignItems: 'center',
        }} className="md-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Terminal size={18} style={{ color: 'var(--color-mute)' }} />
            <span style={{ fontSize: '13px', color: 'var(--color-mute)', fontWeight: 500 }}>
              © {new Date().getFullYear()} Nova Hub. Built with React & Spring Boot.
            </span>
          </div>

          <form onSubmit={handleSubscribe} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '360px'
          }}>
            <input
              type="email"
              placeholder="Subscribe to newsletter..."
              className="text-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                flex: 1,
                fontSize: '13px',
                height: '38px',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-hairline-strong)'
              }}
            />
            <button 
              type="submit" 
              className="btn-primary" 
              style={{ height: '38px', padding: '0 18px', fontSize: '13px' }}
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .md-row {
            flex-direction: row !important;
          }
        }
      `}</style>
    </footer>
  );
}
