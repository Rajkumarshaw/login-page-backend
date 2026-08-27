import React, { useState } from 'react';
import { submitRecord } from '../services/recordService';
import { validateName, validateDOB } from '../utils/validators';
import { Calendar, User, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';

const AgeCalculator = ({ showToast }) => {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setResult(null);

    // Front-end Validations
    const nameErr = validateName(name);
    const dobErr = validateDOB(dob);

    if (nameErr || dobErr) {
      setErrors({
        name: nameErr,
        dob: dobErr,
      });
      return;
    }

    setErrors({});
    setLoading(true);

    try {
      const data = await submitRecord(name, dob);
      setResult(data.age);
      showToast(data.message || 'Age calculated successfully.', 'success');
      // Reset form
      setName('');
      setDob('');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit calculation.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex flex-col justify-center items-center">
      <div className="w-full max-w-lg">
        {/* Logo and title */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-primary-50 border border-primary-100 rounded-2xl text-primary-600 mb-4 shadow-sm">
            <Clock className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight sm:text-4xl">
            Calculate Your Age
          </h1>
          <p className="mt-3 text-base sm:text-lg text-gray-600">
            Enter your details to calculate your current age.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-950 ${
                    errors.name
                      ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300'
                  }`}
                  placeholder="Rahul Kumar"
                />
              </div>
              {errors.name && <p className="mt-1.5 text-sm text-rose-600 font-medium">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="dob" className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date of Birth
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dob"
                  id="dob"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border rounded-lg focus:outline-none focus:ring-2 transition-all text-gray-950 ${
                    errors.dob
                      ? 'border-rose-300 focus:ring-rose-500 focus:border-rose-500'
                      : 'border-gray-200 focus:ring-primary-500 focus:border-primary-500 hover:border-gray-300'
                  }`}
                />
              </div>
              {errors.dob && <p className="mt-1.5 text-sm text-rose-600 font-medium">{errors.dob}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                <>
                  <span>Calculate Age</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Results Box */}
          {result && (
            <div className="mt-8 border-t border-gray-100 pt-6 animate-fade-in">
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    Your information has been submitted successfully.
                  </p>
                  <p className="text-xs text-emerald-600 mt-0.5">
                    Your record is securely stored and is accessible only by the authenticated system administrator.
                  </p>
                </div>
              </div>

              <div className="text-center bg-gray-50 border border-gray-100 rounded-xl p-5">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">
                  Your Current Age
                </p>
                <div className="flex flex-wrap justify-center items-baseline gap-1 sm:gap-2">
                  <span className="text-3xl sm:text-4xl font-extrabold text-primary-600">{result.years}</span>
                  <span className="text-base sm:text-lg font-bold text-gray-500 mr-2">years</span>
                  {result.months > 0 && (
                    <>
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary-600">{result.months}</span>
                      <span className="text-base sm:text-lg font-bold text-gray-500 mr-2">months</span>
                    </>
                  )}
                  {result.days > 0 && (
                    <>
                      <span className="text-3xl sm:text-4xl font-extrabold text-primary-600">{result.days}</span>
                      <span className="text-base sm:text-lg font-bold text-gray-500">days</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default AgeCalculator;
