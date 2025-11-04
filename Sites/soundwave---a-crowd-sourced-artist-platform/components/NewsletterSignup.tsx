import React, { useState } from 'react';
import Button from './Button';
import { Icon } from './Icon';

const NewsletterSignup: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            setSubmitted(true);
        }, 1000);
    }

    if (submitted) {
        return (
            <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="bg-green-500/20 text-green-300 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Icon name="thumbs-up" className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">You're Subscribed!</h3>
                <p className="text-gray-400 mt-2">Thanks for joining our mailing list. Keep an eye on your inbox for exclusive content.</p>
            </div>
        )
    }

    return (
        <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-2">Join the Mailing List</h3>
            <p className="text-gray-400 mb-4 text-sm">Get exclusive downloads, event news, and special offers directly in your inbox.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    required
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-4 focus:ring-brand-accent focus:border-brand-accent transition text-white"
                />
                <Button type="submit" isLoading={isSubmitting} className="w-full">
                    Subscribe
                </Button>
            </form>
        </div>
    )
}

export default NewsletterSignup;