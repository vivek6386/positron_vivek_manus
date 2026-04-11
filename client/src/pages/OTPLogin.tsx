import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type LoginStep = "contact" | "otp" | "name";

export default function OTPLogin() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<LoginStep>("contact");
  const [contact, setContact] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [name, setName] = useState("");
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading, setLoading] = useState(false);

  // API calls
  const requestOtpMutation = trpc.otp.requestOtp.useMutation();
  const verifyOtpMutation = trpc.otp.verifyOtp.useMutation();
  const loginMutation = trpc.otp.login.useMutation();
  const registerMutation = trpc.otp.register.useMutation();

  const handleRequestOTP = async () => {
    if (!contact.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      await requestOtpMutation.mutateAsync({
        contact: contact.trim(),
        contactType: "email",
      });
      toast.success("OTP sent to your email");
      setStep("otp");
      setOtpCode("");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyOtpMutation.mutateAsync({
        contact: contact.trim(),
        code: otpCode,
        contactType: "email",
      });

      if (result.isNewUser) {
        setIsNewUser(true);
        setStep("name");
      } else {
        // Login existing user
        await loginMutation.mutateAsync({
          contact: contact.trim(),
          contactType: "email",
        });
        toast.success("Logged in successfully!");
        navigate("/");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid OTP";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      await registerMutation.mutateAsync({
        contact: contact.trim(),
        contactType: "email",
        name: name.trim(),
      });
      toast.success("Account created successfully!");
      navigate("/");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to create account";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            {step === "contact" && "Sign in with OTP verification"}
            {step === "otp" && "Enter the verification code"}
            {step === "name" && "Create your account"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "contact" && (
            <div className="space-y-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
                <p className="font-medium">New option: Email OTP login</p>
                <p className="mt-1 text-blue-800">
                  Use your real mailbox to receive a one-time code, then enter it below to login.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleRequestOTP()}
                  disabled={loading}
                />
              </div>

              <Button
                onClick={handleRequestOTP}
                disabled={loading || !contact.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>

              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2 text-xs text-slate-600">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                You will receive your OTP code in your email inbox.
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                <p>Enter the 6-digit code sent to:</p>
                <p className="font-semibold mt-1">{contact}</p>
              </div>

              <div className="flex justify-center">
                <InputOTP
                  maxLength={6}
                  value={otpCode}
                  onChange={setOtpCode}
                  disabled={loading}
                >
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>

              <Button
                onClick={handleVerifyOTP}
                disabled={loading || otpCode.length !== 6}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep("contact");
                  setOtpCode("");
                }}
                disabled={loading}
                className="w-full"
              >
                Back
              </Button>

              <p className="text-xs text-slate-500 text-center">
                Code expires in 10 minutes
              </p>
            </div>
          )}

          {step === "name" && (
            <div className="space-y-4">
              <div className="text-sm text-slate-600">
                <p>Create your account</p>
              </div>

              <Input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleRegister()}
                disabled={loading}
                autoFocus
              />

              <Button
                onClick={handleRegister}
                disabled={loading || !name.trim()}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => {
                  setStep("otp");
                  setName("");
                }}
                disabled={loading}
                className="w-full"
              >
                Back
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
