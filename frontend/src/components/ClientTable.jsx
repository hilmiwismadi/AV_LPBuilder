import { format } from 'date-fns';

const ClientTable = ({ clients, onOpenChat, onEdit, onDelete, onViewDetail }) => {
  const formatDate = (date) => {
    if (!date) return '-';
    return format(new Date(date), 'dd/MM/yyyy');
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'TODO':
        return 'todo';
      case 'FOLLOW_UP':
        return 'follow-up';
      case 'NEXT_YEAR':
        return 'next-year';
      case 'GHOSTED_FOLLOW_UP':
        return 'ghosted-follow-up';
      default:
        return 'todo';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            <th>Event Organizer</th>
            <th>CP 1st</th>
            <th>CP 2nd</th>
            <th>IG Link</th>
            <th>Last Event</th>
            <th>Last Contact</th>
            <th>Status</th>
            <th>PIC</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.length === 0 ? (
            <tr>
              <td colSpan="9" style={{ textAlign: 'center', padding: '40px' }}>
                No clients yet. Add your first client!
              </td>
            </tr>
          ) : (
            clients.map((client) => (
              <tr key={client.id}>
                <td><strong>{client.eventOrganizer}</strong></td>
                <td>{client.cp1st || '-'}</td>
                <td>{client.cp2nd || '-'}</td>
                <td>
                  {client.igLink ? (
                    <a href={client.igLink} target="_blank" rel="noopener noreferrer">
                      View
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td>{client.lastEvent || '-'}</td>
                <td>{formatDate(client.lastContact)}</td>
                <td>
                  <span className={`status-badge ${getStatusBadgeClass(client.status)}`}>
                    {formatStatus(client.status)}
                  </span>
                </td>
                <td>{client.pic || '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      className="info"
                      onClick={() => onViewDetail(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Detail
                    </button>
                    <button
                      className="primary"
                      onClick={() => onOpenChat(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Chat
                    </button>
                    <button
                      className="secondary"
                      onClick={() => onEdit(client)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Edit
                    </button>
                    <button
                      className="danger"
                      onClick={() => onDelete(client.id)}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ClientTable;
