import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabaseBucket = process.env.SUPABASE_BUCKET || "threads-clone";

// Use service key for server-side operations (uploads)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Upload file to Supabase Storage
export async function uploadToSupabase(
    file: Express.Multer.File
): Promise<{ url: string; type: string }> {
    const timestamp = Date.now();
    const randomSuffix = Math.round(Math.random() * 1e9);
    const ext = file.originalname.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomSuffix}.${ext}`;

    // Determine folder based on file type
    let folder = "images";
    if (file.mimetype.startsWith("video/")) {
        folder = "videos";
    } else if (file.mimetype === "image/gif") {
        folder = "gifs";
    }

    const filePath = `${folder}/${fileName}`;

    const { data, error } = await supabase.storage
        .from(supabaseBucket)
        .upload(filePath, file.buffer, {
            contentType: file.mimetype,
            cacheControl: "3600",
            upsert: false,
        });

    if (error) {
        console.error("Supabase upload error:", error);
        throw new Error(`Failed to upload file: ${error.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
        .from(supabaseBucket)
        .getPublicUrl(filePath);

    return {
        url: publicUrlData.publicUrl,
        type: file.mimetype,
    };
}

// Delete file from Supabase Storage
export async function deleteFromSupabase(fileUrl: string): Promise<boolean> {
    try {
        // Extract path from URL
        const url = new URL(fileUrl);
        const pathParts = url.pathname.split(`/storage/v1/object/public/${supabaseBucket}/`);
        if (pathParts.length < 2) return false;

        const filePath = pathParts[1] || "";

        const { error } = await supabase.storage
            .from(supabaseBucket)
            .remove([filePath]);

        if (error) {
            console.error("Supabase delete error:", error);
            return false;
        }

        return true;
    } catch (err) {
        console.error("Delete from Supabase failed:", err);
        return false;
    }
}
