import { Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Loader from "../components/shared/Loader";
import useUserStore from "../stores/authStores/useUserStore";
import useLoginModalStore from "../stores/authStores/useLoginModalStore";

const PrivateRoute = () => {
  const { currentUser, loading } = useUserStore();
  const { openLoginModal } = useLoginModalStore();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    if (!loading && !currentUser) {
      openLoginModal();
      setShouldRedirect(true);
    }
  }, [loading, currentUser, openLoginModal]);

  if (loading) {
    return <Loader />;
  }

  if (currentUser) {
    return <Outlet />;
  }

  if (shouldRedirect) {
    return <Navigate to="/" replace />;
  }

  return null;
};

export default PrivateRoute;
