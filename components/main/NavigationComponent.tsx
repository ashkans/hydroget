import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

import { Protect } from "@clerk/nextjs";

// Read the environment variable
const NEXT_PUBLIC_SHOW_API_DOCS =
  process.env.NEXT_PUBLIC_SHOW_API_DOCS === "true";

export default function NavigationMenuComponent() {
  return (
    <NavigationMenu className="py-4">
      <NavigationMenuList className="flex space-x-4">
        <NavigationMenuItem>
          <Link href="/" legacyBehavior passHref>
            <NavigationMenuLink
              className={
                navigationMenuTriggerStyle() +
                " text-gray-700 hover:text-gray-900"
              }
            >
              Home
            </NavigationMenuLink>
          </Link>
          <Link href="/kcCalibration" legacyBehavior passHref>
            <NavigationMenuLink
              className={
                navigationMenuTriggerStyle() +
                " text-gray-700 hover:text-gray-900"
              }
            >
              Kc Calibration
            </NavigationMenuLink>
          </Link>

          <Protect role="org:admin">
            <Link href="/api/py/docs" legacyBehavior passHref>
              <NavigationMenuLink
                className={
                  navigationMenuTriggerStyle() +
                  " text-gray-700 hover:text-gray-900"
                }
              >
                API doc
              </NavigationMenuLink>
            </Link>
          </Protect>
        </NavigationMenuItem>
        {/* Add more menu items here */}
      </NavigationMenuList>
    </NavigationMenu>
  );
}
