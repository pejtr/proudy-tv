import { Router } from 'express';
import multer from 'multer';
import { storagePut } from './storage';
import { nanoid } from 'nanoid';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// Avatar upload endpoint
router.post('/upload-avatar', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    // Get user from session (assuming auth middleware sets req.user)
    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Generate unique filename
    const ext = req.file.originalname.split('.').pop();
    const filename = `avatars/${userId}-${nanoid()}.${ext}`;
    
    // Upload to S3
    const result = await storagePut(
      filename,
      req.file.buffer,
      req.file.mimetype
    );
    
    return res.json({ url: result.url });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;
