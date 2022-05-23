import { useRouter } from "next/router"
import { useEffect } from "react"
import { useMeQuery } from "../generated/graphql";

export const useIsAtuh = () => {
    const [{data, fetching}] = useMeQuery();
    const router = useRouter()
    useEffect(() => {
    if (!data?.me && !fetching) {
        router.replace("/login?next=" + router.pathname)
    }
    }, [data, fetching])

}