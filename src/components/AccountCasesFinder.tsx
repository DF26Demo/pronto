import React, { useState, useEffect } from 'react';

// Arr, here be the shape of our treasure — a Case object!
interface Case {
  id: string;
  caseNumber: string;
  subject: string;
  status: 'Open' | 'Closed' | 'Pending' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdDate: string;
  lastModifiedDate: string;
  description?: string;
}

interface AccountCasesFinderProps {
  accountId: string;
  accountName?: string;
  // Blimey! Pass yer own API function if ye have one, otherwise we'll use the default
  fetchCases?: (accountId: string) => Promise<Case[]>;
}

export const AccountCasesFinder: React.FC<AccountCasesFinderProps> = ({
  accountId,
  accountName,
  fetchCases,
}) => {
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [priorityFilter, setPriorityFilter] = useState<string>('All');

  // Hoist the sails and fetch those cases from the seven seas!
  useEffect(() => {
    const loadCases = async () => {
      try {
        setLoading(true);
        setError(null);

        // If no custom fetch function be provided, use our default plunder method
        const fetchFunction = fetchCases || defaultFetchCases;
        const data = await fetchFunction(accountId);
        
        setCases(data);
        setFilteredCases(data);
      } catch (err) {
        // Shiver me timbers! Something went wrong on the high seas
        setError(err instanceof Error ? err.message : 'Failed to load cases, matey!');
      } finally {
        setLoading(false);
      }
    };

    if (accountId) {
      loadCases();
    }
  }, [accountId, fetchCases]);

  // Filter the bounty based on search term and filters
  useEffect(() => {
    let filtered = [...cases];

    // Search through the cargo hold for matching cases
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status, unless "All" be selected
    if (statusFilter !== 'All') {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }

    // Filter by priority, lest we miss the urgent treasure
    if (priorityFilter !== 'All') {
      filtered = filtered.filter((c) => c.priority === priorityFilter);
    }

    setFilteredCases(filtered);
  }, [searchTerm, statusFilter, priorityFilter, cases]);

  // Arr, this be a default fetch function fer demonstration purposes
  const defaultFetchCases = async (accId: string): Promise<Case[]> => {
    // Replace this with yer actual API call, ye landlubber!
    const response = await fetch(`/api/accounts/${accId}/cases`);
    if (!response.ok) throw new Error('Failed to fetch cases from the depths!');
    return response.json();
  };

  if (loading) {
    return <div className="loading">🏴‍☠️ Searching the seven seas fer cases...</div>;
  }

  if (error) {
    return <div className="error">⚠️ Blimey! {error}</div>;
  }

  return (
    <div className="account-cases-finder">
      <h2>Cases for {accountName || `Account ${accountId}`}</h2>
      
      {/* Here be the search and filter controls */}
      <div className="controls">
        <input
          type="text"
          placeholder="Search cases by number, subject, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="All">All Statuses</option>
          <option value="Open">Open</option>
          <option value="Closed">Closed</option>
          <option value="Pending">Pending</option>
          <option value="Escalated">Escalated</option>
        </select>

        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Critical">Critical</option>
        </select>
      </div>

      {/* Display the plundered cases! */}
      <div className="cases-list">
        {filteredCases.length === 0 ? (
          <p>No cases found in Davy Jones' locker, matey!</p>
        ) : (
          filteredCases.map((case_) => (
            <div key={case_.id} className={`case-card priority-${case_.priority.toLowerCase()}`}>
              <h3>{case_.caseNumber}: {case_.subject}</h3>
              <div className="case-meta">
                <span className={`status status-${case_.status.toLowerCase()}`}>{case_.status}</span>
                <span className={`priority priority-${case_.priority.toLowerCase()}`}>{case_.priority}</span>
                <span>Created: {new Date(case_.createdDate).toLocaleDateString()}</span>
              </div>
              {case_.description && <p className="case-description">{case_.description}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
};