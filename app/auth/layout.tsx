export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-base-200 flex min-h-screen items-center justify-center p-4">
      {children}
    </div>
  );
}
