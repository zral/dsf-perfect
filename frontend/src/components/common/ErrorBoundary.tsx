"use client";

import { Component, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  handleReset = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center py-24 px-4">
          <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          <h2
            className="text-xl font-bold text-gray-900 mb-2"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Noe gikk galt
          </h2>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            En uventet feil oppstod. Prøv å laste siden på nytt.
          </p>
          <button
            onClick={this.handleReset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium
              bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800
              transition-all duration-150 shadow-sm shadow-blue-600/20 cursor-pointer"
          >
            Prøv igjen
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
