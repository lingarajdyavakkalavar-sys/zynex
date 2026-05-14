'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

export default function MCQIngestion() {
  const [mode, setMode] = useState<'upload' | 'paste' | 'bulk'>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ saved: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && selected.size > 10 * 1024 * 1024) {
      setError('File too large. Max 10MB allowed.');
      return;
    }
    setFile(selected || null);
    setError(null);
  };

  const handleUpload = async () => {
    if (mode === 'paste' && !pastedText.trim()) {
      setError('Please paste some content first.');
      return;
    }
    if (mode === 'upload' && !file) {
      setError('Please select a PDF file.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setUploadProgress('Uploading material...');

    try {
      const formData = new FormData();
      
      if (mode === 'paste') {
        formData.append('content', pastedText);
      } else {
        formData.append('file', file!);
      }

      const uploadRes = await fetch('/api/upload/material', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        throw new Error(err.error || 'Upload failed');
      }

      setUploadProgress('Material uploaded. Generating MCQs...');

      const mcqRes = await fetch('/api/mcq/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sourceContent: mode === 'paste' ? pastedText : '[Extracted from uploaded PDF]',
          count: 10,
          difficulty: 'MEDIUM',
          examType: 'GATE',
        }),
      });

      if (!mcqRes.ok) {
        const err = await mcqRes.json();
        throw new Error(err.error || 'MCQ generation failed');
      }

      const mcqData = await mcqRes.json();
      setResult({ saved: mcqData.count || 0, total: mcqData.count || 0 });
      setUploadProgress('');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkIngest = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setUploadProgress('Ingesting MCQs from question bank...');

    try {
      const res = await fetch('/api/ingest/mcq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mcqs: [],
          examType: 'GATE',
          action: 'seed-sample',
        }),
      });

      if (!res.ok) {
        throw new Error('Bulk ingest failed');
      }

      const data = await res.json();
      setResult({ saved: data.succeeded || 0, total: data.total || 0 });
      setUploadProgress('');
    } catch (err: any) {
      setError(err.message);
      setUploadProgress('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setMode('upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'upload'
                ? 'bg-[#0066cc] text-white'
                : 'bg-[#1a1a24] text-[#8a8a9a] hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4 inline mr-2" />
            Upload PDF
          </button>
          <button
            onClick={() => setMode('paste')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'paste'
                ? 'bg-[#0066cc] text-white'
                : 'bg-[#1a1a24] text-[#8a8a9a] hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4 inline mr-2" />
            Paste Text
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'bulk'
                ? 'bg-[#0066cc] text-white'
                : 'bg-[#1a1a24] text-[#8a8a9a] hover:text-white'
            }`}
          >
            Bulk Ingest
          </button>
        </div>
      </div>

      {mode === 'upload' && (
        <div
          className="border-2 border-dashed border-[#2a2a3e] rounded-xl p-12 text-center hover:border-[#0066cc] transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-[#0066cc]" />
          <p className="text-white text-lg font-medium">
            {file ? file.name : 'Click to upload PDF (max 10MB)'}
          </p>
          <p className="text-[#8a8a9a] text-sm mt-2">
            Extract MCQs from GATE/CAT question papers
          </p>
        </div>
      )}

      {mode === 'paste' && (
        <div className="space-y-4">
          <textarea
            value={pastedText}
            onChange={(e) => setPastedText(e.target.value)}
            placeholder="Paste question paper content here...

For example:
1. Which data structure uses LIFO principle?
A) Queue
B) Stack
C) Array
D) Linked List
Answer: B

2. Time complexity of Binary Search is?
..."
            className="w-full h-96 p-4 bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl text-white placeholder-[#5a5a6e] resize-none focus:border-[#0066cc] focus:outline-none"
          />
          <p className="text-[#8a8a9a] text-xs">
            Paste multiple questions with options A, B, C, D and the correct answer
          </p>
        </div>
      )}

      {mode === 'bulk' && (
        <div className="bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl p-8 text-center">
          <div className="mb-4">
            <FileText className="w-12 h-12 mx-auto text-[#8a8a9a]" />
          </div>
          <h3 className="text-white text-lg font-medium mb-2">Bulk MCQ Ingestion</h3>
          <p className="text-[#8a8a9a] text-sm mb-6">
            Load sample MCQs from GATE/CAT question banks for testing
          </p>
          <button
            onClick={handleBulkIngest}
            className="px-6 py-3 bg-[#0066cc] text-white rounded-lg font-medium hover:bg-[#0052a3] transition-colors"
          >
            Load Sample MCQs (20 questions)
          </button>
        </div>
      )}

      {uploadProgress && (
        <div className="flex items-center gap-3 p-4 bg-[#0a0a0f] border border-[#1f1f2e] rounded-xl">
          <Loader2 className="w-5 h-5 animate-spin text-[#0066cc]" />
          <span className="text-[#8a8a9a]">{uploadProgress}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 bg-[#ea4335]/10 border border-[#ea4335]/30 rounded-xl">
          <XCircle className="w-5 h-5 text-[#ea4335]" />
          <span className="text-[#ea4335]">{error}</span>
        </div>
      )}

      {result && (
        <div className="flex items-center gap-3 p-4 bg-[#34a853]/10 border border-[#34a853]/30 rounded-xl">
          <CheckCircle2 className="w-5 h-5 text-[#34a853]" />
          <span className="text-[#34a853]">
            Successfully ingested {result.saved} MCQs
          </span>
        </div>
      )}

      {(mode === 'upload' || mode === 'paste') && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="w-full py-4 bg-[#0066cc] text-white rounded-xl font-medium hover:bg-[#0052a3] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Extract & Generate MCQs
            </>
          )}
        </button>
      )}
    </div>
  );
}