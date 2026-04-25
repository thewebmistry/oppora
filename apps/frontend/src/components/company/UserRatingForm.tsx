'use client';

import { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { Star, StarHalf } from 'lucide-react';

interface UserRatingFormProps {
  companySlug: string;
}

interface RatingFormData {
  trustRating: number;
  productQuality: number;
  communitySupport: number;
  feedback: string;
}

const UserRatingForm = ({ companySlug }: UserRatingFormProps) => {
  const [formData, setFormData] = useState<RatingFormData>({
    trustRating: 0,
    productQuality: 0,
    communitySupport: 0,
    feedback: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRatingChange = (field: keyof RatingFormData, value: number) => {
    if (isSubmitted) return;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFeedbackChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isSubmitted) return;
    setFormData(prev => ({ ...prev, feedback: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate ratings
    if (formData.trustRating === 0 || formData.productQuality === 0 || formData.communitySupport === 0) {
      setError('Please provide ratings for all categories');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/v1/companies/${companySlug}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          trustRating: formData.trustRating,
          productQuality: formData.productQuality,
          communitySupport: formData.communitySupport,
          feedback: formData.feedback,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit rating: ${response.statusText}`);
      }

      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ 
    value, 
    onChange, 
    label, 
    description 
  }: { 
    value: number; 
    onChange: (newValue: number) => void; 
    label: string;
    description: string;
  }) => {
    const stars = [1, 2, 3, 4, 5];
    
    return (
      <div className="space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{label}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
        <div className="flex items-center gap-1">
          {stars.map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              disabled={isSubmitted}
              className={`p-1 transition-all duration-200 ${isSubmitted ? 'cursor-not-allowed' : 'hover:scale-110'}`}
              aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            >
              <Star
                className={`h-8 w-8 ${star <= value 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300 dark:text-gray-600'
                }`}
              />
            </button>
          ))}
          <span className="ml-4 text-xl font-bold text-gray-900 dark:text-white">
            {value.toFixed(1)}
          </span>
        </div>
      </div>
    );
  };

  return (
    <Card padding="lg" shadow border className="mt-8">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        Your Experience / Verdict
      </h2>
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Share your honest feedback based on our benchmarks
      </p>

      {isSubmitted ? (
        <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
              <Star className="h-6 w-6 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-300">
                Thanks for your insight!
              </h3>
              <p className="text-green-600 dark:text-green-400">
                Your review has been submitted successfully.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-8">
            <StarRating
              value={formData.trustRating}
              onChange={(value) => handleRatingChange('trustRating', value)}
              label="Trust Rating"
              description="How trustworthy is this company based on your experience?"
            />
            
            <StarRating
              value={formData.productQuality}
              onChange={(value) => handleRatingChange('productQuality', value)}
              label="Product Quality"
              description="How would you rate the quality of their products/services?"
            />
            
            <StarRating
              value={formData.communitySupport}
              onChange={(value) => handleRatingChange('communitySupport', value)}
              label="Community Support"
              description="How responsive and helpful is their community support?"
            />
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Optional Feedback
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Share additional thoughts about your experience (optional)
            </p>
            <textarea
              value={formData.feedback}
              onChange={handleFeedbackChange}
              disabled={isSubmitted}
              placeholder="What did you like or dislike? Any suggestions for improvement?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] resize-none"
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-red-600 dark:text-red-400 font-medium">{error}</p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Your review helps others make informed decisions
            </div>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={isSubmitted}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
};

export default UserRatingForm;