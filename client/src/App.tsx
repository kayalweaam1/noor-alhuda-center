import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminStudents from "./pages/admin/Students";
import AdminTeachers from "./pages/admin/Teachers";
import AdminReports from "./pages/admin/Reports";
import AdminLessons from "./pages/admin/Lessons";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminAdmins from "./pages/admin/Admins";
import AdminLayout from "./components/layouts/AdminLayout";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherLessons from "./pages/teacher/Lessons";
import TeacherStudents from "./pages/teacher/Students";
import TeacherEvaluations from "./pages/teacher/Evaluations";
import TeacherLayout from "./components/layouts/TeacherLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentLayout from "./components/layouts/StudentLayout";
import AssistantDashboard from "./pages/assistant/Dashboard";
import AssistantLayout from "./components/layouts/AssistantLayout";
import Login from "./pages/Login";
import AdminDirectLogin from "./pages/AdminDirectLogin";
import Settings from "./pages/Settings";
import AdminStudentDetails from "./pages/admin/StudentDetails";
import ProtectedRoute from "@/components/ProtectedRoute";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/admin-direct"} component={AdminDirectLogin} />
      <Route path="/admin/dashboard">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/users">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminUsers />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/students">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminStudents />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/students/:id">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminStudentDetails />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/teachers">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminTeachers />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/reports">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminReports />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/lessons">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminLessons />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/analytics">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/admins">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <AdminAdmins />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/admin/settings">
        <ProtectedRoute requiredRole="admin">
          <AdminLayout>
            <Settings />
          </AdminLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/teacher/dashboard">
        <ProtectedRoute requiredRole="teacher">
          <TeacherLayout>
            <TeacherDashboard />
          </TeacherLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/teacher/attendance">
        <ProtectedRoute requiredRole="teacher">
          <TeacherLayout>
            <TeacherAttendance />
          </TeacherLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/teacher/students">
        <ProtectedRoute requiredRole="teacher">
          <TeacherLayout>
            <TeacherStudents />
          </TeacherLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/teacher/lessons">
        <ProtectedRoute requiredRole="teacher">
          <TeacherLayout>
            <TeacherLessons />
          </TeacherLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/teacher/evaluations">
        <ProtectedRoute requiredRole="teacher">
          <TeacherLayout>
            <TeacherEvaluations />
          </TeacherLayout>
        </ProtectedRoute>
      </Route>
      {/* Teacher pages that are not yet implemented were removed to avoid broken links */}
      <Route path="/teacher/settings">
        <TeacherLayout>
          <Settings />
        </TeacherLayout>
      </Route>
      <Route path="/student/dashboard">
        <ProtectedRoute requiredRole="student">
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/student/settings">
        <ProtectedRoute requiredRole="student">
          <StudentLayout>
            <Settings />
          </StudentLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/assistant/dashboard">
        <ProtectedRoute>
          <AssistantLayout>
            <AssistantDashboard />
          </AssistantLayout>
        </ProtectedRoute>
      </Route>
      <Route path="/assistant/settings">
        <ProtectedRoute>
          <AssistantLayout>
            <Settings />
          </AssistantLayout>
        </ProtectedRoute>
      </Route>
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

