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
import AdminAdmins from "./pages/admin/Admins";
import AdminLayout from "./components/layouts/AdminLayout";
import TeacherDashboard from "./pages/teacher/Dashboard";
import TeacherAttendance from "./pages/teacher/Attendance";
import TeacherLessons from "./pages/teacher/Lessons";
import TeacherLayout from "./components/layouts/TeacherLayout";
import StudentDashboard from "./pages/student/Dashboard";
import StudentLayout from "./components/layouts/StudentLayout";
import Login from "./pages/Login";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
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
      <Route path="/admin/students">
        <AdminLayout>
          <AdminStudents />
        </AdminLayout>
      </Route>
      <Route path="/admin/teachers">
        <AdminLayout>
          <AdminTeachers />
        </AdminLayout>
      </Route>
      <Route path="/admin/reports">
        <AdminLayout>
          <AdminReports />
        </AdminLayout>
      </Route>
      <Route path="/admin/admins">
        <AdminLayout>
          <AdminAdmins />
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
      <Route path="/student/dashboard">
        <StudentLayout>
          <StudentDashboard />
        </StudentLayout>
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

