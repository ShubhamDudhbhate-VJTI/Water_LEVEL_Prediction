import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Upload, Image, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileUploaded: (file: { url: string; type: string; name: string }) => void;
  onImageGenerated?: (imageUrl: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUploaded, onImageGenerated }) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [imagePrompt, setImagePrompt] = useState('');
  const [showImageGen, setShowImageGen] = useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const bucket = file.type.startsWith('image/') ? 'chat-images' : 'chat-files';

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          filename: file.name,
          file_type: file.type,
          file_size: file.size,
          storage_path: fileName,
        });

      if (dbError) throw dbError;

      onFileUploaded({
        url: data.publicUrl,
        type: file.type,
        name: file.name
      });

      toast({
        title: "File uploaded successfully",
        description: `${file.name} has been uploaded`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Failed to upload file',
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const generateImage = async () => {
    if (!imagePrompt.trim()) return;

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt: imagePrompt }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      if (onImageGenerated) {
        onImageGenerated(data.image);
      }

      toast({
        title: "Image generated successfully",
        description: "AI has created your image",
      });
    } catch (error) {
      console.error('Error generating image:', error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : 'Failed to generate image',
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setImagePrompt('');
      setShowImageGen(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileSelect}
        className="hidden"
        accept="*/*"
      />
      
      <Button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Upload className="h-4 w-4" />
        {isUploading ? 'Uploading...' : 'Upload File'}
      </Button>

      <Button
        onClick={() => setShowImageGen(!showImageGen)}
        variant="outline"
        size="sm"
        className="gap-2"
      >
        <Image className="h-4 w-4" />
        Generate Image
      </Button>

      {showImageGen && (
        <div className="flex items-center gap-2 bg-accent/50 p-2 rounded-lg border">
          <input
            type="text"
            value={imagePrompt}
            onChange={(e) => setImagePrompt(e.target.value)}
            placeholder="Describe the image you want..."
            className="flex-1 px-2 py-1 text-sm bg-background rounded border"
            onKeyPress={(e) => e.key === 'Enter' && generateImage()}
          />
          <Button
            onClick={generateImage}
            disabled={isGenerating || !imagePrompt.trim()}
            size="sm"
          >
            {isGenerating ? 'Generating...' : 'Create'}
          </Button>
          <Button
            onClick={() => setShowImageGen(false)}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;