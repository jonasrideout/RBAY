'use client';

import { useState, useEffect } from 'react';

interface School {
  id: string;
  schoolName: string;
  teacherName: string;
  teacherEmail: string;
  studentCounts?: {
    expected: number;
    registered: number;
  };
  hasPenPals?: boolean;
}

interface Group {
  id: string;
  name: string;
  schools: School[];
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
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [groupName, setGroupName] = useState('');
  const [selectedSchools, setSelectedSchools] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  // Update mode state
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [schoolsToAdd, setSchoolsToAdd] = useState<string[]>([]);
  const [schoolsToRemove, setSchoolsToRemove] = useState<string[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);

  // Fetch existing groups when switching to update mode
  useEffect(() => {
    if (mode === 'update' && groups.length === 0) {
      fetchGroups();
    }
  }, [mode]);

  const fetchGroups = async () => {
    setIsLoadingGroups(true);
    try {
      const response = await fetch('/api/admin/school-groups');
      const data = await response.json();
      
      if (response.ok) {
        setGroups(data.groups || []);
      } else {
        setError('Failed to load groups');
      }
    } catch (err) {
      setError('Failed to load groups');
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const toggleSchool = (schoolId: string) => {
    setSelectedSchools(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const toggleSchoolToAdd = (schoolId: string) => {
    setSchoolsToAdd(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const toggleSchoolToRemove = (schoolId: string) => {
    setSchoolsToRemove(prev => 
      prev.includes(schoolId)
        ? prev.filter(id => id !== schoolId)
        : [...prev, schoolId]
    );
  };

  const selectedGroup = groups.find(g => g.id === selectedGroupId);

  const totalStudents = selectedSchools.reduce((sum, schoolId) => {
    const school = availableSchools.find(s => s.id === schoolId);
    return sum + (school?.studentCounts?.registered || 0);
  }, 0);

  const handleCreateGroup = async () => {
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

  const handleUpdateGroup = async () => {
    if (!selectedGroupId) {
      setError('Please select a group');
      return;
    }

    if (schoolsToAdd.length === 0 && schoolsToRemove.length === 0) {
      setError('No changes to save');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/school-groups', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: selectedGroupId,
          schoolIdsToAdd: schoolsToAdd.length > 0 ? schoolsToAdd : undefined,
          schoolIdsToRemove: schoolsToRemove.length > 0 ? schoolsToRemove : undefined
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update group');
      }

      if (data.dissolved) {
        alert(data.message);
      }

      onGroupCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update group');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = () => {
    if (mode === 'create') {
      handleCreateGroup();
    } else {
      handleUpdateGroup();
    }
  };

  const switchMode = (newMode: 'create' | 'update') => {
    setMode(newMode);
    setError('');
    setGroupName('');
    setSelectedSchools([]);
    setSelectedGroupId('');
    setSchoolsToAdd([]);
    setSchoolsToRemove([]);
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
        width: '700px', 
        height: '80vh',
        display: 'flex',
        flexDirection: 'column',
        padding: 0,
        overflow: 'hidden'
      }}>
        {/* Header - Fixed */}
        <div style={{ padding: '24px 24px 0 24px', flexShrink: 0 }}>
          <h2 className="text-teacher-name" style={{ 
            fontSize: '18px', 
            marginBottom: '20px' 
          }}>
            {mode === 'create' ? 'Create School Group' : 'Update Existing Group'}
          </h2>

          {/* Mode Toggle */}
          <div style={{ 
            marginBottom: '20px',
            display: 'flex',
            gap: '12px'
          }}>
            <button
              onClick={() => switchMode('create')}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: mode === 'create' ? '#007bff' : '#f8f9fa',
                color: mode === 'create' ? 'white' : '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'create' ? '500' : '300'
              }}
            >
              Create New Group
            </button>
            <button
              onClick={() => switchMode('update')}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '10px',
                backgroundColor: mode === 'update' ? '#007bff' : '#f8f9fa',
                color: mode === 'update' ? 'white' : '#495057',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: mode === 'update' ? '500' : '300'
              }}
            >
              Update Existing Group
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div style={{ 
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px',
          marginBottom: '20px'
        }}>
          {/* CREATE MODE */}
          {mode === 'create' && (
            <>
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
                  {availableSchools.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                      No schools available for grouping
                    </div>
                  ) : (
                    availableSchools.map(school => (
                      <label
                        key={school.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '12px',
                          borderBottom: '1px solid #f8f9fa',
                          cursor: school.hasPenPals ? 'not-allowed' : 'pointer',
                          backgroundColor: selectedSchools.includes(school.id) 
                            ? '#f8f9fa' 
                            : 'transparent',
                          opacity: school.hasPenPals ? 0.5 : 1
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSchools.includes(school.id)}
                          onChange={() => toggleSchool(school.id)}
                          disabled={school.hasPenPals}
                          style={{ marginRight: '12px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div className="text-school-name" style={{ fontSize: '14px' }}>
                            {school.schoolName}
                            {school.hasPenPals && (
                              <span style={{ 
                                fontSize: '11px', 
                                color: '#dc3545',
                                marginLeft: '8px'
                              }}>
                                (Has pen pals - cannot group)
                              </span>
                            )}
                          </div>
                          <div className="text-meta-info" style={{ fontSize: '12px' }}>
                            {school.teacherName} • {school.teacherEmail}
                          </div>
                        </div>
                        <div className="text-data-value" style={{ fontSize: '14px' }}>
                          {school.studentCounts?.registered || 0} students
                        </div>
                      </label>
                    ))
                  )}
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
            </>
          )}

          {/* UPDATE MODE */}
          {mode === 'update' && (
            <>
              {isLoadingGroups ? (
                <div style={{ padding: '40px', textAlign: 'center' }}>
                  <div className="loading" style={{ margin: '0 auto' }}></div>
                  <p style={{ marginTop: '12px', color: '#6c757d' }}>Loading groups...</p>
                </div>
              ) : groups.length === 0 ? (
                <div style={{ 
                  padding: '40px', 
                  textAlign: 'center',
                  color: '#6c757d'
                }}>
                  No groups exist yet. Create a group first.
                </div>
              ) : (
                <>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '13px', 
                      fontWeight: '300',
                      color: '#495057',
                      marginBottom: '8px'
                    }}>
                      Select Group to Update
                    </label>
                    
                    <div style={{ 
                      border: '1px solid #dee2e6', 
                      borderRadius: '4px',
                      maxHeight: '150px',
                      overflow: 'auto'
                    }}>
                      {groups.map(group => {
                        const hasLockedSchools = group.schools.some(s => s.hasPenPals);
                        return (
                          <label
                            key={group.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              padding: '12px',
                              borderBottom: '1px solid #f8f9fa',
                              cursor: hasLockedSchools ? 'not-allowed' : 'pointer',
                              backgroundColor: selectedGroupId === group.id 
                                ? '#f8f9fa' 
                                : 'transparent',
                              opacity: hasLockedSchools ? 0.5 : 1
                            }}
                          >
                            <input
                              type="radio"
                              checked={selectedGroupId === group.id}
                              onChange={() => {
                                setSelectedGroupId(group.id);
                                setSchoolsToAdd([]);
                                setSchoolsToRemove([]);
                              }}
                              disabled={hasLockedSchools}
                              style={{ marginRight: '12px' }}
                            />
                            <div style={{ flex: 1 }}>
                              <div className="text-school-name" style={{ fontSize: '14px' }}>
                                {group.name}
                                {hasLockedSchools && (
                                  <span style={{ 
                                    fontSize: '11px', 
                                    color: '#dc3545',
                                    marginLeft: '8px'
                                  }}>
                                    (Locked - has pen pals)
                                  </span>
                                )}
                              </div>
                              <div className="text-meta-info" style={{ fontSize: '12px' }}>
                                {group.schools.length} schools
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {selectedGroup && (
                    <>
                      {/* Current schools in group */}
                      <div style={{ marginBottom: '20px' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '13px', 
                          fontWeight: '300',
                          color: '#495057',
                          marginBottom: '8px'
                        }}>
                          Schools Currently in Group
                        </label>
                        
                        <div style={{ 
                          border: '1px solid #dee2e6', 
                          borderRadius: '4px',
                          maxHeight: '150px',
                          overflow: 'auto'
                        }}>
                          {selectedGroup.schools.map(school => {
                            const isMarkedForRemoval = schoolsToRemove.includes(school.id);
                            return (
                              <div
                                key={school.id}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  padding: '12px',
                                  borderBottom: '1px solid #f8f9fa',
                                  backgroundColor: isMarkedForRemoval ? '#fff3cd' : 'transparent'
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={isMarkedForRemoval}
                                  onChange={() => toggleSchoolToRemove(school.id)}
                                  disabled={school.hasPenPals}
                                  style={{ marginRight: '12px' }}
                                />
                                <div style={{ flex: 1 }}>
                                  <div className="text-school-name" style={{ fontSize: '14px' }}>
                                    {school.schoolName}
                                    {school.hasPenPals && (
                                      <span style={{ 
                                        fontSize: '11px', 
                                        color: '#dc3545',
                                        marginLeft: '8px'
                                      }}>
                                        (Has pen pals - cannot remove)
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-meta-info" style={{ fontSize: '12px' }}>
                                    {school.teacherName}
                                  </div>
                                </div>
                                {isMarkedForRemoval && (
                                  <span style={{ fontSize: '12px', color: '#856404' }}>
                                    Will be removed
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Available schools to add */}
                      {availableSchools.length > 0 && (
                        <div style={{ marginBottom: '20px' }}>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '13px', 
                            fontWeight: '300',
                            color: '#495057',
                            marginBottom: '8px'
                          }}>
                            Available Schools to Add
                          </label>
                          
                          <div style={{ 
                            border: '1px solid #dee2e6', 
                            borderRadius: '4px',
                            maxHeight: '150px',
                            overflow: 'auto'
                          }}>
                            {availableSchools.map(school => {
                              const isMarkedForAdd = schoolsToAdd.includes(school.id);
                              return (
                                <div
                                  key={school.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '12px',
                                    borderBottom: '1px solid #f8f9fa',
                                    cursor: school.hasPenPals ? 'not-allowed' : 'pointer',
                                    backgroundColor: isMarkedForAdd ? '#d1ecf1' : 'transparent',
                                    opacity: school.hasPenPals ? 0.5 : 1
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isMarkedForAdd}
                                    onChange={() => toggleSchoolToAdd(school.id)}
                                    disabled={school.hasPenPals}
                                    style={{ marginRight: '12px' }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    <div className="text-school-name" style={{ fontSize: '14px' }}>
                                      {school.schoolName}
                                      {school.hasPenPals && (
                                        <span style={{ 
                                          fontSize: '11px', 
                                          color: '#dc3545',
                                          marginLeft: '8px'
                                        }}>
                                          (Has pen pals - cannot add)
                                        </span>
                                      )}
                                    </div>
                                    <div className="text-meta-info" style={{ fontSize: '12px' }}>
                                      {school.teacherName}
                                    </div>
                                  </div>
                                  {isMarkedForAdd && (
                                    <span style={{ fontSize: '12px', color: '#0c5460' }}>
                                      Will be added
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </>
              )}
            </>
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
        </div>

        {/* Footer Buttons - Fixed */}
        <div style={{ 
          padding: '0 24px 24px 24px',
          borderTop: '1px solid #dee2e6',
          paddingTop: '20px',
          flexShrink: 0,
          backgroundColor: 'white'
        }}>
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
              disabled={
                isSubmitting || 
                (mode === 'create' && (selectedSchools.length < 2 || !groupName.trim())) ||
                (mode === 'update' && (!selectedGroupId || (schoolsToAdd.length === 0 && schoolsToRemove.length === 0)))
              }
              className="btn btn-primary"
              style={{
                padding: '8px 16px',
                opacity: (
                  isSubmitting || 
                  (mode === 'create' && (selectedSchools.length < 2 || !groupName.trim())) ||
                  (mode === 'update' && (!selectedGroupId || (schoolsToAdd.length === 0 && schoolsToRemove.length === 0)))
                ) ? 0.6 : 1,
                cursor: (
                  isSubmitting || 
                  (mode === 'create' && (selectedSchools.length < 2 || !groupName.trim())) ||
                  (mode === 'update' && (!selectedGroupId || (schoolsToAdd.length === 0 && schoolsToRemove.length === 0)))
                ) ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Group' : 'Update Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
