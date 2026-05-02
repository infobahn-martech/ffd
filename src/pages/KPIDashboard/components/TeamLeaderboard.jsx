import React, { useState, useMemo } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import YellowColorIcon from '../../../assets/images/YellowColorIcon.png';
import BlueColorIcon from '../../../assets/images/BlueColorIcon.png';
import VoilentColorIcon from '../../../assets/images/VoilentColorIcon.png';
import GreenColorIcon from '../../../assets/images/GreenColorIcon.png';
import PurpleColorIcon from '../../../assets/images/PurpleColorIcon.png';
import './TeamLeaderboard.scss';
import PremiumSelect from '../../../components/form/PremiumSelect';

const TeamLeaderboard = () => {
  // Sample data - replace with API data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Tariq Abdulaziz',
      level: 4,
      points: 4520,
      completion: 60,
      icon: PurpleColorIcon,
    },
    {
      id: 2,
      name: 'Layla Hassan',
      level: 2,
      points: 2100,
      completion: 10,
      icon: GreenColorIcon,
    },
    {
      id: 3,
      name: 'Arjun Mehta',
      level: 3,
      points: 3572,
      completion: 52,
      icon: YellowColorIcon,
    },
    {
      id: 4,
      name: 'Priya Nair',
      level: 1,
      points: 1680,
      completion: 65,
      icon: BlueColorIcon,
    },
    {
      id: 5,
      name: 'Noor Al-Faisal',
      level: 5,
      points: 5867,
      completion: 25,
      icon: VoilentColorIcon,
    },
    {
      id: 6,
      name: 'Yusuf Al-Hassan',
      level: 3,
      points: 3286,
      completion: 40,
      icon: YellowColorIcon,
    },
    {
      id: 7,
      name: 'Sarah Johnson',
      level: 4,
      points: 4120,
      completion: 75,
      icon: PurpleColorIcon,
    },
    {
      id: 8,
      name: 'Ahmed Al-Mansoori',
      level: 2,
      points: 1950,
      completion: 30,
      icon: GreenColorIcon,
    },
  ]);

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('All');
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Level options
  const levelOptions = ['All', '1', '2', '3', '4', '5'];

  // Filtered and sorted team members
  const filteredAndSortedMembers = useMemo(() => {
    let filtered = teamMembers.filter((member) => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLevel = levelFilter === 'All' || member.level.toString() === levelFilter;
      return matchesSearch && matchesLevel;
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let aValue, bValue;

        switch (sortField) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'level':
            aValue = a.level;
            bValue = b.level;
            break;
          case 'points':
            aValue = a.points;
            bValue = b.points;
            break;
          case 'completion':
            aValue = a.completion;
            bValue = b.completion;
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
  }, [teamMembers, searchTerm, levelFilter, sortField, sortDirection]);

  // Handle sorting
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <FiChevronUp /> : <FiChevronDown />;
  };

  return (
    <div className="team-leaderboard">
      <div className="team-leaderboard__header">
        <h2 className="team-leaderboard__title">Team Leaderboard</h2>
        <p className="team-leaderboard__subtitle">View and track your team's performance and achievements</p>
      </div>

      {/* Filters Section */}
      <div className="team-leaderboard__filters">
        <div className="team-leaderboard__search">
          <FiSearch className="team-leaderboard__search-icon" />
          <input
            type="text"
            placeholder="Search team members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="team-leaderboard__search-input"
          />
        </div>

        <div className="team-leaderboard__filter-controls">
          <button
            className={`team-leaderboard__filter-toggle ${showFilters ? 'team-leaderboard__filter-toggle--active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter />
            <span>Filters</span>
          </button>

          {showFilters && (
            <div className="team-leaderboard__filter-dropdown">
              <div className="team-leaderboard__filter-group">
                <label className="team-leaderboard__filter-label">Level</label>
                <PremiumSelect
                  value={levelFilter}
                  onChange={(e) => setLevelFilter(e.target.value)}
                  options={levelOptions.map((option) => ({
                    value: option,
                    label: option === 'All' ? 'All Levels' : `Level ${option}`,
                  }))}
                  placeholder="Filter by level"
                  searchPlaceholder="Search level..."
                  className="team-leaderboard__filter-premium-select"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="team-leaderboard__table-wrapper">
        <table className="team-leaderboard-table">
          <thead>
            <tr>
              <th
                className="team-leaderboard-table__header team-leaderboard-table__header--sortable"
                onClick={() => handleSort('name')}
              >
                <div className="team-leaderboard-table__header-content">
                  Name
                  {getSortIcon('name')}
                </div>
              </th>
              <th
                className="team-leaderboard-table__header team-leaderboard-table__header--sortable"
                onClick={() => handleSort('level')}
              >
                <div className="team-leaderboard-table__header-content">
                  Level
                  {getSortIcon('level')}
                </div>
              </th>
              <th
                className="team-leaderboard-table__header team-leaderboard-table__header--sortable"
                onClick={() => handleSort('points')}
              >
                <div className="team-leaderboard-table__header-content">
                  Points
                  {getSortIcon('points')}
                </div>
              </th>
              <th
                className="team-leaderboard-table__header team-leaderboard-table__header--sortable"
                onClick={() => handleSort('completion')}
              >
                <div className="team-leaderboard-table__header-content">
                  Current Level Completion
                  {getSortIcon('completion')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedMembers.length === 0 ? (
              <tr>
                <td colSpan="4" className="team-leaderboard-table__empty">
                  No team members found
                </td>
              </tr>
            ) : (
              filteredAndSortedMembers.map((member) => (
                <tr key={member.id} className="team-leaderboard-table__row">
                  <td className="team-leaderboard-table__cell team-leaderboard-table__cell--name">
                    {member.name}
                  </td>
                  <td className="team-leaderboard-table__cell">
                    <div className="team-leaderboard-table__level-content">
                      <img
                        src={member.icon}
                        alt={`Level ${member.level}`}
                        className="team-leaderboard-table__level-icon"
                      />
                      <span>Level {member.level}</span>
                    </div>
                  </td>
                  <td className="team-leaderboard-table__cell">
                    {member.points.toLocaleString()} Points
                  </td>
                  <td className="team-leaderboard-table__cell">
                    <div className="team-leaderboard-table__completion">
                      <div className="team-leaderboard-table__progress-bar">
                        <div
                          className="team-leaderboard-table__progress-fill"
                          style={{ width: `${member.completion}%` }}
                        ></div>
                      </div>
                      <span className="team-leaderboard-table__completion-text">{member.completion}%</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="team-leaderboard__summary">
        <span className="team-leaderboard__summary-text">
          Showing {filteredAndSortedMembers.length} of {teamMembers.length} team members
        </span>
      </div>
    </div>
  );
};

export default TeamLeaderboard;
