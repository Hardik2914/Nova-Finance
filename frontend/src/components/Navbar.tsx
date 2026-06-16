import { Terminal, LogOut } from 'lucide-react';

interface User {
  id: number;
  email: string;
  provider: string;
}

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  return (
    <nav className="navbar-container">
      <div className="container-hub" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
      }}>
        {/* Brand Logo */}
        <div 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 700,
            color: 'var(--color-ink)',
            fontSize: '18px',
            fontFamily: 'Outfit, sans-serif',
            userSelect: 'none'
          }}
        >
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--color-primary-start) 0%, var(--color-primary-end) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            boxShadow: 'var(--shadow-primary)'
          }}>
            <Terminal size={16} />
          </div>
          <span>Nova Finance</span>
        </div>

        {/* User Credentials & Logout actions */}
        {user && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px'
          }}>
            <span 
              className="caption-md sm-inline" 
              style={{ 
                color: 'var(--color-mute)',
                borderRight: '1px solid var(--color-hairline)',
                paddingRight: '16px',
                display: 'none',
                fontWeight: 600
              }}
            >
              {user.email}
            </span>
            <button 
              className="btn-secondary" 
              onClick={onLogout}
              style={{ 
                height: '32px', 
                fontSize: '12px', 
                borderRadius: '9999px', 
                padding: '0 14px',
                display: 'flex',
                gap: '6px',
                boxShadow: 'none'
              }}
            >
              <LogOut size={12} />
              Sign Out
            </button>
          </div>
        )}
      </div>

      <style>{`
        @media (min-width: 576px) {
          .sm-inline { display: inline !important; }
        }
      `}</style>
    </nav>
  );
}
