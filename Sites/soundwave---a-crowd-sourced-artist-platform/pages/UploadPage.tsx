
import React, { useState } from 'react';
import Button from '../components/Button';
import { Icon } from '../components/Icon';
import { generateTrackDescription } from '../services/geminiService';
import { UploadType } from '../types';

const UploadPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [uploadType, setUploadType] = useState<UploadType>(UploadType.PREVIEW);
  const [price, setPrice] = useState(0.99);
  const [tags, setTags] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleGenerateDescription = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    try {
      const generatedDesc = await generateTrackDescription(aiPrompt);
      setDescription(generatedDesc);
    } catch (error) {
      console.error("Failed to generate description:", error);
      // You could set an error message in state here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsUploading(true);
    // Simulate upload process
    setTimeout(() => {
        setIsUploading(false);
        setUploadSuccess(true);
        // Here you would typically add the new track to a global state or send to a backend
        console.log({ title, description, uploadType, price: uploadType === 'For Sale' ? price : 0, tags: tags.split(',') });
        setTimeout(() => setUploadSuccess(false), 3000);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">Upload Your Track</h1>
      <p className="text-gray-400 mb-8">Share your music with the world. Fill out the details below.</p>
      
      {uploadSuccess && (
        <div className="bg-green-500/20 border border-green-500 text-green-300 px-4 py-3 rounded-lg relative mb-6" role="alert">
          <strong className="font-bold">Success!</strong>
          <span className="block sm:inline"> Your track has been uploaded.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-1">
              <label htmlFor="track-title" className="block text-sm font-medium text-gray-400 mb-2">Track Title</label>
              <input type="text" id="track-title" value={title} onChange={e => setTitle(e.target.value)} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition" />
            </div>
            <div className="col-span-1">
               <label htmlFor="tags" className="block text-sm font-medium text-gray-400 mb-2">Tags (comma-separated)</label>
              <input type="text" id="tags" value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. lofi, chill, electronic" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition" />
            </div>
          </div>
          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">Description</label>
            <textarea id="description" value={description} onChange={e => setDescription(e.target.value)} rows={4} required className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition"></textarea>
            
            <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
              <label htmlFor="ai-prompt" className="block text-sm font-medium text-gray-400 mb-2">Need help with the description? Give the AI some keywords.</label>
              <div className="flex space-x-2">
                <input type="text" id="ai-prompt" value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} placeholder="e.g. epic, cinematic, synthwave" className="flex-grow bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition" />
                <Button type="button" onClick={handleGenerateDescription} isLoading={isGenerating} variant="secondary">
                  Generate
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload Type</label>
              <select value={uploadType} onChange={e => setUploadType(e.target.value as UploadType)} className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition">
                <option value={UploadType.PREVIEW}>Preview Only</option>
                <option value={UploadType.FREE}>Free Download</option>
                <option value={UploadType.SALE}>For Sale</option>
              </select>
            </div>
            {uploadType === 'For Sale' && (
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-400 mb-2">Price (USD)</label>
                <input type="number" id="price" value={price} onChange={e => setPrice(Number(e.target.value))} min="0.50" step="0.01" className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition" />
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="submit" isLoading={isUploading}>
            <Icon name="upload" className="w-5 h-5 mr-2" />
            Upload Track
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadPage;
