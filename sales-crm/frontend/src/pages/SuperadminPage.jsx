import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';

const SuperadminPage = () => {
  const [activeTab, setActiveTab] = useState('create');
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [createForm, setCreateForm] = useState({
    email: '', password: '', name: '', role: 'ADMIN'
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });

  useEffect(() => { fetchAdmins(); }, []);

  const fetchAdmins = async () => {
    try {
      const response = await adminAPI.getAll();
      setAdmins(response.data.data || []);
    } catch (error) {
      showMessage('error', 'Failed to fetch admin list: ' + error.message);
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    try {
      const response = await adminAPI.create(createForm.email, createForm.password, createForm.name, createForm.role);
      showMessage('success', 'Admin account created successfully!');
      setCreateForm({ email: '', password: '', name: '', role: 'ADMIN' });
      fetchAdmins();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.message || 'Failed to create admin account');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showMessage('error', 'New passwords do not match');
      setLoading(false);
      return;
    }
    try {
      const response = await adminAPI.changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      showMessage('success', 'Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAdmin = async (adminId, adminName) => {
    if (!window.confirm("Delete admin \"" + adminName + "\"?")) return;
    setLoading(true);
    try {
      const response = await adminAPI.delete(adminId);
      showMessage('success', 'Admin deleted successfully');
      fetchAdmins();
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.message || 'Failed to delete admin');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    page: { padding: '20px', maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '30px' },
    title: { fontSize: '28px', fontWeight: '600', color: '#1f2937', marginBottom: '8px' },
    subtitle: { fontSize: '14px', color: '#6b7280' },
    tabs: { display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid #e5e7eb' },
    tab: { padding: '12px 24px', background: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '15px', fontWeight: '500', color: '#6b7280' },
    tabActive: { borderBottomColor: '#3b82f6', color: '#3b82f6' },
    card: { background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' },
    cardTitle: { fontSize: '20px', fontWeight: '600', color: '#1f2937', marginBottom: '24px' },
    form: { display: 'flex', flexDirection: 'column', gap: '20px' },
    formGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    label: { fontSize: '14px', fontWeight: '500', color: '#374151' },
    input: { padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px' },
    select: { padding: '12px 16px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', background: 'white' },
    button: { padding: '12px 24px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '500', cursor: 'pointer' },
    buttonDisabled: { opacity: 0.6, cursor: 'not-allowed' },
    message: { padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px', fontWeight: '500' },
    messageSuccess: { background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' },
    messageError: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
    adminList: { display: 'flex', flexDirection: 'column', gap: '12px' },
    adminItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #e5e7eb' },
    adminInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    adminName: { fontSize: '15px', fontWeight: '500', color: '#1f2937' },
    adminEmail: { fontSize: '13px', color: '#6b7280' },
    adminMeta: { display: 'flex', gap: '16px', alignItems: 'center' },
    role: { padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' },
    roleSuperadmin: { background: '#fef3c7', color: '#92400e' },
    roleAdmin: { background: '#dbeafe', color: '#1e40af' },
    roleCS: { background: '#e0e7ff', color: '#4338ca' },
    deleteButton: { padding: '8px 16px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', fontSize: '13px', fontWeight: '500', cursor: 'pointer' },
    emptyState: { textAlign: 'center', padding: '40px', color: '#9ca3af' }
  };

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Superadmin Panel</h1>
        <p style={styles.subtitle}>Manage admin accounts and security settings</p>
      </div>
      {message.text && <div style={{ ...styles.message, ...(message.type === 'success' ? styles.messageSuccess : styles.messageError) }}>{message.text}</div>}
      <div style={styles.tabs}>
        <button style={{ ...styles.tab, ...(activeTab === 'create' ? styles.tabActive : {}) }} onClick={() => setActiveTab('create')}>Create Admin</button>
        <button style={{ ...styles.tab, ...(activeTab === 'password' ? styles.tabActive : {}) }} onClick={() => setActiveTab('password')}>Change Password</button>
        <button style={{ ...styles.tab, ...(activeTab === 'list' ? styles.tabActive : {}) }} onClick={() => setActiveTab('list')}>Manage Admins ({admins.length})</button>
      </div>
      {activeTab === 'create' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Create New Admin Account</h2>
          <form style={styles.form} onSubmit={handleCreateAdmin}>
            <div style={styles.formGroup}><label style={styles.label}>Name *</label><input type="text" style={styles.input} placeholder="Enter admin name" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Email *</label><input type="email" style={styles.input} placeholder="admin@example.com" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Password *</label><input type="password" style={styles.input} placeholder="Min 8 characters" value={createForm.password} onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })} minLength={8} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Role *</label><select style={styles.select} value={createForm.role} onChange={(e) => setCreateForm({ ...createForm, role: e.target.value })} required><option value="ADMIN">Admin</option><option value="CS">Customer Service</option></select></div>
            <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>{loading ? 'Creating...' : 'Create Admin'}</button>
          </form>
        </div>
      )}
      {activeTab === 'password' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Change Your Password</h2>
          <form style={styles.form} onSubmit={handleChangePassword}>
            <div style={styles.formGroup}><label style={styles.label}>Current Password *</label><input type="password" style={styles.input} placeholder="Enter current password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>New Password *</label><input type="password" style={styles.input} placeholder="Min 8 characters" value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} minLength={8} required /></div>
            <div style={styles.formGroup}><label style={styles.label}>Confirm New Password *</label><input type="password" style={styles.input} placeholder="Re-enter new password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })} minLength={8} required /></div>
            <button type="submit" style={{ ...styles.button, ...(loading ? styles.buttonDisabled : {}) }} disabled={loading}>{loading ? 'Changing...' : 'Change Password'}</button>
          </form>
        </div>
      )}
      {activeTab === 'list' && (
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Admin Accounts</h2>
          {admins.length === 0 ? <div style={styles.emptyState}>No admin accounts found</div> : (
            <div style={styles.adminList}>
              {admins.map((admin) => (
                <div key={admin.id} style={styles.adminItem}>
                  <div style={styles.adminInfo}>
                    <div style={styles.adminName}>{admin.name}</div>
                    <div style={styles.adminEmail}>{admin.email}</div>
                  </div>
                  <div style={styles.adminMeta}>
                    <span style={{ ...styles.role, ...(admin.role === 'SUPERADMIN' ? styles.roleSuperadmin : admin.role === 'ADMIN' ? styles.roleAdmin : styles.roleCS) }}>{admin.role}</span>
                    {admin.role !== 'SUPERADMIN' && <button style={styles.deleteButton} onClick={() => handleDeleteAdmin(admin.id, admin.name)} disabled={loading}>Delete</button>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperadminPage;
