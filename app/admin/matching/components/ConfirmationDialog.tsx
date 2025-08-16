// app/admin/matching/components/ConfirmationDialog.tsx
"use client";

import { School } from '../types';

interface ConfirmationDialogProps {
  pinnedSchool: School;
  selectedMatch: School;
  showWarning: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationDialog({
  pinnedSchool,
  selectedMatch,
  showWarning,
  onConfirm,
  onCancel
}: ConfirmationDialogProps) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Confirm School Match
        </h3>
        
        {showWarning && (
          <div style={{
            backgroundColor: '#fff3cd',
            border: '1px solid #ffeaa7',
            borderRadius: '4px',
            padding: '10px',
            marginBottom: '15px',
            color: '#856404'
          }}>
            ⚠️ Warning: Both schools are in the same region ({pinnedSchool.region}). 
            Cross-regional matches are preferred for this program.
          </div>
        )}
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            marginBottom: '15px', 
            padding: '10px', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px' 
          }}>
            <strong>{pinnedSchool.schoolName}</strong><br />
            <span style={{ fontSize: '14px', color: '#666' }}>
              {pinn
