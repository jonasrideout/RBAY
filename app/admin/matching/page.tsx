// app/admin/matching/page.tsx 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import FilterBar from './components/FilterBar';
import ConfirmationDialog from './components/ConfirmationDialog';
import SchoolCard from './components/SchoolCard';
import SchoolPairDisplay from './components/SchoolPairDisplay';
import { School, StatusCounts, Filters } from './types';

interface SchoolPair {
  school1: School;
  school2: School;
  hasStudentPairings: boolean;
  bothSchoolsReady: boolean;
}

export default function AdminDashboard() {
  const [schools, setSchools] = useState<School[]>([]);
  const [statusCounts, setStatusCounts] = useState<StatusCounts>({
    COLLECTING: 0,
    READY: 0,
    MATCHED: 0,
    CORRESPONDING: 0,
    DONE: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [adminUser, setAdminUser] = useState<string>('');
  
  // Matching and filtering state
  const [pinnedSchool, setPinnedSchool] = useState<School | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<School | null>(null);
  const [showWarning, setShowWarning] = useState(false);
  const [isMatched, setIsMatched] = useState(false);
  
  // Filter state
  const [filters, setFilters] = useState<Filters>({
    schoolSearch: '',
    teacherSearch: '',
    regions: [],
    statuses: [],
    classSizes: [],
    startDate: '',
    grades: []
  });
  const [filteredSchools, setFilteredSchools] = useState<School[]>([]);
  const [filtersApplied, setFiltersApplied] = useState(false);
  
  const router = useRouter();

  // Single useEffect for initialization
  useEffect(() => {
    let mounted = true;
    
    const initializeAdmin = async () => {
      try {
        // Check admin auth
        const authResponse = await fetch('/api/admin/me');
        if (!authResponse.ok) {
          router.push('/admin/login');
          return;
        }
        const authData = await authResponse.json();
        if (mounted) {
          setAdminUser(authData.email);
        }

        // Fetch all schools data (now includes pen pal assignments)
        await new Promise(resolve => setTimeout(resolve, 1000));
        await fetchAllSchools();
      } catch (error) {
        console.error('Admin initialization failed:', error);
        router.push('/admin/login');
      }
    };

    initializeAdmin();

    // Cleanup function
    return () => {
      mounted = false;
    };
  }, [router]);

  const handleAdminLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/');
    }
  };

  const fetchAllSchools = async () => {
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/admin/all-schools?v=2&t=${Date.now()}&r=${Math.random()}`);
      const data = await response.json();
      console.log('fetchAllSchools received data:', data.schools?.length || 0, 'schools');
      console.log('About to check response.ok, response status:', response.status);
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch schools');
      }

      setSchools(data.schools || []);
      console.log('Called setSchools with:', data.schools?.length, 'schools');
      setStatusCounts(data.statusCounts || {
        COLLECTING: 0,
        READY: 0,
        MATCHED: 0,
        CORRESPONDING: 0,
        DONE: 0
      });

      // No more individual API calls - pen pal data comes from the main query!

    } catch (err: any) {
      setError('Error fetching schools: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSchoolsUpdate = async () => {
    try {
      await fetchAllSchools();
      // Clear matching state after successful update
      setPinnedSchool(null);
      setShowFilters(false);
      setFiltersApplied(false);
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to refresh school data:', error);
      return Promise.resolve();
    }
  };

  const handleAssignPenPals = async (school1Id: string, school2Id: string) => {
    try {
      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          school1Id, 
          school2Id 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign pen pals');
      }

      fetchAllSchools();
      
    } catch (err: any) {
      console.error('Error assigning pen pals:', err);
      alert('Error assigning pen pals: ' + err.message);
    }
  };

  // Helper function to check if both schools are ready for pen pal assignment
  const areBothSchoolsReady = (school1: School, school2: School): boolean => {
    const validStatuses = ['READY', 'MATCHED'];
    return validStatuses.includes(school1.status) && validStatuses.includes(school2.status);
  };

  // Helper function to check if school pair has pen pal assignments (using new data structure)
  const getPairPenPalStatus = (school1: School, school2: School): boolean => {
    // Use the new penPalAssignments data from the API response
    return school1.penPalAssignments?.hasAssignments || school2.penPalAssignments?.hasAssignments || false;
  };

  // Matching workflow functions
  const handlePinSchool = (school: School) => {
    if (pinnedSchool && pinnedSchool.id === school.id) {
      // Unpin if clicking the same school
      setPinnedSchool(null);
      setShowFilters(false);
      setFiltersApplied(false);
    } else {
      // Pin a new school and show filters
      setPinnedSchool(school);
      setShowFilters(true);
      // Clear any existing filters
      setFilters({
        schoolSearch: '',
        teacherSearch: '',
        regions: [],
        statuses: [],
        classSizes: [],
        startDate: '',
        grades: []
      });
      setFiltersApplied(false);
    }
  };

  const handleMatchRequest = (school: School) => {
    if (!pinnedSchool) return;
    
    setSelectedMatch(school);
    
    // Check if same region for warning
    if (pinnedSchool.region === school.region) {
      setShowWarning(true);
    } else {
      setShowWarning(false);
    }
    
    setIsMatched(false);
    setShowConfirmDialog(true);
  };

  const confirmMatch = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      const response = await fetch('/api/admin/match-schools', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school1Id: pinnedSchool.id,
          school2Id: selectedMatch.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to match schools');
      }

      setIsMatched(true);
      
    } catch (err) {
      console.error('Error matching schools:', err);
      alert(`Error matching schools: ${err instanceof Error ? err.message : 'Please try again.'}`);
    }
  };

  const handleAssignPenPalsFromDialog = async () => {
    if (!pinnedSchool || !selectedMatch) return;

    try {
      const response = await fetch('/api/admin/assign-penpals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          school1Id: pinnedSchool.id,
          school2Id: selectedMatch.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to assign pen pals');
      }

      // Refresh data and close dialog
      await handleSchoolsUpdate();
      
      setTimeout(() => {
        setShowConfirmDialog(false
