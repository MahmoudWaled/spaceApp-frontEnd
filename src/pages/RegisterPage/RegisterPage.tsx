import Register from "@/components/Register/Register";

export default function RegisterPage() {


  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="flex w-full max-w-sm flex-col gap-6">
         <Register/>
        </div>
      </div>
  )
}
