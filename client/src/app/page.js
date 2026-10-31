"use client";

import Banner from "@/components/home/banner";
import DesignTypes from "@/components/home/design-types";
import Header from "@/components/home/header";
import SideBar from "@/components/home/sidebar";
import AiFeatures from "@/components/home/ai-features";
import RecentDesigns from "@/components/home/recent-design";
import { getUserSubscription } from "@/services/subscription-service";
import { useEditorStore } from "../store";
import { useEffect } from "react";
import { getUserDesigns } from "@/services/design-service";
import SubscriptionModal from "@/components/subscription/premium-modal";
import TrashModal from "@/components/home/trash-modal";
import DesignModal from "@/components/home/designs-modal";

export default function Home() {
  const {
    setUserSubscription,
    setUserDesigns,
    showPremiumModal,
    setShowPremiumModal,
    showDesignsModal,
    setShowDesignsModal,
    userDesigns,
  } = useEditorStore();

  const fetchUserSubscription = async () => {
    const response = await getUserSubscription();

    if (response.success) setUserSubscription(response.data);
  };

  async function fetchUserDesigns() {
    const result = await getUserDesigns();

    if (result?.success) setUserDesigns(result?.data);
  }

  useEffect(() => {
    fetchUserSubscription();
    fetchUserDesigns();
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      <SideBar />
      <div className="flex-1 flex flex-col ml-18">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto pt-20">
          <Banner />
          <DesignTypes />
          <AiFeatures />
          <RecentDesigns />
        </main>
      </div>
      <SubscriptionModal isOpen={showPremiumModal} onClose={setShowPremiumModal} />
      <DesignModal
        isOpen={showDesignsModal}
        onClose={setShowDesignsModal}
        userDesigns={userDesigns}
      />
      <TrashModal />
    </div>
  );
}
