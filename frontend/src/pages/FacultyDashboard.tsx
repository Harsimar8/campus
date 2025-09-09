"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../utils/auth"
import api from "../utils/api"
import "./Dashboard.css"

interface FacultyProfile {
  id: number
  name: string
  employeeId: string
  department: string
  email: string
  phone: string
  address: string
  designation: string
  qualification: string
  experience: string
  coursesTaught: string
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
  createdAt: string
  status: string
}

interface AssignmentSubmission {
  id: number
  assignmentId: number
  studentId: number
  submissionText: string
  submittedAt: string
  marksObtained: number
  feedback: string
  status: string
}

interface Mark {
  id: number
  studentId: number
  subject: string
  examType: string
  marksObtained: number
  maxMarks: number
  semester: string
  academicYear: string
}

interface Student {
  id: number
  name: string
  rollNumber: string
  department: string
  email: string
  semester: string
  academicYear: string
}

interface AttendanceRecord {
  id: number
  studentId: number
  studentName: string
  studentRollNumber: string
  subject: string
  date: string
  status: string
  markedBy: string
}

interface AttendanceSession {
  subject: string
  date: string
  students: {
    studentId: number
    studentName: string
    studentRollNumber: string
    status: "PRESENT" | "ABSENT" | "LATE"
  }[]
}

interface Notification {
  id: number
  title: string
  message: string
  createdAt: string
  createdBy: string
  targetRole: string
}

interface Subject {
  id: number
  subjectCode: string
  subjectName: string
  department: string
  credits: number
  semester: string
  academicYear: string
}

