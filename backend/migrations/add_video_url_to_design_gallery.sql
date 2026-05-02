-- Migration: Add video_url column to product_design_gallery table
-- Description: Adds support for storing video URLs with design-specific galleries

ALTER TABLE product_design_gallery
ADD COLUMN IF NOT EXISTS video_url TEXT DEFAULT NULL;

-- Index for faster queries (optional, for performance)
CREATE INDEX IF NOT EXISTS idx_product_design_gallery_video_url 
ON product_design_gallery(video_url);

-- Comment on the new column
COMMENT ON COLUMN product_design_gallery.video_url IS 'Optional video URL for design-specific gallery (e.g., color demo or product video)';
