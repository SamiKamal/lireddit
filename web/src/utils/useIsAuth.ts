import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useIsAtuh = () => {
  const { data, loading } = useMeQuery();
  const router = useRouter();
  useEffect(() => {
    if (!data?.me && !loading) {
      router.replace("/login?next=" + router.pathname);
    }
  }, [data, loading]);
};
