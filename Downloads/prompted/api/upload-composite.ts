import type { VercelRequest, VercelResponse } from '@vercel/node';
import formidable from 'formidable';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(
    req: VercelRequest,
    res: VercelResponse
) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const form = formidable({});

        const [fields, files] = await form.parse(req);

        // Check if file exists in the request - n8n sends 'video', but we'll be robust
        const file = files.video?.[0] || files.image?.[0] || Object.values(files).flat()[0];

        if (!file) {
            return res.status(400).json({
                success: false,
                error: 'No file provided'
            });
        }

        // Process the file here (upload to storage, DB, etc.)
        // For now, just return success metadata

        return res.status(200).json({
            success: true,
            message: 'File received',
            filename: file.originalFilename,
            size: file.size,
            type: file.mimetype
        });

    } catch (error) {
        console.error('Error processing composite:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process image'
        });
    }
}
