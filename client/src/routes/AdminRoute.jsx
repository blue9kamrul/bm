import Loader from "../components/shared/Loader";

import { Navigate, Outlet } from "react-router-dom";
import useUserStore from "../stores/authStores/useUserStore";

const AdminRoute = () => {
  const { currentUser, loading } = useUserStore();

  if (loading) {
    return <Loader />;
  }
  if (currentUser && currentUser.role === "ADMIN") {
    return <Outlet />;
  }

  return <Navigate to={"/"} replace />;
};

export default AdminRoute;
