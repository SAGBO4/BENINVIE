import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { fileToPhotoDataUrl } from "./photo";

describe("fileToPhotoDataUrl", () => {
  let originalFileReader: typeof FileReader;
  let originalImage: typeof Image;

  beforeEach(() => {
    originalFileReader = globalThis.FileReader;
    originalImage = globalThis.Image;
  });

  afterEach(() => {
    globalThis.FileReader = originalFileReader;
    globalThis.Image = originalImage;
    vi.restoreAllMocks();
  });

  it("rejects with 'Lecture du fichier impossible.' when FileReader errors", async () => {
    class MockFailingFileReader {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      readAsDataURL() {
        setTimeout(() => this.onerror?.(), 0);
      }
    }
    // @ts-expect-error mock FileReader
    globalThis.FileReader = MockFailingFileReader;

    const dummyFile = new File(["fake"], "photo.jpg", { type: "image/jpeg" });
    await expect(fileToPhotoDataUrl(dummyFile)).rejects.toThrow(
      "Lecture du fichier impossible.",
    );
  });

  it("rejects with 'Image invalide.' when image decoding fails", async () => {
    class MockSuccessFileReader {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      result = "data:image/jpeg;base64,corrupted";
      readAsDataURL() {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    class MockFailingImage {
      onerror: (() => void) | null = null;
      onload: (() => void) | null = null;
      set src(_: string) {
        setTimeout(() => this.onerror?.(), 0);
      }
    }
    // @ts-expect-error mock
    globalThis.FileReader = MockSuccessFileReader;
    // @ts-expect-error mock
    globalThis.Image = MockFailingImage;

    const dummyFile = new File(["bad-image"], "photo.jpg", {
      type: "image/jpeg",
    });
    await expect(fileToPhotoDataUrl(dummyFile)).rejects.toThrow(
      "Image invalide.",
    );
  });

  it("rejects with 'Canvas indisponible.' when canvas 2D context cannot be obtained", async () => {
    class MockSuccessFileReader {
      onload: (() => void) | null = null;
      result = "data:image/jpeg;base64,valid";
      readAsDataURL() {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    class MockSuccessImage {
      onload: (() => void) | null = null;
      width = 400;
      height = 300;
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error mock
    globalThis.FileReader = MockSuccessFileReader;
    // @ts-expect-error mock
    globalThis.Image = MockSuccessImage;

    // Ensure getContext returns null
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);

    const dummyFile = new File(["valid"], "photo.jpg", { type: "image/jpeg" });
    await expect(fileToPhotoDataUrl(dummyFile)).rejects.toThrow(
      "Canvas indisponible.",
    );
  });

  it("crops and resizes image to centered square and returns JPEG data URL", async () => {
    class MockSuccessFileReader {
      onload: (() => void) | null = null;
      result = "data:image/jpeg;base64,mocked";
      readAsDataURL() {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    class MockSuccessImage {
      onload: (() => void) | null = null;
      width = 800;
      height = 600;
      set src(_: string) {
        setTimeout(() => this.onload?.(), 0);
      }
    }
    // @ts-expect-error mock
    globalThis.FileReader = MockSuccessFileReader;
    // @ts-expect-error mock
    globalThis.Image = MockSuccessImage;

    const drawImageMock = vi.fn();
    const mockCtx = {
      drawImage: drawImageMock,
    } as unknown as CanvasRenderingContext2D;

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(
      mockCtx,
    );
    vi.spyOn(HTMLCanvasElement.prototype, "toDataURL").mockReturnValue(
      "data:image/jpeg;base64,compressed",
    );

    const dummyFile = new File(["valid"], "photo.jpg", { type: "image/jpeg" });
    const result = await fileToPhotoDataUrl(dummyFile, 256);

    expect(result).toBe("data:image/jpeg;base64,compressed");
    // For 800x600, min=600. sx=(800-600)/2=100. sy=(600-600)/2=0.
    expect(drawImageMock).toHaveBeenCalledWith(
      expect.anything(),
      100, // sx
      0, // sy
      600, // sw
      600, // sh
      0, // dx
      0, // dy
      256, // dw
      256, // dh
    );
  });
});
