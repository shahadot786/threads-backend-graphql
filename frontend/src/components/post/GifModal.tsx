"use client";

import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { X, Upload, Search, Image as ImageIcon } from "lucide-react";
import { useQuery } from "@apollo/client/react";

import { MOCK_GIFS, MockGif, GIFS_BY_CATEGORY, getRandomGifs, searchGifs } from "@/data/mockGifs";

interface GifModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (file: File) => void;
}

export function GifModal({ isOpen, onClose, onSelect }: GifModalProps) {
    const [activeTab, setActiveTab] = useState<"search" | "upload">("search");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("trending");
    const [displayedGifs, setDisplayedGifs] = useState<MockGif[]>([]);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Initial load and category filtering
    useEffect(() => {
        if (searchQuery) {
            setDisplayedGifs(searchGifs(searchQuery).slice(0, 50));
        } else if (selectedCategory === "trending") {
            setDisplayedGifs(getRandomGifs(50));
        } else {
            // @ts-ignore - Index signature for dynamic category access
            const categoryGifs = GIFS_BY_CATEGORY[selectedCategory as keyof typeof GIFS_BY_CATEGORY] || [];
            setDisplayedGifs(categoryGifs);
        }
    }, [searchQuery, selectedCategory]);

    // Helper to convert URL to File object
    const handleGifUrlSelect = async (url: string) => {
        setUploading(true);
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const filename = url.split("/").pop() || `gif-${Date.now()}.gif`;
            const file = new File([blob], filename, { type: "image/gif" });
            onSelect(file);
            onClose();
        } catch (e) {
            console.error("Failed to load GIF", e);
        } finally {
            setUploading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            if (file.type === "image/gif") {
                onSelect(file);
                onClose();
            } else {
                alert("Please select a valid GIF file.");
            }
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent showCloseButton={false} className="w-full max-w-2xl p-0 overflow-hidden bg-background border-border/50 h-[80vh] flex flex-col">
                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 border-b border-border/50">
                    <h3 className="font-bold text-lg">Select GIF</h3>
                    <div className="flex bg-secondary/30 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab("search")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "search" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Search
                        </button>
                        <button
                            onClick={() => setActiveTab("upload")}
                            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Upload
                        </button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                        <X size={20} />
                    </Button>
                </div>

                {activeTab === "search" ? (
                    <div className="flex flex-col flex-1 min-h-0">
                        {/* Search Bar */}
                        <div className="p-4 pb-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                                <Input
                                    placeholder="Search GIPHY..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 bg-secondary/50 border-none rounded-xl h-10"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Category Pills (Horizontal Scroll) */}
                        {!searchQuery && (
                            <div className="px-4 py-2 border-b border-border/30">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    <button
                                        onClick={() => setSelectedCategory("trending")}
                                        className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors border ${selectedCategory === "trending"
                                            ? "bg-foreground text-background border-foreground font-medium"
                                            : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                                            }`}
                                    >
                                        Trending
                                    </button>
                                    {Object.keys(GIFS_BY_CATEGORY).map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setSelectedCategory(cat)}
                                            className={`px-4 py-1.5 text-sm rounded-full whitespace-nowrap transition-colors border capitalize ${selectedCategory === cat
                                                ? "bg-foreground text-background border-foreground font-medium"
                                                : "bg-background text-muted-foreground border-border hover:border-foreground/50"
                                                }`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* GIF Grid (Masonry-ish using columns) */}
                        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                            <div className="columns-2 sm:columns-3 gap-3 space-y-3">
                                {displayedGifs.map((gif) => (
                                    <button
                                        key={gif.id}
                                        disabled={uploading}
                                        onClick={() => handleGifUrlSelect(gif.url)}
                                        className="relative w-full rounded-lg overflow-hidden group hover:ring-2 hover:ring-primary transition-all break-inside-avoid"
                                        style={{ aspectRatio: `${gif.width} / ${gif.height}` }}
                                    >
                                        <div className="absolute inset-0 bg-secondary/20 animate-pulse" /> {/* Placeholder */}
                                        <img
                                            src={gif.url}
                                            alt={gif.title}
                                            className="w-full h-full object-cover relative z-10"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors z-20" />
                                    </button>
                                ))}
                            </div>
                            {displayedGifs.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-10">
                                    <Search size={48} className="opacity-20 mb-4" />
                                    <p>No GIFs found</p>
                                </div>
                            )}
                            {uploading && (
                                <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-50">
                                    <div className="bg-background border border-border rounded-lg px-6 py-4 shadow-xl">
                                        <p className="font-semibold animate-pulse">Processing GIF...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Upload Tab
                    <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
                        <div
                            className="w-full max-w-sm aspect-video border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center bg-secondary/5 hover:bg-secondary/10 hover:border-border/80 transition-all cursor-pointer group"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-4 bg-secondary/20 rounded-full group-hover:scale-110 transition-transform mb-4">
                                <Upload className="w-8 h-8 text-muted-foreground" />
                            </div>
                            <div className="text-center">
                                <p className="font-semibold text-lg">Upload GIF</p>
                                <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</p>
                            </div>
                            <p className="text-xs text-muted-foreground/50 mt-4">Max size 5MB</p>
                        </div>
                        <input
                            type="file"
                            accept="image/gif"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
