import { usePostQuery } from "../generated/graphql";
import { useGetIndId } from "./useGetIntId";

export const usePostQueryFromUrl = () => {
    const intId = useGetIndId()
    return usePostQuery({
        pause: intId === -1,
        variables: {
                id: intId
        }
    })

}