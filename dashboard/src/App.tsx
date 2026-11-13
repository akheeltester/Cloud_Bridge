import { lazy, Suspense } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Shell } from "./console/components/shell";

const OverviewPage = lazy(() =>
  import("./console/pages/Overview").then((module) => ({
    default: module.OverviewPage,
  })),
);
const InfrastructurePage = lazy(() =>
  import("./console/pages/Infrastructure").then((module) => ({
    default: module.InfrastructurePage,
  })),
);
const CustomersPage = lazy(() =>
  import("./console/pages/Customers").then((module) => ({
    default: module.CustomersPage,
  })),
);
const MigrationPage = lazy(() =>
  import("./console/pages/Migration").then((module) => ({
    default: module.MigrationPage,
  })),
);
const SecurityPage = lazy(() =>
  import("./console/pages/Security").then((module) => ({
    default: module.SecurityPage,
  })),
);
const SocPage = lazy(() =>
  import("./console/pages/SOC").then((module) => ({
    default: module.SocPage,
  })),
);
const AutomationPage = lazy(() =>
  import("./console/pages/Automation").then((module) => ({
    default: module.AutomationPage,
  })),
);
const DocumentationPage = lazy(() =>
  import("./console/pages/Documentation").then((module) => ({
    default: module.DocumentationPage,
  })),
);

const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <Shell>
        <Suspense fallback={<div className="page-loading">Loading page...</div>}>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/infrastructure" element={<InfrastructurePage />} />
            <Route path="/customers" element={<CustomersPage />} />
            <Route path="/migration" element={<MigrationPage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/soc" element={<SocPage />} />
            <Route path="/automation" element={<AutomationPage />} />
            <Route path="/documentation" element={<DocumentationPage />} />
            <Route path="/docs" element={<DocumentationPage />} />
            <Route path="*" element={<OverviewPage />} />
          </Routes>
        </Suspense>
      </Shell>
    </BrowserRouter>
  );
}
