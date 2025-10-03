export default function SchoolCard({ 
  school, 
  isPinned = false, 
  showMatchIcon = false, 
  showActions = true,
  onPin, 
  onMatch,
  onUpdate
}: SchoolCardProps) {
  const [copyButtonText, setCopyButtonText] = useState('Copy URL');
  const [emailCopyText, setEmailCopyText] = useState('✉');
  const [showUnmatchModal, setShowUnmatchModal] = useState(false);
  const [isUnmatching, setIsUnmatching] = useState(false);

  // Check if this school is part of a group
  const isGrouped = school.schoolGroupId && school.schoolGroup;

  const getDashboardUrl = () => {
    const adminDashboardPath = `/admin/school-dashboard?schoolId=${school.id}`;
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin;
      return `${currentOrigin}${adminDashboardPath}`;
    }
    return adminDashboardPath;
  };

  const openDashboard = () => {
    if (isGrouped) {
      // TODO: Open group dashboard view (side-by-side schools)
      // For now, do nothing
      return;
    }
    const url = getDashboardUrl();
    window.open(url, '_blank');
  };

  const copyDashboardUrl = async () => {
    if (isGrouped) {
      // Disabled for grouped schools (no single URL)
      return;
    }
    const url = getDashboardUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopyButtonText('Copied');
      setTimeout(() => setCopyButtonText('Copy URL'), 2000);
    } catch (err) {
      console.error('Failed to copy URL:', err);
      prompt('Copy this URL:', url);
    }
  };
