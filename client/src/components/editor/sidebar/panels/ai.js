"use client";

import { ImagePlus, Loader, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/base-service";
import { addImageToCanvas } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";
import { toast } from "sonner";

function AiPanel() {
  const { canvas, aiGeneratedContent, setAiGeneratedContent, userSubscription } = useEditorStore();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const FREE_LIMIT = 5;
  const PREMIUM_LIMIT = 50;

  const isPremium = userSubscription?.isPremium === true;
  const aiLimit = isPremium ? PREMIUM_LIMIT : FREE_LIMIT;
  const aiUsed = aiGeneratedContent?.totalGenerated ?? 0;
  const remaining = Math.max(0, aiLimit - aiUsed);

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    if (remaining <= 0) {
      toast.error(
        isPremium
          ? `You've reached the premium limit of ${PREMIUM_LIMIT} AI images.`
          : `You've used all ${FREE_LIMIT} free AI images. Upgrade to Premium for up to ${PREMIUM_LIMIT} images!`
      );
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await fetchWithAuth("/v1/media/ai-image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      if (result.success === false) {
        throw new Error(result.message || "Failed to generate image");
      }

      const imageUrl = result.data?.url;

      if (!imageUrl) {
        throw new Error("Image generated, but no image URL was returned");
      }

      // Persist to store so image survives tab switches
      setAiGeneratedContent({
        url: imageUrl,
        prompt: result.prompt || prompt.trim(),
        totalGenerated: result.aiImageCount ?? aiUsed + 1,
      });

      toast.success("Image generated successfully!");
    } catch (e) {
      console.error("Error generating image from AI:", e);
      setError(e.message || "Unable to generate image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 space-y-4">
        <div className="flex items-center space-x-2 mb-2">
          <Wand2 className="h-5 w-5 text-purple-500" />
          <h3 className="text-lg font-semibold">AI Image Generator</h3>
        </div>

        {/* Usage counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-2">
          <span>{isPremium ? "✨ Premium" : "🆓 Free"} plan</span>
          <span className={remaining === 0 ? "text-red-500 font-semibold" : "font-medium"}>
            {aiUsed} / {aiLimit} images used
          </span>
        </div>

        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="e.g., A cute dog image..."
          className="resize-none min-h-50"
          disabled={isLoading}
        />

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading || remaining === 0}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : remaining === 0 ? (
            isPremium ? "Limit Reached" : "Upgrade to Generate More"
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image ({remaining} left)
            </>
          )}
        </Button>

        {!isPremium && remaining <= 2 && remaining > 0 && (
          <p className="text-xs text-amber-600 text-center">
            Only {remaining} free image{remaining === 1 ? "" : "s"} left.{" "}
            <span className="font-semibold underline cursor-pointer">Upgrade to Premium</span> for {PREMIUM_LIMIT} images.
          </p>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        {isLoading && (
          <div className="rounded-md border bg-gray-50 p-6 flex flex-col items-center justify-center">
            <Loader className="mb-3 h-8 w-8 animate-spin text-purple-500" />
            <p className="text-center text-sm text-gray-600">Creating your image...</p>
          </div>
        )}

        {aiGeneratedContent?.url && !isLoading && (
          <div className="space-y-3">
            <h4 className="font-medium">Generated Image</h4>
            <img
              src={aiGeneratedContent.url}
              alt={aiGeneratedContent.prompt}
              className="w-full rounded-md border object-contain"
            />
            <p className="text-sm text-muted-foreground">{aiGeneratedContent.prompt}</p>
            <Button
              onClick={() => addImageToCanvas(canvas, aiGeneratedContent.url)}
              disabled={!canvas}
              className="w-full"
              variant="outline"
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Add to Canvas
            </Button>
            <Button
              onClick={() => setAiGeneratedContent(null)}
              className="w-full"
              variant="ghost"
              size="sm"
            >
              Clear
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiPanel;
