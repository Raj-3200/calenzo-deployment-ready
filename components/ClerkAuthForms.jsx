"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Button, Input, Label } from "@/components/ui";

function formatClerkError(error) {
  if (!error) return "Unexpected authentication error.";
  if (
    error.errors &&
    Array.isArray(error.errors) &&
    error.errors[0]?.longMessage
  ) {
    return error.errors[0].longMessage;
  }
  if (error.message) return error.message;
  return String(error);
}

function getAbsoluteUrl(path) {
  if (typeof window === "undefined") return path;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${window.location.origin}${path}`;
}

function AuthFormLayout({ children, status, error }) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-700 bg-slate-950/80 p-5 shadow-lg shadow-slate-950/20">
      {children}
      {status ? <p className="text-sm text-slate-400">{status}</p> : null}
      {error ? <p className="text-sm text-red-400">{error}</p> : null}
    </div>
  );
}

export function PasswordSignInForm({ successRedirectUrl = "/" }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = getAbsoluteUrl(successRedirectUrl);

  const signInWithPassword = async (event) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;
    if (!identifier || !password) {
      setError("Enter your name/email and password.");
      return;
    }

    setError("");
    setStatus("Signing in...");
    setIsSubmitting(true);

    try {
      const response = await signIn.create({
        strategy: "password",
        identifier,
        password,
      });

      if (response.createdSessionId) {
        await setActive({ session: response.createdSessionId });
      }

      if (response.status === "complete") {
        router.push(redirectUrl);
        return;
      }

      setStatus("Continue signing in using the remaining Clerk flow.");
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout status={status} error={error}>
      <form onSubmit={signInWithPassword} className="space-y-4">
        <div className="space-y-2">
          <Label>Name or email</Label>
          <Input
            type="text"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            placeholder="Your name or email"
            autoComplete="username"
          />
        </div>

        <div className="space-y-2">
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          Sign in with password
        </Button>
      </form>
    </AuthFormLayout>
  );
}

export function EmailOtpSignInForm({ successRedirectUrl = "/" }) {
  const { isLoaded, signIn, setActive } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeStep, setIsCodeStep] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = getAbsoluteUrl(successRedirectUrl);

  const sendCode = async (event) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;
    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setError("");
    setStatus("Sending your one-time code...");
    setIsSubmitting(true);

    try {
      const response = await signIn.create({
        strategy: "email_code",
        identifier: email,
      });
      if (response.status === "complete") {
        if (response.createdSessionId) {
          await setActive({ session: response.createdSessionId });
        }
        router.push(redirectUrl);
        return;
      }
      setIsCodeStep(true);
      setStatus(
        "A one-time code was sent to your email. Enter it below to continue.",
      );
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!isLoaded || !signIn) return;
    if (!code) {
      setError("Enter the code you received by email.");
      return;
    }

    setError("");
    setStatus("Verifying your code...");
    setIsSubmitting(true);

    try {
      const response = await signIn.attemptFirstFactor({
        strategy: "email_code",
        code,
      });
      if (response.createdSessionId) {
        await setActive({ session: response.createdSessionId });
      }
      router.push(redirectUrl);
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || !signIn) return;
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setError("");
    setStatus("Resending code...");
    setIsSubmitting(true);

    try {
      await signIn.create({ strategy: "email_code", identifier: email });
      setIsCodeStep(true);
      setStatus("A new code was sent to your email.");
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout status={status} error={error}>
      <form onSubmit={isCodeStep ? verifyCode : sendCode} className="space-y-4">
        <div className="space-y-2">
          <Label>Email address</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isCodeStep}
            autoComplete="email"
          />
        </div>

        {isCodeStep ? (
          <div className="space-y-2">
            <Label>One-time code</Label>
            <Input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isCodeStep ? "Verify code" : "Continue with Email (OTP)"}
          </Button>
          {isCodeStep ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={resendCode}
              className="w-full"
            >
              Resend code
            </Button>
          ) : null}
        </div>
      </form>
    </AuthFormLayout>
  );
}

export function EmailOtpSignUpForm({ successRedirectUrl = "/" }) {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [isCodeStep, setIsCodeStep] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const redirectUrl = getAbsoluteUrl(successRedirectUrl);

  const createSignUp = async (event) => {
    event.preventDefault();
    if (!isLoaded || !signUp) return;
    if (!email) {
      setError("Enter your email address.");
      return;
    }

    setError("");
    setStatus("Starting account creation...");
    setIsSubmitting(true);

    try {
      const response = await signUp.create({ emailAddress: email });
      if (response.status === "complete") {
        if (response.createdSessionId) {
          await setActive({ session: response.createdSessionId });
        }
        router.push(redirectUrl);
        return;
      }

      await response.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setIsCodeStep(true);
      setStatus(
        "A verification code was sent to your email. Enter it below to finish.",
      );
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const verifyCode = async (event) => {
    event.preventDefault();
    if (!isLoaded || !signUp) return;
    if (!code) {
      setError("Enter the code you received by email.");
      return;
    }

    setError("");
    setStatus("Verifying your account...");
    setIsSubmitting(true);

    try {
      const response = await signUp.attemptEmailAddressVerification({ code });
      if (response.createdSessionId) {
        await setActive({ session: response.createdSessionId });
      }
      router.push(redirectUrl);
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendCode = async () => {
    if (!isLoaded || !signUp) return;
    if (!email) {
      setError("Enter your email address first.");
      return;
    }

    setError("");
    setStatus("Resending verification code...");
    setIsSubmitting(true);

    try {
      const response = await signUp.upsert({ emailAddress: email });
      await response.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      setIsCodeStep(true);
      setStatus("A new code was sent to your email.");
    } catch (err) {
      setError(formatClerkError(err));
      setStatus("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthFormLayout status={status} error={error}>
      <form
        onSubmit={isCodeStep ? verifyCode : createSignUp}
        className="space-y-4"
      >
        <div className="space-y-2">
          <Label>Email address</Label>
          <Input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            disabled={isCodeStep}
            autoComplete="email"
          />
        </div>

        {isCodeStep ? (
          <div className="space-y-2">
            <Label>Verification code</Label>
            <Input
              type="text"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="123456"
              autoComplete="one-time-code"
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isCodeStep ? "Verify code" : "Continue with Email (OTP)"}
          </Button>
          {isCodeStep ? (
            <Button
              type="button"
              variant="secondary"
              disabled={isSubmitting}
              onClick={resendCode}
              className="w-full"
            >
              Resend code
            </Button>
          ) : null}
        </div>
      </form>
    </AuthFormLayout>
  );
}
