"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function VerifyPayment() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your payment...");

  useEffect(() => {
    if (!reference) {
      router.push("/onboarding");
      return;
    }

    const verify = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/payments/paystack/verify/${reference}`, {
          method: "GET",
          headers: { "Authorization": `Bearer ${token}` }
        });

        const data = await res.json();
        if (data.success && data.data.status === "success") {
          setStatus("success");
          setMessage("Payment successful! Your subscription is now active.");
          setTimeout(() => {
            router.push("/app");
          }, 3000);
        } else {
          setStatus("error");
          setMessage(data.message || "Payment verification failed.");
        }
      } catch (err) {
        setStatus("error");
        setMessage("Something went wrong while verifying your payment.");
      }
    };

    verify();
  }, [reference, router]);

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-background p-6 text-center">
      <div className="max-w-md w-full bg-card border border-border rounded-3xl p-10 shadow-deep">
        {status === "loading" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
            <h1 className="font-display text-2xl font-semibold mb-2">Verifying Payment</h1>
            <p className="text-muted-foreground">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <div className="h-20 w-20 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
            <h1 className="font-display text-3xl font-semibold mb-2 text-foreground">Welcome Aboard!</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-green-500 animate-progress" />
            </div>
            <p className="text-xs text-muted-foreground mt-4 italic text-center">Redirecting to your dashboard...</p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center animate-in zoom-in duration-500">
            <div className="h-20 w-20 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <XCircle className="h-10 w-10 text-destructive" />
            </div>
            <h1 className="font-display text-2xl font-semibold mb-2">Payment Failed</h1>
            <p className="text-muted-foreground mb-8">{message}</p>
            <div className="flex flex-col w-full gap-3">
              <button 
                onClick={() => router.push("/onboarding")}
                className="w-full bg-primary text-primary-foreground rounded-xl py-3.5 font-semibold shadow-deep hover:bg-primary-glow transition"
              >
                Try again
              </button>
              <Link 
                href="/app" 
                className="text-sm text-muted-foreground hover:text-foreground transition"
              >
                Go to app anyway (Restricted access)
              </Link>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .animate-progress {
          animation: progress 3s linear forwards;
        }
      `}</style>
    </div>
  );
}
