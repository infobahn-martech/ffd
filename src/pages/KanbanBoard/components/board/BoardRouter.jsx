import { useParams } from 'react-router-dom';
import KanbanBoard from '../../index';
import DADeskBoard from '../../../DADeskBoard';

// Router component that determines which board to render based on ID
export default function BoardRouter() {
  const { id } = useParams();

  // Centralized DA DESK board has id 1 - render DADeskBoard
  if (id === '1') {
    return <DADeskBoard />;
  }

  // For other board IDs or no ID, render default KanbanBoard
  return <KanbanBoard />;
}
