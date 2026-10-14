
import { Outlet } from "react-router-dom";

import { StudentProfileProvider } from "../context/StudentProfileContext";
import StudentSidebar from "../components/student/StudentSidebar";
import StudentHeader from "../components/student/StudentHeader";

import "../pages/student/StudentProfile.css";

function StudentLayoutContent() {
    return (
        <div className="student-app">
            <StudentSidebar />

            <div className="student-main">
                <StudentHeader />
                <main className="student-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

function StudentLayout() {
    return (
        <StudentProfileProvider>
            <StudentLayoutContent />
        </StudentProfileProvider>
    );
}

export default StudentLayout;
