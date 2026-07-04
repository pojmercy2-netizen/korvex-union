import { ref, onMounted } from 'vue'

export interface User {
  id: string
  email: string
  fullName: string
  accountType: string
  status?: string
  isAdmin?: boolean
}

const API_BASE_URL = '/api'

export const useAuth = () => {
  const user = useState<User | null>('auth-user', () => null)
  const token = useState<string | null>('auth-token', () => null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Safe client side initialization
  onMounted(() => {
    const savedToken = localStorage.getItem('authToken')
    const savedUser = localStorage.getItem('user')
    const savedUserId = localStorage.getItem('userId')

    if (savedToken && savedUser) {
      token.value = savedToken
      try {
        user.value = JSON.parse(savedUser)
      } catch (e) {
        user.value = {
          id: savedUserId || '1001',
          email: '',
          fullName: 'User',
          accountType: 'checking'
        }
      }
    }
  })

  const healthCheck = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/health', {
        signal: AbortSignal.timeout(1500)
      })
      return response.ok
    } catch {
      return false
    }
  }

  const apiCall = async <T = any>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    bodyData?: Record<string, any>
  ): Promise<{ success: boolean; data?: T; error?: string }> => {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      }

      const activeToken = token.value || localStorage.getItem('authToken')
      if (activeToken) {
        headers['Authorization'] = `Bearer ${activeToken}`
      }

      const options: RequestInit = {
        method,
        headers
      }

      if ((method === 'POST' || method === 'PUT') && bodyData) {
        options.body = JSON.stringify(bodyData)
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`, options)

      if (!response.ok) {
        if (response.status === 401) {
          logout()
          navigateTo('/login')
        }
        const errJson = await response.json().catch(() => ({}))
        return {
          success: false,
          error: errJson.error || `HTTP error ${response.status}`
        }
      }

      const result = await response.json()
      return {
        success: true,
        data: result
      }
    } catch (e: any) {
      console.error('API Call Error:', e)
      return {
        success: false,
        error: e.message || 'Network connection failed'
      }
    }
  }

  const login = async (emailVal: string, passwordVal: string) => {
    isLoading.value = true
    error.value = null

    try {
      const isHealthy = await healthCheck()

      if (!isHealthy) {
        console.warn('Backend server not running. Using mock login fallback.')
        const isDefaultAdmin = emailVal.toLowerCase().includes('admin')
        const mockUser: User = {
          id: '1001',
          email: emailVal,
          fullName: (emailVal.split('@')[0] || '').toUpperCase(),
          accountType: 'Checking',
          status: 'Active',
          isAdmin: isDefaultAdmin
        }

        token.value = 'mock_token_' + Date.now()
        user.value = mockUser

        localStorage.setItem('authToken', token.value)
        localStorage.setItem('userId', mockUser.id)
        localStorage.setItem('user', JSON.stringify(mockUser))

        setTimeout(() => {
          isLoading.value = false
          if (isDefaultAdmin) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
        }, 800)
        return true
      }

      const response = await apiCall<{ access_token: string; user: any }>('/auth/login', 'POST', {
        email: emailVal,
        password: passwordVal
      })

      if (response.success && response.data?.access_token) {
        token.value = response.data.access_token
        localStorage.setItem('authToken', token.value)

        // Fetch full profile using the new Nuxt backend endpoint
        const profileRes = await apiCall<any>('/dashboard/profile', 'GET')
        if (profileRes.success && profileRes.data) {
          const profile = profileRes.data
          const isAdminUser = profile.role === 'admin' || profile.role === 'superadmin'
          const userData: User = {
            id: profile.id?.toString() || '1001',
            email: profile.email,
            fullName: profile.fullName || profile.full_name || emailVal.split('@')[0],
            accountType: 'checking',
            isAdmin: isAdminUser
          }

          user.value = userData
          localStorage.setItem('userId', userData.id)
          localStorage.setItem('user', JSON.stringify(userData))

          isLoading.value = false
          if (isAdminUser) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
          return true
        }
      }

      error.value = response.error || 'Login failed'
      isLoading.value = false
      return false
    } catch (e: any) {
      error.value = 'Failed to connect to backend.'
      isLoading.value = false
      return false
    }
  }

  const register = async (emailVal: string, passwordVal: string, fullNameVal: string, accountTypeVal: string, phoneVal: string = '0000000000') => {
    isLoading.value = true
    error.value = null

    try {
      const isHealthy = await healthCheck()

      if (!isHealthy) {
        console.warn('Backend server not running. Using mock registration fallback.')
        const isDefaultAdmin = emailVal.toLowerCase().includes('admin')
        const mockUser: User = {
          id: Math.floor(Math.random() * 10000).toString(),
          email: emailVal,
          fullName: fullNameVal,
          accountType: accountTypeVal,
          status: 'Active',
          isAdmin: isDefaultAdmin
        }

        token.value = 'mock_token_' + Date.now()
        user.value = mockUser

        localStorage.setItem('authToken', token.value)
        localStorage.setItem('userId', mockUser.id)
        localStorage.setItem('user', JSON.stringify(mockUser))

        setTimeout(() => {
          isLoading.value = false
          if (isDefaultAdmin) {
            navigateTo('/admin')
          } else {
            navigateTo('/dashboard')
          }
        }, 800)
        return true
      }

      const username = emailVal.split('@')[0] || ''
      const regResponse = await apiCall<any>('/auth/register', 'POST', {
        email: emailVal,
        password: passwordVal,
        full_name: fullNameVal,
        username,
        phone: phoneVal
      })

      if (!regResponse.success) {
        error.value = regResponse.error || 'Registration failed'
        isLoading.value = false
        return false
      }

      // Auto-login
      return await login(emailVal, passwordVal)
    } catch (e: any) {
      error.value = 'Failed to connect to backend.'
      isLoading.value = false
      return false
    }
  }

  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('authToken')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
    navigateTo('/login')
  }

  return {
    user,
    token,
    isLoading,
    error,
    login,
    register,
    logout,
    apiCall
  }
}
