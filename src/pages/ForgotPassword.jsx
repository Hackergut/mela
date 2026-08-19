import React, { useState } from "react";
import { Link } from "react-router-dom";
import { requestPasswordReset } from "@/lib/auth/accounts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [resetPath, setResetPath] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = requestPasswordReset(email);
      setResetPath(token ? `/reset-password?token=${encodeURIComponent(token)}` : "");
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      icon={Mail}
      title="Reset password"
      subtitle="Ti diamo un link per impostarne una nuova"
      footer={
        <Link to="/login" className="text-primary font-medium hover:underline">
          <ArrowLeft className="w-3 h-3 inline mr-1" />Torna al login
        </Link>
      }
    >
      {submitted ? (
        resetPath ? (
          <div className="space-y-3 text-sm text-foreground">
            <p>Account trovato. Apri questo link per scegliere una nuova password (vale 1 ora):</p>
            <Link to={resetPath} className="block rounded-lg bg-muted px-3 py-2 font-mono text-xs text-primary break-all">
              {resetPath}
            </Link>
          </div>
        ) : (
          <p className="text-sm text-foreground text-center">
            Se esiste un account con quella email, puoi riprovare o accedere con Google.
          </p>
        )
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                placeholder="tuo@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Invio...
              </>
            ) : (
              "Genera link di reset"
            )}
          </Button>
        </form>
      )}
    </AuthLayout>
  );
}
