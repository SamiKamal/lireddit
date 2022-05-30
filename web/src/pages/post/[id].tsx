import { Box, Heading, Spinner } from "@chakra-ui/react";
import React from "react";
import { EditDeletePostButtons } from "../../components/EditDeletePostButtons";
import { Layout } from "../../components/Layout";
import { usePostQueryFromUrl } from "../../utils/usePostQueryFromUrl";
import { withApollo } from "../../utils/withApollo";

interface PostProps {}

const Post: React.FC<PostProps> = ({}) => {
  const { data, loading } = usePostQueryFromUrl();

  if (loading) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  if (!data?.post) {
    return (
      <Layout>
        <Heading>Sorry, we couldn't find that post</Heading>
      </Layout>
    );
  }

  return (
    <Layout>
      <Heading mb={4}>{data?.post?.title}</Heading>
      <Box mb={4}>{data?.post?.text}</Box>
      <EditDeletePostButtons
        creatorId={data?.post?.creatorId}
        id={data.post.id}
      />
    </Layout>
  );
};

export default withApollo({ ssr: true })(Post);
