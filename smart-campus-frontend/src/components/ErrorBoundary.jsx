import React from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * ErrorBoundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing.
 *
 * Usage:
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    this.setState({
      error,
      errorInfo,
    });

    // You can also log to an error reporting service here
    // logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={() =>
            this.setState({ hasError: false, error: null, errorInfo: null })
          }
        />
      );
    }

    return this.props.children;
  }
}

/**
 * ErrorFallback Component
 *
 * Beautiful fallback UI shown when an error is caught
 */
function ErrorFallback({ error, errorInfo, resetError }) {
  const navigate = useNavigate();

  const handleGoHome = () => {
    resetError();
    navigate("/dashboard");
  };

  const handleReload = () => {
    resetError();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Error Card */}
        <div className="glass-strong rounded-2xl p-8 space-y-6">
          {/* Error Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full"></div>
              <div className="relative bg-red-500/10 p-6 rounded-full">
                <AlertCircle className="w-16 h-16 text-red-400" />
              </div>
            </div>
          </div>

          {/* Error Message */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-white">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-300">
              We encountered an unexpected error. Don't worry, your data is
              safe.
            </p>
          </div>

          {/* Error Details (Development Mode) */}
          {import.meta.env.DEV && error && (
            <div className="bg-black/30 rounded-lg p-4 space-y-2">
              <p className="text-red-400 font-semibold text-sm">
                Error Details (Development Mode):
              </p>
              <pre className="text-xs text-gray-300 overflow-x-auto">
                {error.toString()}
              </pre>
              {errorInfo && (
                <details className="text-xs text-gray-400">
                  <summary className="cursor-pointer hover:text-gray-300">
                    Component Stack
                  </summary>
                  <pre className="mt-2 overflow-x-auto">
                    {errorInfo.componentStack}
                  </pre>
                </details>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleGoHome}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Go to Dashboard
            </button>

            <button
              onClick={handleReload}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 glass hover:bg-white/10 text-white rounded-lg font-medium transition-all duration-200 hover:scale-105"
            >
              <RefreshCw className="w-5 h-5" />
              Reload Page
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center text-sm text-gray-400">
            <p>If this problem persists, please contact support.</p>
          </div>
        </div>

        {/* Additional Tips */}
        <div className="mt-6 glass rounded-lg p-4">
          <p className="text-sm text-gray-300">
            <span className="font-semibold text-white">Quick Tips:</span>
          </p>
          <ul className="mt-2 space-y-1 text-sm text-gray-400">
            <li>• Try refreshing the page</li>
            <li>• Clear your browser cache</li>
            <li>• Check your internet connection</li>
            <li>• Try logging out and back in</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary;
