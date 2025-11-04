import React, { useState } from 'react';

const surveyQuestions = ["What is your primary motivation for joining the Portal Universe?","Describe your ideal virtual world in three words.","Do you prefer collaborating with others or exploring solo?","Which of these activities excites you most: building, exploring, competing, or socializing?","On a scale of 1-10, how important is a deep, evolving story to you?","What kind of role do you typically play in online communities (e.g., leader, follower, creator, observer)?","Are you more interested in fantasy, sci-fi, historical, or modern settings?","How much time do you envision spending in the portal each week?","What is your experience level with virtual reality or metaverse platforms?","Is creating your own content (e.g., worlds, avatars, items) important to you?",];

const SurveyPage: React.FC<{ onSurveyComplete: (answers: string[]) => void }> = ({ onSurveyComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(surveyQuestions.length).fill(''));
  const handleAnswerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = e.target.value;
    setAnswers(newAnswers);
  };
  const handleNext = () => { if (currentQuestionIndex < surveyQuestions.length - 1) setCurrentQuestionIndex(prev => prev + 1); };
  const handlePrev = () => { if (currentQuestionIndex > 0) setCurrentQuestionIndex(prev => prev - 1); };
  const handleComplete = () => { onSurveyComplete(answers); }
  const progress = ((currentQuestionIndex + 1) / surveyQuestions.length) * 100;

  return (
    <main className="relative flex items-center justify-center min-h-screen w-full bg-gray-900 text-gray-200 overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center z-0" style={{ backgroundImage: "url('https://picsum.photos/1920/1080?grayscale&blur=2&random=2')" }}></div>
      <div className="absolute inset-0 bg-black/70 z-10"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-fuchsia-500/20 rounded-full filter blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-4000"></div>
      <div className="relative z-20 flex flex-col w-full max-w-2xl p-8 m-4 bg-gray-900/50 backdrop-blur-xl border border-cyan-500/20 rounded-2xl shadow-2xl shadow-cyan-500/10">
        <div className="text-center mb-6"><h1 className="font-orbitron text-3xl font-bold text-cyan-300 tracking-widest uppercase">Onboarding Survey</h1><p className="text-gray-400 mt-2">Help us tailor your universe. ({currentQuestionIndex + 1}/{surveyQuestions.length})</p></div>
        <div className="w-full bg-gray-700/50 rounded-full h-2 my-4"><div className="bg-cyan-500 h-2 rounded-full transition-all duration-500 ease-in-out" style={{ width: `${progress}%` }}></div></div>
        <div className="my-6 min-h-[200px]"><label className="font-orbitron text-lg text-cyan-200 mb-4 block">{surveyQuestions[currentQuestionIndex]}</label><textarea value={answers[currentQuestionIndex]} onChange={handleAnswerChange} placeholder="Your thoughts..." rows={5} className="w-full p-3 bg-gray-800/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none"/></div>
        <div className="flex items-center justify-between mt-6">
            <button onClick={handlePrev} disabled={currentQuestionIndex === 0} className="font-orbitron bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-all duration-300">Previous</button>
            {currentQuestionIndex < surveyQuestions.length - 1 ? <button onClick={handleNext} className="font-orbitron bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-cyan-500/30 transition-all duration-300 transform hover:scale-105">Next</button> : <button onClick={handleComplete} className="font-orbitron bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-8 rounded-lg shadow-lg shadow-green-500/30 transition-all duration-300 transform hover:scale-105">Complete Survey</button>}
        </div>
      </div>
    </main>
  );
};

export default SurveyPage;
