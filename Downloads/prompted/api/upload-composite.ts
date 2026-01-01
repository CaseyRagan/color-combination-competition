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

        // Check if image file exists in the request
        const imageFile = files.image?.[0];

        if (!imageFile) {
            return res.status(400).json({
                success: false,
                error: 'No image provided'
            });
        }

        // Process the image here (upload to storage, DB, etc.)
        // For now, just return success metadata

        return res.status(200).json({
            success: true,
            message: 'Composite image received',
            filename: imageFile.originalFilename,
            size: imageFile.size
        });

    } catch (error) {
        console.error('Error processing composite:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to process image'
        });
    }
}
