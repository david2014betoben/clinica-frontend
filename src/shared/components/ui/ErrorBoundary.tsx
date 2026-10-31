import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  fallo: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    fallo: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { fallo: true };
  }

  componentDidCatch(error: Error, informacion: ErrorInfo): void {
    console.error("Error al renderizar una sección:", error, informacion);
  }

  render(): ReactNode {
    if (this.state.fallo) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
