"use client";
import { useEffect, Suspense } from "react";
import { toast } from "react-hot-toast";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

function ToastController() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        const errorType = searchParams.get("error");

        if (errorType) {

            let message = "An error occurred";
            if (errorType === "expired") {
                message = "Session expired, please login again";
            } else if (errorType === "fetch_failed") {
                message = "Could not load data from server";
            }

            toast.error(message, { id: "auth-error" });

            const params = new URLSearchParams(searchParams.toString());
            params.delete("error");

            const newUrl = params.toString()
                ? `${pathname}?${params.toString()}`
                : pathname;

            router.replace(newUrl);
        }
    }, [searchParams, router, pathname]);

    return null;
}

export default function ToastObserver() {
    return (
        <Suspense fallback={null}>
            <ToastController />
        </Suspense>
    );
}