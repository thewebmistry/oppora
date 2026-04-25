'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, IndianRupee, Star } from 'lucide-react';
import apiClient from '@/lib/api';
import PageLoader from '@/components/ui/PageLoader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Plan {
  _id: string;
  name: string;
  price: number;
  duration: 'monthly' | 'yearly';
  features: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PlansResponse {
  success: boolean;
  count: number;
  data: Plan[];
}

export default function PricingPage() {
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Fetch plans on mount
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get<PlansResponse>('/payment/plans');
        setPlans(response.data.data);
        // Auto-select the first plan by default
        if (response.data.data.length > 0) {
          setSelectedPlanId(response.data.data[0]._id);
        }
      } catch (err: any) {
        console.error('Failed to fetch plans:', err);
        setError(err.response?.data?.message || 'Failed to load plans. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleCheckout = async () => {
    if (!selectedPlanId) {
      alert('Please select a plan');
      return;
    }

    // Check authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You need to log in to proceed with checkout.');
      router.push('/login');
      return;
    }

    setCheckoutLoading(true);
    try {
      const response = await apiClient.post('/payment/checkout', { planId: selectedPlanId });
      const { checkoutUrl } = response.data.data;
      alert('Redirecting to Gateway...');
      // In production, you would redirect to the checkout URL
      // For now, we'll redirect to dashboard as per instructions
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Checkout error:', err);
      alert(err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const selectedPlan = plans.find(p => p._id === selectedPlanId);

  // Determine which plan is "Most Popular" (e.g., the one with highest price or name contains "Pro")
  const getPopularPlanId = () => {
    const proPlan = plans.find(p => p.name.toLowerCase().includes('pro'));
    if (proPlan) return proPlan._id;
    // fallback to second plan if exists
    if (plans.length >= 2) return plans[1]._id;
    return plans[0]?._id || null;
  };

  const popularPlanId = getPopularPlanId();

  if (loading) {
    return <PageLoader message="Loading plans..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card padding="lg" className="max-w-md text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6">{error}</p>
          <Button variant="primary" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Growth Plan</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Select the perfect plan that matches your ambitions. All plans include core features with priority support and regular updates.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => {
            const isPopular = plan._id === popularPlanId;
            const isSelected = selectedPlanId === plan._id;
            return (
              <div
                key={plan._id}
                className={`relative ${isPopular ? 'lg:scale-105 lg:-translate-y-4' : ''}`}
                onClick={() => setSelectedPlanId(plan._id)}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                      <Star size={12} />
                      Most Popular
                    </div>
                  </div>
                )}
                <Card
                  padding="xl"
                  shadow
                  hoverEffect
                  border
                  className={`h-full cursor-pointer transition-all duration-300 ${isSelected ? 'ring-4 ring-blue-500 dark:ring-blue-400' : 'ring-1 ring-gray-200 dark:ring-gray-800'}`}
                >
                  <div className="flex flex-col h-full">
                    <div className="mb-6">
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                      <div className="mt-4 flex items-baseline">
                        <IndianRupee className="h-6 w-6 text-gray-700 dark:text-gray-300" />
                        <span className="text-5xl font-bold text-gray-900 dark:text-white ml-1">
                          {plan.price}
                        </span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">/{plan.duration}</span>
                      </div>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Billed {plan.duration === 'yearly' ? 'annually' : 'monthly'}
                      </p>
                    </div>

                    <ul className="space-y-3 flex-grow">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="ml-3 text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Button
                        variant={isSelected ? 'primary' : 'outline'}
                        size="lg"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedPlanId(plan._id);
                        }}
                      >
                        {isSelected ? 'Selected' : 'Select Plan'}
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>

        {/* Selected Plan Summary & CTA */}
        <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-2xl p-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                {selectedPlan ? `Selected: ${selectedPlan.name}` : 'No plan selected'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedPlan ? (
                  <>
                    <IndianRupee className="inline h-4 w-4" /> {selectedPlan.price} / {selectedPlan.duration}
                    {' • '}
                    {selectedPlan.features.length} features included
                  </>
                ) : (
                  'Choose a plan to continue'
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                onClick={() => router.push('/')}
              >
                Back to Home
              </Button>
              <Button
                variant="primary"
                size="lg"
                isLoading={checkoutLoading}
                disabled={!selectedPlanId}
                onClick={handleCheckout}
                className="min-w-[200px]"
              >
                {checkoutLoading ? 'Processing...' : 'Proceed to Checkout'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}