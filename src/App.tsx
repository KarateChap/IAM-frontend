import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { store } from "./store";
import { AuthGuard } from "./components/auth/AuthGuard";
import { PermissionGuard } from "./components/auth/PermissionGuard";
import { Layout } from "./components/layout/Layout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import ErrorBoundary from "./components/ErrorBoundary";
import UsersPage from "./pages/UsersPage";
import GroupsPage from "./pages/GroupsPage";
import RolesPage from "./pages/RolesPage";
import ModulesPage from "./pages/ModulesPage";
import PermissionsPage from "./pages/PermissionsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/*"
              element={
                <AuthGuard>
                  <Layout>
                    <Routes>
                      <Route
                        path="/"
                        element={<Navigate to="/dashboard" replace />}
                      />
                      <Route
                        path="/dashboard"
                        element={
                          <ErrorBoundary>
                            <DashboardPage />
                          </ErrorBoundary>
                        }
                      />
                      <Route 
                        path="/users" 
                        element={
                          <PermissionGuard>
                            <UsersPage />
                          </PermissionGuard>
                        } 
                      />
                      <Route 
                        path="/groups" 
                        element={
                          <PermissionGuard>
                            <GroupsPage />
                          </PermissionGuard>
                        } 
                      />
                      <Route 
                        path="/roles" 
                        element={
                          <PermissionGuard>
                            <RolesPage />
                          </PermissionGuard>
                        } 
                      />
                      <Route 
                        path="/modules" 
                        element={
                          <PermissionGuard>
                            <ModulesPage />
                          </PermissionGuard>
                        } 
                      />
                      <Route
                        path="/permissions"
                        element={
                          <PermissionGuard>
                            <PermissionsPage />
                          </PermissionGuard>
                        }
                      />
                    </Routes>
                  </Layout>
                </AuthGuard>
              }
            />
          </Routes>
        </Router>
      </QueryClientProvider>
    </Provider>
  );
}

export default App;
