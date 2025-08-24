import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import IssuesList from "./pages/IssuesList";
import IssueDetail from "./pages/IssueDetail";
import IssueForm from "./pages/IssueForm";
import ProtectedRoute from "./routes/ProtectedRoute";
import Header from "./components/Header";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<IssuesList />} />
          <Route path="/issues/:id" element={<IssueDetail />} />
          <Route path="/new-issue" element={<IssueForm />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
