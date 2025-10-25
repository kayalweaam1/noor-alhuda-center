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
import StudentProfile from "./pages/StudentProfile";
import AdminTeachers from "./pages/admin/Teachers";
import TeacherProfile from "./pages/TeacherProfile";
import AdminReports from "./pages/admin/Reports";
import AdminLessons from "./pages/admin/Lessons";
import AdminAnalytics from "./pages/admin/Analytics";
import AdminAdmins from "./pages/admin/Admins";
import AdminPayments from "./pages/admin/Payments";
import AdminAppSettings from "./pages/admin/AppSettings";
import AdminUserDetails from "./pages/admin/UserDetails";
import AdminLayout from "./components/layouts/AdminLayout";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherLessons from "./pages/teacher/Lessons";
import TeacherEvaluations from "./pages/teacher/Evaluations";
import TeacherMyStudents from "./pages/teacher/MyStudents";
import TeacherLayout from "./components/layouts/TeacherLayout";
import TeacherStudentsPage from "./pages/teacher/Students";
import StudentDashboard from "./pages/student/Dashboard";
import StudentLayout from "./components/layouts/StudentLayout";
import AssistantDashboard from "./pages/assistant/Dashboard";
import AssistantLayout from "./components/layouts/AssistantLayout";
import Login from "./pages/Login";
import AdminDirectLogin from "./pages/AdminDirectLogin";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import DashboardLayout from "./components/DashboardLayout";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/admin-direct"} component={AdminDirectLogin} />
      <Route path="/admin/dashboard">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/users">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </Route>
      <Route path="/admin/users/:id">
        <AdminLayout>
          <AdminUserDetails />
        </AdminLayout>
      </Route>
	      <Route path="/admin/students">
	        <AdminLayout>
	          <AdminStudents />
	        </AdminLayout>
	      </Route>
	      <Route path="/admin/students/:studentId">
	        <AdminLayout>
	          <StudentProfile />
	        </AdminLayout>
	      </Route>
	      <Route path="/admin/teachers">
	        <AdminLayout>
	          <AdminTeachers />
	        </AdminLayout>
	      </Route>
	      <Route path="/admin/teachers/:teacherId">
	        <AdminLayout>
	          <TeacherProfile />
	        </AdminLayout>
	      </Route>
      <Route path="/admin/reports">
        <AdminLayout>
          <AdminReports />
        </AdminLayout>
      </Route>
      <Route path="/admin/lessons">
        <AdminLayout>
          <AdminLessons />
        </AdminLayout>
      </Route>
      <Route path="/admin/analytics">
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      </Route>
      <Route path="/admin/admins">
        <AdminLayout>
          <AdminAdmins />
        </AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout>
          <Settings />
        </AdminLayout>
      </Route>
      <Route path="/admin/payments">
        <AdminLayout>
          <AdminPayments />
        </AdminLayout>
      </Route>
      <Route path="/admin/app-settings">
        <AdminLayout>
          <AdminAppSettings />
        </AdminLayout>
      </Route>
      <Route path="/teacher/dashboard">
        <TeacherLayout>
          <TeacherDashboard />
        </TeacherLayout>
      </Route>
      <Route path="/teacher/attendance">
        <TeacherLayout>
          <TeacherAttendance />
        </TeacherLayout>
      </Route>
	      <Route path="/teacher/lessons">
	        <TeacherLayout>
	          <TeacherLessons />
	        </TeacherLayout>
	      </Route>
	      <Route path="/teacher/evaluations">
	        <TeacherLayout>
	          <TeacherEvaluations />
	        </TeacherLayout>
	      </Route>
	      <Route path="/teacher/students/dashboard">
	        <TeacherLayout>
	          <TeacherStudentsPage />
	        </TeacherLayout>
	      </Route>
      <Route path="/teacher/settings">
        <TeacherLayout>
          <Settings />
        </TeacherLayout>
      </Route>
      <Route path="/profile">
        <DashboardLayout>
          <Profile />
        </DashboardLayout>
      </Route>
      <Route path="/student/dashboard">
        <StudentLayout>
          <StudentDashboard />
        </StudentLayout>
      </Route>
      <Route path="/student/settings">
        <StudentLayout>
          <Settings />
        </StudentLayout>
      </Route>
      <Route path="/assistant/dashboard">
        <AssistantLayout>
          <AssistantDashboard />
        </AssistantLayout>
      </Route>
      <Route path="/assistant/settings">
        <AssistantLayout>
          <Settings />
        </AssistantLayout>
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

