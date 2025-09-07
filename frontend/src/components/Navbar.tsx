import { Link, NavLink, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <div className="navbar">
      <div className="navbar-inner">
        <Link className="brand" to="/login">Campus CMS</Link>
        <div className="navlinks">
          {token && role === 'STUDENT' && <NavLink to="/student">Student</NavLink>}
          {token && role === 'FACULTY' && <NavLink to="/faculty">Faculty</NavLink>}
          {token && role === 'ADMIN' && <NavLink to="/admin">Admin</NavLink>}
          {token ? (
            <a onClick={logout} style={{ cursor: 'pointer' }}>Logout</a>
          ) : (
            <NavLink to="/login">Login</NavLink>
          )}
        </div>
      </div>
    </div>
  )
}


