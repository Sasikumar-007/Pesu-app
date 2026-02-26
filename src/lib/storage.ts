import { supabase } from './supabase';

export async function uploadMedia(
    file: File | Blob,
    userId: string,
    fileExtension: string
): Promise<string | null> {
    const fileName = `${userId}/${Date.now()}.${fileExtension}`;

    const { error } = await supabase.storage
        .from('chat-media')
        .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false,
        });

    if (error) {
        console.error('Upload error:', error);
        alert(`Media upload failed: ${error.message}`);
        return null;
    }

    const { data } = supabase.storage.from('chat-media').getPublicUrl(fileName);
    return data.publicUrl;
}

export function getMediaUrl(path: string): string {
    const { data } = supabase.storage.from('chat-media').getPublicUrl(path);
    return data.publicUrl;
}
