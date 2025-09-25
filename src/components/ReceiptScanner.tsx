import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, Loader2, Check, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { ocrProcessor } from '@/lib/ocr';
import { categorizeExpense, getCategoryIcon, getCategoryLabel } from '@/lib/categorizer';

interface ReceiptScannerProps {
  onSave: (expenseData: {
    amount: number;
    category: string;
    date: string;
    notes: string;
    source: string;
    ocrRaw: string;
    ocrParsed: any;
  }) => void;
  onClose: () => void;
}

export const ReceiptScanner = ({ onSave, onClose }: ReceiptScannerProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [editedData, setEditedData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = [
    { value: "food", label: "Food & Dining", icon: "🍕" },
    { value: "transport", label: "Transportation", icon: "🚗" },
    { value: "entertainment", label: "Entertainment", icon: "🎬" },
    { value: "shopping", label: "Shopping", icon: "🛍️" },
    { value: "bills", label: "Bills & Utilities", icon: "💡" },
    { value: "health", label: "Healthcare", icon: "🏥" },
    { value: "education", label: "Education", icon: "📚" },
    { value: "other", label: "Other", icon: "📝" },
  ];

  const processImage = async (file: File) => {
    setIsProcessing(true);
    
    try {
      // Create preview
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);

      toast({
        title: "Processing receipt...",
        description: "Extracting text from your receipt image",
      });

      // Extract text using OCR
      const rawText = await ocrProcessor.extractText(file);
      
      // Parse the extracted text
      const parsedData = ocrProcessor.parseReceiptText(rawText);
      
      // Auto-categorize
      const categoryResult = categorizeExpense(rawText, parsedData.merchant || '');
      
      const extractedExpense = {
        amount: parsedData.amount || 0,
        category: categoryResult.category,
        date: parsedData.date,
        merchant: parsedData.merchant || '',
        notes: `${parsedData.merchant || 'Receipt'}\n\nRaw OCR: ${rawText.substring(0, 200)}${rawText.length > 200 ? '...' : ''}`,
        confidence: categoryResult.confidence,
        matchedKeywords: categoryResult.matchedKeywords || [],
        rawText,
        parsedData
      };

      setExtractedData(extractedExpense);
      setEditedData({ ...extractedExpense });
      setShowPreview(true);

      toast({
        title: "Receipt processed!",
        description: `Found amount: ${extractedExpense.amount ? `₹${extractedExpense.amount}` : 'Not detected'}, Category: ${getCategoryLabel(extractedExpense.category)}`,
      });

    } catch (error) {
      console.error('OCR processing failed:', error);
      toast({
        title: "Processing failed",
        description: "Could not extract text from the image. Please try again with a clearer photo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      processImage(file);
    }
  };

  const handleSave = () => {
    if (!editedData || !editedData.amount || editedData.amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    onSave({
      amount: parseFloat(editedData.amount.toString()),
      category: editedData.category,
      date: editedData.date,
      notes: editedData.notes,
      source: 'receipt',
      ocrRaw: extractedData.rawText,
      ocrParsed: {
        merchant: editedData.merchant,
        confidence: extractedData.confidence,
        matchedKeywords: extractedData.matchedKeywords,
        originalAmount: extractedData.amount,
        parsedData: extractedData.parsedData
      }
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-background rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Receipt Scanner</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="p-4 space-y-4">
          {!showPreview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="text-center space-y-4">
                {selectedImage && (
                  <div className="relative">
                    <img 
                      src={selectedImage} 
                      alt="Selected receipt" 
                      className="max-w-full h-48 object-contain mx-auto rounded-lg border"
                    />
                  </div>
                )}

                {isProcessing ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Processing receipt...</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Take a photo or upload an image of your receipt
                    </p>
                    
                    <div className="flex flex-col space-y-3">
                      <Button
                        onClick={() => cameraInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Camera className="h-4 w-4" />
                        Take Photo
                      </Button>
                      
                      <Button
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-2"
                      >
                        <Upload className="h-4 w-4" />
                        Upload Image
                      </Button>
                    </div>
                  </>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Check className="h-4 w-4 text-green-500" />
                    Extracted Information
                  </CardTitle>
                  {extractedData.confidence > 0 && (
                    <Badge variant="secondary" className="w-fit">
                      {Math.round(extractedData.confidence * 100)}% confidence
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount *</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={editedData?.amount || ''}
                      onChange={(e) => setEditedData(prev => ({ ...prev, amount: e.target.value }))}
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Category *</Label>
                    <Select 
                      value={editedData?.category || ''} 
                      onValueChange={(value) => setEditedData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.value} value={cat.value}>
                            <div className="flex items-center gap-2">
                              <span>{cat.icon}</span>
                              <span>{cat.label}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={editedData?.date || ''}
                      onChange={(e) => setEditedData(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes..."
                      value={editedData?.notes || ''}
                      onChange={(e) => setEditedData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button variant="outline" onClick={() => setShowPreview(false)} className="flex-1">
                      <Edit3 className="h-4 w-4 mr-2" />
                      Scan Another
                    </Button>
                    <Button onClick={handleSave} className="flex-1">
                      Save Expense
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};