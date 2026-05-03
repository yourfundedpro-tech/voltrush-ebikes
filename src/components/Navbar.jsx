import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import { useCart } from "../state/CartContext";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Bikes", path: "/bikes" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

export default function Navbar() {
  const { summary } = useCart();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  function handleSearch(event) {
    event.preventDefault();
    navigate(`/bikes?search=${encodeURIComponent(query.trim())}`);
    setMenuOpen(false);
  }

  async function handleLogout() {
    await logout();
    navigate("/");
    setMenuOpen(false);
  }

  return (
    <header className="navbar">
      <div className="navbar__inner container">
        <Link className="brand" to="/">
          <span className="brand__mark">V</span>
          <span>
            VoltRush
            <small>Electric Mobility</small>
          </span>
        </Link>

        <button
          className="menu-toggle"
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          aria-label="Toggle navigation"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`nav-panel ${menuOpen ? "is-open" : ""}`}>
          <nav className="nav-links">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) => (isActive ? "active" : "")}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <form className="searchbar" onSubmit={handleSearch}>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search bikes"
              aria-label="Search bikes"
            />
            <button type="submit">Search</button>
          </form>

          <div className="navbar__account">
            {isAuthenticated ? (
              <>
                <Link
                  className="account-link"
                  to="/account"
                  onClick={() => setMenuOpen(false)}
                >
                  My Account
                </Link>
                <button className="account-link account-link--button" type="button" onClick={handleLogout}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link className="account-link" to="/login" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link className="account-link" to="/signup" onClick={() => setMenuOpen(false)}>
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <Link className="cart-chip" to="/cart" onClick={() => setMenuOpen(false)}>
            Cart
            <span>{summary.itemCount}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
