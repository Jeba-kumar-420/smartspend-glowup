import { createWorker } from 'tesseract.js';

export class OCRProcessor {
  constructor() {
    this.worker = null;
  }

  async initialize() {
    if (!this.worker) {
      this.worker = await createWorker('eng');
    }
    return this.worker;
  }

  async extractText(imageFile) {
    try {
      await this.initialize();
      
      const { data: { text } } = await this.worker.recognize(imageFile);
      return text;
    } catch (error) {
      console.error('OCR extraction failed:', error);
      throw new Error('Failed to extract text from image');
    }
  }

  parseReceiptText(text) {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Extract amount (look for currency symbols and decimal numbers)
    const amountRegex = /[₹$€£¥]\s*(\d+(?:\.\d{2})?)|(\d+\.\d{2})/g;
    const amountMatches = text.match(amountRegex);
    let amount = null;
    
    if (amountMatches) {
      // Get the largest amount (likely the total)
      const amounts = amountMatches.map(match => {
        const numStr = match.replace(/[₹$€£¥\s]/g, '');
        return parseFloat(numStr);
      }).filter(num => !isNaN(num));
      
      if (amounts.length > 0) {
        amount = Math.max(...amounts);
      }
    }

    // Extract date (various formats)
    const dateRegex = /(\d{1,2}[-/]\d{1,2}[-/]\d{2,4})|(\d{2,4}[-/]\d{1,2}[-/]\d{1,2})|(\d{1,2}\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{2,4})/gi;
    const dateMatch = text.match(dateRegex);
    let date = null;
    
    if (dateMatch) {
      try {
        // Try to parse the first date found
        const dateStr = dateMatch[0];
        const parsedDate = new Date(dateStr);
        if (!isNaN(parsedDate.getTime())) {
          date = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        }
      } catch (error) {
        console.warn('Could not parse date:', dateMatch[0]);
      }
    }

    // Extract merchant (usually one of the first few lines)
    let merchant = null;
    for (let i = 0; i < Math.min(3, lines.length); i++) {
      const line = lines[i];
      // Skip lines that are likely not merchant names
      if (line.length > 3 && 
          !line.match(/^\d+$/) && 
          !line.match(/^[₹$€£¥]/) &&
          !line.match(/^\d{1,2}[-/]\d{1,2}[-/]\d{2,4}$/)) {
        merchant = line;
        break;
      }
    }

    return {
      amount,
      date: date || new Date().toISOString().split('T')[0],
      merchant,
      rawText: text,
      allLines: lines
    };
  }

  async terminate() {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
  }
}

export const ocrProcessor = new OCRProcessor();