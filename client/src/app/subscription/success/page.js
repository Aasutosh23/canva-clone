"use client";

import { capturePaypalOrder } from "@/services/subscription-service";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useEditorStore } from "@/store";

function SubscriptionSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [errorMessage, setErrorMessage] = useState("");
  const hasProcessed = useRef(false);
  const { setUserSubscription } = useEditorStore();

  useEffect(() => {
    const orderId = searchParams.get("token");

    if (!orderId) {
      setStatus("error");
      setErrorMessage("No order token found in URL.");
      return;
    }

    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const processPayment = async () => {
      try {
        const response = await capturePaypalOrder(orderId);
        if (response.success) {
          if (response.data) {
            setUserSubscription(response.data);
          }
          setStatus("success");
          setTimeout(() => {
            router.push("/");
          }, 2000);
        } else {
          setStatus("error");
          setErrorMessage(response.message || "Failed to confirm payment.");
        }
      } catch (e) {
        console.error("Payment capture error:", e);
        setStatus("error");
        setErrorMessage(e.message || "Something went wrong while confirming your payment.");
      }
    };

    processPayment();
  }, [searchParams, router, setUserSubscription]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md rounded-xl border bg-white p-8 shadow-lg text-center">
        {status === "processing" && (
          <div className="flex flex-col items-center">
            <Loader2 className="h-16 w-16 animate-spin text-purple-600 mb-4" />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 text-green-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-green-700">Payment Successful!</h1>
            <p className="text-muted-foreground mb-4">
              You are now a Canva Premium member. Redirecting to home...
            </p>
            <Button onClick={() => router.push("/")} className="bg-purple-600 hover:bg-purple-700">
              Go to Home
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-red-700">Payment Failed</h1>
            <p className="text-muted-foreground mb-4">
              {errorMessage || "Unable to complete your transaction."}
            </p>
            <Button onClick={() => router.push("/")} variant="outline">
              Return to Home
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubscriptionSuccess;
