"use client";

import { ImagePlus, Loader, Sparkles, Wand2 } from "lucide-react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/services/base-service";
import { addImageToCanvas } from "@/fabric/fabric-utils";
import { useEditorStore } from "@/store";

function AiPanel() {
  const { canvas } = useEditorStore();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState(null);
  const [error, setError] = useState("");

  const handlePromptChange = (event) => {
    setPrompt(event.target.value);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError("");
    setGeneratedContent(null);

    try {
      console.log("[AI Panel] Sending AI image generation request for prompt:", prompt.trim());
      const result = await fetchWithAuth("/v1/media/ai-image-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });

      console.log("[AI Panel] Response received:", result);

      if (result.success === false) {
        throw new Error(result.message || "Failed to generate image");
      }

      const imageUrl = result.data?.url;

      if (!imageUrl) {
        throw new Error("Image generated, but no image URL was returned");
      }

      setGeneratedContent({
        url: imageUrl,
        prompt: result.prompt || prompt.trim(),
      });
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

        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="e.g., A cute dog image..."
          className="resize-none min-h-50"
          disabled={isLoading}
        />

        <Button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>

        {error && <p className="text-sm text-red-500">{error}</p>}

        {isLoading && (
          <div className="rounded-md border bg-gray-50 p-6 flex flex-col items-center justify-center">
            <Loader className="mb-3 h-8 w-8 animate-spin text-purple-500" />
            <p className="text-center text-sm text-gray-600">Creating your image...</p>
          </div>
        )}

        {generatedContent && (
          <div className="space-y-3">
            <h4 className="font-medium">Generated Image</h4>
            <img
              src={generatedContent.url}
              alt={generatedContent.prompt}
              className="w-full rounded-md border object-contain"
            />
            <p className="text-sm text-muted-foreground">{generatedContent.prompt}</p>
            <Button
              onClick={() => addImageToCanvas(canvas, generatedContent.url)}
              disabled={!canvas}
              className="w-full"
              variant="outline"
            >
              <ImagePlus className="mr-2 h-4 w-4" />
              Add to Canvas
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AiPanel;
