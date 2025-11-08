
import React, { useState, useEffect } from 'react';
import { Masterclass } from '../types';
import { getMasterclasses } from '../services/firebaseService';
import Spinner from '../components/Spinner';
import MasterclassCard from '../components/MasterclassCard';

const MasterclassPage: React.FC = () => {
  const [masterclasses, setMasterclasses] = useState<Masterclass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedMasterclasses = await getMasterclasses();
      setMasterclasses(fetchedMasterclasses);
      setLoading(false);
    };
    fetchData();
  }, []);


  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Masterclasses</h1>
      <p className="text-gray-400 mb-8">Take a deep dive with exclusive, in-depth courses from top-tier artists and producers.</p>
      
      <div className="space-y-8">
        {masterclasses.map(mc => (
            <MasterclassCard key={mc.id} masterclass={mc} />
        ))}
      </div>
    </div>
  );
};

export default MasterclassPage;
