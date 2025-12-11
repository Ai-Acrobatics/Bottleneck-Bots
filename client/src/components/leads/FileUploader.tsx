import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import Papa from 'papaparse';

interface FileUploaderProps {
  onFileSelect: (data: any[], columns: string[], fileName: string) => void;
  acceptedFormats?: string[];
  maxSize?: number; // in MB
}

export function FileUploader({
  onFileSelect,
  acceptedFormats = ['.csv', '.json'],
  maxSize = 10
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const processFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    // Simulate initial upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + 10;
      });
    }, 100);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase();

      if (fileExtension === 'csv') {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            clearInterval(progressInterval);
            setUploadProgress(100);

            setTimeout(() => {
              if (results.data && results.data.length > 0) {
                const columns = Object.keys(results.data[0] as any);
                onFileSelect(results.data, columns, file.name);
              } else {
                setError('CSV file is empty or invalid');
              }
              setIsProcessing(false);
              setIsUploading(false);
              setUploadProgress(0);
            }, 300);
          },
          error: (error) => {
            clearInterval(progressInterval);
            setError(`Error parsing CSV: ${error.message}`);
            setIsProcessing(false);
            setIsUploading(false);
            setUploadProgress(0);
          }
        });
      } else if (fileExtension === 'json') {
        const text = await file.text();
        setUploadProgress(70);

        const data = JSON.parse(text);
        setUploadProgress(90);

        const arrayData = Array.isArray(data) ? data : [data];

        clearInterval(progressInterval);
        setUploadProgress(100);

        setTimeout(() => {
          if (arrayData.length > 0) {
            const columns = Object.keys(arrayData[0]);
            onFileSelect(arrayData, columns, file.name);
          } else {
            setError('JSON file is empty or invalid');
          }
          setIsProcessing(false);
          setIsUploading(false);
          setUploadProgress(0);
        }, 300);
      } else {
        clearInterval(progressInterval);
        setError('Unsupported file format');
        setIsProcessing(false);
        setIsUploading(false);
        setUploadProgress(0);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : 'Error processing file');
      setIsProcessing(false);
      setIsUploading(false);
      setUploadProgress(0);
    }
  }, [onFileSelect]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxSize) {
      setError(`File size exceeds ${maxSize}MB limit`);
      return;
    }

    setFile(file);
    processFile(file);
  }, [maxSize, processFile]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedFormats.reduce((acc, format) => ({ ...acc, [format]: [] }), {}),
    maxFiles: 1,
    multiple: false,
    disabled: isUploading
  });

  const removeFile = () => {
    setFile(null);
    setError('');
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-accent/50",
          file && "border-solid border-primary bg-primary/5",
          isUploading && "cursor-not-allowed opacity-60"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className={cn(
            "rounded-full p-4",
            file ? "bg-primary/10" : "bg-accent"
          )}>
            {file ? (
              <File className="h-8 w-8 text-primary" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>

          {file ? (
            <div className="space-y-2">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
              {isProcessing && (
                <p className="text-sm text-primary">Processing file...</p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-lg font-medium">
                {isDragActive ? "Drop file here" : "Drag & drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: {acceptedFormats.join(', ')} (max {maxSize}MB)
              </p>
            </div>
          )}
        </div>
      </div>

      {isUploading && (
        <div className="w-full space-y-2 animate-fade-in">
          <Progress value={uploadProgress} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
        </div>
      )}

      {file && !isProcessing && (
        <div className="flex items-center justify-between p-3 bg-accent rounded-lg">
          <div className="flex items-center gap-3">
            <File className="h-5 w-5 text-primary" />
            <div>
              <p className="font-medium text-sm">{file.name}</p>
              <p className="text-xs text-muted-foreground">
                {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={removeFile}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
