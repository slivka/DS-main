import { Component, type ReactNode } from "react";

type Fallback = ReactNode | ((error: Error, reset: () => void) => ReactNode);

type Props = {
  children: ReactNode;
  /** Vlastní obsah při chybě – statický uzel nebo funkce dostanou chybu a reset. */
  fallback?: Fallback;
  /** Zavolá se při zachycení chyby (např. pro logování). */
  onCatch?: (error: Error, info: unknown) => void;
  /** Změna resetKey vymaže chybu (např. po navigaci nebo změně id). */
  resetKey?: unknown;
};

type State = { error: Error | null };

/**
 * Klasická React Error Boundary. Zachytí runtime chyby vyhozené během
 * renderu potomků a místo bílé obrazovky zobrazí srozumitelný fallback.
 * Na rozdíl od route-level errorComponent zachová okolní layout (AppShell).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  componentDidCatch(error: Error, info: unknown) {
    this.props.onCatch?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      const { fallback } = this.props;
      if (typeof fallback === "function") return fallback(error, this.reset);
      return fallback ?? null;
    }
    return this.props.children;
  }
}
