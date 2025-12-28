import { useState, useEffect } from 'react';

const ClientForm = ({ client, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    eventOrganizer: '',
    phoneNumber: '',
    igLink: '',
    cp1st: '',
    cp2nd: '',
    imgLogo: '',
    imgPoster: '',
    lastEvent: '',
    linkDemo: '',
    lastSystem: '',
    colorPalette: '',
    dateEstimation: '',
    igeventLink: '',
    pic: '',
    status: 'TODO',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        ...client,
        dateEstimation: client.dateEstimation
          ? new Date(client.dateEstimation).toISOString().split('T')[0]
          : '',
      });
    }
  }, [client]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSubmit = {
      ...formData,
      dateEstimation: formData.dateEstimation
        ? new Date(formData.dateEstimation).toISOString()
        : null,
    };
    onSave(dataToSubmit);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{client ? 'Edit Client' : 'Add New Client'}</h2>
          <button className="close-button" onClick={onCancel}>
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Event Organizer *</label>
              <input
                type="text"
                name="eventOrganizer"
                value={formData.eventOrganizer}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                placeholder="e.g., 081234567890"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>CP 1st Hand</label>
              <input
                type="text"
                name="cp1st"
                value={formData.cp1st}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>CP 2nd Hand</label>
              <input
                type="text"
                name="cp2nd"
                value={formData.cp2nd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Instagram Link</label>
              <input
                type="url"
                name="igLink"
                value={formData.igLink}
                onChange={handleChange}
                placeholder="https://instagram.com/..."
              />
            </div>

            <div className="form-group">
              <label>IG Event Link</label>
              <input
                type="url"
                name="igeventLink"
                value={formData.igeventLink}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Last Event</label>
              <input
                type="text"
                name="lastEvent"
                value={formData.lastEvent}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Last System Used</label>
              <input
                type="text"
                name="lastSystem"
                value={formData.lastSystem}
                onChange={handleChange}
                placeholder="e.g., Forms/WhatsApp/Partner"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Demo Link</label>
              <input
                type="url"
                name="linkDemo"
                value={formData.linkDemo}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>Color Palette</label>
              <input
                type="text"
                name="colorPalette"
                value={formData.colorPalette}
                onChange={handleChange}
                placeholder="e.g., #FF0000, Blue"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date Estimation</label>
              <input
                type="date"
                name="dateEstimation"
                value={formData.dateEstimation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label>PIC</label>
              <input
                type="text"
                name="pic"
                value={formData.pic}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="TODO">To Do</option>
              <option value="FOLLOW_UP">Follow Up</option>
              <option value="NEXT_YEAR">Next Year</option>
              <option value="GHOSTED_FOLLOW_UP">Ghosted Follow Up</option>
            </select>
          </div>

          <div className="button-group">
            <button type="button" className="secondary" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit" className="primary">
              {client ? 'Update' : 'Add'} Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;
