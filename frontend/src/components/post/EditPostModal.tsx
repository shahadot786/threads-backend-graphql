"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { useMutation } from "@apollo/client/react";
import { UPDATE_POST_MUTATION } from "@/graphql/mutations/post";
import { Textarea } from "../ui/Textarea";

export function EditPostModal() {
  const { isEditPostModalOpen, editPostData, closeEditPostModal, showToast } = useUIStore();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [updatePost] = useMutation(UPDATE_POST_MUTATION);

  useEffect(() => {
    if (editPostData) {
      setContent(editPostData.content || "");
    }
  }, [editPostData]);

  const handleSubmit = async () => {
    if (!editPostData) return;
    if (!content.trim()) {
      showToast("Post content cannot be empty");
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePost({
        variables: {
          postId: editPostData.id,
          input: {
            content: content,
          }
        }
      });
      showToast("Post updated successfully");
      closeEditPostModal();
    } catch (error) {
      console.error(error);
      showToast("Failed to update post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isEditPostModalOpen} onOpenChange={closeEditPostModal}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card border-border rounded-xl">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-center font-bold">Edit Post</DialogTitle>
        </DialogHeader>

        <div className="p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px] bg-transparent border-none focus-visible:ring-0 resize-none text-lg p-0"
            placeholder="What's new?"
          />
        </div>

        <DialogFooter className="p-4 border-t border-border flex justify-between items-center bg-secondary/20">
          <span className="text-xs text-muted-foreground ml-2">
            Anyone can reply & quote
          </span>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={closeEditPostModal} disabled={isSubmitting} className="rounded-xl font-semibold">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting || !content.trim()} className="rounded-xl font-bold px-6">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Save
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
