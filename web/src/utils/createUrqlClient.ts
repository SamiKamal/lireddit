import { cacheExchange, Resolver } from '@urql/exchange-graphcache';
import { dedupExchange, fetchExchange, errorExchange, stringifyVariables, gql } from "urql";
import { LoginMutation, LogoutMutation, MeDocument, MeQuery, RegisterMutation, VoteMutationVariables } from "../generated/graphql";
import { betterUpdateQuery } from "./betterUpdateQuery";
import Router from 'next/router'
import { isServer } from './isServer';

export const cursorPagination = (): Resolver<any, any, any> => {

  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;

    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const fieldKey = `${fieldName}(${stringifyVariables(fieldArgs)})`
    const inCache = cache.resolve(
      cache.resolveFieldByKey(entityKey, fieldKey) as string,
      "posts"
    );
    info.partial = !inCache;

    let results: string[] = [];
    let dataHasMore = true;
    fieldInfos.forEach((fi) => {
      
      const key = cache.resolveFieldByKey(entityKey, fi.fieldKey) as string;
      const dataPosts = cache.resolve(key, 'posts') as string[];
      dataHasMore = cache.resolve(key, 'hasMore') as boolean;
      
      results.push(...dataPosts)
      
    })

    return {
      __typename: "PaginatedPosts",
      hasMore: dataHasMore,
      posts: results
    };

    // const visited = new Set();
    // let result: NullArray<string> = [];
    // let prevOffset: number | null = null;

    // for (let i = 0; i < size; i++) {
    //   const { fieldKey, arguments: args } = fieldInfos[i];
    //   if (args === null || !compareArgs(fieldArgs, args)) {
    //     continue;
    //   }

    //   const links = cache.resolve(entityKey, fieldKey) as string[];
    //   const currentOffset = args[cursorArgument];

    //   if (
    //     links === null ||
    //     links.length === 0 ||
    //     typeof currentOffset !== 'number'
    //   ) {
    //     continue;
    //   }

    //   const tempResult: NullArray<string> = [];

    //   for (let j = 0; j < links.length; j++) {
    //     const link = links[j];
    //     if (visited.has(link)) continue;
    //     tempResult.push(link);
    //     visited.add(link);
    //   }

    //   if (
    //     (!prevOffset || currentOffset > prevOffset) ===
    //     (mergeMode === 'after')
    //   ) {
    //     result = [...result, ...tempResult];
    //   } else {
    //     result = [...tempResult, ...result];
    //   }

    //   prevOffset = currentOffset;
    // }

    // const hasCurrentPage = cache.resolve(entityKey, fieldName, fieldArgs);
    // if (hasCurrentPage) {
    //   return result;
    // } else if (!(info as any).store.schema) {
    //   return undefined;
    // } else {
    //   info.partial = true;
    //   return result;
    // }
  };
};


export const createUrqlClient = (_ssrExchange: any, ctx: any) => ({
  url: 'http://localhost:4000/graphql',
  fetchOptions: {
    credentials: "include" as const,
    headers: isServer() ?  {
      cookie: ctx.req.headers.cookie
    } : undefined
  },
  exchanges: [dedupExchange, cacheExchange({
    keys: {
      PaginatedPosts: () => null
    },
    resolvers: {
      Query: {
        posts: cursorPagination(),
      }
    },
    updates: {
      Mutation: {
        vote: (_result, args, cache, info) => {
          const {postId, value} = args as VoteMutationVariables;
          const data = cache.readFragment(
            gql`
            fragment __ on Post {
              id
              points
              voteStatus
            }`, {id: postId}
          )

          if (data) {
            if (data.voteStatus === args.value) {
              return;
            }
            const newPoints = data.points + (!data.voteStatus ? 1 : 2) * value; 
            cache.writeFragment(
              gql`
              fragment __ on Post {
                points
                voteStatus
              }`, {id: postId, points: newPoints, voteStatus: value}
            )
          }
        },
        createPost: (_result, args, cache, info) => {
          const allFields = cache.inspectFields("Query");
          const fiendInfos = allFields.filter(info => info.fieldName === 'posts')
          fiendInfos.forEach((fi) => {
            cache.invalidate('Query', 'posts', fi.arguments || {});
          })

        },
        login: (_result, args, cache, info) => {
            console.log(_result);
            
          betterUpdateQuery<LoginMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
            if (result.login.errors) {
              return query;
            } else {
              return {
                me: result.login.user
              }
            }
          })
        },
        register: (_result, args, cache, info) => {
          betterUpdateQuery<RegisterMutation, MeQuery>(cache, {query: MeDocument}, _result, (result, query) => {
            if (result.register.errors) {
              return query;
            } else {
              return {
                me: result.register.user
              }
            }
          })
        },
        logout: (_result, args, cache, info) => {
          betterUpdateQuery<LogoutMutation, MeQuery>(cache, {query: MeDocument}, _result, () => ({me: null}))
        }

      }
    }
  }),
   errorExchange({
     onError(error) {       
       if (error.message.includes("Not authenticated")){
         Router.replace("/login")
       }
     }
   }),
   _ssrExchange,
   fetchExchange]
})