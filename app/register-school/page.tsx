// /app/register-school/page.tsx

"use client";

import { useState } from 'react';
import { SchoolFormData } from './types';
import { STATE_TO_REGION } from './constants';
import SchoolRegistrationForm from './components/SchoolRegistrationForm';
import SuccessPage from './components/SuccessPage';

export default function RegisterSchool() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredSchool, setRegisteredSchool] = useState<any>(null);
  const [formData, setFormData] = useState<SchoolFormData>({
    teacherFirstName: '',
    teacherLastName: '',
    teacherEmail: '',
    teacherPhone: '',
    schoolName: '',
    schoolCity: '',
    schoolState: '',
    gradeLevels: [],
    classSize: '',
    programStartMonth: '',
    letterFrequency: '',
    specialConsiderations: '',
    programAgreement: false,
    parentNotification: false
  });

  const updateFormData = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleGradeLevelChange = (grade: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      gradeLevels: checked 
        ? [...prev.gradeLevels, grade]
        : prev.gradeLevels.filter(g => g !== grade)
    }));
    if (error) setError('');
  };

  const getRegionForState = (state: string) => {
    return STATE_TO_REGION[state] || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Updated validation - removed schoolAddress, made schoolCity optional
    const requiredFields = [
      'teacherFirstName', 'teacherLastName', 'teacherEmail', 'schoolName', 
      'schoolState', 'classSize', 'programStartMonth', 'letterFrequency'
    ];

    for (const field of requiredFields) {
      if (!formData[field as keyof SchoolFormData]) {
        setError('Please fill in all required fields');
        setIsLoading(false);
        return;
      }
    }

    if (formData.gradeLevels.length === 0) {
      setError('Please select at least one grade level');
      setIsLoading(false);
      return;
    }

    if (!formData.teacherEmail.includes('@')) {
      setError('Please enter a valid email address');
      setIsLoading(false);
      return;
    }

    if (!formData.programAgreement || !formData.parentNotification) {
      setError('Please check both agreement boxes to continue');
      setIsLoading(false);
      return;
    }

    try {
      // Transform data to match API expectations
      const region = getRegionForState(formData.schoolState);
      const dataToSend = {
        teacherFirstName: formData.teacherFirstName,
        teacherLastName: formData.teacherLastName,
        teacherEmail: formData.teacherEmail,
        teacherPhone: formData.teacherPhone,
        schoolName: formData.schoolName,
        schoolCity: formData.schoolCity, // Optional field
        schoolAddress: '', // Empty for now, will collect later
        schoolState: formData.schoolState,
        schoolZip: '', // Empty for now, will collect later
        region,
        gradeLevel: formData.gradeLevels.join(', '), // Convert array to string
        expectedClassSize: formData.classSize,
        startMonth: formData.programStartMonth,
        letterFrequency: formData.letterFrequency,
        specialConsiderations: formData.specialConsiderations,
        programAgreement: formData.programAgreement,
        parentNotification: formData.parentNotification
      };

      const response = await fetch('/api/schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register school');
      }

      setRegisteredSchool(data.school);
      setIsSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'There was an error submitting your registration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return <SuccessPage registeredSchool={registeredSchool} />;
  }

  return (
    <SchoolRegistrationForm
      formData={formData}
      isLoading={isLoading}
      error={error}
      onSubmit={handleSubmit}
      onUpdateFormData={updateFormData}
      onGradeLevelChange={handleGradeLevelChange}
    />
  );
}
