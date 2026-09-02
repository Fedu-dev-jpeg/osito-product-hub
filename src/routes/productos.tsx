import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/productos")({
  component: ProductosLayout,
});

function ProductosLayout() {
  return <Outlet />;
}
