
import React, { useState, useEffect } from 'react';
import { Label } from '../types';
import { getLabels } from '../services/firebaseService';
import Spinner from '../components/Spinner';
import LabelCard from '../components/LabelCard';

const LabelsPage: React.FC = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedLabels = await getLabels();
      setLabels(fetchedLabels);
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Record Labels</h1>
      <p className="text-gray-400 mb-8">Discover the labels shaping the sound of the community.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {(labels || []).length > 0 ? (
          labels.map(label => (
            <LabelCard key={label.id} label={label} />
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-400 text-lg">No labels found. Check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LabelsPage;
