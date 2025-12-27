import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.location.href = path;
  };
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resetLink, setResetLink] = useState('');

  const validateEmail = (email: string) => {
    if (!email) return 'Email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Invalid email format';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    const validationError = validateEmail(value);
    setError(validationError);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      // In development mode, the API returns the reset link
      if (data.resetLink) {
        setResetLink(data.resetLink);
      }

      setIsSubmitted(true);
      toast.success('Password reset instructions sent!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send reset email';
      toast.error(message);
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
              <CheckCircle2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
            <p className="text-muted-foreground">We've sent password reset instructions</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Email Sent</CardTitle>
              <CardDescription>
                If an account exists with {email}, you will receive password reset instructions shortly.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20">
                <Mail className="h-4 w-4" />
                <AlertDescription>
                  Check your inbox and spam folder for the reset link. The link will expire in 24 hours.
                </AlertDescription>
              </Alert>

              {resetLink && (
                <Alert>
                  <AlertDescription className="space-y-2">
                    <p className="font-medium">Development Mode - Reset Link:</p>
                    <a
                      href={resetLink}
                      className="text-sm text-primary hover:underline break-all"
                      onClick={(e) => {
                        e.preventDefault();
                        const url = new URL(resetLink);
                        navigateTo(url.pathname + url.search);
                      }}
                    >
                      {resetLink}
                    </a>
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Button
                  onClick={() => navigateTo('/login')}
                  className="w-full"
                >
                  Back to Login
                </Button>

                <Button
                  onClick={() => {
                    setIsSubmitted(false);
                    setEmail('');
                    setError('');
                  }}
                  variant="outline"
                  className="w-full"
                >
                  Resend Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background via-secondary/20 to-accent/10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg mb-4">
            <Mail className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Forgot Password?</h1>
          <p className="text-muted-foreground">No worries, we'll send you reset instructions</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  placeholder="you@example.com"
                  aria-invalid={!!error}
                  aria-describedby={error ? 'email-error' : undefined}
                  autoComplete="email"
                  autoFocus
                />
                {error && (
                  <p id="email-error" className="text-sm text-destructive" role="alert">
                    {error}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full"
                isLoading={isLoading}
                loadingText="Sending reset link..."
                disabled={!!error || isLoading}
              >
                Send Reset Link
              </Button>

              <button
                type="button"
                onClick={() => navigateTo('/login')}
                className="flex items-center justify-center gap-2 w-full text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
