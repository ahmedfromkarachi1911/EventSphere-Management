export default function AttendeeSettings() {
  return (
    <div>
      <div className="page-head"><div><h1>Settings</h1><p>Manage your account preferences and security.</p></div></div>

      <div className="grid grid-2">
        <div className="card">
          <div className="card-title">Change Password</div>
          <div className="mt-4">
            <div className="form-group"><label className="form-label">Current Password</label><input className="input" type="password" /></div>
            <div className="form-group"><label className="form-label">New Password</label><input className="input" type="password" /></div>
            <div className="form-group"><label className="form-label">Confirm New Password</label><input className="input" type="password" /></div>
          </div>
          <button className="btn btn-primary">Update Password</button>
        </div>

        <div className="card">
          <div className="card-title">Notification Preferences</div>
          <div className="mt-4" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <label className="checkbox-row"><input type="checkbox" defaultChecked /> Email me about session reminders</label>
            <label className="checkbox-row"><input type="checkbox" defaultChecked /> Email me about new messages</label>
            <label className="checkbox-row"><input type="checkbox" /> SMS alerts before an expo starts</label>
            <label className="checkbox-row"><input type="checkbox" defaultChecked /> Recommend expos based on my interests</label>
          </div>
          <button className="btn btn-primary mt-4">Save Preferences</button>
        </div>
      </div>
    </div>
  )
}
