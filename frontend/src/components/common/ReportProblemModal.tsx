"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Paperclip, X, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { API_BASE_URL } from "@/lib/config";

const SUBMIT_REPORT_MUTATION = gql`
  mutation SubmitReport($input: CreateReportInput!) {
    submitReport(input: $input)
  }
`;

interface ReportProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ReportProblemModal({ isOpen, onClose }: ReportProblemModalProps) {
  const { showToast } = useUIStore();
  const [category, setCategory] = useState("Bug");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [submitReport] = useMutation(SUBMIT_REPORT_MUTATION);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      showToast("Please describe the problem");
      return;
    }

    setIsSubmitting(true);

    try {
      let attachmentUrl = null;

      // Upload file if exists
      if (selectedFile) {
        const formData = new FormData();
        formData.append("files", selectedFile);

        const uploadRes = await fetch(`${API_BASE_URL}/api/upload`, {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) throw new Error("File upload failed");

        const data = await uploadRes.json();
        attachmentUrl = data.url;
      }

      // Collect device info
      const deviceInfo = JSON.stringify({
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        language: navigator.language,
        platform: navigator.platform,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      });

      await submitReport({
        variables: {
          input: {
            category,
            description,
            attachmentUrl,
            deviceInfo,
          },
        },
      });

      showToast("Report submitted successfully");
      onClose();
      // Reset form
      setDescription("");
      setCategory("bug");
      handleRemoveFile();

    } catch (error) {
      console.error(error);
      showToast("Failed to submit report");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border rounded-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center font-bold">Report a Problem</DialogTitle>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold ml-1">Category</label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full bg-background border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Bug">Bug / Error</SelectItem>
                <SelectItem value="Spam">Spam or Abuse</SelectItem>
                <SelectItem value="Feature">Feature Request</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold ml-1">Description</label>
            </div>
            <Textarea
              placeholder="Briefly explain what happened or what's not working..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-background border-border resize-none"
            />
          </div>

          {/* Attachment Preview */}
          {previewUrl && (
            <div className="relative rounded-lg overflow-hidden border border-border bg-secondary/30">
              <button
                onClick={handleRemoveFile}
                className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors z-10"
              >
                <X size={14} />
              </button>
              {selectedFile?.type.startsWith('video/') ? (
                <video src={previewUrl} className="w-full max-h-48 object-contain" controls />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-contain" />
              )}
            </div>
          )}

          {/* File Input */}
          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*,video/*"
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-muted-foreground hover:text-foreground gap-2"
            >
              <Paperclip size={16} />
              {selectedFile ? "Change attachment" : "Add screenshot or video"}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-2 px-1">
            We include details like your browser and device info to help us fix the issue faster.
          </p>
        </div>

        <DialogFooter className="p-4 border-t border-border flex gap-2 sm:justify-end">
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !description.trim()} className="font-bold">
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