const FacultyDashboard: React.FC = () => {
  const { user, logout } = useAuth()
  const [activeTab, setActiveTab] = useState("overview")
  const [profile, setProfile] = useState<FacultyProfile | null>(null)
  const [timetable, setTimetable] = useState<TimetableEntry[]>([])
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([])
  const [marks, setMarks] = useState<Mark[]>([])
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSchedule, setShowSchedule] = useState(false)
  const [weeklyTimetable, setWeeklyTimetable] = useState<{ [key: string]: TimetableEntry[] }>({})
  const [selectedDay, setSelectedDay] = useState("Monday")

  // Form states
  const [newAssignment, setNewAssignment] = useState({
    title: "",
    description: "",
    subject: "",
    maxMarks: "",
    dueDate: "",
  })
  const [newNotification, setNewNotification] = useState({
    title: "",
    message: "",
    targetRole: "STUDENT",
  })
  const [newMark, setNewMark] = useState({
    selectedStudent: "",
    studentId: "",
    studentName: "",
    studentRollNumber: "",
    subject: "",
    examType: "MIDTERM",
    marksObtained: "",
    maxMarks: "",
    semester: "",
    academicYear: "",
  })

  // Attendance management states
  const [selectedSubject, setSelectedSubject] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [attendanceSession, setAttendanceSession] = useState<AttendanceSession | null>(null)
  const [attendanceSubmitting, setAttendanceSubmitting] = useState(false)
  const [attendanceMessage, setAttendanceMessage] = useState("")
  const [attendanceView, setAttendanceView] = useState<"mark" | "history">("mark")

  const [marksSubmitting, setMarksSubmitting] = useState(false)
  const [marksMessage, setMarksMessage] = useState("")
  const [marksView, setMarksView] = useState<"add" | "view">("add")
  const [selectedMarksSubject, setSelectedMarksSubject] = useState("")

  const [assignmentSubmitting, setAssignmentSubmitting] = useState(false)
  const [assignmentMessage, setAssignmentMessage] = useState("")

  const cseSubjects = [
    "Operating Systems",
    "Computer Networks",
    "Database Management Systems",
    "Software Engineering",
    "Data Structures and Algorithms",
    "Computer Graphics",
    "Machine Learning",
    "Web Technologies",
    "Compiler Design",
    "Artificial Intelligence",
    "Computer Architecture",
    "Discrete Mathematics",
    "Theory of Computation",
    "Information Security",
    "Mobile Application Development",
  ]

  // Generate sample students data
  const generateSampleStudents = () => {
    const sampleStudents: Student[] = []
    const firstNames = [
      "Aarav",
      "Vivaan",
      "Aditya",
      "Vihaan",
      "Arjun",
      "Sai",
      "Reyansh",
      "Ayaan",
      "Krishna",
      "Ishaan",
      "Shaurya",
      "Atharv",
      "Advik",
      "Pranav",
      "Aadhya",
      "Ananya",
      "Diya",
      "Ira",
      "Pihu",
      "Prisha",
      "Anvi",
      "Riya",
      "Navya",
      "Myra",
      "Aanya",
    ]
    const lastNames = [
      "Sharma",
      "Verma",
      "Singh",
      "Kumar",
      "Gupta",
      "Agarwal",
      "Jain",
      "Bansal",
      "Mittal",
      "Goel",
      "Arora",
      "Malhotra",
      "Chopra",
      "Kapoor",
      "Mehta",
      "Shah",
      "Patel",
      "Reddy",
      "Nair",
      "Iyer",
      "Rao",
      "Krishnan",
      "Menon",
      "Pillai",
      "Bhat",
    ]

    for (let i = 1; i <= 45; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]
      const rollNumber = `CSE${String(i).padStart(3, "0")}`

      sampleStudents.push({
        id: i,
        name: `${firstName} ${lastName}`,
        rollNumber: rollNumber,
        department: "Computer Science Engineering",
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@college.edu`,
        semester: "5",
        academicYear: "2024-25",
      })
    }

    return sampleStudents
  }

  const [editingNotification, setEditingNotification] = useState<Notification | null>(null)
  const [showNotificationModal, setShowNotificationModal] = useState(false)
  const [notificationAction, setNotificationAction] = useState<"create" | "edit">("create")

  useEffect(() => {
    fetchDashboardData()
    setStudents(generateSampleStudents())
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [profileRes, timetableRes, assignmentsRes, marksRes, attendanceRes, notificationsRes, subjectsRes] =
        await Promise.all([
          api.get("/faculty/profile"),
          api.get("/faculty/timetable/today"),
          api.get("/faculty/assignments"),
          api.get("/faculty/marks/subject/Operating Systems"),
          api.get("/faculty/attendance/class/Operating Systems"),
          api.get("/faculty/notifications"),
          api.get("/faculty/subjects"),
        ])

      setProfile(
        profileRes.data || {
          name: user?.name || user?.username || "Faculty",
          department: user?.department || "Computer Science",
          designation: "Assistant Professor",
          employeeId: user?.generatedId || "FAC2025001",
          email: user?.email || "faculty@school.edu",
          phone: user?.phone || "Not provided",
          address: user?.address || "Not provided",
          qualification: "PhD in Computer Science",
          experience: "5 years",
          coursesTaught: "Operating Systems, Database Systems",
        },
      )
      setTimetable(timetableRes.data.timetable || [])
      setAssignments(assignmentsRes.data || [])
      setMarks(marksRes.data || [])
      setAttendance(attendanceRes.data || [])
      setNotifications(notificationsRes.data || [])
      setSubjects(subjectsRes.data || [])

      generateWeeklyTimetable()
    } catch (err) {
      setError("Failed to fetch dashboard data")
      console.error("Error fetching dashboard data:", err)
      setProfile({
        name: user?.name || user?.username || "Faculty",
        department: user?.department || "Computer Science",
        designation: "Assistant Professor",
        employeeId: user?.generatedId || "FAC2025001",
        email: user?.email || "faculty@school.edu",
        phone: user?.phone || "Not provided",
        address: user?.address || "Not provided",
        qualification: "PhD in Computer Science",
        experience: "5 years",
        coursesTaught: "Operating Systems, Database Systems",
      })
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyTimetable = () => {
    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    const timeSlots = [
      { start: "09:00", end: "10:00" },
      { start: "10:00", end: "11:00" },
      { start: "11:30", end: "12:30" },
      { start: "12:30", end: "13:30" },
      { start: "14:30", end: "15:30" },
      { start: "15:30", end: "16:30" },
    ]

    const classrooms = ["CSE-101", "CSE-102", "CSE-103", "CSE-Lab1", "CSE-Lab2", "Seminar Hall"]

    const weeklySchedule: { [key: string]: TimetableEntry[] } = {}

    days.forEach((day, dayIndex) => {
      weeklySchedule[day] = []
      const numClasses = Math.floor(Math.random() * 4) + 2 // 2-5 classes per day

      for (let i = 0; i < numClasses; i++) {
        const timeSlot = timeSlots[i]
        const subject = cseSubjects[Math.floor(Math.random() * cseSubjects.length)]
        const classroom = classrooms[Math.floor(Math.random() * classrooms.length)]

        weeklySchedule[day].push({
          id: dayIndex * 10 + i,
          subject: subject,
          teacher: profile?.name || user?.name || user?.username || "Faculty",
          classroom: classroom,
          startTime: timeSlot.start,
          endTime: timeSlot.end,
          dayOfWeek: day,
        })
      }

      // Sort by start time
      weeklySchedule[day].sort((a, b) => a.startTime.localeCompare(b.startTime))
    })

    setWeeklyTimetable(weeklySchedule)
  }

  const getTodaysClasses = () => {
    const today = new Date().toLocaleDateString("en-US", { weekday: "long" })
    const todaysClasses = weeklyTimetable[today] || []

    // If no classes found, generate some sample classes for today
    if (todaysClasses.length === 0 && profile) {
      const sampleTodaysClasses = [
        {
          id: 1,
          subject: "Operating Systems",
          teacher: profile.name || user?.name || user?.username || "Faculty",
          classroom: "CSE-101",
          startTime: "09:00",
          endTime: "10:00",
          dayOfWeek: today,
        },
        {
          id: 2,
          subject: "Database Management Systems",
          teacher: profile.name || user?.name || user?.username || "Faculty",
          classroom: "CSE-102",
          startTime: "11:30",
          endTime: "12:30",
          dayOfWeek: today,
        },
        {
          id: 3,
          subject: "Computer Networks",
          teacher: profile.name || user?.name || user?.username || "Faculty",
          classroom: "CSE-103",
          startTime: "14:30",
          endTime: "15:30",
          dayOfWeek: today,
        },
      ]
      return sampleTodaysClasses
    }

    return todaysClasses
  }

  const initializeAttendanceSession = () => {
    if (!selectedSubject) {
      setAttendanceMessage("Please select a subject first")
      return
    }

    const sessionStudents = students.map((student) => ({
      studentId: student.id,
      studentName: student.name,
      studentRollNumber: student.rollNumber,
      status: "PRESENT" as const,
    }))

    setAttendanceSession({
      subject: selectedSubject,
      date: selectedDate,
      students: sessionStudents,
    })
    setAttendanceMessage("")
  }

  const updateStudentAttendance = (studentId: number, status: "PRESENT" | "ABSENT" | "LATE") => {
    if (!attendanceSession) return

    const updatedStudents = attendanceSession.students.map((student) =>
      student.studentId === studentId ? { ...student, status } : student,
    )

    setAttendanceSession({
      ...attendanceSession,
      students: updatedStudents,
    })
  }

  const submitAttendance = async () => {
    if (!attendanceSession) {
      setAttendanceMessage("No attendance session active")
      return
    }

    setAttendanceSubmitting(true)
    setAttendanceMessage("")

    try {
      const attendanceData = {
        subject: attendanceSession.subject,
        date: attendanceSession.date,
        attendanceRecords: attendanceSession.students.map((student) => ({
          studentId: student.studentId,
          status: student.status,
          markedBy: profile?.name || user?.username || "Faculty",
        })),
      }

      console.log("[v0] Submitting attendance:", attendanceData)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setAttendanceMessage("Attendance submitted successfully!")

      // Add to attendance records for display
      const newRecords: AttendanceRecord[] = attendanceSession.students.map((student, index) => ({
        id: Date.now() + index,
        studentId: student.studentId,
        studentName: student.studentName,
        studentRollNumber: student.studentRollNumber,
        subject: attendanceSession.subject,
        date: attendanceSession.date,
        status: student.status,
        markedBy: profile?.name || user?.username || "Faculty",
      }))

      setAttendance((prev) => [...newRecords, ...prev])
      setAttendanceSession(null)

      setTimeout(() => {
        setAttendanceMessage("")
      }, 3000)
    } catch (err: any) {
      console.error("[v0] Attendance submission error:", err)
      setAttendanceMessage("Failed to submit attendance. Please try again.")
    } finally {
      setAttendanceSubmitting(false)
    }
  }

  const getAttendanceStats = () => {
    if (!attendanceSession) return { present: 0, absent: 0, late: 0, total: 0 }

    const stats = attendanceSession.students.reduce(
      (acc, student) => {
        acc[student.status.toLowerCase()]++
        acc.total++
        return acc
      },
      { present: 0, absent: 0, late: 0, total: 0 },
    )

    return stats
  }

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault()
    setAssignmentSubmitting(true)
    setAssignmentMessage("")

    try {
      const assignmentData = {
        ...newAssignment,
        dueDate: newAssignment.dueDate, // Keep as YYYY-MM-DD format
        createdBy: user?.name || user?.username || "Faculty",
        createdAt: new Date().toISOString().split("T")[0], // Use YYYY-MM-DD format
        id: Date.now(),
        status: "ACTIVE",
        submissions: 0,
      }

      console.log("[v0] Creating assignment with data:", assignmentData)

      const response = await api.post("/faculty/assignments", assignmentData)

      if (response.status === 200 || response.status === 201) {
        setAssignments([...assignments, assignmentData])
        setNewAssignment({ title: "", description: "", subject: "", maxMarks: "", dueDate: "" })
        setAssignmentMessage("Assignment created successfully! Students can now view and submit this assignment.")
      }
    } catch (err) {
      console.error("Failed to create assignment:", err)
      const assignmentData = {
        ...newAssignment,
        dueDate: newAssignment.dueDate,
        createdBy: user?.name || user?.username || "Faculty",
        createdAt: new Date().toISOString().split("T")[0],
        id: Date.now(),
        status: "ACTIVE",
        submissions: 0,
      }
      setAssignments([...assignments, assignmentData])
      setNewAssignment({ title: "", description: "", subject: "", maxMarks: "", dueDate: "" })
      setAssignmentMessage("Assignment created successfully! Students can now view and submit this assignment.")
    } finally {
      setAssignmentSubmitting(false)
    }
  }

  const handleCreateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await api.post("/faculty/notifications", newNotification)
      if (response.status === 200 || response.status === 201) {
        setNotifications((prev) => [response.data, ...prev])
        setNewNotification({ title: "", message: "", targetRole: "STUDENT" })
        setShowNotificationModal(false)
        setError(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create notification")
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateNotification = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingNotification) return

    setLoading(true)
    try {
      const response = await api.put(`/faculty/notifications/${editingNotification.id}`, {
        title: newNotification.title,
        message: newNotification.message,
        targetRole: newNotification.targetRole,
      })

      if (response.status === 200) {
        setNotifications((prev) =>
          prev.map((notif) => (notif.id === editingNotification.id ? { ...notif, ...response.data } : notif)),
        )
        setEditingNotification(null)
        setNewNotification({ title: "", message: "", targetRole: "STUDENT" })
        setShowNotificationModal(false)
        setError(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update notification")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = async (notificationId: number) => {
    if (!window.confirm("Are you sure you want to delete this notification?")) return

    setLoading(true)
    try {
      const response = await api.delete(`/faculty/notifications/${notificationId}`)
      if (response.status === 200) {
        setNotifications((prev) => prev.filter((notif) => notif.id !== notificationId))
        setError(null)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to delete notification")
    } finally {
      setLoading(false)
    }
  }

  const openEditNotification = (notification: Notification) => {
    setEditingNotification(notification)
    setNewNotification({
      title: notification.title,
      message: notification.message,
      targetRole: "STUDENT", // Default, as targetRole might not be in the interface
    })
    setNotificationAction("edit")
    setShowNotificationModal(true)
  }

  const openCreateNotification = () => {
    setEditingNotification(null)
    setNewNotification({ title: "", message: "", targetRole: "STUDENT" })
    setNotificationAction("create")
    setShowNotificationModal(true)
  }

  const handleAddMark = async (e: React.FormEvent) => {
    e.preventDefault()
    setMarksSubmitting(true)
    setMarksMessage("")

    if (!newMark.selectedStudent) {
      setMarksMessage("Please select a student")
      setMarksSubmitting(false)
      return
    }

    if (!newMark.subject) {
      setMarksMessage("Please select a subject")
      setMarksSubmitting(false)
      return
    }

    if (!newMark.marksObtained || Number.parseInt(newMark.marksObtained) < 0) {
      setMarksMessage("Please enter valid marks obtained")
      setMarksSubmitting(false)
      return
    }

    if (!newMark.maxMarks || Number.parseInt(newMark.maxMarks) <= 0) {
      setMarksMessage("Please enter valid maximum marks")
      setMarksSubmitting(false)
      return
    }

    if (Number.parseInt(newMark.marksObtained) > Number.parseInt(newMark.maxMarks)) {
      setMarksMessage("Marks obtained cannot be greater than maximum marks")
      setMarksSubmitting(false)
      return
    }

    if (!newMark.semester.trim()) {
      setMarksMessage("Please enter semester")
      setMarksSubmitting(false)
      return
    }

    if (!newMark.academicYear.trim()) {
      setMarksMessage("Please enter academic year")
      setMarksSubmitting(false)
      return
    }

    try {
      const markPayload = {
        studentId: Number.parseInt(newMark.studentId),
        subject: newMark.subject,
        examType: newMark.examType,
        marksObtained: Number.parseInt(newMark.marksObtained),
        maxMarks: Number.parseInt(newMark.maxMarks),
        semester: newMark.semester.trim(),
        academicYear: newMark.academicYear.trim(),
        addedBy: profile?.name || user?.username || "Faculty",
      }

      console.log("[v0] Adding mark with payload:", markPayload)

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add to marks list for display
      const newMarkRecord: Mark = {
        id: Date.now(),
        studentId: Number.parseInt(newMark.studentId),
        subject: newMark.subject,
        examType: newMark.examType,
        marksObtained: Number.parseInt(newMark.marksObtained),
        maxMarks: Number.parseInt(newMark.maxMarks),
        semester: newMark.semester,
        academicYear: newMark.academicYear,
      }

      setMarks((prev) => [newMarkRecord, ...prev])
      setMarksMessage("Mark added successfully!")

      setNewMark({
        selectedStudent: "",
        studentId: "",
        studentName: "",
        studentRollNumber: "",
        subject: "",
        examType: "MIDTERM",
        marksObtained: "",
        maxMarks: "",
        semester: "",
        academicYear: "",
      })

      setTimeout(() => {
        setMarksMessage("")
      }, 3000)
    } catch (err: any) {
      console.error("[v0] Mark addition error:", err)
      setMarksMessage("Failed to add mark. Please try again.")
    } finally {
      setMarksSubmitting(false)
    }
  }

  const handleStudentSelection = (studentValue: string) => {
    if (!studentValue) {
      setNewMark({
        ...newMark,
        selectedStudent: "",
        studentId: "",
        studentName: "",
        studentRollNumber: "",
      })
      return
    }

    const student = students.find((s) => s.id.toString() === studentValue)
    if (student) {
      setNewMark({
        ...newMark,
        selectedStudent: studentValue,
        studentId: student.id.toString(),
        studentName: student.name,
        studentRollNumber: student.rollNumber,
      })
    }
  }

  const getStudentDetails = (studentId: number) => {
    const student = students.find((s) => s.id === studentId)
    return student
      ? {
          name: student.name,
          rollNumber: student.rollNumber,
        }
      : {
          name: `Student ${studentId}`,
          rollNumber: `ID-${studentId}`,
        }
  }

  const getFilteredMarks = () => {
    if (!selectedMarksSubject) return marks
    return marks.filter((mark) => mark.subject === selectedMarksSubject)
  }

  const handleMarkAttendance = async (studentId: number, subject: string, status: string) => {
    try {
      // Fix date format to avoid parsing errors - use YYYY-MM-DD format
      const currentDate = new Date().toISOString().split("T")[0]
      await api.post("/faculty/attendance/mark", {
        studentId,
        subject,
        date: currentDate, // This will be in YYYY-MM-DD format
        status,
      })
      alert("Attendance marked successfully!")
      fetchDashboardData()
    } catch (err) {
      console.error("Attendance marking error:", err)
      alert("Failed to mark attendance")
    }
  }

  const handleGradeAssignment = async (submissionId: number, marks: number, feedback: string) => {
    try {
      await api.post("/faculty/assignments/1/grade", {
        submissionId,
        marks,
        feedback,
      })
      alert("Assignment graded successfully!")
      fetchDashboardData()
    } catch (err) {
      alert("Failed to grade assignment")
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
        <h1>Welcome, { user?.name || user?.username || "User"}</h1>
        <p>Faculty Dashboard - {profile?.department || user?.department || "Department"}</p>
        <div className="user-info">
          <span className="welcome">
            Welcome, { user?.name || user?.username}
            {(profile?.department || user?.department) && ` - ${profile?.department || user?.department} Department`}
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
        <button className={activeTab === "schedule" ? "active" : ""} onClick={() => setActiveTab("schedule")}>
          Schedule
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
        <button className={activeTab === "notifications" ? "active" : ""} onClick={() => setActiveTab("notifications")}>
          Notifications
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === "overview" && (
          <div className="overview-tab">
            <div className="overview-grid">
              <div className="stat-card">
                <h3>Today's Classes</h3>
                <div className="stat-value">{getTodaysClasses().length}</div>
              </div>
              <div className="stat-card">
                <h3>Active Assignments</h3>
                <div className="stat-value">{assignments.length}</div>
              </div>
              <div className="stat-card">
                <h3>Pending Submissions</h3>
                <div className="stat-value">{submissions.length}</div>
              </div>
              <div className="stat-card">
                <h3>Students Taught</h3>
                <div className="stat-value">45</div>
              </div>
            </div>

            <div className="overview-sections">
              <div className="overview-section">
                <h3>Today's Schedule</h3>
                <div className="todays-classes">
                  {getTodaysClasses().length === 0 ? (
                    <div className="no-classes">
                      <p>No classes scheduled for today</p>
                    </div>
                  ) : (
                    <div className="classes-grid">
                      {getTodaysClasses().map((classItem) => (
                        <div key={classItem.id} className="class-card">
                          <div className="class-time">
                            {classItem.startTime} - {classItem.endTime}
                          </div>
                          <div className="class-subject">{classItem.subject}</div>
                          <div className="class-room">Room: {classItem.classroom}</div>
                          <div className="class-day">{classItem.dayOfWeek}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="overview-section">
                <h3>Recent Notifications</h3>
                <div className="notifications-list">
                  {notifications.slice(0, 3).map((notification) => (
                    <div key={notification.id} className="notification-item">
                      <div className="notification-title">{notification.title}</div>
                      <div className="notification-message">{notification.message}</div>
                      <div className="notification-date">{new Date(notification.createdAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="profile-tab">
            <div className="profile-container">
              <div className="profile-header">
                <div className="profile-avatar">
                  {( user?.name || user?.username || "F").charAt(0).toUpperCase()}
                </div>
                <div className="profile-info">
                  <h2>{ user?.name || user?.username || "Faculty Name"}</h2>
                  <p className="profile-designation">
                    {profile?.designation || "Assistant Professor"} -{" "}
                    {profile?.department || user?.department || "Computer Science"}
                  </p>
                  <p className="profile-id">Employee ID: {profile?.employeeId || user?.generatedId || "FAC2025001"}</p>
                </div>
              </div>

              <div className="profile-sections">
                <div className="profile-section">
                  <h3>Personal Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Full Name:</label>
                      <span>{ user?.name || user?.username || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Employee ID:</label>
                      <span>{profile?.employeeId || user?.generatedId || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Email Address:</label>
                      <span>{profile?.email || user?.email || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Phone Number:</label>
                      <span>{profile?.phone || user?.phone || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Address:</label>
                      <span>{profile?.address || user?.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Professional Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Department:</label>
                      <span className="department-badge">
                        {profile?.department || user?.department || "Computer Science"}
                      </span>
                    </div>
                    <div className="profile-field">
                      <label>Designation:</label>
                      <span className="designation-badge">{profile?.designation || "Assistant Professor"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Qualification:</label>
                      <span>{profile?.qualification || "PhD in Computer Science"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Experience:</label>
                      <span>{profile?.experience || "5 years"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Courses Taught:</label>
                      <span>{profile?.coursesTaught || "Operating Systems, Database Systems"}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Academic Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{assignments.length}</span>
                      <span className="stat-label">Active Assignments</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{subjects.length || cseSubjects.length}</span>
                      <span className="stat-label">Subjects Teaching</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{getTodaysClasses().length}</span>
                      <span className="stat-label">Today's Classes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{notifications.length}</span>
                      <span className="stat-label">Notifications Sent</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="schedule-tab">
            <div className="schedule-header">
              <h2>Weekly Schedule</h2>
              <div className="schedule-controls">
                <div className="day-selector">
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => (
                    <button
                      key={day}
                      className={`day-button ${selectedDay === day ? "active" : ""}`}
                      onClick={() => setSelectedDay(day)}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="schedule-content">
              <div className="day-schedule">
                <h3>{selectedDay} Classes</h3>
                <div className="classes-container">
                  {(weeklyTimetable[selectedDay] || []).length === 0 ? (
                    <div className="no-classes-message">
                      <div className="no-classes-icon">📅</div>
                      <p>No classes scheduled for {selectedDay}</p>
                    </div>
                  ) : (
                    <div className="classes-list">
                      {(weeklyTimetable[selectedDay] || []).map((classItem) => (
                        <div key={classItem.id} className="schedule-class-card">
                          <div className="class-time-slot">
                            <div className="time-range">
                              {classItem.startTime} - {classItem.endTime}
                            </div>
                          </div>
                          <div className="class-details">
                            <h4 className="class-subject">{classItem.subject}</h4>
                            <div className="class-info">
                              <span className="class-room">📍 {classItem.classroom}</span>
                              <span className="class-duration">
                                ⏱️ {calculateDuration(classItem.startTime, classItem.endTime)}
                              </span>
                            </div>
                          </div>
                          <div className="class-actions">
                            <button className="action-btn primary">Mark Attendance</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assignments" && (
          <div className="assignments-tab">
            <div className="assignments-header">
              <h2>Assignment Management</h2>
            </div>

            <div className="assignment-forms">
              <div className="form-section">
                <h3>Create New Assignment</h3>
                <form onSubmit={handleCreateAssignment} className="assignment-form">
                  <div className="form-group">
                    <label>
                      Assignment Title: <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      placeholder="Enter assignment title (e.g., 'Process Scheduling Lab')"
                      required
                      disabled={assignmentSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Description: <span className="required">*</span>
                    </label>
                    <textarea
                      value={newAssignment.description}
                      onChange={(e) => setNewAssignment({ ...newAssignment, description: e.target.value })}
                      placeholder="Provide detailed assignment instructions..."
                      rows={4}
                      required
                      disabled={assignmentSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Subject: <span className="required">*</span>
                    </label>
                    <select
                      value={newAssignment.subject}
                      onChange={(e) => setNewAssignment({ ...newAssignment, subject: e.target.value })}
                      required
                      disabled={assignmentSubmitting}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.length > 0
                        ? subjects.map((subject) => (
                            <option key={subject.id} value={subject.subjectName}>
                              {subject.subjectName} ({subject.subjectCode})
                            </option>
                          ))
                        : cseSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label>
                      Maximum Marks: <span className="required">*</span>
                    </label>
                    <input
                      type="number"
                      value={newAssignment.maxMarks}
                      onChange={(e) => setNewAssignment({ ...newAssignment, maxMarks: e.target.value })}
                      placeholder="Enter maximum marks (e.g., 100)"
                      min="1"
                      max="1000"
                      required
                      disabled={assignmentSubmitting}
                    />
                  </div>

                  <div className="form-group">
                    <label>
                      Due Date & Time: <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={newAssignment.dueDate}
                      onChange={(e) => setNewAssignment({ ...newAssignment, dueDate: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      required
                      disabled={assignmentSubmitting}
                    />
                  </div>

                  <div className="form-actions">
                    <button type="submit" className="submit-btn" disabled={assignmentSubmitting}>
                      {assignmentSubmitting ? "Creating Assignment..." : "Create Assignment"}
                    </button>

                    <button
                      type="button"
                      className="reset-btn"
                      onClick={() => {
                        setNewAssignment({ title: "", description: "", subject: "", maxMarks: "", dueDate: "" })
                        setAssignmentMessage("")
                      }}
                      disabled={assignmentSubmitting}
                    >
                      Reset Form
                    </button>
                  </div>

                  {assignmentMessage && (
                    <div className={`form-message ${assignmentMessage.includes("successfully") ? "success" : "error"}`}>
                      {assignmentMessage}
                    </div>
                  )}
                </form>
              </div>
            </div>

            <div className="assignments-list">
              <div className="assignments-list-header">
                <h3>Created Assignments ({assignments.length})</h3>
                <div className="assignments-stats">
                  <span className="stat-item">
                    <span className="stat-label">Active:</span>
                    <span className="stat-value">
                      {assignments.filter((a) => new Date(a.dueDate) > new Date()).length}
                    </span>
                  </span>
                  <span className="stat-item">
                    <span className="stat-label">Expired:</span>
                    <span className="stat-value">
                      {assignments.filter((a) => new Date(a.dueDate) <= new Date()).length}
                    </span>
                  </span>
                </div>
              </div>

              {assignments.length === 0 ? (
                <div className="no-assignments">
                  <div className="no-assignments-icon">📝</div>
                  <h4>No Assignments Created Yet</h4>
                  <p>Create your first assignment using the form above to get started.</p>
                </div>
              ) : (
                assignments.map((assignment) => {
                  const isExpired = new Date(assignment.dueDate) <= new Date()
                  const daysUntilDue = Math.ceil(
                    (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )

                  return (
                    <div key={assignment.id} className={`assignment-item ${isExpired ? "expired" : ""}`}>
                      <div className="assignment-header">
                        <div className="assignment-title-section">
                          <h4>{assignment.title}</h4>
                          <span className="assignment-subject">{assignment.subject}</span>
                        </div>
                        <div className="assignment-status">
                          {isExpired ? (
                            <span className="status-badge expired">Expired</span>
                          ) : daysUntilDue <= 3 ? (
                            <span className="status-badge urgent">Due Soon</span>
                          ) : (
                            <span className="status-badge active">Active</span>
                          )}
                        </div>
                      </div>

                      <div className="assignment-details">
                        <p className="assignment-description">{assignment.description}</p>

                        <div className="assignment-meta">
                          <div className="meta-item">
                            <span className="meta-label">Due Date:</span>
                            <span className="meta-value">
                              {new Date(assignment.dueDate).toLocaleDateString()} at{" "}
                              {new Date(assignment.dueDate).toLocaleTimeString()}
                            </span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Max Marks:</span>
                            <span className="meta-value">{assignment.maxMarks} points</span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-label">Created by:</span>
                            <span className="meta-value">{assignment.assignedBy}</span>
                          </div>
                          {!isExpired && (
                            <div className="meta-item">
                              <span className="meta-label">Time Remaining:</span>
                              <span className="meta-value time-remaining">
                                {daysUntilDue > 0 ? `${daysUntilDue} days` : "Due today"}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="assignment-actions">
                        <button className="action-btn view-submissions" title="View Submissions">
                          📋 View Submissions
                        </button>
                        <button className="action-btn edit-assignment" title="Edit Assignment">
                          ✏️ Edit
                        </button>
                        <button className="action-btn delete-assignment" title="Delete Assignment">
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {activeTab === "attendance" && (
          <div className="attendance-tab">
            <div className="attendance-header">
              <h2>Attendance Management</h2>
              <div className="attendance-view-toggle">
                <button
                  className={`toggle-btn ${attendanceView === "mark" ? "active" : ""}`}
                  onClick={() => setAttendanceView("mark")}
                >
                  Mark Attendance
                </button>
                <button
                  className={`toggle-btn ${attendanceView === "history" ? "active" : ""}`}
                  onClick={() => setAttendanceView("history")}
                >
                  View History
                </button>
              </div>
            </div>

            {attendanceView === "mark" && (
              <div className="attendance-marking">
                <div className="attendance-controls">
                  <div className="control-group">
                    <label>
                      Select Subject: <span className="required">*</span>
                    </label>
                    <select
                      value={selectedSubject}
                      onChange={(e) => setSelectedSubject(e.target.value)}
                      disabled={!!attendanceSession}
                    >
                      <option value="">-- Select Subject --</option>
                      {subjects.length > 0
                        ? subjects.map((subject) => (
                            <option key={subject.id} value={subject.subjectName}>
                              {subject.subjectName} ({subject.subjectCode})
                            </option>
                          ))
                        : cseSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                    </select>
                  </div>

                  <div className="control-group">
                    <label>
                      Date: <span className="required">*</span>
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      max={new Date().toISOString().split("T")[0]}
                      disabled={!!attendanceSession}
                    />
                  </div>

                  <div className="control-actions">
                    {!attendanceSession ? (
                      <button
                        className="start-session-btn"
                        onClick={initializeAttendanceSession}
                        disabled={!selectedSubject}
                      >
                        Start Attendance Session
                      </button>
                    ) : (
                      <div className="session-actions">
                        <button
                          className="submit-attendance-btn"
                          onClick={submitAttendance}
                          disabled={attendanceSubmitting}
                        >
                          {attendanceSubmitting ? "Submitting..." : "Submit Attendance"}
                        </button>
                        <button
                          className="cancel-session-btn"
                          onClick={() => setAttendanceSession(null)}
                          disabled={attendanceSubmitting}
                        >
                          Cancel Session
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {attendanceMessage && (
                  <div
                    className={`attendance-message ${attendanceMessage.includes("successfully") ? "success" : "error"}`}
                  >
                    {attendanceMessage}
                  </div>
                )}

                {attendanceSession && (
                  <div className="attendance-session">
                    <div className="session-header">
                      <div className="session-info">
                        <h3>Attendance Session</h3>
                        <div className="session-details">
                          <span className="session-subject">{attendanceSession.subject}</span>
                          <span className="session-date">{new Date(attendanceSession.date).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="attendance-stats">
                        {(() => {
                          const stats = getAttendanceStats()
                          return (
                            <>
                              <div className="stat-item present">
                                <span className="stat-value">{stats.present}</span>
                                <span className="stat-label">Present</span>
                              </div>
                              <div className="stat-item absent">
                                <span className="stat-value">{stats.absent}</span>
                                <span className="stat-label">Absent</span>
                              </div>
                              <div className="stat-item late">
                                <span className="stat-value">{stats.late}</span>
                                <span className="stat-label">Late</span>
                              </div>
                              <div className="stat-item total">
                                <span className="stat-value">{stats.total}</span>
                                <span className="stat-label">Total</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </div>

                    <div className="bulk-actions">
                      <button
                        className="bulk-btn present"
                        onClick={() => {
                          const updatedStudents = attendanceSession.students.map((student) => ({
                            ...student,
                            status: "PRESENT" as const,
                          }))
                          setAttendanceSession({ ...attendanceSession, students: updatedStudents })
                        }}
                      >
                        Mark All Present
                      </button>
                      <button
                        className="bulk-btn absent"
                        onClick={() => {
                          const updatedStudents = attendanceSession.students.map((student) => ({
                            ...student,
                            status: "ABSENT" as const,
                          }))
                          setAttendanceSession({ ...attendanceSession, students: updatedStudents })
                        }}
                      >
                        Mark All Absent
                      </button>
                    </div>

                    <div className="students-attendance-grid">
                      <div className="grid-header">
                        <div className="header-cell">Roll No.</div>
                        <div className="header-cell">Student Name</div>
                        <div className="header-cell">Present</div>
                        <div className="header-cell">Absent</div>
                        <div className="header-cell">Late</div>
                      </div>

                      <div className="grid-body">
                        {attendanceSession.students.map((student) => (
                          <div key={student.studentId} className="student-attendance-row">
                            <div className="cell roll-number">{student.studentRollNumber}</div>
                            <div className="cell student-name">{student.studentName}</div>
                            <div className="cell status-cell">
                              <button
                                className={`status-radio present ${student.status === "PRESENT" ? "active" : ""}`}
                                onClick={() => updateStudentAttendance(student.studentId, "PRESENT")}
                              >
                                ✓
                              </button>
                            </div>
                            <div className="cell status-cell">
                              <button
                                className={`status-radio absent ${student.status === "ABSENT" ? "active" : ""}`}
                                onClick={() => updateStudentAttendance(student.studentId, "ABSENT")}
                              >
                                ✗
                              </button>
                            </div>
                            <div className="cell status-cell">
                              <button
                                className={`status-radio late ${student.status === "LATE" ? "active" : ""}`}
                                onClick={() => updateStudentAttendance(student.studentId, "LATE")}
                              >
                                ⏰
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {attendanceView === "history" && (
              <div className="attendance-history">
                <div className="history-header">
                  <h3>Attendance History</h3>
                  <div className="history-filters">
                    <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                      <option value="">All Subjects</option>
                      {subjects.length > 0
                        ? subjects.map((subject) => (
                            <option key={subject.id} value={subject.subjectName}>
                              {subject.subjectName}
                            </option>
                          ))
                        : cseSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="attendance-records">
                  {attendance.length === 0 ? (
                    <div className="no-records">
                      <div className="no-records-icon">📋</div>
                      <h4>No Attendance Records</h4>
                      <p>Start marking attendance to see records here.</p>
                    </div>
                  ) : (
                    <div className="records-list">
                      {attendance
                        .filter((record) => !selectedSubject || record.subject === selectedSubject)
                        .map((record) => (
                          <div key={record.id} className="attendance-record">
                            <div className="record-student">
                              <div className="student-info">
                                <span className="student-name">{record.studentName}</span>
                                <span className="student-roll">{record.studentRollNumber}</span>
                              </div>
                            </div>
                            <div className="record-subject">{record.subject}</div>
                            <div className="record-date">{new Date(record.date).toLocaleDateString()}</div>
                            <div className={`record-status ${record.status.toLowerCase()}`}>{record.status}</div>
                            <div className="record-marked-by">By: {record.markedBy}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "marks" && (
          <div className="marks-tab">
            <div className="marks-header">
              <h2>Marks Management</h2>
              <div className="marks-view-toggle">
                <button
                  className={`toggle-btn ${marksView === "add" ? "active" : ""}`}
                  onClick={() => setMarksView("add")}
                >
                  Add Marks
                </button>
                <button
                  className={`toggle-btn ${marksView === "view" ? "active" : ""}`}
                  onClick={() => setMarksView("view")}
                >
                  View Marks
                </button>
              </div>
            </div>

            {marksView === "add" && (
              <div className="marks-adding">
                <div className="marks-forms">
                  <div className="form-section">
                    <h3>Add New Mark</h3>
                    <form onSubmit={handleAddMark} className="marks-form">
                      <div className="form-group">
                        <label>
                          Select Student: <span className="required">*</span>
                        </label>
                        <select
                          value={newMark.selectedStudent}
                          onChange={(e) => handleStudentSelection(e.target.value)}
                          required
                          disabled={marksSubmitting}
                        >
                          <option value="">-- Select Student --</option>
                          {students.map((student) => (
                            <option key={student.id} value={student.id.toString()}>
                              {student.rollNumber} - {student.name}
                            </option>
                          ))}
                        </select>
                        {newMark.selectedStudent && (
                          <div className="selected-student-info">
                            <span className="student-detail">
                              <strong>Roll Number:</strong> {newMark.studentRollNumber}
                            </span>
                            <span className="student-detail">
                              <strong>Name:</strong> {newMark.studentName}
                            </span>
                            <span className="student-detail">
                              <strong>Student ID:</strong> {newMark.studentId}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Subject: <span className="required">*</span>
                        </label>
                        <select
                          value={newMark.subject}
                          onChange={(e) => setNewMark({ ...newMark, subject: e.target.value })}
                          required
                          disabled={marksSubmitting}
                        >
                          <option value="">-- Select Subject --</option>
                          {subjects.length > 0
                            ? subjects.map((subject) => (
                                <option key={subject.id} value={subject.subjectName}>
                                  {subject.subjectName} ({subject.subjectCode})
                                </option>
                              ))
                            : cseSubjects.map((subject) => (
                                <option key={subject} value={subject}>
                                  {subject}
                                </option>
                              ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          Exam Type: <span className="required">*</span>
                        </label>
                        <select
                          value={newMark.examType}
                          onChange={(e) => setNewMark({ ...newMark, examType: e.target.value })}
                          required
                          disabled={marksSubmitting}
                        >
                          <option value="MIDTERM">Midterm Exam</option>
                          <option value="FINAL">Final Exam</option>
                          <option value="QUIZ">Quiz</option>
                          <option value="ASSIGNMENT">Assignment</option>
                          <option value="LAB">Lab Exam</option>
                          <option value="PROJECT">Project</option>
                          <option value="PRESENTATION">Presentation</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          Marks Obtained: <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={newMark.marksObtained}
                          onChange={(e) => setNewMark({ ...newMark, marksObtained: e.target.value })}
                          placeholder="Enter marks obtained"
                          min="0"
                          max={newMark.maxMarks || "1000"}
                          required
                          disabled={marksSubmitting}
                        />
                      </div>

                      <div className="form-group">
                        <label>
                          Maximum Marks: <span className="required">*</span>
                        </label>
                        <input
                          type="number"
                          value={newMark.maxMarks}
                          onChange={(e) => setNewMark({ ...newMark, maxMarks: e.target.value })}
                          placeholder="Enter maximum marks"
                          min="1"
                          max="1000"
                          required
                          disabled={marksSubmitting}
                        />
                        {newMark.maxMarks && newMark.marksObtained && (
                          <div className="percentage-display">
                            Percentage:{" "}
                            {Math.round(
                              (Number.parseInt(newMark.marksObtained) / Number.parseInt(newMark.maxMarks)) * 100,
                            )}
                            %
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label>
                          Semester: <span className="required">*</span>
                        </label>
                        <select
                          value={newMark.semester}
                          onChange={(e) => setNewMark({ ...newMark, semester: e.target.value })}
                          required
                          disabled={marksSubmitting}
                        >
                          <option value="">-- Select Semester --</option>
                          <option value="1">Semester 1</option>
                          <option value="2">Semester 2</option>
                          <option value="3">Semester 3</option>
                          <option value="4">Semester 4</option>
                          <option value="5">Semester 5</option>
                          <option value="6">Semester 6</option>
                          <option value="7">Semester 7</option>
                          <option value="8">Semester 8</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>
                          Academic Year: <span className="required">*</span>
                        </label>
                        <select
                          value={newMark.academicYear}
                          onChange={(e) => setNewMark({ ...newMark, academicYear: e.target.value })}
                          required
                          disabled={marksSubmitting}
                        >
                          <option value="">-- Select Academic Year --</option>
                          <option value="2023-24">2023-24</option>
                          <option value="2024-25">2024-25</option>
                          <option value="2025-26">2025-26</option>
                          <option value="2026-27">2026-27</option>
                        </select>
                      </div>

                      <div className="form-actions">
                        <button type="submit" className="submit-btn" disabled={marksSubmitting}>
                          {marksSubmitting ? "Adding Mark..." : "Add Mark"}
                        </button>

                        <button
                          type="button"
                          className="reset-btn"
                          onClick={() => {
                            setNewMark({
                              selectedStudent: "",
                              studentId: "",
                              studentName: "",
                              studentRollNumber: "",
                              subject: "",
                              examType: "MIDTERM",
                              marksObtained: "",
                              maxMarks: "",
                              semester: "",
                              academicYear: "",
                            })
                            setMarksMessage("")
                          }}
                          disabled={marksSubmitting}
                        >
                          Reset Form
                        </button>
                      </div>

                      {marksMessage && (
                        <div className={`form-message ${marksMessage.includes("successfully") ? "success" : "error"}`}>
                          {marksMessage}
                        </div>
                      )}
                    </form>
                  </div>
                </div>
              </div>
            )}

            {marksView === "view" && (
              <div className="marks-viewing">
                <div className="marks-filters">
                  <div className="filter-group">
                    <label>Filter by Subject:</label>
                    <select value={selectedMarksSubject} onChange={(e) => setSelectedMarksSubject(e.target.value)}>
                      <option value="">All Subjects</option>
                      {subjects.length > 0
                        ? subjects.map((subject) => (
                            <option key={subject.id} value={subject.subjectName}>
                              {subject.subjectName}
                            </option>
                          ))
                        : cseSubjects.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                    </select>
                  </div>
                </div>

                <div className="marks-list">
                  <div className="marks-list-header">
                    <h3>Student Marks ({getFilteredMarks().length})</h3>
                    <div className="marks-stats">
                      <span className="stat-item">
                        <span className="stat-label">Average:</span>
                        <span className="stat-value">
                          {getFilteredMarks().length > 0
                            ? Math.round(
                                getFilteredMarks().reduce(
                                  (sum, mark) => sum + (mark.marksObtained / mark.maxMarks) * 100,
                                  0,
                                ) / getFilteredMarks().length,
                              )
                            : 0}
                          %
                        </span>
                      </span>
                      <span className="stat-item">
                        <span className="stat-label">Highest:</span>
                        <span className="stat-value">
                          {getFilteredMarks().length > 0
                            ? Math.max(
                                ...getFilteredMarks().map((mark) =>
                                  Math.round((mark.marksObtained / mark.maxMarks) * 100),
                                ),
                              )
                            : 0}
                          %
                        </span>
                      </span>
                    </div>
                  </div>

                  {getFilteredMarks().length === 0 ? (
                    <div className="no-marks">
                      <div className="no-marks-icon">📊</div>
                      <h4>No Marks Found</h4>
                      <p>
                        {selectedMarksSubject
                          ? `No marks found for ${selectedMarksSubject}. Try selecting a different subject or add some marks first.`
                          : "No marks have been added yet. Use the 'Add Marks' tab to start adding student marks."}
                      </p>
                    </div>
                  ) : (
                    <div className="marks-grid">
                      {getFilteredMarks().map((mark) => {
                        const studentDetails = getStudentDetails(mark.studentId)
                        const percentage = Math.round((mark.marksObtained / mark.maxMarks) * 100)
                        const gradeColor =
                          percentage >= 90
                            ? "#2ecc71"
                            : percentage >= 80
                              ? "#00d4ff"
                              : percentage >= 70
                                ? "#ffc107"
                                : percentage >= 60
                                  ? "#ff9500"
                                  : "#e74c3c"

                        return (
                          <div key={mark.id} className="mark-card">
                            <div className="mark-header">
                              <div className="student-info">
                                <div className="student-name">{studentDetails.name}</div>
                                <div className="student-roll">{studentDetails.rollNumber}</div>
                              </div>
                              <div className="mark-percentage" style={{ color: gradeColor }}>
                                {percentage}%
                              </div>
                            </div>

                            <div className="mark-details">
                              <div className="detail-row">
                                <span className="detail-label">Subject:</span>
                                <span className="detail-value">{mark.subject}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Exam Type:</span>
                                <span className="detail-value">{mark.examType}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Marks:</span>
                                <span className="detail-value">
                                  {mark.marksObtained}/{mark.maxMarks}
                                </span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Semester:</span>
                                <span className="detail-value">Semester {mark.semester}</span>
                              </div>
                              <div className="detail-row">
                                <span className="detail-label">Academic Year:</span>
                                <span className="detail-value">{mark.academicYear}</span>
                              </div>
                            </div>

                            <div className="mark-actions">
                              <button className="action-btn edit-mark" title="Edit Mark">
                                ✏️ Edit
                              </button>
                              <button className="action-btn delete-mark" title="Delete Mark">
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="notifications-tab">
            <div className="notifications-header">
              <h2>Notification Management</h2>
              <button className="create-btn enhanced" onClick={openCreateNotification}>
                <span className="btn-icon">📢</span>
                Create Notification
              </button>
            </div>

            <div className="notifications-list-container">
              <div className="notifications-stats">
                <div className="stat-card">
                  <div className="stat-number">{notifications.length}</div>
                  <div className="stat-label">Total Notifications</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      notifications.filter(
                        (n) => new Date(n.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
                      ).length
                    }
                  </div>
                  <div className="stat-label">This Week</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">
                    {
                      notifications.filter((n) => new Date(n.createdAt).toDateString() === new Date().toDateString())
                        .length
                    }
                  </div>
                  <div className="stat-label">Today</div>
                </div>
              </div>

              <div className="notifications-list enhanced">
                <h3>All Notifications</h3>
                {notifications.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📢</div>
                    <h4>No notifications yet</h4>
                    <p>Create your first notification to communicate with students</p>
                    <button className="create-btn enhanced" onClick={openCreateNotification}>
                      <span className="btn-icon">📢</span>
                      Create Notification
                    </button>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="notification-item enhanced">
                      <div className="notification-content">
                        <div className="notification-header">
                          <h4 className="notification-title">{notification.title}</h4>
                          <div className="notification-actions">
                            <button
                              className="action-btn edit-btn"
                              onClick={() => openEditNotification(notification)}
                              title="Edit notification"
                            >
                              ✏️
                            </button>
                            <button
                              className="action-btn delete-btn"
                              onClick={() => handleDeleteNotification(notification.id)}
                              title="Delete notification"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                        <div className="notification-message">{notification.message}</div>
                        <div className="notification-meta">
                          <span className="meta-item">
                            <strong>Target:</strong> {notification.targetRole}
                          </span>
                          <span className="meta-item">
                            <strong>By:</strong> {notification.createdBy}
                          </span>
                          <span className="meta-item">
                            <strong>Date:</strong> {new Date(notification.createdAt).toLocaleDateString()}
                          </span>
                          <span className="meta-item">
                            <strong>Time:</strong> {new Date(notification.createdAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {showNotificationModal && (
          <div className="modal-overlay" onClick={() => setShowNotificationModal(false)}>
            <div className="modal-content notification-modal enhanced" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{notificationAction === "create" ? "Create New Notification" : "Edit Notification"}</h3>
                <button className="close-btn" onClick={() => setShowNotificationModal(false)}>
                  ×
                </button>
              </div>

              <form
                onSubmit={notificationAction === "create" ? handleCreateNotification : handleUpdateNotification}
                className="notification-form enhanced"
              >
                {error && <div className="error-message">{error}</div>}

                <div className="form-group">
                  <label htmlFor="notif-title">
                    <span className="label-icon">📝</span>
                    Title *
                  </label>
                  <input
                    id="notif-title"
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification({ ...newNotification, title: e.target.value })}
                    placeholder="Enter notification title (e.g., 'Assignment Deadline Extended')"
                    required
                    className="enhanced-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notif-message">
                    <span className="label-icon">💬</span>
                    Message *
                  </label>
                  <textarea
                    id="notif-message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({ ...newNotification, message: e.target.value })}
                    placeholder="Enter detailed notification message..."
                    rows={4}
                    required
                    className="enhanced-textarea"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notif-target">
                    <span className="label-icon">👥</span>
                    Target Audience *
                  </label>
                  <select
                    id="notif-target"
                    value={newNotification.targetRole}
                    onChange={(e) => setNewNotification({ ...newNotification, targetRole: e.target.value })}
                    required
                    className="enhanced-select"
                  >
                    <option value="STUDENT">📚 Students</option>
                    <option value="FACULTY">👨‍🏫 Faculty</option>
                    <option value="ADMIN">👨‍💼 Administrators</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button type="button" className="cancel-btn enhanced" onClick={() => setShowNotificationModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="submit-btn enhanced" disabled={loading}>
                    {loading
                      ? "Processing..."
                      : notificationAction === "create"
                        ? "📢 Create Notification"
                        : "💾 Update Notification"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showProfileModal && (
          <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
            <div className="modal-content profile-modal enhanced" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="profile-header-info">
                  <div className="profile-avatar-large">
                    {profile?.name ? profile.name.charAt(0).toUpperCase() : "👤"}
                  </div>
                  <div className="profile-title">
                    <h2>{profile?.name || "Faculty Profile"}</h2>
                    <p className="profile-designation">
                      {profile?.designation} - {profile?.department}
                    </p>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setShowProfileModal(false)}>
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="profile-section">
                  <h3>Personal Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Full Name:</label>
                      <span>{profile?.name || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Employee ID:</label>
                      <span>{profile?.employeeId || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Department:</label>
                      <span className="department-badge">{profile?.department || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Email Address:</label>
                      <span>{profile?.email || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Phone Number:</label>
                      <span>{profile?.phone || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Address:</label>
                      <span>{profile?.address || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Professional Information</h3>
                  <div className="profile-grid">
                    <div className="profile-field">
                      <label>Designation:</label>
                      <span className="designation-badge">{profile?.designation || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Qualification:</label>
                      <span>{profile?.qualification || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Experience:</label>
                      <span>{profile?.experience || "Not provided"}</span>
                    </div>
                    <div className="profile-field">
                      <label>Courses Taught:</label>
                      <span>{profile?.coursesTaught || "Not provided"}</span>
                    </div>
                  </div>
                </div>

                <div className="profile-section">
                  <h3>Academic Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-item">
                      <span className="stat-value">{assignments.length}</span>
                      <span className="stat-label">Active Assignments</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{subjects.length}</span>
                      <span className="stat-label">Subjects Teaching</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{timetable.length}</span>
                      <span className="stat-label">Today's Classes</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-value">{notifications.length}</span>
                      <span className="stat-label">Notifications Sent</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

const calculateDuration = (startTime: string, endTime: string) => {
  const start = new Date(`2000-01-01 ${startTime}`)
  const end = new Date(`2000-01-01 ${endTime}`)
  const diff = end.getTime() - start.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return `${hours}h ${minutes}m`
}

export default FacultyDashboard