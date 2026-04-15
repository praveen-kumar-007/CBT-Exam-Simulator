import React from "react";
import ActivityPage from "./pages/ActivityPage";
import AddQuestionPage from "./pages/AddQuestionPage";
import ConfigPage from "./pages/ConfigPage";
import DemoExamPage from "./pages/DemoExamPage";
import HelpPage from "./pages/HelpPage";
import InsightsPage from "./pages/InsightsPage";
import OverviewPage from "./pages/OverviewPage";
import ProfilePage from "./pages/ProfilePage";
import QuestionsPage from "./pages/QuestionsPage";
import ReportsPage from "./pages/ReportsPage";
import ResponsesPage from "./pages/ResponsesPage";
import SectionsPage from "./pages/SectionsPage";
import SettingsPage from "./pages/SettingsPage";
import StudentsPage from "./pages/StudentsPage";
import TenantsPage from "./pages/TenantsPage";
import UsersPage from "./pages/UsersPage";

export type AdminFeatureKey =
  | "overview"
  | "sections"
  | "questions"
  | "add-question"
  | "students"
  | "responses"
  | "config"
  | "activity"
  | "insights"
  | "reports"
  | "users"
  | "settings"
  | "tenants"
  | "help"
  | "profile"
  | "demo-exam";

type AdminFeaturePage = {
  key: AdminFeatureKey;
  route: string;
  title: string;
  component: React.ComponentType;
};

export const adminFeaturePages: AdminFeaturePage[] = [
  {
    key: "overview",
    route: "/admin/dashboard/overview",
    title: "Overview",
    component: OverviewPage,
  },
  {
    key: "sections",
    route: "/admin/dashboard/sections",
    title: "Sections",
    component: SectionsPage,
  },
  {
    key: "questions",
    route: "/admin/dashboard/questions",
    title: "Question Bank",
    component: QuestionsPage,
  },
  {
    key: "add-question",
    route: "/admin/dashboard/add-question",
    title: "Add Question",
    component: AddQuestionPage,
  },
  {
    key: "students",
    route: "/admin/dashboard/students",
    title: "Students",
    component: StudentsPage,
  },
  {
    key: "responses",
    route: "/admin/dashboard/responses",
    title: "Responses",
    component: ResponsesPage,
  },
  {
    key: "config",
    route: "/admin/dashboard/config",
    title: "Exam Config",
    component: ConfigPage,
  },
  {
    key: "activity",
    route: "/admin/dashboard/activity",
    title: "Activity",
    component: ActivityPage,
  },
  {
    key: "insights",
    route: "/admin/dashboard/insights",
    title: "Insights",
    component: InsightsPage,
  },
  {
    key: "reports",
    route: "/admin/dashboard/reports",
    title: "Reports",
    component: ReportsPage,
  },
  {
    key: "users",
    route: "/admin/dashboard/users",
    title: "Users",
    component: UsersPage,
  },
  {
    key: "settings",
    route: "/admin/dashboard/settings",
    title: "Settings",
    component: SettingsPage,
  },
  {
    key: "tenants",
    route: "/admin/dashboard/tenants",
    title: "Tenants",
    component: TenantsPage,
  },
  {
    key: "help",
    route: "/admin/dashboard/help",
    title: "Help",
    component: HelpPage,
  },
  {
    key: "profile",
    route: "/admin/dashboard/profile",
    title: "Profile",
    component: ProfilePage,
  },
  {
    key: "demo-exam",
    route: "/admin/dashboard/demo-exam",
    title: "Demo Exam",
    component: DemoExamPage,
  },
];
