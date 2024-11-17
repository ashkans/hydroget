"use client";

import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { UserProfilePage } from "./Usage";

const DotIcon = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="3 3 24 24"
      fill="currentColor"
      width="24"
      height="24"
    >
      <path d="M18.5 3h-13A2.5 2.5 0 003 5.5v13A2.5 2.5 0 005.5 21h13a2.5 2.5 0 002.5-2.5v-13A2.5 2.5 0 0018.5 3zm1.5 15.5c0 .827-.673 1.5-1.5 1.5h-13c-.827 0-1.5-.673-1.5-1.5v-13c0-.827.673-1.5 1.5-1.5h13c.827 0 1.5.673 1.5 1.5v13z" />
      <path d="M15 16H9c-.552 0-1-.448-1-1s.448-1 1-1h6c.552 0 1 .448 1 1s-.448 1-1 1zM15 12H9c-.552 0-1-.448-1-1s.448-1 1-1h6c.552 0 1 .448 1 1s-.448 1-1 1zM11 8H9c-.552 0-1-.448-1-1s.448-1 1-1h2c.552 0 1 .448 1 1s-.448 1-1 1z" />
    </svg>
  );
};

export default function AuthButtons() {
  return (
    <>
      <SignedOut>
        <SignInButton />
      </SignedOut>
      <SignedIn>
        <UserButton>
          <UserButton.UserProfilePage
            label="Usage"
            url="custom"
            labelIcon={<DotIcon />}
          >
            <UserProfilePage />
          </UserButton.UserProfilePage>
        </UserButton>
      </SignedIn>
    </>
  );
}
