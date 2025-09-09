
import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function AdminDashboard() {
	const [dashboard, setDashboard] = useState<any>(null)
	const [loading, setLoading] = useState(true)
	const [activeTab, setActiveTab] = useState('overview')

	useEffect(() => {
		fetchDashboard()
	}, [])

	const fetchDashboard = async () => {
		try {
			const res = await api.get('/admin/dashboard')
			setDashboard(res.data)
		} catch (err) {
			console.error('Failed to fetch dashboard:', err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) return (
		<div className="loading-container">
			<div className="loading-spinner"></div>
			<p>Loading dashboard...</p>
		</div>
	)

	const tabs = [
		{ id: 'overview', label: 'Overview', icon: '📊' },
		{ id: 'users', label: 'User Management', icon: '👥' },
		{ id: 'reports', label: 'Reports', icon: '📈' },
		{ id: 'feedback', label: 'Feedback', icon: '💬' },
		{ id: 'notifications', label: 'Notifications', icon: '🔔' },
		{ id: 'analytics', label: 'Analytics', icon: '📊' }
	]

	return (
		<div className="dashboard-container">
			<div className="dashboard-header">
				<h1>Admin Dashboard</h1>
				<div className="user-info">
					<span className="welcome">System Administration</span>
				</div>
			</div>

			<div className="dashboard-tabs">
				{tabs.map(tab => (
					<button
						key={tab.id}
						className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
						onClick={() => setActiveTab(tab.id)}
					>
						<span className="tab-icon">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</div>

			<div className="dashboard-content">
				{activeTab === 'overview' && (
					<div className="overview-grid">
						<div className="stat-card primary">
							<div className="stat-icon">👥</div>
							<div className="stat-content">
								<h3>Total Students</h3>
								<p className="stat-value">{dashboard?.totalStudents || 0}</p>
							</div>
						</div>
						<div className="stat-card success">
							<div className="stat-icon">👨‍🏫</div>
							<div className="stat-content">
								<h3>Total Faculty</h3>
								<p className="stat-value">{dashboard?.totalFaculty || 0}</p>
							</div>
						</div>
						<div className="stat-card warning">
							<div className="stat-icon">📝</div>
							<div className="stat-content">
								<h3>Total Assignments</h3>
								<p className="stat-value">{dashboard?.totalAssignments || 0}</p>
							</div>
						</div>
						<div className="stat-card info">
							<div className="stat-icon">💰</div>
							<div className="stat-content">
								<h3>Fees Collected</h3>
								<p className="stat-value">${dashboard?.totalFeesCollected || 0}</p>
								<small>Pending: ${dashboard?.pendingFees || 0}</small>
							</div>
						</div>
						<div className="stat-card secondary">
							<div className="stat-icon">💬</div>
							<div className="stat-content">
								<h3>Pending Feedback</h3>
								<p className="stat-value">{dashboard?.pendingFeedback || 0}</p>
							</div>
						</div>
						<div className="stat-card tertiary">
							<div className="stat-icon">📚</div>
							<div className="stat-content">
								<h3>Library Books</h3>
								<p className="stat-value">{dashboard?.libraryBooks || 0}</p>
							</div>
						</div>
					</div>
				)}

				{activeTab === 'users' && <UserManagement />}
				{activeTab === 'reports' && <ReportsManagement />}
				{activeTab === 'feedback' && <FeedbackManagement />}
				{activeTab === 'notifications' && <NotificationManagement />}
				{activeTab === 'analytics' && <AnalyticsManagement />}
			</div>
		</div>
	)
}

function UserManagement() {
	const [users, setUsers] = useState<any[]>([])
	const [newUser, setNewUser] = useState({
		username: '',
		password: '',
		role: 'STUDENT'
	})
	const [loading, setLoading] = useState(true)
	const [submitting, setSubmitting] = useState(false)
	const [message, setMessage] = useState('')

	useEffect(() => {
		fetchUsers()
	}, [])

	const fetchUsers = async () => {
		try {
			const res = await api.get('/admin/users')
			setUsers(res.data)
		} catch (err) {
			console.error('Failed to fetch users:', err)
		} finally {
			setLoading(false)
		}
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setSubmitting(true)
		setMessage('')

		try {
			await api.post('/admin/users', newUser)
			setMessage('User created successfully!')
			setNewUser({
				username: '',
				password: '',
				role: 'STUDENT'
			})
			fetchUsers()
		} catch (err) {
			setMessage('Failed to create user')
		} finally {
			setSubmitting(false)
		}
	}

	const handleDelete = async (userId: number) => {
		if (window.confirm('Are you sure you want to delete this user?')) {
			try {
				await api.delete(`/admin/users/${userId}`)
				setMessage('User deleted successfully!')
				fetchUsers()
			} catch (err) {
				setMessage('Failed to delete user')
			}
		}
	}

	if (loading) return <div className="loading">Loading users...</div>

	return (
		<div className="tab-content">
			<h2>User Management</h2>

			<div className="user-form-section">
				<h3>Create New User</h3>
				<form onSubmit={handleSubmit} className="user-form">
					<div className="form-row">
						<div className="form-group">
							<label>Username</label>
							<input
								type="text"
								value={newUser.username}
								onChange={(e) => setNewUser({...newUser, username: e.target.value})}
								required
							/>
						</div>
						<div className="form-group">
							<label>Password</label>
							<input
								type="password"
								value={newUser.password}
								onChange={(e) => setNewUser({...newUser, password: e.target.value})}
								required
							/>
						</div>
						<div className="form-group">
							<label>Role</label>
							<select
								value={newUser.role}
								onChange={(e) => setNewUser({...newUser, role: e.target.value})}
							>
								<option value="STUDENT">Student</option>
								<option value="FACULTY">Faculty</option>
								<option value="ADMIN">Admin</option>
							</select>
						</div>
					</div>
					<button type="submit" disabled={submitting} className="submit-button">
						{submitting ? 'Creating...' : 'Create User'}
					</button>
					{message && <div className="message">{message}</div>}
				</form>
			</div>

			<div className="users-list">
				<h3>All Users</h3>
				<div className="users-table">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Username</th>
								<th>Role</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{users.map((user, index) => (
								<tr key={index}>
									<td>{user.id}</td>
									<td>{user.username}</td>
									<td>
										<span className={`role-badge ${user.role.toLowerCase()}`}>
											{user.role}
										</span>
									</td>
									<td>
										<button
											onClick={() => handleDelete(user.id)}
											className="delete-button"
										>
											Delete
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	)
}

function ReportsManagement() {
	const [reports, setReports] = useState<any>({})
	const [loading, setLoading] = useState(true)
	const [activeReport, setActiveReport] = useState('attendance')

	useEffect(() => {
		fetchReports()
	}, [])

	const fetchReports = async () => {
		try {
			const [attendanceRes, marksRes, feesRes, assignmentsRes] = await Promise.all([
				api.get('/admin/attendance/reports'),
				api.get('/admin/marks/reports'),
				api.get('/admin/fees/reports'),
				api.get('/admin/assignments/reports')
			])

			setReports({
				attendance: attendanceRes.data,
				marks: marksRes.data,
				fees: feesRes.data,
				assignments: assignmentsRes.data
			})
		} catch (err) {
			console.error('Failed to fetch reports:', err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) return <div className="loading">Loading reports...</div>

	const reportTabs = [
		{ id: 'attendance', label: 'Attendance', icon: '📅' },
		{ id: 'marks', label: 'Marks', icon: '📈' },
		{ id: 'fees', label: 'Fees', icon: '💰' },
		{ id: 'assignments', label: 'Assignments', icon: '📝' }
	]

	return (
		<div className="tab-content">
			<h2>Reports & Analytics</h2>

			<div className="reports-tabs">
				{reportTabs.map(tab => (
					<button
						key={tab.id}
						className={`report-tab-button ${activeReport === tab.id ? 'active' : ''}`}
						onClick={() => setActiveReport(tab.id)}
					>
						<span className="tab-icon">{tab.icon}</span>
						{tab.label}
					</button>
				))}
			</div>

			<div className="report-content">
				{activeReport === 'attendance' && (
					<div className="report-section">
						<h3>Attendance Reports</h3>
						<div className="report-grid">
							{reports.attendance?.map((record: any, index: number) => (
								<div key={index} className="report-card">
									<div className="report-date">{new Date(record.date).toLocaleDateString()}</div>
									<div className="report-subject">{record.subject}</div>
									<div className={`report-status ${record.status.toLowerCase()}`}>
										{record.status}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeReport === 'marks' && (
					<div className="report-section">
						<h3>Marks Reports</h3>
						<div className="report-grid">
							{reports.marks?.map((mark: any, index: number) => (
								<div key={index} className="report-card">
									<div className="report-subject">{mark.subject}</div>
									<div className="report-exam">{mark.examType}</div>
									<div className="report-score">
										{mark.marksObtained}/{mark.maxMarks}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeReport === 'fees' && (
					<div className="report-section">
						<h3>Fees Reports</h3>
						<div className="report-grid">
							{reports.fees?.map((fee: any, index: number) => (
								<div key={index} className="report-card">
									<div className="report-fee-type">{fee.feeType}</div>
									<div className="report-amount">${fee.amount}</div>
									<div className={`report-status ${fee.status.toLowerCase()}`}>
										{fee.status}
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{activeReport === 'assignments' && (
					<div className="report-section">
						<h3>Assignments Reports</h3>
						<div className="report-grid">
							{reports.assignments?.map((assignment: any, index: number) => (
								<div key={index} className="report-card">
									<div className="report-title">{assignment.title}</div>
									<div className="report-subject">{assignment.subject}</div>
									<div className="report-marks">Max: {assignment.maxMarks} marks</div>
								</div>
							))}
						</div>
					</div>
				)}
			</div>
		</div>
	)
}

function NotificationManagement() {
const [notifications, setNotifications] = useState<any[]>([])
    const [newNotification, setNewNotification] = useState({
        title: '',
        message: '',
        targetRole: 'ALL',
        createdBy: 'ADMIN'
    })
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editingData, setEditingData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        fetchNotifications()
    }, [])

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/admin/notifications')
            setNotifications(res.data)
        } catch (err) {
            console.error('Failed to fetch notifications:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage('')

        try {
            await api.post('/admin/notifications', newNotification)
            setMessage('Notification created successfully!')
            setNewNotification({ title: '', message: '', targetRole: 'ALL' })
            fetchNotifications()
        } catch (err) {
            setMessage('Failed to create notification')
        } finally {
            setSubmitting(false)
        }
    }

    const handleEdit = (notif: any) => {
        setEditingId(notif.id)
        setEditingData({ ...notif })
    }

    const handleUpdate = async () => {
        if (!editingData.title || !editingData.message) {
            setMessage('Title and message are required')
            return
        }
        try {
            await api.put(`/admin/notifications/${editingId}`, editingData)
            setMessage('Notification updated successfully!')
            setEditingId(null)
            setEditingData(null)
            fetchNotifications()
        } catch (err) {
            setMessage('Failed to update notification')
        }
    }

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this notification?')) {
            try {
                await api.delete(`/admin/notifications/${id}`)
                setMessage('Notification deleted successfully!')
                fetchNotifications()
            } catch (err) {
                setMessage('Failed to delete notification')
            }
        }
    }

    if (loading) return <div className="loading">Loading notifications...</div>

    return (
        <div className="tab-content">
            <h2>Notification Management</h2>

            <div className="notification-form-section">
                <h3>Create New Notification</h3>
                <form onSubmit={handleSubmit} className="notification-form">
                    <div className="form-group">
                        <label>Title</label>
                        <input
                            type="text"
                            value={newNotification.title}
                            onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Message</label>
                        <textarea
                            value={newNotification.message}
                            onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Target Role</label>
                        <select
                            value={newNotification.targetRole}
                            onChange={(e) => setNewNotification({ ...newNotification, targetRole: e.target.value })}
                        >
                            <option value="STUDENT">Students</option>
                            <option value="FACULTY">Faculty</option>
                            <option value="ADMIN">Admin</option>
                            <option value="ALL">All Users</option>
                        </select>
                    </div>
                    <button type="submit" disabled={submitting} className="submit-button">
                        {submitting ? 'Creating...' : 'Create Notification'}
                    </button>
                    {message && <div className="message">{message}</div>}
                </form>
            </div>

            <div className="notifications-list">
                <h3>All Notifications</h3>
                {notifications.map((notif) => (
                    <div key={notif.id} className="notification-card">
                        {editingId === notif.id ? (
                            <div className="edit-form">
                                <input
                                    type="text"
                                    value={editingData.title}
                                    onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                                />
                                <textarea
                                    value={editingData.message}
                                    onChange={(e) => setEditingData({ ...editingData, message: e.target.value })}
                                    rows={3}
                                />
                                <select
                                    value={editingData.targetRole}
                                    onChange={(e) => setEditingData({ ...editingData, targetRole: e.target.value })}
                                >
                                    <option value="STUDENT">Students</option>
                                    <option value="FACULTY">Faculty</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="ALL">All Users</option>
                                </select>
                                <div className="edit-actions">
                                    <button onClick={handleUpdate}>Save</button>
                                    <button onClick={() => setEditingId(null)}>Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="notification-header">
                                    <h4>{notif.title}</h4>
                                    <span className="notification-target">{notif.targetRole}</span>
                                </div>
                                <p className="notification-message">{notif.message}</p>
                                <div className="notification-footer">
                                    <span className="notification-date">
                                        {new Date(notif.createdAt).toLocaleDateString()}
                                    </span>
                                    <span className="notification-author">By: {notif.createdBy}</span>
                                </div>
                                <div className="notification-actions">
                                    <button onClick={() => handleEdit(notif)}>Edit</button>
                                    <button onClick={() => handleDelete(notif.id)}>Delete</button>
                                </div>
                            </>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
}

function AnalyticsManagement() {
	const [analytics, setAnalytics] = useState<any>({})
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		fetchAnalytics()
	}, [])

	const fetchAnalytics = async () => {
		try {
			const res = await api.get('/admin/analytics')
			setAnalytics(res.data)
		} catch (err) {
			console.error('Failed to fetch analytics:', err)
		} finally {
			setLoading(false)
		}
	}

	if (loading) return <div className="loading">Loading analytics...</div>

	return (
		<div className="tab-content">
			<h2>System Analytics</h2>

			<div className="analytics-grid">
				<div className="analytics-card">
					<h3>Attendance Analytics</h3>
					<div className="analytics-metric">
						<span className="metric-label">Total Records:</span>
						<span className="metric-value">{analytics.totalAttendanceRecords || 0}</span>
					</div>
					<div className="analytics-metric">
						<span className="metric-label">Attendance %:</span>
						<span className="metric-value">{analytics.attendancePercentage?.toFixed(1) || 0}%</span>
					</div>
				</div>

				<div className="analytics-card">
					<h3>Academic Performance</h3>
					<div className="analytics-metric">
						<span className="metric-label">Average Marks:</span>
						<span className="metric-value">{analytics.averageMarks || 0}</span>
					</div>
					<div className="analytics-metric">
						<span className="metric-label">Total Students:</span>
						<span className="metric-value">{analytics.totalStudents || 0}</span>
					</div>
				</div>

				<div className="analytics-card">
					<h3>Financial Analytics</h3>
					<div className="analytics-metric">
						<span className="metric-label">Total Fees:</span>
						<span className="metric-value">${analytics.totalFees || 0}</span>
					</div>
					<div className="analytics-metric">
						<span className="metric-label">Total Faculty:</span>
						<span className="metric-value">{analytics.totalFaculty || 0}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
