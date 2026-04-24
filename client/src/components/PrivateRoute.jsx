import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";
import { checkSetupStatus } from "../redux/initialSetup/initialStatusSlice";

const PrivateRoute = () => {
  const { currentUser } = useSelector((state) => state.user);

  const dispatch = useDispatch();
  const { initialStatus } = useSelector((state) => state.initialStatus);

  const isSetupRequired = initialStatus?.setupRequired ?? null;

  useEffect(() => {
    dispatch(checkSetupStatus());
  }, []);

  if (isSetupRequired) {
    return <Navigate to="/sign-up" />;
  }

  return currentUser ? <Outlet /> : <Navigate to="/sign-in" />;
};

export default PrivateRoute;
