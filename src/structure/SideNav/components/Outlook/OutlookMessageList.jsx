import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { FiSearch, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import OutlookMessageListItem from './OutlookMessageListItem';

const OutlookMessageList = ({
  messages,
  isLoading,
  isLoadingMore,
  hasMore,
  error,
  selectedMessageId,
  searchQuery,
  onSearchChange,
  onSelectMessage,
  onRefresh,
  onLoadMore,
}) => {
  const [searchInput, setSearchInput] = useState(searchQuery);

  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput.trim() !== searchQuery) {
        onSearchChange(searchInput.trim());
      }
    }, 400);
    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  return (
    <div className="outlook-message-list">
      <div className="outlook-message-list-toolbar">
        <div className="outlook-message-list-search">
          <FiSearch size={14} aria-hidden />
          <input
            type="search"
            placeholder="Search mail"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            aria-label="Search mail"
          />
        </div>
        <button
          type="button"
          className="outlook-message-list-refresh"
          onClick={onRefresh}
          aria-label="Refresh"
          disabled={isLoading}
        >
          <FiRefreshCw size={16} className={isLoading ? 'outlook-spin' : ''} aria-hidden />
        </button>
      </div>

      <div className="outlook-message-list-scroll">
        {error && (
          <div className="outlook-message-list-error" role="alert">
            <FiAlertCircle size={16} aria-hidden />
            <span>{error}</span>
            <button type="button" onClick={onRefresh}>
              Retry
            </button>
          </div>
        )}

        {!error && isLoading && messages.length === 0 && (
          <div className="outlook-message-list-loading">Loading messages…</div>
        )}

        {!error && !isLoading && messages.length === 0 && (
          <div className="outlook-message-list-empty">No messages found</div>
        )}

        {messages.map((message) => (
          <OutlookMessageListItem
            key={message.id}
            message={message}
            isActive={message.id === selectedMessageId}
            onSelect={onSelectMessage}
          />
        ))}

        {hasMore && (
          <button
            type="button"
            className="outlook-message-list-load-more"
            onClick={onLoadMore}
            disabled={isLoadingMore}
          >
            {isLoadingMore ? 'Loading…' : 'Load more'}
          </button>
        )}
      </div>
    </div>
  );
};

OutlookMessageList.propTypes = {
  messages: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  isLoadingMore: PropTypes.bool.isRequired,
  hasMore: PropTypes.bool.isRequired,
  error: PropTypes.string,
  selectedMessageId: PropTypes.string,
  searchQuery: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
  onSelectMessage: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onLoadMore: PropTypes.func.isRequired,
};

OutlookMessageList.defaultProps = {
  error: null,
  selectedMessageId: null,
};

export default OutlookMessageList;
