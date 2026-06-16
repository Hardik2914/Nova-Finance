import { ArrowRight, Play } from 'lucide-react';

interface HeroProps {
  onExploreStore: () => void;
}

export default function Hero({ onExploreStore }: HeroProps) {
  return (
    <header className="hero-section">
      <div className="hero-mesh" />

      <div className="container-hub" style={{
        position: 'relative',
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '24px',
        maxWidth: '850px'
      }}>
        <div className="badge-info-soft">
          Nova Web Hub is Now Live
        </div>

        <h1 className="display-xl">
          Built for the perfect <br />
          <span style={{
            background: 'linear-gradient(135deg, var(--color-primary-start) 0%, var(--color-primary-end) 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>developer workflow</span>
        </h1>

        <p className="body-lg" style={{ maxWidth: '640px', margin: '0 auto 12px auto' }}>
          Supercharge your productivity. Search, install, and execute tools directly from the web command palette mockup below. Persist your workflow integrations seamlessly.
        </p>

        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button 
            className="btn-primary" 
            onClick={onExploreStore}
          >
            Explore Store
            <ArrowRight size={16} style={{ marginLeft: '8px' }} />
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => window.alert("Simulated: Nova Demo Video playing...")}
          >
            <Play size={14} style={{ marginRight: '8px', fill: 'currentColor' }} />
            Watch Demo
          </button>
        </div>
      </div>
    </header>
  );
}
