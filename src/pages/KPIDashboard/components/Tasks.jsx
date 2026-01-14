import React, { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import './Tasks.scss';

const Tasks = () => {
  // Sample data - replace with API data
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Port Clearance Documentation',
      estimatedTime: '4h 30m',
      estimatedMinutes: 270,
      timeSpent: '3h 15m',
      spentMinutes: 195,
      remainingTime: '1h 15m',
      remainingMinutes: 75,
      status: 'In Progress',
      totalPoints: 4520,
      earnedPoints: 3390,
      balancePoints: 1130,
    },
    {
      id: 2,
      name: 'Vessel Arrival Report',
      estimatedTime: '2h 00m',
      estimatedMinutes: 120,
      timeSpent: '2h 00m',
      spentMinutes: 120,
      remainingTime: '0h 00m',
      remainingMinutes: 0,
      status: 'Completed',
      totalPoints: 3200,
      earnedPoints: 3200,
      balancePoints: 0,
    },
    {
      id: 3,
      name: 'Customs Declaration',
      estimatedTime: '6h 00m',
      estimatedMinutes: 360,
      timeSpent: '4h 45m',
      spentMinutes: 285,
      remainingTime: '1h 15m',
      remainingMinutes: 75,
      status: 'In Progress',
      totalPoints: 7850,
      earnedPoints: 5888,
      balancePoints: 1962,
    },
    {
      id: 4,
      name: 'Crew Medical Check',
      estimatedTime: '3h 30m',
      estimatedMinutes: 210,
      timeSpent: '1h 20m',
      spentMinutes: 80,
      remainingTime: '2h 10m',
      remainingMinutes: 130,
      status: 'Pending',
      totalPoints: 2150,
      earnedPoints: 0,
      balancePoints: 2150,
    },
    {
      id: 5,
      name: 'Transport Arrangement',
      estimatedTime: '2h 15m',
      estimatedMinutes: 135,
      timeSpent: '2h 15m',
      spentMinutes: 135,
      remainingTime: '0h 00m',
      remainingMinutes: 0,
      status: 'Completed',
      totalPoints: 1890,
      earnedPoints: 1890,
      balancePoints: 0,
    },
    {
      id: 6,
      name: 'Hotel Booking',
      estimatedTime: '1h 30m',
      estimatedMinutes: 90,
      timeSpent: '0h 00m',
      spentMinutes: 0,
      remainingTime: '1h 30m',
      remainingMinutes: 90,
      status: 'Pending',
      totalPoints: 950,
      earnedPoints: 0,
      balancePoints: 950,
    },
    {
      id: 7,
      name: 'Warehouse Inventory',
      estimatedTime: '5h 00m',
      estimatedMinutes: 300,
      timeSpent: '3h 00m',
      spentMinutes: 180,
      remainingTime: '2h 00m',
      remainingMinutes: 120,
      status: 'In Progress',
      totalPoints: 6230,
      earnedPoints: 3738,
      balancePoints: 2492,
    },
    {
      id: 8,
      name: 'Launch Hire Coordination',
      estimatedTime: '2h 45m',
      estimatedMinutes: 165,
      timeSpent: '2h 45m',
      spentMinutes: 165,
      remainingTime: '0h 00m',
      remainingMinutes: 0,
      status: 'Completed',
      totalPoints: 3450,
      earnedPoints: 3450,
      balancePoints: 0,
    },
  ]);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Status options
  const statusOptions = ['All', 'Pending', 'In Progress', 'Completed'];

  // Filtered and sorted tasks
  const filteredAndSortedTasks = useMemo(() => {
    let filtered = tasks.filter((task) => {
      const matchesSearch = task.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'estimatedTime':
            aValue = a.estimatedMinutes;
            bValue = b.estimatedMinutes;
            break;
          case 'timeSpent':
            aValue = a.spentMinutes;
            bValue = b.spentMinutes;
            break;
          case 'remainingTime':
            aValue = a.remainingMinutes;
            bValue = b.remainingMinutes;
            break;
          case 'status':
            aValue = a.status;
            bValue = b.status;
            break;
          case 'points':
            aValue = a.points || 0;
            bValue = b.points || 0;
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [tasks, searchTerm, statusFilter, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get status badge class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed':
        return 'tasks-table__status--completed';
      case 'In Progress':
        return 'tasks-table__status--in-progress';
      case 'Pending':
        return 'tasks-table__status--pending';
      default:
        return '';
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  // Format points with commas
  const formatPoints = (points) => {
    return (points || 0).toLocaleString('en-US');
  };

  return (
    <div className="tasks">
      <div className="tasks__header">
        <h2 className="tasks__title">Task Management</h2>
        <p className="tasks__subtitle">View, filter, and manage all your assigned tasks</p>
      </div>

      {/* Filters Section */}
      <div className="tasks__filters">
        <div className="tasks__search">
          <FiSearch className="tasks__search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="tasks__search-input"
          />
        </div>

        <div className="tasks__filter-controls">
          <button
            className={`tasks__filter-toggle ${showFilters ? 'tasks__filter-toggle--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="tasks__filter-dropdown">
              <div className="tasks__filter-group">
                <label className="tasks__filter-label">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="tasks__filter-select"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="tasks__table-wrapper">
        <table className="tasks-table">
          <thead>
            <tr>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('name')}
              >
                <div className="tasks-table__header-content">
                  Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('estimatedTime')}
              >
                <div className="tasks-table__header-content">
                  Estimated Time
                  {getSortIcon('estimatedTime')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('timeSpent')}
              >
                <div className="tasks-table__header-content">
                  Time Spent
                  {getSortIcon('timeSpent')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('remainingTime')}
              >
                <div className="tasks-table__header-content">
                  Remaining Time
                  {getSortIcon('remainingTime')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('status')}
              >
                <div className="tasks-table__header-content">
                  Status
                  {getSortIcon('status')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('totalPoints')}
              >
                <div className="tasks-table__header-content">
                  Total Points
                  {getSortIcon('totalPoints')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('earnedPoints')}
              >
                <div className="tasks-table__header-content">
                  Earned Points
                  {getSortIcon('earnedPoints')}
                </div>
              </th>
              <th
                className="tasks-table__header tasks-table__header--sortable"
                onClick={() => handleSort('balancePoints')}
              >
                <div className="tasks-table__header-content">
                  Balance Points
                  {getSortIcon('balancePoints')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedTasks.length === 0 ? (
              <tr>
                <td colSpan="8" className="tasks-table__empty">
                  No tasks found
                </td>
              </tr>
            ) : (
              filteredAndSortedTasks.map((task) => (
                <tr key={task.id} className="tasks-table__row">
                  <td className="tasks-table__cell tasks-table__cell--name">
                    {task.name}
                  </td>
                  <td className="tasks-table__cell">{task.estimatedTime}</td>
                  <td className="tasks-table__cell">{task.timeSpent}</td>
                  <td className="tasks-table__cell">{task.remainingTime}</td>
                  <td className="tasks-table__cell">
                    <span className={`tasks-table__status ${getStatusClass(task.status)}`}>
                      {task.status}
                    </span>
                  </td>
                  <td className="tasks-table__cell">{formatPoints(task.totalPoints)}</td>
                  <td className="tasks-table__cell">{formatPoints(task.earnedPoints)}</td>
                  <td className="tasks-table__cell">{formatPoints(task.balancePoints)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="tasks__summary">
        <span className="tasks__summary-text">
          Showing {filteredAndSortedTasks.length} of {tasks.length} tasks
        </span>
      </div>
    </div>
  );
};

export default Tasks;
