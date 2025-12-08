"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Image, X, FileUp } from "lucide-react";
import { toast } from "sonner";

interface MobileFileUploadProps {
  onFileSelect: (file: File) => void;
  currentFile: File | null;
  maxSizeMB?: number;
  accept?: string;
}

export function MobileFileUpload({
  onFileSelect,
  currentFile,
  maxSizeMB = 10,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
}: MobileFileUploadProps) {
  const [isMobile, setIsMobile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Detect mobile device
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkMobile = () => {
        setIsMobile(
          /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
          ) || window.innerWidth < 768
        );
      };
      checkMobile();
      window.addEventListener("resize", checkMobile);
      return () => window.removeEventListener("resize", checkMobile);
    }
  }, []);

  // Compress image if needed
  const compressImage = async (file: File): Promise<File> => {
    if (!file.type.startsWith("image/")) {
      return file;
    }

    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement("img");
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if too large (max 1920px on longest side)
          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height * maxDimension) / width;
              width = maxDimension;
            } else {
              width = (width * maxDimension) / height;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  const compressedFile = new File(
                    [blob],
                    file.name,
                    { type: file.type, lastModified: Date.now() }
                  );
                  resolve(compressedFile);
                } else {
                  resolve(file);
                }
              },
              file.type,
              0.85 // 85% quality
            );
          } else {
            resolve(file);
          }
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    // Validate file size
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File size must be less than ${maxSizeMB}MB`);
      return;
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        "Unsupported file type. Please upload PDF, DOC, DOCX, JPG, or PNG files."
      );
      return;
    }

    // Compress image if it's an image
    const processedFile = await compressImage(file);
    onFileSelect(processedFile);
    toast.success("File selected successfully");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const removeFile = () => {
    onFileSelect(null as any);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (cameraInputRef.current) {
      cameraInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <div className="space-y-3">
      {currentFile ? (
        <div className="border-2 border-primary/50 rounded-lg p-4 bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0">
                <FileUp className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{currentFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(currentFile.size)}
                </p>
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={removeFile}
              className="flex-shrink-0 h-10 w-10 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* Mobile: Show camera and gallery buttons */}
          {isMobile ? (
            <div className="grid grid-cols-2 gap-3">
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleCameraCapture}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="h-14 flex-col gap-2 border-2 border-dashed hover:border-primary/50 transition-colors"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Take Photo</span>
              </Button>

              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="h-14 flex-col gap-2 border-2 border-dashed hover:border-primary/50 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Image className="h-6 w-6 text-primary" />
                <span className="text-xs font-medium">Choose File</span>
              </Button>
            </div>
          ) : (
            /* Desktop: Drag and drop area */
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer group">
              <input
                ref={fileInputRef}
                type="file"
                accept={accept}
                onChange={handleFileInput}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="h-10 w-10 mx-auto mb-2 text-muted-foreground group-hover:text-primary" />
                <p className="text-sm font-medium mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, DOCX, JPG, PNG (max {maxSizeMB}MB)
                </p>
              </label>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

