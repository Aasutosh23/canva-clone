"use client";

import { useEffect, useState } from "react";
import { getUserDesigns } from "@/services/design-service";
import { useRouter } from "next/navigation";

function RecentDesigns() {
  const [userDesigns, setUserDesigns] = useState([]);
  const router = useRouter();

  async function fetchUserDesigns() {
    const result = await getUserDesigns();

    if (result?.success) setUserDesigns(result?.data);
  }

  useEffect(() => {
    fetchUserDesigns();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Recent Designs</h2>
      <div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5
      gap-4
      "
      >
        {!userDesigns.length && <h1>No design found!</h1>}
        {userDesigns.map((design) => (
          <div
            onClick={() => router.push(`/editor/${design?._id}`)}
            key={design._id}
            className="group cursor-pointer"
          >
            <div
              className="aspect-video bg-gray-100 rounded-lg mb-2 overflow-hidden
            transition-shadow group-hover:shadow-md"
            />
            <p className="font-bold text-sm truncate">{design.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentDesigns;
