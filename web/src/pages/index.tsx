import { Link } from "@chakra-ui/react";
import { withUrqlClient } from "next-urql";
import { Layout } from "../components/Layout";
import { NavBar } from "../components/NavBar"
import { createUrqlClient } from "../utils/createUrqlClient";
import NextLink from 'next/link'

const Index = () => (
  <Layout>
    <NextLink href="/create-post">
      <Link>
        create post
      </Link>
    </NextLink>
    <div>
      Hello World
    </div>
  </Layout>
)

export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
