
import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';
import { RekordboxTrack } from '../types';
import Spinner from '../components/Spinner';

const ImportCollectionPage: React.FC = () => {
  const [collection, setCollection] = useState<RekordboxTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const navigate = useNavigate();

  const parseRekordboxXml = (xmlString: string) => {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      
      const errorNode = xmlDoc.querySelector("parsererror");
      if (errorNode) {
        throw new Error("Failed to parse XML file. Please ensure it's a valid Rekordbox XML.");
      }

      const trackNodes = xmlDoc.querySelectorAll("COLLECTION > TRACK");
      if (trackNodes.length === 0) {
        throw new Error("No tracks found in the <COLLECTION> tag. Please check your XML file structure.");
      }

      const tracks: RekordboxTrack[] = Array.from(trackNodes).map(node => ({
        trackId: node.getAttribute('TrackID') || '',
        title: node.getAttribute('Name') || 'N/A',
        artist: node.getAttribute('Artist') || 'N/A',
        album: node.getAttribute('Album') || 'N/A',
        genre: node.getAttribute('Genre') || 'N/A',
        totalTime: node.getAttribute('TotalTime') || 'N/A',
        dateAdded: node.getAttribute('DateAdded') || 'N/A',
        comments: node.getAttribute('Comments') || '',
        playCount: node.getAttribute('PlayCount') || '0',
        key: node.getAttribute('Tonality') || 'N/A',
      }));
      
      // Navigate back to profile with the collection data
      // In a real app, this would be a POST to a backend, then a redirect.
      // Here we use react-router's state passing for simulation.
      navigate('/profile/user_1', { state: { collection: tracks } });

    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during parsing.');
      setCollection([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    if (file.type !== 'text/xml') {
      setError('Invalid file type. Please upload a Rekordbox XML file.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCollection([]);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onabort = () => {
        setError('File reading was aborted.');
        setIsLoading(false);
    }
    reader.onerror = () => {
        setError('File reading has failed.');
        setIsLoading(false);
    }
    reader.onload = () => {
      const fileContent = reader.result as string;
      parseRekordboxXml(fileContent);
    };
    reader.readAsText(file);
  }, []);

  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onDrop(Array.from(e.dataTransfer.files));
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onDrop(Array.from(e.target.files));
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };


  return (
    <div className="max-w-7xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-2">Import Rekordbox Collection</h1>
      <p className="text-gray-400 mb-8">Upload your Rekordbox XML file to view and manage your music library.</p>
      
      <div 
        role="button"
        tabIndex={0}
        aria-label="Upload Rekordbox XML file"
        className={`bg-gray-800 p-8 rounded-lg shadow-lg border-2 border-dashed ${isDragActive ? 'border-brand-accent' : 'border-gray-600'} transition-colors duration-300 text-center cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-accent`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={openFileDialog}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && openFileDialog()}
      >
        <input 
            ref={fileInputRef}
            type="file" 
            accept=".xml,text/xml"
            onChange={handleFileSelect}
            className="hidden"
            />
        <Icon name="upload" className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold">
          {isLoading ? 'Processing...' : (fileName ? `File: ${fileName}` : 'Drop your Rekordbox XML here or click to browse')}
        </h2>
        <p className="text-gray-500 mt-1">Export your collection from Rekordbox as an XML file.</p>
      </div>

      {isLoading && <Spinner />}
      
      {error && (
         <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg relative my-6" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      )}
      
      {collection.length > 0 && !isLoading && (
        <div className="mt-8 text-center">
            <h2 className="text-xl font-semibold text-green-400">Successfully processed {collection.length} tracks.</h2>
            <p className="text-gray-400">Redirecting you to your profile...</p>
        </div>
      )}
    </div>
  );
};

export default ImportCollectionPage;