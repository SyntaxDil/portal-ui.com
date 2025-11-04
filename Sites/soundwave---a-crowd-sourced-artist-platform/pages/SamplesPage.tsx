
import React, { useState, useEffect } from 'react';
import { SamplePack } from '../types';
import { getSamplePacks } from '../services/mockData';
import Spinner from '../components/Spinner';
import SamplePackCard from '../components/SamplePackCard';

const SamplesPage: React.FC = () => {
  const [samplePacks, setSamplePacks] = useState<SamplePack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedPacks = await getSamplePacks();
      setSamplePacks(fetchedPacks);
      setLoading(false);
    };
    fetchData();
  }, []);


  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Sample Packs</h1>
      <p className="text-gray-400 mb-8">Find the perfect sound for your next track. High-quality, royalty-free samples from the community.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {samplePacks.map(pack => (
            <SamplePackCard key={pack.id} pack={pack} />
        ))}
      </div>
    </div>
  );
};

export default SamplesPage;
