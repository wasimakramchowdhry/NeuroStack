import { Component, ReactNode } from 'react';
import { NeoCard } from '../neo/NeoCard';
import { NeoButton } from '../neo/NeoButton';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
          <NeoCard className="p-8 max-w-lg text-center">
            <NeoCard variant="flat" className="p-6 inline-block mb-6">
              <AlertCircle className="w-16 h-16 text-destructive" />
            </NeoCard>
            
            <h1 className="text-2xl font-bold text-[var(--neo-text-primary)] mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-[var(--neo-text-secondary)] mb-6">
              We encountered an unexpected error. Don't worry, your data is safe.
            </p>
            
            {this.state.error && (
              <NeoCard variant="inset" className="p-4 mb-6 text-left">
                <p className="text-sm text-destructive font-mono">
                  {this.state.error.message}
                </p>
              </NeoCard>
            )}
            
            <NeoButton
              variant="primary"
              onClick={this.handleReset}
            >
              <RefreshCw className="w-5 h-5" />
              Return to Home
            </NeoButton>
          </NeoCard>
        </div>
      );
    }

    return this.props.children;
  }
}
