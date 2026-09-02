import { createFileRoute } from "@tanstack/react-router";
import { AdminDashboard } from "@/components/callao/AdminDashboard";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administración — Librería Callao" },
      {
        name: "description",
        content: "Dashboard para cargar productos, campañas y seguimiento de la tienda.",
      },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  return <AdminDashboard />;
}
