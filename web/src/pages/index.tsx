import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { NavBar } from "../components/NavBar"
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{data,fetching}] = usePostsQuery({
    variables: {
      limit: 10
    }
  });

  return (<Layout>
    <NextLink href="/create-post">
      <Link>
        create post
      </Link>
    </NextLink>
    <div>
      Hello World
      {fetching ? 'loading...' : (
        data?.posts.map((post, i) => (
          <ul>
            <li key={i}>{post.title}</li>
          </ul>
        ))
      )}
    </div>
  </Layout>)
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
