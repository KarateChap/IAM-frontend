import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

export default function SimpleDashboard() {
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth)

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard</h1>
      <p>Authentication Status: {isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</p>
      {user && (
        <div>
          <h2>User Info:</h2>
          <p>Email: {user.email}</p>
          <p>Username: {user.username}</p>
          <p>Name: {user.firstName} {user.lastName}</p>
        </div>
      )}
    </div>
  )
}
