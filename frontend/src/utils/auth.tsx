"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import api from "./api"

interface User {
  id: number
  username: string
  role: string
  name?: string
  email?: string
  department?: string
  generatedId?: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, password: string, role: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      // Verify token and get user info
      api
        .get("/auth/me")
        .then((response) => {
          setUser({
            id: response.data.id,
            username: response.data.username,
            role: response.data.role,
            name: response.data.name,
            email: response.data.email,
            department: response.data.department,
            generatedId: response.data.generatedId || response.data.studentId || response.data.teacherId,
          })
        })
        .catch(() => {
          localStorage.removeItem("token")
          localStorage.removeItem("role")
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { username, password })
      const { token, role } = response.data

      localStorage.setItem("token", token)
      localStorage.setItem("role", role)

      // Now fetch full user profile using the token
      const profileRes = await api.get("/auth/me")

      setUser({
        id: profileRes.data.id,
        username: profileRes.data.username,
        role: profileRes.data.role,
        name: profileRes.data.name || profileRes.data.username,
        email: profileRes.data.email,
        department: profileRes.data.department,
        generatedId: profileRes.data.generatedId || profileRes.data.studentId || profileRes.data.teacherId,
      })
    } catch (error) {
      throw error
    }
  }


  const signup = async (username: string, password: string, role: string) => {
    try {
      if (role === "ADMIN") {
        const adminCheck = await api.get("/auth/check-admin")
        if (adminCheck.data.hasAdmin) {
          throw new Error("Admin already exists. Only one admin is allowed.")
        }
      }
      await api.post("/auth/signup", { username, password, role })
    } catch (error) {
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setUser(null)
  }

  const value = {
    user,
    login,
    signup,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
