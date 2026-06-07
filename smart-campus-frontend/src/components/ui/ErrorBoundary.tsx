import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error caught by ErrorBoundary:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  private handleRefresh = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex min-h-[400px] w-full items-center justify-center p-6 animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-destructive/20 shadow-lg bg-card/50 backdrop-blur-sm">
            <CardHeader className="flex flex-col items-center text-center space-y-3 pb-2">
              <div className="rounded-full bg-destructive/10 p-3 text-destructive animate-pulse">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <CardTitle className="text-xl font-bold tracking-tight text-foreground">
                Something went wrong
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                An unexpected error occurred while loading this view.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              {this.state.error && (
                <div className="rounded-md bg-muted/50 p-3 text-xs font-mono text-muted-foreground max-h-[120px] overflow-auto border border-border text-left">
                  {this.state.error.toString()}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="w-full sm:w-auto"
              >
                Try Again
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={this.handleRefresh}
                className="w-full sm:w-auto gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Page
              </Button>
            </CardFooter>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
