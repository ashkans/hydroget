import { SignInButton } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to HydroGet
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Please sign in to access the application
          </p>
        </div>
        <div className="mt-8 flex justify-center">
          <SignInButton mode="modal">
            <button className="group relative w-48 flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              Sign in to continue
            </button>
          </SignInButton>
        </div>
      </div>
    </div>
  );
}
