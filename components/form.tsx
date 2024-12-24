'use client'; 
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { z } from 'zod';
import { FormDataSchema } from '@/lib/schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Inputs = z.infer<typeof FormDataSchema>;

const steps = [
  {
    id: 'Step 1',
    name: 'Personal Information',
    fields: ['firstName', 'lastName', 'email'],
  },
  {
    id: 'Step 2',
    name: 'Address',
    fields: ['country', 'state', 'city'],
  },
  {
    id: 'Step 3',
    name: 'Preferences',
    fields: ['newsletter', 'terms'],
  },
  { id: 'Step 4', name: 'Review', fields: [] },
];

export default function Form() {
  const [darkMode, setDarkMode] = useState(false);
  const [previousStep, setPreviousStep] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const delta = currentStep - previousStep;

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setDarkMode(savedTheme === 'dark');
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', darkMode ? 'dark' : 'light');
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Load saved form data from localStorage
  const savedFormData = JSON.parse(localStorage.getItem('formData') || '{}');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    trigger,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(FormDataSchema),
    defaultValues: savedFormData, // Set default values from saved data
  });

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const subscription = watch((value) => {
      localStorage.setItem('formData', JSON.stringify(value));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  const processForm: SubmitHandler<Inputs> = (data) => {
    console.log(data);
    reset(); // Reset form after submission (optionally clear localStorage as well)
    localStorage.removeItem('formData'); // Clear saved data on form submission
  };

  type FieldName = keyof Inputs;

  const next = async () => {
    const fields = steps[currentStep].fields;
    if (fields) {
      const isValid = await trigger(fields as FieldName[], { shouldFocus: true });
      if (!isValid) return;
    }

    if (currentStep < steps.length - 1) {
      if (currentStep === steps.length - 2) {
        await handleSubmit(processForm)(); // Submit on the last step
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (currentStep > 0) {
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const handleFinalSubmit = () => {
    toast.success("Form submitted successfully!"); // Trigger toast on submit
    reset(); // Optionally reset form
    localStorage.removeItem('formData'); // Clear saved data on final submit
  };

  return (
    <section className="absolute inset-0 flex flex-col justify-between p-6 sm:p-12 md:p-16 lg:p-24 xl:p-32 2xl:p-48">
      {/* Dark Mode Toggle */}
      <header className="flex justify-between items-center mb-4">
        <h1 className="text-lg font-bold">Multi-Step Form</h1>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="rounded bg-gray-200 px-3 py-1 text-sm font-semibold hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>
      </header>

      {/* Steps */}
      <nav aria-label="Progress">
        <ol role="list" className="space-y-4 md:flex md:space-x-8 md:space-y-0">
          {steps.map((step, index) => (
            <li key={step.name} className="md:flex-1">
              {currentStep > index ? (
                <div className="group flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-sky-600 transition-colors">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : currentStep === index ? (
                <div
                  className="flex w-full flex-col border-l-4 border-sky-600 py-2 pl-4 md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4"
                  aria-current="step"
                >
                  <span className="text-sm font-medium text-sky-600">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              ) : (
                <div className="group flex w-full flex-col border-l-4 border-gray-200 py-2 pl-4 transition-colors md:border-l-0 md:border-t-4 md:pb-0 md:pl-0 md:pt-4">
                  <span className="text-sm font-medium text-gray-500 transition-colors">{step.id}</span>
                  <span className="text-sm font-medium">{step.name}</span>
                </div>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Form */}
      <form className="mt-12 py-12 space-y-6" onSubmit={handleSubmit(processForm)}>
        {/* Step 1: Personal Information */}
        {currentStep === 0 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                {...register('firstName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.firstName && <p className="text-sm text-red-600">{errors.firstName.message}</p>}
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                {...register('lastName')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.lastName && <p className="text-sm text-red-600">{errors.lastName.message}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                {...register('email')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
            </div>
          </motion.div>
        )}

        {/* Step 2: Address */}
        {currentStep === 1 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">Address</h2>
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <input
                type="text"
                id="country"
                {...register('country')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.country && <p className="text-sm text-red-600">{errors.country.message}</p>}
            </div>
            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                State
              </label>
              <input
                type="text"
                id="state"
                {...register('state')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.state && <p className="text-sm text-red-600">{errors.state.message}</p>}
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <input
                type="text"
                id="city"
                {...register('city')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
              {errors.city && <p className="text-sm text-red-600">{errors.city.message}</p>}
            </div>
          </motion.div>
        )}

        {/* Step 3: Preferences */}
        {currentStep === 2 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
            <div>
              <label htmlFor="newsletter" className="block text-sm font-medium text-gray-700">
                Subscribe to Newsletter
              </label>
              <input
                type="checkbox"
                id="newsletter"
                {...register('newsletter')}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
                Accept Terms & Conditions
              </label>
              <input
                type="checkbox"
                id="terms"
                {...register('terms')}
                className="mt-1"
              />
            </div>
          </motion.div>
        )}

        {/* Step 4: Review */}
        {currentStep === 3 && (
          <motion.div
            initial={{ x: delta >= 0 ? '50%' : '-50%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-6"
          >
            <h2 className="text-lg font-semibold text-gray-900">Review</h2>
            <div className="space-y-2">
              <p><strong>First Name:</strong> {watch('firstName')}</p>
              <p><strong>Last Name:</strong> {watch('lastName')}</p>
              <p><strong>Email:</strong> {watch('email')}</p>
              <p><strong>Country:</strong> {watch('country')}</p>
              <p><strong>State:</strong> {watch('state')}</p>
              <p><strong>City:</strong> {watch('city')}</p>
              <p><strong>Subscribed to newsletter:</strong> {watch('newsletter') ? 'Yes' : 'No'}</p>
              <p><strong>Accepted Terms:</strong> {watch('terms') ? 'Yes' : 'No'}</p>
            </div>

            <button
              type="button"
              onClick={handleFinalSubmit} // Toastify on form submit
              className="mt-4 rounded bg-blue-600 text-white px-6 py-2"
            >
              Submit
            </button>
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="mt-6 flex justify-between">
          <button
            type="button"
            onClick={prev}
            disabled={currentStep === 0}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 disabled:border-gray-200 disabled:text-gray-300"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={currentStep === steps.length - 1}
            className="rounded bg-blue-600 text-white px-6 py-2 text-sm font-medium"
          >
            {currentStep === steps.length - 1 ? 'Next' : 'Next'}
          </button>
        </div>
      </form>

      <ToastContainer />
    </section>
  );
}