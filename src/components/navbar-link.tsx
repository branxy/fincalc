import { Link } from "@tanstack/react-router";

interface NavbarLinkProps {
  path: string;
  name: string;
}

function NavbarLink({ path, name }: NavbarLinkProps) {
  return (
    <li className="h-full md:h-auto">
      <Link
        to={path}
        activeProps={{
          className: "bg-green-300 text-zinc-700 font-semibold",
        }}
        activeOptions={{ exact: true }}
        className={
          "h-full rounded px-4 pb-2 pt-1.5 align-baseline ring-green-300 hover:ring-1 md:px-2 md:pb-1 md:pt-0"
        }
      >
        {name}
      </Link>
    </li>
  );
}

export default NavbarLink;
