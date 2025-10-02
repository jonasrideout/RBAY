'use client';

import { useState } from 'react';

interface School {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  studentCounts?: {
    expected: number;
    registered: number;
  };
}

interface CreateGroupModalProps {
  availableSchools: School[];
  onClose: () => void;
  onGroupCreated: () => void;
}

export default function CreateGroupModal({ 
  availableSchools, 
  onClose, 
  onGroupCreated 
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const totalStudents = selectedSchools.reduce((sum, schoolId) => {
    const school = availableSchools.find(s => s.id === schoolId);
    return sum + (school?.studentCounts?.registered || 0);
  }, 0);

  const handleSubmit = async () => {
    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }
    
    if (selectedSchools.length < 2) {
      setError('Please select at least 2 schools');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/school-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          schoolIds: selectedSchools
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create group');
      }

      onGroupCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create group');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="card" style={{ 
        width: '600px', 
        maxHeight: '80vh', 
        overflow: 'auto',
        padding: '24px'
      }}>
        <h2 className="text-teacher-name" style={{ 
          fontSize: '18px', 
          marginBottom: '20px' 
        }}>
          Create School Group
        </h2>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '13px', 
            fontWeight: '300',
            color: '#495057',
            marginBottom: '8px'
          }}>
            Group Name
          </label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="e.g., Washington Elementary 4th Grade Combined"
            style={{
              width: '100%',
              padding: '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            fontSize: '13px', 
            fontWeight: '300',
            color: '#495057',
            marginBottom: '8px'
          }}>
            Select Schools (minimum 2)
          </label>
          
          <div style={{ 
            border: '1px solid #dee2e6', 
            borderRadius: '4px',
            maxHeight: '300px',
            overflow: 'auto'
          }}>
            {availableSchools.map(school => (
              <label
                key={school.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '12px',
                  borderBottom: '1px solid #f8f9fa',
                  cursor: 'pointer',
                  backgroundColor: selectedSchools.includes(school.id) 
                    ? '#f8f9fa' 
                    : 'transparent'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedSchools.includes(school.id)}
                  onChange={() => toggleSchool(school.id)}
                  style={{ marginRight: '12px' }}
                />
                <div style={{ flex: 1 }}>
                  <div className="text-school-name" style={{ fontSize: '14px' }}>
                    {school.schoolName}
                  </div>
                  <div className="text-meta-info" style={{ fontSize: '12px' }}>
                    {school.teacherName} • {school.teacherEmail}
                  </div>
                </div>
                <div className="text-data-value" style={{ fontSize: '14px' }}>
                  {school.studentCounts?.registered || 0} students
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedSchools.length >= 2 && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8f9fa',
            borderRadius: '4px',
            marginBottom: '20px'
          }}>
            <div className="text-data-label" style={{ marginBottom: '4px' }}>
              Combined Total
            </div>
            <div className="text-data-value" style={{ fontSize: '16px' }}>
              {selectedSchools.length} schools • {totalStudents} students
            </div>
          </div>
        )}

        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '20px',
            fontSize: '13px'
          }}>
            {error}
          </div>
        )}

        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="btn"
            style={{
              padding: '8px 16px',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '4px',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '300'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedSchools.length < 2 || !groupName.trim()}
            className="btn btn-primary"
            style={{
              padding: '8px 16px',
              opacity: (isSubmitting || selectedSchools.length < 2 || !groupName.trim()) 
                ? 0.6 
                : 1,
              cursor: (isSubmitting || selectedSchools.length < 2 || !groupName.trim())
                ? 'not-allowed' 
                : 'pointer',
              fontSize: '14px'
            }}
          >
            {isSubmitting ? 'Creating...' : 'Create Group'}
          </button>
        </div>
      </div>
    </div>
  );
}
