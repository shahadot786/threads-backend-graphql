"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { X, Check, type LucideIcon, AlignLeft, AlignCenter, AlignRight, Type, Image as ImageIcon, Palette, Layout, Move, Upload } from "lucide-react";

// --- Types & Constants ---

interface QuoteStyleState {
    // Background
    bgType: "color" | "gradient" | "image";
    bgColor: string;
    bgGradient: string;
    bgImage: string | null;
    bgImageOpacity: number; // 0-1

    // Text
    text: string;
    author: string;
    textColor: string;
    fontFamily: string;
    fontSize: number; // px
    textAlign: "left" | "center" | "right";
    fontWeight: "normal" | "bold";

    // Layout
    aspectRatio: "1:1" | "4:5" | "16:9";
    padding: number; // px
}

const FONTS = [
    { id: "sans", name: "Modern Sans", value: "Arial, Helvetica, sans-serif" },
    { id: "serif", name: "Classic Serif", value: "Times New Roman, serif" },
    { id: "mono", name: "Monospace", value: "Courier New, monospace" },
    { id: "cursive", name: "Handwriting", value: "Brush Script MT, cursive" },
    { id: "impact", name: "Bold Impact", value: "Impact, sans-serif" },
];

const GRADIENTS = [
    { name: "Ocean", value: "linear-gradient(135deg, #00c6ff 0%, #0072ff 100%)" },
    { name: "Sunset", value: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)" },
    { name: "Purple", value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
    { name: "Fire", value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
    { name: "Forest", value: "linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)" },
    { name: "Dark", value: "linear-gradient(135deg, #232526 0%, #414345 100%)" },
];

const COLORS = [
    "#ffffff", "#000000", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#00ffff", "#ff00ff",
    "#f3f4f6", "#1f2937", "#fca5a5", "#86efac", "#93c5fd", "#fcd34d"
];

const INITIAL_STATE: QuoteStyleState = {
    bgType: "gradient",
    bgColor: "#000000",
    bgGradient: GRADIENTS[0].value,
    bgImage: null,
    bgImageOpacity: 0.5,
    text: "",
    author: "",
    textColor: "#ffffff",
    fontFamily: FONTS[0].value,
    fontSize: 60,
    textAlign: "center",
    fontWeight: "bold",
    aspectRatio: "1:1",
    padding: 80,
};

interface QuoteGeneratorProps {
    onGenerate: (file: File) => void;
    onCancel: () => void;
}

export function QuoteGenerator({ onGenerate, onCancel }: QuoteGeneratorProps) {
    const [state, setState] = useState<QuoteStyleState>(INITIAL_STATE);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- Canvas Drawing Logic ---

    const drawCanvas = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // 1. Setup Dimensions based on Aspect Ratio
        let width = 1080;
        let height = 1080;
        if (state.aspectRatio === "4:5") height = 1350;
        if (state.aspectRatio === "16:9") height = 608;

        canvas.width = width;
        canvas.height = height;

        // 2. Clear
        ctx.clearRect(0, 0, width, height);

        // 3. Draw Background
        if (state.bgType === "color") {
            ctx.fillStyle = state.bgColor;
            ctx.fillRect(0, 0, width, height);
        } else if (state.bgType === "gradient") {
            // Simple linear gradient parsing for canvas
            // (Improving regex to handle generic linear-gradient string roughly)
            const gradient = ctx.createLinearGradient(0, 0, width, height);
            // Fallback or rough parse - for now hardcoding based on known presets for simplicity 
            // Real implementation would parse arbitrary CSS gradient strings
            const knownGradient = GRADIENTS.find(g => g.value === state.bgGradient);
            if (knownGradient) {
                // We'll just re-create the gradient stops manually for these presets
                // This is a simplification.
                if (knownGradient.name === "Ocean") { gradient.addColorStop(0, "#00c6ff"); gradient.addColorStop(1, "#0072ff"); }
                else if (knownGradient.name === "Sunset") { gradient.addColorStop(0, "#f6d365"); gradient.addColorStop(1, "#fda085"); }
                else if (knownGradient.name === "Purple") { gradient.addColorStop(0, "#667eea"); gradient.addColorStop(1, "#764ba2"); }
                else if (knownGradient.name === "Fire") { gradient.addColorStop(0, "#f093fb"); gradient.addColorStop(1, "#f5576c"); }
                else if (knownGradient.name === "Forest") { gradient.addColorStop(0, "#56ab2f"); gradient.addColorStop(1, "#a8e063"); }
                else if (knownGradient.name === "Dark") { gradient.addColorStop(0, "#232526"); gradient.addColorStop(1, "#414345"); }
            } else {
                gradient.addColorStop(0, "#000"); gradient.addColorStop(1, "#555");
            }
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, width, height);
        } else if (state.bgType === "image" && state.bgImage) {
            // Draw background color first (black usually)
            ctx.fillStyle = "#000";
            ctx.fillRect(0, 0, width, height);

            const img = new Image();
            img.src = state.bgImage;
            // This is async in reality, but for Blob URLs created locally, it's often instant after load.
            // Needs handling: we just trigger draw when image loads.
            if (img.complete) {
                drawImageCover(ctx, img, width, height, state.bgImageOpacity);
            } else {
                img.onload = () => {
                    drawImageCover(ctx, img, width, height, state.bgImageOpacity);
                    // Re-trigger text drawing?
                    drawTextOverlay(ctx, width, height);
                };
                return; // Exit here, onload will finish
            }
        }

        drawTextOverlay(ctx, width, height);
    };

    const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, w: number, h: number, opacity: number) => {
        // Calculate aspect ratio fill
        const scale = Math.max(w / img.width, h / img.height);
        const x = (w / 2) - (img.width / 2) * scale;
        const y = (h / 2) - (img.height / 2) * scale;

        ctx.save();
        ctx.globalAlpha = opacity;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        ctx.restore();
    };

    const drawTextOverlay = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
        if (!state.text) return;

        ctx.fillStyle = state.textColor;
        ctx.font = `${state.fontWeight} ${state.fontSize}px ${state.fontFamily}`;
        ctx.textBaseline = "middle";

        // --- Multiline Text Wrapping ---
        const words = state.text.split(" ");
        let line = "";
        const lines = [];
        const maxWidth = width - (state.padding * 2);
        const lineHeight = state.fontSize * 1.4;

        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + " ";
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            if (testWidth > maxWidth && n > 0) {
                lines.push(line);
                line = words[n] + " ";
            } else {
                line = testLine;
            }
        }
        lines.push(line);

        // --- Calculate Positioning ---
        // If author exists, make room
        const authorFontSize = state.fontSize * 0.5;
        const authorMargin = state.fontSize;
        const authorHeight = state.author ? authorMargin + authorFontSize : 0;

        const totalTextHeight = (lines.length * lineHeight) + authorHeight;
        let startY = (height - totalTextHeight) / 2 + (lineHeight / 2);

        // --- Draw Quote Text ---
        ctx.textAlign = state.textAlign;
        let x = width / 2; // Default center
        if (state.textAlign === "left") x = state.padding;
        if (state.textAlign === "right") x = width - state.padding;

        for (let i = 0; i < lines.length; i++) {
            ctx.fillText(lines[i], x, startY + (i * lineHeight));
        }

        // --- Draw Author ---
        if (state.author) {
            ctx.font = `normal ${authorFontSize}px ${state.fontFamily}`;
            const authorY = startY + (lines.length * lineHeight) + (authorMargin / 2); // Push down
            // Author usually usually aligned right or match text align? Let's match text align + dash
            let authorText = `- ${state.author}`;
            ctx.fillText(authorText, x, authorY);
        }
    };

    useEffect(() => {
        drawCanvas();
    }, [state]);

    // --- Handlers ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setState(prev => ({ ...prev, bgType: "image", bgImage: url }));
        }
    };

    const handleDone = () => {
        if (!canvasRef.current || !state.text.trim()) return;
        canvasRef.current.toBlob((blob) => {
            if (blob) {
                const file = new File([blob], `quote-${Date.now()}.png`, { type: "image/png" });
                onGenerate(file);
            }
        }, "image/png");
    };

    return (
        <div className="flex flex-col bg-background rounded-xl overflow-hidden border border-border/50 h-[85vh] w-full max-w-lg mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0">
                <h3 className="font-bold text-lg">Create Quote</h3>
                <button onClick={onCancel} className="p-2 hover:bg-secondary rounded-full">
                    <X size={20} />
                </button>
            </div>

            {/* Top: Preview Canvas - Fixed/Flexible Height */}
            <div className="flex-1 bg-secondary/10 flex items-center justify-center p-6 relative bg-[url('https://www.transparenttextures.com/patterns/graphy.png')] min-h-[300px] overflow-hidden">
                <div className="shadow-2xl rounded-sm overflow-hidden flex items-center justify-center w-full h-full">
                    <canvas
                        ref={canvasRef}
                        style={{
                            height: 'auto',
                            width: 'auto',
                            maxHeight: '100%',
                            maxWidth: '100%',
                            objectFit: 'contain',
                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                        }}
                    />
                </div>
            </div>

            {/* Bottom: Controls Tab - Scrollable */}
            <div className="flex-1 flex flex-col min-h-0 bg-background border-t border-border/50">
                {/* Tabs to switch between Edit Modes */}
                <Tabs defaultValue="text" className="flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-3 rounded-none border-b border-border/50 bg-background p-0 h-11 shrink-0">
                        <TabsTrigger value="text" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary h-full"><Type size={16} className="mr-2" /> Text</TabsTrigger>
                        <TabsTrigger value="background" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary h-full"><Palette size={16} className="mr-2" /> Style</TabsTrigger>
                        <TabsTrigger value="layout" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary h-full"><Layout size={16} className="mr-2" /> Layout</TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-5 custom-scrollbar bg-background">
                        {/* --- Text Tab --- */}
                        <TabsContent value="text" className="mt-0 space-y-4">
                            <textarea
                                value={state.text}
                                onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
                                placeholder="Write your quote here..."
                                className="w-full bg-secondary/20 p-4 rounded-xl border border-border resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 h-32 text-lg"
                                autoFocus
                            />

                            <div className="flex gap-2">
                                <Input
                                    value={state.author}
                                    onChange={(e) => setState(prev => ({ ...prev, author: e.target.value }))}
                                    placeholder="- Author (Optional)"
                                    className="flex-1 h-10 bg-secondary/20 border-border"
                                />
                                <div className="flex bg-secondary/20 rounded-lg p-1 border border-border">
                                    <Button variant="ghost" size="icon" className={`w-8 h-8 rounded-md ${state.textAlign === "left" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, textAlign: "left" }))}><AlignLeft size={16} /></Button>
                                    <Button variant="ghost" size="icon" className={`w-8 h-8 rounded-md ${state.textAlign === "center" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, textAlign: "center" }))}><AlignCenter size={16} /></Button>
                                    <Button variant="ghost" size="icon" className={`w-8 h-8 rounded-md ${state.textAlign === "right" ? "bg-background shadow-sm text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, textAlign: "right" }))}><AlignRight size={16} /></Button>
                                </div>
                            </div>

                            {/* Font Settings */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground">Font Family</label>
                                    <select
                                        value={state.fontFamily}
                                        onChange={e => setState(s => ({ ...s, fontFamily: e.target.value }))}
                                        className="w-full p-2 h-9 rounded-md border border-border bg-secondary/20 text-sm"
                                    >
                                        {FONTS.map(f => (
                                            <option key={f.id} value={f.value}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                                        <span>Size</span>
                                        <span>{state.fontSize}px</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="20" max="120" step="5"
                                        value={state.fontSize}
                                        onChange={e => setState(s => ({ ...s, fontSize: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- Background Tab --- */}
                        <TabsContent value="background" className="mt-0 space-y-6">
                            {/* BG Type Select */}
                            <div className="flex bg-secondary/20 p-1 rounded-lg">
                                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${state.bgType === "color" ? "bg-background shadow text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, bgType: "color" }))}>Solid</button>
                                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${state.bgType === "gradient" ? "bg-background shadow text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, bgType: "gradient" }))}>Gradient</button>
                                <button className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${state.bgType === "image" ? "bg-background shadow text-primary" : "text-muted-foreground"}`} onClick={() => setState(s => ({ ...s, bgType: "image" }))}>Image</button>
                            </div>

                            {state.bgType === "color" && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground">Select Color</label>
                                    <div className="grid grid-cols-7 gap-2">
                                        {COLORS.map(c => (
                                            <button key={c} onClick={() => setState(s => ({ ...s, bgColor: c }))} className={`mx-auto w-8 h-8 rounded-full border border-border/50 shadow-sm transition-transform hover:scale-110 ${state.bgColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ background: c }} />
                                        ))}
                                        <div className="relative w-8 h-8 rounded-full overflow-hidden border border-border mx-auto">
                                            <input type="color" value={state.bgColor} onChange={e => setState(s => ({ ...s, bgColor: e.target.value }))} className="absolute -top-2 -left-2 w-12 h-12 cursor-pointer p-0 border-0" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {state.bgType === "gradient" && (
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold text-muted-foreground">Select Gradient</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {GRADIENTS.map(g => (
                                            <div key={g.name} onClick={() => setState(s => ({ ...s, bgGradient: g.value }))} className={`h-12 rounded-lg cursor-pointer border border-border/50 shadow-sm hover:shadow-md transition-all ${state.bgGradient === g.value ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ background: g.value }} />
                                        ))}
                                    </div>
                                </div>
                            )}

                            {state.bgType === "image" && (
                                <div className="space-y-4">
                                    <div
                                        className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center bg-secondary/5 hover:bg-secondary/10 cursor-pointer transition-colors"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        <Upload className="text-muted-foreground mb-2" />
                                        <span className="text-sm font-medium">Upload Background Image</span>
                                        <input type="file" onChange={handleImageUpload} ref={fileInputRef} className="hidden" accept="image/*" />
                                    </div>

                                    {state.bgImage && (
                                        <div className="space-y-3 p-4 bg-secondary/10 rounded-xl">
                                            <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                                                <span>Overlay Opacity</span>
                                                <span>{Math.round(state.bgImageOpacity * 100)}%</span>
                                            </label>
                                            <input
                                                type="range"
                                                min="0" max="1" step="0.1"
                                                value={state.bgImageOpacity}
                                                onChange={e => setState(s => ({ ...s, bgImageOpacity: parseFloat(e.target.value) }))}
                                                className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-2 border-t border-border/50">
                                <label className="text-xs font-semibold text-muted-foreground mb-3 block">Text Color</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLORS.map(c => (
                                        <button key={`text-${c}`} onClick={() => setState(s => ({ ...s, textColor: c }))} className={`w-8 h-8 rounded-full border border-border/50 shadow-sm ${state.textColor === c ? 'ring-2 ring-primary ring-offset-2' : ''}`} style={{ background: c }} />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>

                        {/* --- Layout Tab --- */}
                        <TabsContent value="layout" className="mt-0 space-y-6">
                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground">Aspect Ratio</label>
                                <div className="grid grid-cols-3 gap-4">
                                    {[
                                        { id: "1:1", label: "Square", iconClass: "w-8 h-8" },
                                        { id: "4:5", label: "Portrait", iconClass: "w-6 h-8" },
                                        { id: "16:9", label: "Landscape", iconClass: "w-10 h-6" }
                                    ].map(ratio => (
                                        <div
                                            key={ratio.id}
                                            onClick={() => setState(s => ({ ...s, aspectRatio: ratio.id as any }))}
                                            className={`border border-border rounded-xl p-4 cursor-pointer flex flex-col items-center gap-3 hover:bg-secondary/20 transition-all ${state.aspectRatio === ratio.id ? "border-primary bg-secondary/10 ring-1 ring-primary" : ""}`}
                                        >
                                            <div className={`${ratio.iconClass} border-2 border-current rounded-sm opacity-50`} />
                                            <span className="text-xs font-medium">{ratio.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-xs font-semibold text-muted-foreground flex justify-between">
                                    <span>Content Padding</span>
                                    <span>{state.padding}px</span>
                                </label>
                                <input
                                    type="range"
                                    min="20" max="300" step="10"
                                    value={state.padding}
                                    onChange={e => setState(s => ({ ...s, padding: parseInt(e.target.value) }))}
                                    className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </TabsContent>
                    </div>

                    {/* Generate Button Footer */}
                    <div className="p-4 border-t border-border/50 bg-background shrink-0">
                        <Button onClick={handleDone} className="w-full font-bold rounded-full h-11 text-base shadow-lg hover:shadow-xl transition-all" disabled={!state.text.trim()}>
                            Generate & Attach
                        </Button>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
