
import React, { useState, useEffect } from 'react';
import { Tutorial } from '../types';
import { getTutorials } from '../services/mockData';
import Spinner from '../components/Spinner';
import TutorialCard from '../components/TutorialCard';

const TutorialsPage: React.FC = () => {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const fetchedTutorials = await getTutorials();
      setTutorials(fetchedTutorials);
      setLoading(false);
    };
    fetchData();
  }, []);


  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-2">Tutorials</h1>
      <p className="text-gray-400 mb-8">Learn new skills and production techniques from talented artists in the community.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tutorials.map(tutorial => (
            <TutorialCard key={tutorial.id} tutorial={tutorial} />
        ))}
      </div>
    </div>
  );
};

export default TutorialsPage;
