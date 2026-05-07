import { Component, type ReactNode, type ErrorInfo } from 'react'

type Props = { children: ReactNode }
type State = { hasError: boolean; error: Error | null }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught error:', error, info.componentStack)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000',
          padding: '2rem',
        }}>
          <div style={{
            maxWidth: 480,
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
          }}>
            <h1 style={{
              fontFamily: "'Barlow', sans-serif",
              fontWeight: 700,
              fontSize: '1.5rem',
              color: '#fff',
              margin: 0,
            }}>
              Something went wrong
            </h1>
            <p style={{
              fontFamily: "'Barlow', sans-serif",
              fontSize: '14px',
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              lineHeight: 1.6,
            }}>
              An unexpected error occurred. Please refresh the page to try again.
            </p>
            {this.state.error && (
              <pre style={{
                fontFamily: 'monospace',
                fontSize: '12px',
                color: 'rgba(255,100,100,0.7)',
                background: 'rgba(255,255,255,0.03)',
                borderRadius: '0.5rem',
                padding: '1rem',
                textAlign: 'left',
                overflow: 'auto',
                maxHeight: 120,
                margin: 0,
              }}>
                {this.state.error.message}
              </pre>
            )}
            <button
              onClick={() => window.location.reload()}
              style={{
                fontFamily: "'Barlow', sans-serif",
                fontWeight: 600,
                fontSize: '14px',
                background: '#0052FF',
                color: '#fff',
                border: 'none',
                borderRadius: 9999,
                padding: '12px 28px',
                cursor: 'pointer',
                alignSelf: 'center',
              }}
            >
              Refresh Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
