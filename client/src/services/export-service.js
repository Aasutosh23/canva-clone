import { saveAs } from "file-saver";

export function exportAsJson(canvas, fileName = "design") {
  if (!canvas) return false;

  try {
    const canvasData = canvas.toJSON(["id", "filters", "isCanvasBackground", "locked"]);
    const jsonString = JSON.stringify(canvasData, null, 2);
    const canvasJsonBlob = new Blob([jsonString], { type: "application/json" });
    saveAs(canvasJsonBlob, `${fileName}.json`);
    return true;
  } catch (e) {
    console.error("Error exporting JSON:", e);
    return false;
  }
}

export function exportAsPng(canvas, fileName = "design") {
  if (!canvas) return false;

  try {
    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
      multiplier: 1,
    });
    saveAs(dataUrl, `${fileName}.png`);
    return true;
  } catch (e) {
    console.error("Error exporting PNG:", e);
    return false;
  }
}

export function exportAsSvg(canvas, fileName = "design") {
  if (!canvas) return false;

  try {
    const svgString = canvas.toSVG();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    saveAs(svgBlob, `${fileName}.svg`);
    return true;
  } catch (e) {
    console.error("Error exporting SVG:", e);
    return false;
  }
}

export async function exportAsPdf(canvas, fileName = "design") {
  if (!canvas) return false;

  try {
    const { jsPDF } = await import("jspdf");
    const width = canvas.width;
    const height = canvas.height;
    const orientation = width >= height ? "landscape" : "portrait";

    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [width, height],
    });

    const dataUrl = canvas.toDataURL({
      format: "png",
      quality: 1,
    });

    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);
    pdf.save(`${fileName}.pdf`);
    return true;
  } catch (e) {
    console.error("Error exporting PDF:", e);
    return false;
  }
}

