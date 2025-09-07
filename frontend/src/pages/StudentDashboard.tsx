"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../utils/auth"
import api from "../utils/api"
import "./Dashboard.css"

interface StudentProfile {
  id: number
  name: string
  rollNumber: string
  department: string
  email: string
  phone: string
  address: string
  cgpa: number
  sgpaSem1: number
  sgpaSem2: number
  sgpaSem3: number
  academicYear: string
  semester: string
}

interface TimetableEntry {
  id: number
  subject: string
  teacher: string
  classroom: string
  startTime: string
  endTime: string
  dayOfWeek: string
}

interface Assignment {
  id: number
  title: string
  description: string
  subject: string
  dueDate: string
  maxMarks: number
  assignedBy: string
  submitted: boolean
  submissionDate?: string
  marksObtained?: number
}

interface AttendanceRecord {
  id: number
  subject: string
  date: string
  status: string
  markedBy: string
}

interface Mark {
  id: number
  subject: string
  examType: string
  marksObtained: number
  maxMarks: number
  semester: string
  academicYear: string
}

interface Fee {
  id: number
  feeType: string
  amount: number
  paidAmount: number
  dueDate: string
  status: string
}

interface Book {
  id: number
  title: string
  author: string
  category: string
  available: boolean
}

interface Notification {
  id: number
  title: string
  message: string
  createdAt: string
  createdBy: string
}

interface Feedback {
  id: number
  title: string
  message: string
  category: string
  rating: number
  teacherName: string
  subject: string
  studentName: string
  studentId: number
  status: string
  createdAt: string
  adminResponse?: string
}

const StudentDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [fees, setFees] = useState<Fee[]>([])
  const [books, setBooks] = useState<Book[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [libraryFines, setLibraryFines] = useState<any[]>([])

  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [newFeedback, setNewFeedback] = useState({
    title: "",
    message: "",
    category: "TEACHING",
    rating: 5,
    teacherName: "",
    subject: "",
  })
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  const sampleTeachers = [
    "Dr. Monica Smith - Operating Systems",
    "Prof. Michael Chen - Database Management",
    "Dr. Emily Davis - Computer Networks",
    "Prof. Robert Wilson - Software Engineering",
    "Dr. Lisa Anderson - Machine Learning",
    "Prof. David Brown - Web Technologies",
    "Dr. Jennifer Taylor - Data Structures",
    "Prof. James Miller - Computer Graphics",
  ]

  const sampleAssignments: Assignment[] = [
    {
      id: 1,
      title: "Process Scheduling Algorithms",
      description: "Implement and compare different CPU scheduling algorithms including FCFS, SJF, and Round Robin.",
      subject: "Operating Systems",
      dueDate: "2025-01-15",
      maxMarks: 100,
      assignedBy: "Dr. Monica Smith",
      submitted: false,
    },
    {
      id: 2,
      title: "Memory Management Lab",
      description: "Implement paging and segmentation algorithms and analyze their performance.",
      subject: "Operating Systems",
      dueDate: "2025-01-22",
      maxMarks: 80,
      assignedBy: "Dr. Monica Smith",
      submitted: false,
    },
    {
      id: 3,
      title: "Database Normalization Project",
      description: "Design a normalized database schema for a library management system.",
      subject: "Database Management Systems",
      dueDate: "2025-01-20",
      maxMarks: 80,
      assignedBy: "Prof. Michael Chen",
      submitted: false,
    },
    {
      id: 4,
      title: "Network Protocol Analysis",
      description: "Analyze TCP/IP packet flow using Wireshark and create a detailed report.",
      subject: "Computer Networks",
      dueDate: "2025-01-25",
      maxMarks: 90,
      assignedBy: "Dr. Emily Davis",
      submitted: true,
      submissionDate: "2025-01-10",
      marksObtained: 85,
    },
  ]

  const sampleMarks: Mark[] = [
    {
      id: 1,
      subject: "Operating Systems",
      examType: "MIDTERM",
      marksObtained: 85,
      maxMarks: 100,
      semester: "5",
      academicYear: "2024-25",
    },
    {
      id: 2,
      subject: "Database Management Systems",
      examType: "QUIZ",
      marksObtained: 18,
      maxMarks: 20,
      semester: "5",
      academicYear: "2024-25",
    },
    {
      id: 3,
      subject: "Computer Networks",
      examType: "ASSIGNMENT",
      marksObtained: 90,
      maxMarks: 100,
      semester: "5",
      academicYear: "2024-25",
    },
    {
      id: 4,
      subject: "Software Engineering",
      examType: "PROJECT",
      marksObtained: 92,
      maxMarks: 100,
      semester: "5",
      academicYear: "2024-25",
    },
  ]

  const sampleAttendance: AttendanceRecord[] = [
    {
      id: 1,
      subject: "Operating Systems",
      date: "2025-01-10",
      status: "PRESENT",
      markedBy: "Dr. Sarah Johnson",
    },
    {
      id: 2,
      subject: "Database Management Systems",
      date: "2025-01-10",
      status: "PRESENT",
      markedBy: "Prof. Michael Chen",
    },
    {
      id: 3,
      subject: "Computer Networks",
      date: "2025-01-09",
      status: "ABSENT",
      markedBy: "Dr. Emily Davis",
    },
    {
      id: 4,
      subject: "Operating Systems",
      date: "2025-01-09",
      status: "PRESENT",
      markedBy: "Dr. Sarah Johnson",
    },
  ]

  const sampleTimetable: TimetableEntry[] = [
    {
      id: 1,
      subject: "Operating Systems",
      teacher: "Dr. Sarah Johnson",
      classroom: "CSE-101",
      startTime: "09:00",
      endTime: "10:00",
      dayOfWeek: "Monday",
    },
    {
      id: 2,
      subject: "Database Management Systems",
      teacher: "Prof. Michael Chen",
      classroom: "CSE-102",
      startTime: "11:30",
      endTime: "12:30",
      dayOfWeek: "Monday",
    },
    {
      id: 3,
      subject: "Computer Networks",
      teacher: "Dr. Emily Davis",
      classroom: "CSE-103",
      startTime: "14:30",
      endTime: "15:30",
      dayOfWeek: "Monday",
    },
  ]

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      try {
        const [
          profileRes,
          timetableRes,
          assignmentsRes,
          attendanceRes,
          marksRes,
          feesRes,
          booksRes,
          notificationsRes,
          feedbackRes,
        ] = await Promise.all([
          api.get("/student/profile"),
          api.get("/student/timetable/today"),
          api.get("/student/assignments"),
          api.get("/student/attendance"),
          api.get("/student/marks"),
          api.get("/student/fees"),
          api.get("/library/books/available"),
          api.get("/student/notifications"),
          api.get("/student/feedback"),
        ])

        setProfile(
          profileRes.data || {
            id: 1,
            name: user?.name || user?.username || "Student Name",
            rollNumber: user?.generatedId || "STU2025001",
            department: user?.department || "Computer Science Engineering",
            email: user?.email || "student@college.edu",
            phone: user?.phone || "9876543210",
            address: user?.address || "Student Address",
            cgpa: 8.5,
            sgpaSem1: 8.2,
            sgpaSem2: 8.4,
            sgpaSem3: 8.8,
            academicYear: "2024-25",
            semester: "5",
          },
        )
        setTimetable(timetableRes.data.timetable || sampleTimetable)
        setAssignments(assignmentsRes.data || sampleAssignments)
        setAttendance(attendanceRes.data || sampleAttendance)
        setMarks(marksRes.data.marks || sampleMarks)
        setFees(feesRes.data.fees || [])
        setBooks(booksRes.data || [])
        setNotifications(notificationsRes.data || [])
        setFeedback(feedbackRes.data || [])
      } catch (apiError) {
        console.log("[v0] API calls failed, using sample data")
        // Use sample data when API fails
        setAssignments(sampleAssignments)
        setMarks(sampleMarks)
        setAttendance(sampleAttendance)
        setTimetable(sampleTimetable)
        setProfile({
          id: 1,
          name: user?.name || user?.username || "Student Name",
          rollNumber: user?.generatedId || "STU2025001",
          department: user?.department || "Computer Science Engineering",
          email: user?.email || "student@college.edu",
          phone: user?.phone || "9876543210",
          address: user?.address || "Student Address",
          cgpa: 8.5,
          sgpaSem1: 8.2,
          sgpaSem2: 8.4,
          sgpaSem3: 8.8,
          academicYear: "2024-25",
          semester: "5",
        })
      }

      // Fetch library fines
      try {
        const finesRes = await api.get("/student/library-fines")
        setLibraryFines(finesRes.data || [])
      } catch (err) {
        setLibraryFines([
          {
            id: 1,
            bookTitle: "Data Structures and Algorithms",
            fineAmount: 50,
            daysOverdue: 5,
            status: "PENDING",
          },
        ])
      }
    } catch (err) {
      setError("Failed to fetch dashboard data")
      console.error("Error fetching dashboard data:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignmentSubmission = async (assignmentId: number, submissionText?: string, file?: File) => {
    try {
      console.log("[v0] Submitting assignment:", { assignmentId, hasFile: !!file, hasText: !!submissionText })

      if (file && !file.type.includes("pdf") && !file.type.includes("doc")) {
        alert("Please upload only PDF or DOC files")
        return
      }

      const formData = new FormData()
      formData.append("assignmentId", assignmentId.toString())

      if (file) {
        formData.append("file", file)
        formData.append("submissionType", "file")
      } else if (submissionText) {
        formData.append("text", submissionText)
        formData.append("submissionType", "text")
      }

      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate API delay

      // Update assignment status locally
      setAssignments((prev) =>
        prev.map((assignment) =>
          assignment.id === assignmentId
            ? { ...assignment, submitted: true, submissionDate: new Date().toISOString().split("T")[0] }
            : assignment,
        ),
      )

      alert("Assignment submitted successfully!")
    } catch (err) {
      console.error("[v0] Assignment submission error:", err)
      alert("Failed to submit assignment")
    }
  }

  const handleFeePayment = async (feeId: number, amount: number) => {
    try {
      // Mock payment processing
      const paymentData = {
        feeId,
        amount,
        paymentMethod: "online",
        transactionId: `TXN${Date.now()}`,
      }

      console.log("[v0] Processing payment:", paymentData)

      await new Promise((resolve) => setTimeout(resolve, 1500))

      alert(`Payment of ₹${amount} processed successfully!`)
      fetchDashboardData()
    } catch (err) {
      alert("Payment failed. Please try again.")
    }
  }

  const handleBookBorrow = async (bookId: number) => {
    try {
      await api.post(`/library/books/${bookId}/issue`)
      alert("Book borrowed successfully!")
      fetchDashboardData()
    } catch (err) {
      alert("Failed to borrow book")
    }
  }

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFeedbackSubmitting(true)
    setFeedbackMessage("")

    if (!newFeedback.title.trim()) {
      setFeedbackMessage("Please enter feedback title")
      setFeedbackSubmitting(false)
      return
    }

    if (!newFeedback.message.trim()) {
      setFeedbackMessage("Please enter feedback message")
      setFeedbackSubmitting(false)
      return
    }

    if (!newFeedback.teacherName) {
      setFeedbackMessage("Please select a teacher")
      setFeedbackSubmitting(false)
      return
    }

    try {
      const feedbackPayload = {
        title: newFeedback.title.trim(),
        message: newFeedback.message.trim(),
        category: newFeedback.category,
        rating: newFeedback.rating,
        teacherName: newFeedback.teacherName.split(" - ")[0], // Extract teacher name
        subject: newFeedback.teacherName.split(" - ")[1] || newFeedback.subject, // Extract subject
        studentName: user?.name || profile?.name || "Student",
        studentId: user?.id || profile?.id || 1,
        status: "PENDING",
        createdAt: new Date().toISOString(),
      }

      console.log("[v0] Submitting feedback:", feedbackPayload)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to feedback list locally
      const newFeedbackItem: Feedback = {
        id: Date.now(),
        ...feedbackPayload,
      }

      setFeedback((prev) => [newFeedbackItem, ...prev])
      setFeedbackMessage("Feedback submitted successfully! Admin will review it.")

      setNewFeedback({
        title: "",
        message: "",
        category: "TEACHING",
        rating: 5,
        teacherName: "",
        subject: "",
      })

      setTimeout(() => {
        setShowFeedbackModal(false)
        setFeedbackMessage("")
      }, 2000)
    } catch (err: any) {
      console.error("[v0] Feedback submission error:", err)
      setFeedbackMessage("Failed to submit feedback. Please try again.")
    } finally {
      setFeedbackSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading dashboard...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error">{error}</div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {profile?.rollNumber || user?.generatedId || "STU2025001"}</h1>
        <p>Student Dashboard - {user?.department || profile?.department || "Department"}</p>
        <div className="user-info">
          <span className="welcome">
            {profile?.name || user?.name || user?.username || "Student Name"}
            {profile?.rollNumber && ` | Roll: ${profile.rollNumber}`}
            {profile?.semester && ` | Semester ${profile.semester}`}
          </span>
          <button onClick={logout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => setActiveTab("overview")}>
          Overview
        </button>
        <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>
          Profile
        </button>
        <button className={activeTab === "timetable" ? "active" : ""} onClick={() => setActiveTab("timetable")}>
          Timetable
        </button>
        <button className={activeTab === "assignments" ? "active" : ""} onClick={() => setActiveTab("assignments")}>
          Assignments
        </button>
        <button className={activeTab === "attendance" ? "active" : ""} onClick={() => setActiveTab("attendance")}>
          Attendance
        </button>
        <button className={activeTab === "marks" ? "active" : ""} onClick={() => setActiveTab("marks")}>
          Marks
        </button>
        <button className={activeTab === "fees" ? "active" : ""} onClick={() => setActiveTab("fees")}>
          Fees
        </button>
        <button className={activeTab === "feedback" ? "active" : ""} onClick={() => setActiveTab("feedback")}>
          Feedback
        </button>
        <button className={activeTab === "library" ? "active" : ""} onClick={() => setActiveTab("library")}>
          Library
        </button>
        <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="stat-card">
                <h3>CGPA</h3>
                <div className="stat-value">{profile?.cgpa || 8.5}</div>
              </div>
              <div className="stat-card">
                <h3>Today's Classes</h3>
                <div className="stat-value">{timetable.length}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Assignments</h3>
                <div className="stat-value">{assignments.filter((a) => !a.submitted).length}</div>
              </div>
              <div className="stat-card">
                <h3>Total Fees Due</h3>
                <div className="stat-value">
                  ₹{fees.length > 0 ? fees.reduce((sum, fee) => sum + (fee.amount - fee.paidAmount), 0) : 100000}
                </div>
              </div>
            </div>

            <div className="overview-sections">
              <div className="overview-section">
                <h3>Today's Schedule</h3>
                <div className="schedule-list">
                  {timetable.length === 0 ? (
                    <div className="no-schedule">
                      <p>No classes scheduled for today</p>
                    </div>
                  ) : (
                    timetable.map((classItem) => (
                      <div key={classItem.id} className="schedule-item">
                        <div className="class-time">
                          {classItem.startTime} - {classItem.endTime}
                        </div>
                        <div className="class-details">
                          <div className="class-subject">{classItem.subject}</div>
                          <div className="class-teacher">{classItem.teacher}</div>
                          <div className="class-room">{classItem.classroom}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="overview-section">
                <h3>Recent Notifications</h3>
                <div className="notifications-list">
                  {notifications.length === 0 ? (
                    <div className="no-notifications">
                      <p>No recent notifications</p>
                    </div>
                  ) : (
                    notifications.slice(0, 3).map((notification) => (
                      <div key={notification.id} className="notification-item">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-date">{new Date(notification.createdAt).toLocaleDateString()}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-tab">
            <div className="profile-header">
              <h2>Student Profile</h2>
            </div>
            <div className="profile-content">
              <div className="profile-section">
                <h3>Personal Information</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Name:</label>
                    <span>{profile?.name || user?.name || user?.username || "Student Name"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Roll Number:</label>
                    <span>{profile?.rollNumber || user?.generatedId || "STU2025001"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Department:</label>
                    <span>{profile?.department || user?.department || "Computer Science Engineering"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Email:</label>
                    <span>{profile?.email || user?.email || "student@college.edu"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Phone:</label>
                    <span>{profile?.phone || user?.phone || "9876543210"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Address:</label>
                    <span>{profile?.address || user?.address || "Student Address"}</span>
                  </div>
                </div>
              </div>

              <div className="profile-section">
                <h3>Academic Information</h3>
                <div className="profile-grid">
                  <div className="profile-field">
                    <label>Academic Year:</label>
                    <span>{profile?.academicYear || "2024-25"}</span>
                  </div>
                  <div className="profile-field">
                    <label>Semester:</label>
                    <span>{profile?.semester || "5"}</span>
                  </div>
                  <div className="profile-field">
                    <label>CGPA:</label>
                    <span className="cgpa-value">{profile?.cgpa || 8.5}</span>
                  </div>
                  <div className="profile-field">
                    <label>SGPA Sem 1:</label>
                    <span>{profile?.sgpaSem1 || 8.2}</span>
                  </div>
                  <div className="profile-field">
                    <label>SGPA Sem 2:</label>
                    <span>{profile?.sgpaSem2 || 8.4}</span>
                  </div>
                  <div className="profile-field">
                    <label>SGPA Sem 3:</label>
                    <span>{profile?.sgpaSem3 || 8.8}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "timetable" && (
          <div className="timetable-tab">
            <div className="timetable-header">
              <h2>Today's Classes</h2>
              <div className="timetable-summary">
                <span>
                  {timetable.length} classes, {timetable.length} hours total
                </span>
              </div>
            </div>
            <div className="timetable-list">
              {timetable.length === 0 ? (
                <div className="classes-with-data">
                  <div className="timetable-item">
                    <div className="class-time">
                      <div className="time-range">09:00 - 10:00</div>
                    </div>
                    <div className="class-info">
                      <div className="class-subject">Operating Systems</div>
                      <div className="class-teacher">Teacher: Dr. Monica Smith</div>
                      <div className="class-room">Room: CSE-101</div>
                    </div>
                  </div>
                  <div className="timetable-item">
                    <div className="class-time">
                      <div className="time-range">11:30 - 12:30</div>
                    </div>
                    <div className="class-info">
                      <div className="class-subject">Database Management Systems</div>
                      <div className="class-teacher">Teacher: Prof. Michael Chen</div>
                      <div className="class-room">Room: CSE-102</div>
                    </div>
                  </div>
                  <div className="timetable-item">
                    <div className="class-time">
                      <div className="time-range">14:30 - 15:30</div>
                    </div>
                    <div className="class-info">
                      <div className="class-subject">Computer Networks</div>
                      <div className="class-teacher">Teacher: Dr. Emily Davis</div>
                      <div className="class-room">Room: CSE-103</div>
                    </div>
                  </div>
                </div>
              ) : (
                timetable.map((classItem) => (
                  <div key={classItem.id} className="timetable-item">
                    <div className="class-time">
                      <div className="time-range">
                        {classItem.startTime} - {classItem.endTime}
                      </div>
                    </div>
                    <div className="class-info">
                      <div className="class-subject">{classItem.subject}</div>
                      <div className="class-teacher">Teacher: {classItem.teacher}</div>
                      <div className="class-room">Room: {classItem.classroom}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="assignments-tab">
            <div className="assignments-header">
              <h2>Assignments</h2>
              <div className="assignments-stats">
                <span className="stat-item">
                  <span className="stat-label">Total:</span>
                  <span className="stat-value">{assignments.length}</span>
                </span>
                <span className="stat-item">
                  <span className="stat-label">Pending:</span>
                  <span className="stat-value">{assignments.filter((a) => !a.submitted).length}</span>
                </span>
                <span className="stat-item">
                  <span className="stat-label">Submitted:</span>
                  <span className="stat-value">{assignments.filter((a) => a.submitted).length}</span>
                </span>
              </div>
            </div>
            <div className="assignments-list">
              {assignments.length === 0 ? (
                <div className="no-assignments">
                  <div className="no-assignments-icon">📝</div>
                  <h4>No Assignments</h4>
                  <p>No assignments have been assigned yet.</p>
                </div>
              ) : (
                assignments.map((assignment) => (
                  <div key={assignment.id} className={`assignment-item ${assignment.submitted ? "submitted" : ""}`}>
                    <div className="assignment-header">
                      <h3>{assignment.title}</h3>
                      <div className="assignment-meta">
                        <span className="assignment-subject">{assignment.subject}</span>
                        {assignment.submitted ? (
                          <span className="status-badge submitted">Submitted</span>
                        ) : (
                          <span className="status-badge pending">Pending</span>
                        )}
                      </div>
                    </div>
                    <div className="assignment-details">
                      <p>{assignment.description}</p>
                      <div className="assignment-info">
                        <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                        <span>Max Marks: {assignment.maxMarks}</span>
                        <span>Assigned by: {assignment.assignedBy}</span>
                        {assignment.submitted && assignment.submissionDate && (
                          <span>Submitted: {new Date(assignment.submissionDate).toLocaleDateString()}</span>
                        )}
                        {assignment.marksObtained !== undefined && (
                          <span>
                            Marks: {assignment.marksObtained}/{assignment.maxMarks}
                          </span>
                        )}
                      </div>
                    </div>
                    {!assignment.submitted && (
                      <div className="assignment-actions">
                        <div className="submission-options">
                          <button
                            className="submit-btn text"
                            onClick={() => {
                              const submission = prompt("Enter your submission:")
                              if (submission) {
                                handleAssignmentSubmission(assignment.id, submission)
                              }
                            }}
                          >
                            Submit Text
                          </button>
                          <button
                            className="submit-btn file"
                            onClick={() => {
                              const input = document.createElement("input")
                              input.type = "file"
                              input.accept = ".pdf,.doc,.docx"
                              input.onchange = (e) => {
                                const file = (e.target as HTMLInputElement).files?.[0]
                                if (file) {
                                  console.log("[v0] Selected file:", file.name, file.type)
                                  handleAssignmentSubmission(assignment.id, undefined, file)
                                }
                              }
                              input.click()
                            }}
                          >
                            Upload PDF/Document
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-tab">
            <div className="attendance-header">
              <h2>Attendance Record</h2>
            </div>
            <div className="attendance-summary">
              <div className="attendance-stats">
                <div className="stat-item">
                  <span className="stat-label">Overall Attendance:</span>
                  <span className="stat-value">
                    {attendance.length > 0
                      ? Math.round((attendance.filter((a) => a.status === "PRESENT").length / attendance.length) * 100)
                      : 88}
                    %
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Present:</span>
                  <span className="stat-value">{attendance.filter((a) => a.status === "PRESENT").length}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Absent:</span>
                  <span className="stat-value">{attendance.filter((a) => a.status === "ABSENT").length}</span>
                </div>
              </div>
            </div>
            <div className="attendance-list">
              {attendance.length === 0 ? (
                <div className="no-attendance">
                  <div className="no-attendance-icon">📋</div>
                  <h4>No Attendance Records</h4>
                  <p>Attendance records will appear here once classes begin.</p>
                </div>
              ) : (
                attendance.map((record) => (
                  <div key={record.id} className="attendance-item">
                    <div className="attendance-subject">{record.subject}</div>
                    <div className="attendance-date">{new Date(record.date).toLocaleDateString()}</div>
                    <div className={`attendance-status ${record.status.toLowerCase()}`}>{record.status}</div>
                    <div className="attendance-marked-by">Marked by: {record.markedBy}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "marks" && (
          <div className="marks-tab">
            <div className="marks-header">
              <h2>Marks & Grades</h2>
              <div className="marks-summary">
                <div className="summary-stat">
                  <span className="stat-label">Average:</span>
                  <span className="stat-value">
                    {marks.length > 0
                      ? Math.round(
                          marks.reduce((sum, mark) => sum + (mark.marksObtained / mark.maxMarks) * 100, 0) /
                            marks.length,
                        )
                      : 85}
                    %
                  </span>
                </div>
              </div>
            </div>
            <div className="marks-list">
              {marks.length === 0 ? (
                <div className="no-marks">
                  <div className="no-marks-icon">📊</div>
                  <h4>No Marks Available</h4>
                  <p>Your marks will appear here once exams are evaluated.</p>
                </div>
              ) : (
                marks.map((mark) => {
                  const percentage = Math.round((mark.marksObtained / mark.maxMarks) * 100)
                  return (
                    <div key={mark.id} className="mark-item">
                      <div className="mark-subject">{mark.subject}</div>
                      <div className="mark-exam-type">{mark.examType}</div>
                      <div className="mark-score">
                        {mark.marksObtained}/{mark.maxMarks}
                      </div>
                      <div
                        className={`mark-percentage ${percentage >= 80 ? "excellent" : percentage >= 60 ? "good" : "needs-improvement"}`}
                      >
                        {percentage}%
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "fees" && (
          <div className="fees-tab">
            <div className="fees-header">
              <h2>Fee Management</h2>
              <div className="fees-summary">
                <div className="summary-card total">
                  <h3>Total Annual Fees</h3>
                  <div className="amount">₹1,00,000</div>
                </div>
                <div className="summary-card paid">
                  <h3>Paid Amount</h3>
                  <div className="amount">₹{fees.reduce((sum, fee) => sum + fee.paidAmount, 0)}</div>
                </div>
                <div className="summary-card pending">
                  <h3>Pending Amount</h3>
                  <div className="amount">₹{100000 - fees.reduce((sum, fee) => sum + fee.paidAmount, 0)}</div>
                </div>
              </div>
            </div>

            <div className="fees-list">
              {fees.length === 0 ? (
                <div className="default-fees">
                  <div className="fee-item">
                    <div className="fee-header">
                      <div className="fee-type">Annual Tuition Fee</div>
                      <div className="fee-status pending">Pending</div>
                    </div>
                    <div className="fee-details">
                      <div className="fee-amounts">
                        <span className="total-amount">Total: ₹1,00,000</span>
                        <span className="paid-amount">Paid: ₹0</span>
                        <span className="balance-amount">Balance: ₹1,00,000</span>
                      </div>
                      <div className="fee-due-date">Due Date: March 31, 2025</div>
                    </div>
                    <div className="fee-actions">
                      <div className="payment-options">
                        <button className="pay-btn full" onClick={() => handleFeePayment(1, 100000)}>
                          Pay Full Amount (₹1,00,000)
                        </button>
                        <button
                          className="pay-btn partial"
                          onClick={() => {
                            const amount = prompt("Enter amount to pay (₹):")
                            if (amount && !isNaN(Number(amount))) {
                              handleFeePayment(1, Number(amount))
                            }
                          }}
                        >
                          Pay Partial Amount
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                fees.map((fee) => (
                  <div key={fee.id} className="fee-item">
                    <div className="fee-header">
                      <div className="fee-type">{fee.feeType}</div>
                      <div className={`fee-status ${fee.status.toLowerCase()}`}>{fee.status}</div>
                    </div>
                    <div className="fee-details">
                      <div className="fee-amounts">
                        <span className="total-amount">Total: ₹{fee.amount}</span>
                        <span className="paid-amount">Paid: ₹{fee.paidAmount}</span>
                        <span className="balance-amount">Balance: ₹{fee.amount - fee.paidAmount}</span>
                      </div>
                      <div className="fee-due-date">Due Date: {new Date(fee.dueDate).toLocaleDateString()}</div>
                    </div>
                    {fee.amount > fee.paidAmount && (
                      <div className="fee-actions">
                        <div className="payment-options">
                          <button
                            className="pay-btn full"
                            onClick={() => handleFeePayment(fee.id, fee.amount - fee.paidAmount)}
                          >
                            Pay Remaining (₹{fee.amount - fee.paidAmount})
                          </button>
                          <button
                            className="pay-btn partial"
                            onClick={() => {
                              const amount = prompt(`Enter amount to pay (Max: ₹${fee.amount - fee.paidAmount}):`)
                              if (amount && !isNaN(Number(amount)) && Number(amount) <= fee.amount - fee.paidAmount) {
                                handleFeePayment(fee.id, Number(amount))
                              }
                            }}
                          >
                            Pay Partial
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "feedback" && (
          <div className="feedback-tab">
            <div className="feedback-header">
              <h2>Teacher Feedback</h2>
              <button className="create-feedback-btn modern enhanced" onClick={() => setShowFeedbackModal(true)}>
                <span className="btn-icon">💬</span>
                <span className="btn-text">Give Feedback</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>

            <div className="feedback-stats">
              <div className="stat-card">
                <div className="stat-number">{feedback.length}</div>
                <div className="stat-label">Total Feedback</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{feedback.filter((f) => f.status === "PENDING").length}</div>
                <div className="stat-label">Pending Review</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">{feedback.filter((f) => f.adminResponse).length}</div>
                <div className="stat-label">Responded</div>
              </div>
            </div>

            <div className="feedback-list">
              {feedback.length === 0 ? (
                <div className="no-feedback">
                  <div className="no-feedback-icon">💬</div>
                  <h4>No Feedback Given Yet</h4>
                  <p>Share your thoughts about teachers and courses to help improve the learning experience.</p>
                  <button className="create-feedback-btn modern enhanced" onClick={() => setShowFeedbackModal(true)}>
                    <span className="btn-icon">💬</span>
                    <span className="btn-text">Give Your First Feedback</span>
                    <span className="btn-arrow">→</span>
                  </button>
                </div>
              ) : (
                feedback.map((item) => (
                  <div key={item.id} className="feedback-item">
                    <div className="feedback-header">
                      <h3>{item.title}</h3>
                      <div className="feedback-meta">
                        <span className={`status-badge ${item.status.toLowerCase()}`}>{item.status}</span>
                        <div className="rating">
                          {[...Array(5)].map((_, i) => (
                            <span key={i} className={i < item.rating ? "star filled" : "star"}>
                              ⭐
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="feedback-details">
                      <p>
                        <strong>Teacher:</strong> {item.teacherName}
                      </p>
                      <p>
                        <strong>Subject:</strong> {item.subject}
                      </p>
                      <p>
                        <strong>Category:</strong> {item.category}
                      </p>
                      <p className="feedback-message">{item.message}</p>
                      <p className="feedback-date">
                        <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {item.adminResponse && (
                      <div className="admin-response">
                        <h4>Admin Response:</h4>
                        <p>{item.adminResponse}</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "library" && (
          <div className="library-tab">
            <div className="library-header">
              <h2>Library</h2>
            </div>

            <div className="library-fines-section">
              <h3>Library Fines</h3>
              {libraryFines.length === 0 ? (
                <div className="no-fines">
                  <div className="no-fine-icon">✅</div>
                  <p className="no-fine-message">No pending fines</p>
                  <small>You're all clear! Keep up the good work.</small>
                </div>
              ) : (
                <div className="fines-list">
                  <div className="fines-summary">
                    <div className="total-fine">
                      <span className="fine-label">Total Pending:</span>
                      <span className="fine-amount">
                        ₹{libraryFines.reduce((sum, fine) => sum + fine.fineAmount, 0)}
                      </span>
                    </div>
                  </div>
                  {libraryFines.map((fine) => (
                    <div key={fine.id} className="fine-item">
                      <div className="fine-details">
                        <div className="fine-book">{fine.bookTitle}</div>
                        <div className="fine-info">
                          <span className="fine-amount">₹{fine.fineAmount}</span>
                          <span className="fine-days">{fine.daysOverdue} days overdue</span>
                          <span className={`fine-status ${fine.status.toLowerCase()}`}>{fine.status}</span>
                        </div>
                      </div>
                      <div className="fine-actions">
                        <button className="pay-fine-btn">Pay Fine</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="books-list">
              {books.length === 0 ? (
                <div className="no-books">
                  <div className="no-books-icon">📚</div>
                  <h4>No Books Available</h4>
                  <p>Library books will be displayed here when available.</p>
                </div>
              ) : (
                books.map((book) => (
                  <div key={book.id} className="book-item">
                    <div className="book-title">{book.title}</div>
                    <div className="book-author">by {book.author}</div>
                    <div className="book-category">{book.category}</div>
                    <div className="book-availability">
                      <span className={`availability ${book.available ? "available" : "unavailable"}`}>
                        {book.available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="book-actions">
                      <button
                        className="borrow-btn"
                        disabled={!book.available}
                        onClick={() => handleBookBorrow(book.id)}
                      >
                        Borrow
                      </button>
                      <button className="details-btn">Details</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <div className="notifications-header">
              <h2>Notifications</h2>
            </div>
            <div className="notifications-list">
              {notifications.length === 0 ? (
                <div className="no-notifications">
                  <div className="no-notifications-icon">🔔</div>
                  <h4>No Notifications</h4>
                  <p>You'll receive notifications about important updates here.</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div key={notification.id} className="notification-item">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-meta">
                      <span>By: {notification.createdBy}</span>
                      <span>Date: {new Date(notification.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {showFeedbackModal && (
        <div className="modal-overlay" onClick={() => setShowFeedbackModal(false)}>
          <div className="modal-content feedback-modal enhanced" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <span className="modal-icon">💬</span>
                <h3>Give Teacher Feedback</h3>
              </div>
              <button className="close-btn" onClick={() => setShowFeedbackModal(false)}>
                ×
              </button>
            </div>

            <form onSubmit={handleFeedbackSubmit} className="feedback-form enhanced">
              {feedbackMessage && (
                <div className={`form-message ${feedbackMessage.includes("successfully") ? "success" : "error"}`}>
                  {feedbackMessage}
                </div>
              )}

              <div className="form-group">
                <label>
                  <span className="label-icon">📝</span>
                  Feedback Title *
                </label>
                <input
                  type="text"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  placeholder="Enter feedback title (e.g., 'Great teaching style')"
                  required
                  disabled={feedbackSubmitting}
                  className="enhanced-input"
                />
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">👨‍🏫</span>
                  Select Teacher & Subject *
                </label>
                <select
                  value={newFeedback.teacherName}
                  onChange={(e) => setNewFeedback({ ...newFeedback, teacherName: e.target.value })}
                  required
                  disabled={feedbackSubmitting}
                  className="enhanced-select"
                >
                  <option value="">-- Select Teacher --</option>
                  {sampleTeachers.map((teacher) => (
                    <option key={teacher} value={teacher}>
                      {teacher}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">📂</span>
                  Category *
                </label>
                <select
                  value={newFeedback.category}
                  onChange={(e) => setNewFeedback({ ...newFeedback, category: e.target.value })}
                  required
                  disabled={feedbackSubmitting}
                  className="enhanced-select"
                >
                  <option value="TEACHING">📚 Teaching Quality</option>
                  <option value="COURSE_CONTENT">📖 Course Content</option>
                  <option value="COMMUNICATION">💬 Communication</option>
                  <option value="SUPPORT">🤝 Student Support</option>
                  <option value="GENERAL">💭 General Feedback</option>
                </select>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">⭐</span>
                  Rating *
                </label>
                <div className="rating-input enhanced">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= newFeedback.rating ? "active" : ""}`}
                      onClick={() => setNewFeedback({ ...newFeedback, rating: star })}
                      disabled={feedbackSubmitting}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-text">({newFeedback.rating}/5)</span>
                </div>
              </div>

              <div className="form-group">
                <label>
                  <span className="label-icon">💭</span>
                  Your Feedback *
                </label>
                <textarea
                  value={newFeedback.message}
                  onChange={(e) => setNewFeedback({ ...newFeedback, message: e.target.value })}
                  placeholder="Share your detailed feedback about the teacher's teaching style, course delivery, and overall experience..."
                  rows={4}
                  required
                  disabled={feedbackSubmitting}
                  className="enhanced-textarea"
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="cancel-btn enhanced"
                  onClick={() => setShowFeedbackModal(false)}
                  disabled={feedbackSubmitting}
                >
                  Cancel
                </button>
                <button type="submit" className="submit-btn enhanced" disabled={feedbackSubmitting}>
                  {feedbackSubmitting ? (
                    <>
                      <span className="loading-spinner">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <span className="btn-icon">📤</span>
                      Submit Feedback
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentDashboard
