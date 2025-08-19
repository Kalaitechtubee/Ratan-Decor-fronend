import { Component } from 'react';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="text-gray-700 mb-4">{this.state.error?.message || 'An unexpected error occurred'}</p>
          <button 
            onClick={() => window.location.href = '/'} 
            className="text-blue-500 hover:underline"
          >
            Return to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;