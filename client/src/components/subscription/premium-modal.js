"use client";

import { useEditorStore } from "@/store";
import { Dialog, DialogContent, DialogTitle } from "../ui/dialog";
import { CheckCircle, Clock, Crown, Loader2, Palette, Sparkles } from "lucide-react";
import { Button } from "../ui/button";
import { createPaypalOrder } from "@/services/subscription-service";
import { useState } from "react";

function SubscriptionModal({ isOpen, onClose }) {
  const { userSubscription } = useEditorStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleUpgrade = async () => {
    setIsLoading(true);
    const response = await createPaypalOrder();

    if (response.success) {
      window.location.href = response.data.approvalLink;
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={"sm:max-w-225 p-0 gap-0 overflow-hidden"}>
        <div className="flex flex-col md:flex-row">
          <div className="p-6 flex-1">
            {userSubscription?.isPremium ? (
              <>
                <DialogTitle className={"text-2xl font-bold mb-4 flex items-center"}>
                  <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                  You're a premium Member!
                </DialogTitle>

                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <p className="text-green-700 font-medium">
                      Premium active since{" "}
                      {new Date(userSubscription?.premiumSince).toLocaleDateString() || "recently"}
                    </p>
                  </div>

                  <p className="text-sm mt-3 mb-6">Enjoy all premium features and benefits!</p>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                      <Crown className="h-5 w-5 text-primary mr-0.5" />
                      <div>
                        <div className="font-medium">
                          Premium Content
                          <p className="text-sm text-muted-foreground">
                            Access to all premium templates and assets
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                      <Palette className="h-5 w-5 text-primary mr-0.5" />
                      <div>
                        <div className="font-medium">
                          Brand Tools
                          <p className="text-sm text-muted-foreground">
                            Create and maintain consistent brand identity
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                      <Clock className="h-5 w-5 text-primary mr-0.5" />
                      <div>
                        <div className="font-medium">
                          Advanced Editing
                          <p className="text-sm text-muted-foreground">
                            Time-saving tools for professional designs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <DialogTitle className={"text-2xl font-bold mb-4 flex items-center"}>
                  <Sparkles className="h-6 w-6 text-yellow-500 mr-2" />
                  Upgrade to Canva Premium
                </DialogTitle>

                <p className="text-sm mb-4">
                  Upgrade to <span className="font-semibold">Canva Premium</span> and create quality
                  design together
                </p>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Crown className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <div className="font-medium">
                        Premium Content
                        <p className="text-sm text-muted-foreground">
                          Access to all premium templates and assets
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Palette className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <div className="font-medium">
                        Brand Tools
                        <p className="text-sm text-muted-foreground">
                          Create and maintain consistent brand identity
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 bg-white p-3 rounded-lg border">
                    <Clock className="h-5 w-5 text-primary mr-0.5" />
                    <div>
                      <div className="font-medium">
                        Advanced Editing
                        <p className="text-sm text-muted-foreground">
                          Time-saving tools for professional designs
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button
                    className={"w-full bg-purple-600 hover:bg-purple-700"}
                    onClick={handleUpgrade}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Upgrade"
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>
          <div className="hidden md:block md:w-112.5">
            <img
              src="https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=NHwxMjA3fDA%3D"
              alt="Team Collaboration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SubscriptionModal;
