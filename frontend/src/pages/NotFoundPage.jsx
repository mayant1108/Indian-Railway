import { Link } from "react-router-dom";
import { EmptyState } from "../components/ui/EmptyState.jsx";

export const NotFoundPage = () => (
  <EmptyState
    title="Page not found"
    description="The page you were looking for doesn't exist or may have moved."
    action={
      <Link to="/" className="primary-button">
        Return home
      </Link>
    }
  />
);
