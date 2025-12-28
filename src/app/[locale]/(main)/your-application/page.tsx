'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, SubmitHandler, FieldValues } from 'react-hook-form';
import LockClosed from '@/components/Icons/LockClosed';
import LockOpen from '@/components/Icons/LockOpen';
import { useTranslations } from 'next-intl';

interface Field {
  key: string;
  label: string;
  type: 'select' | 'number';
  options?: string[];
  required?: boolean;
}

const YourApplicationPage = () => {
  const router = useRouter();
  const t = useTranslations('your_application_page');

  // Field definitions using t for labels
  const personalFields: Field[] = [
    {
      key: 'sex',
      label: t('gender_title'),
      type: 'select',
      options: ['male', 'female', 'diverse'],
      required: true,
    },
    {
      key: 'job',
      label: t('job_title'),
      type: 'select',
      options: [
        'unskilled and non-resident',
        'unskilled and resident',
        'skilled',
        'highly skilled',
      ],
      required: true,
    },
    {
      key: 'housing',
      label: t('housing_title'),
      type: 'select',
      options: ['own', 'free', 'rent'],
      required: true,
    },
    {
      key: 'saving.accounts',
      label: t('saving_accounts_title'),
      type: 'select',
      options: ['little', 'moderate', 'rich', 'quite rich'],
      required: true,
    },
    {
      key: 'checking.account',
      label: t('checking_account_title'),
      type: 'select',
      options: ['little', 'moderate', 'rich'],
      required: true,
    },
    {
      key: 'age',
      label: t('age_title'),
      type: 'number',
      required: true,
    },
  ];

  const loanFields: Field[] = [
    { key: 'credit.amount', label: t('credit_amount_title'), type: 'number', required: true },
    { key: 'duration', label: t('loan_duration_title'), type: 'number', required: true },
    {
      key: 'purpose',
      label: t('loan_purpose_title'),
      type: 'select',
      options: [
        'car',
        'radio/TV',
        'education',
        'furniture/equipment',
        'business',
        'domestic appliances',
        'repairs',
        'vacation/others',
      ],
      required: true,
    },
  ];

  const initialLocked: Record<string, boolean> = personalFields.reduce<Record<string, boolean>>(
    (acc, field) => {
      acc[field.key] = false;
      return acc;
    },
    {} as Record<string, boolean>,
  );
  loanFields.forEach((field) => {
    initialLocked[field.key] = false;
  });

  // Helper to flatten nested objects with dot notation
  function flattenObject(
    obj: Record<string, unknown>,
    prefix = '',
    res: Record<string, unknown> = {},
  ) {
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const value = obj[key];
        const newKey = prefix ? `${prefix}.${key}` : key;
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          flattenObject(value as Record<string, unknown>, newKey, res);
        } else {
          res[newKey] = value;
        }
      }
    }
    return res;
  }

  // Helper to get nested error using dot notation
  function getNestedError(errors: Record<string, unknown>, key: string): unknown {
    return key
      .split('.')
      .reduce<unknown>(
        (obj, k) =>
          obj && typeof obj === 'object' && k in obj
            ? (obj as Record<string, unknown>)[k]
            : undefined,
        errors,
      );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>();

  const [locked, setLocked] = useState<Record<string, boolean>>(initialLocked);
  const [isLoading, setIsLoading] = useState(false);

  const handleLock = (key: string) => {
    setLocked((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const onSubmit: SubmitHandler<FieldValues> = async (data) => {
    // Log the raw form data for debugging
    console.log('Raw form data:', data);
    // Map 'diverse' gender to 'female' before sending to backend
    if (data.sex === 'diverse') {
      data.sex = 'female';
    }
    // Flatten the data to match backend expectations
    const flatData = flattenObject(data);
    console.log('Flattened data:', flatData);
    try {
      setIsLoading(true);
      console.log('Starting counterfactual generation with data:', flatData);

      // Get the locked fields
      const lockedFields = Object.keys(locked).filter((k) => locked[k]);
      console.log('Locked fields:', lockedFields);

      // Send data to the counterfactuals API
      console.log('Sending request to counterfactuals API...');
      const response = await fetch('/api/counterfactuals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: flatData,
          locked: lockedFields,
        }),
      });

      if (!response.ok) {
        console.error('API request failed with status:', response.status);
        throw new Error('Failed to generate counterfactuals');
      }

      const result = await response.json();
      console.log('Counterfactuals generation completed successfully');
      console.log('Counterfactuals result:', result);

      // Log specific details about the counterfactuals
      if (result.success && result.result) {
        console.log('Number of counterfactuals generated:', result.result.length);
        console.log('First counterfactual example:', result.result[0]);
      }

      // Redirect to dashboard after successful completion
      console.log('Redirecting to dashboard...');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error generating counterfactuals:', error);
      alert('Failed to generate counterfactuals. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderField = (field: Field) => (
    <div key={field.key} className="relative mb-4 flex flex-col gap-1">
      <div className="mb-1 flex items-center justify-between">
        <label htmlFor={field.key} className="font-medium">
          {field.label}
        </label>
        <button
          type="button"
          className={`ml-2 ${locked[field.key] ? 'text-blue-700' : 'text-gray-400'} hover:text-blue-600`}
          onClick={() => handleLock(field.key)}
          aria-label={locked[field.key] ? 'Unlock' : 'Lock'}
        >
          {locked[field.key] ? <LockClosed fill="#BDD6FB" /> : <LockOpen />}
        </button>
      </div>
      {field.type === 'select' ? (
        <select
          id={field.key}
          className={`rounded border px-3 py-2 ${locked[field.key] ? 'bg-gray-100 text-gray-400' : ''}`}
          {...register(field.key, { required: field.required ? 'This field is required.' : false })}
          disabled={locked[field.key]}
        >
          <option value="">Select</option>
          {field.options!.map((opt: string) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={field.key}
          type="number"
          className={`rounded border px-3 py-2 ${locked[field.key] ? 'bg-gray-100 text-gray-400' : ''}`}
          {...register(field.key, {
            required: field.required ? 'This field is required.' : false,
            valueAsNumber: true,
            validate: (value: number) => value > 0 || 'Please enter a valid number.',
          })}
          disabled={locked[field.key]}
          min={0}
        />
      )}
      {(() => {
        const err = getNestedError(errors, field.key);
        let msg = '';
        if (err && typeof err === 'object' && 'message' in err) {
          const m = (err as { message: unknown }).message;
          msg = typeof m === 'string' ? m : '';
        }
        return msg ? <span className="mt-1 text-xs text-red-500">{msg}</span> : null;
      })()}
    </div>
  );

  return (
    <div className="flex h-full flex-1 grow flex-col gap-[50px] rounded-2xl bg-white px-[24px] py-[40px] drop-shadow-md">
      <p className="align-semibold mb-8 text-center text-xl">{t('form_description')}</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto w-full max-w-3xl">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <h2 className="mb-4 text-2xl font-bold">{t('personal_information_title')}</h2>
            {personalFields.map(renderField)}
          </div>
          <div>
            <h2 className="mb-4 text-2xl font-bold">{t('loan_details_title')}</h2>
            {loanFields.map(renderField)}
          </div>
        </div>
        <div className="mt-8 flex justify-center">
          <button
            type="submit"
            disabled={isLoading}
            className={`rounded px-8 py-2 text-white transition ${
              isLoading ? 'cursor-not-allowed bg-gray-400' : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                {t('generating_counterfactuals_text')}
              </div>
            ) : (
              t('submit_button_text')
            )}
          </button>
        </div>
        {Object.keys(errors).length > 0 && (
          <div className="mt-4 text-center text-red-600">{t('error_correct_above')}</div>
        )}
      </form>
    </div>
  );
};

export default YourApplicationPage;
